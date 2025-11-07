'use strict';

import 'es6-promise/auto';
import { RESPONSE_SERVER_ERROR, aiAnswersInteractionsInstance } from './api';
import { Settings } from './settings';
import { ApiFetchCallback } from './apifetch';

/**
 * Source document from AI Answers response
 */
export interface AiAnswersSource {
  id: string;
  title: string;
  url: string;
  last_updated_date: string;
}

/**
 * AI Answers streaming response
 */
export interface AiAnswersResponse {
  conversation_id: string;
  answer: string;
  sources: AiAnswersSource[];
  is_streaming_complete?: boolean;
  error?: {
    response: number;
    message: string;
  };
}

/**
 * Non-streaming API response format
 */
interface ConversationsApiResponse {
  response: {
    conversation_id: string;
    answer: string;
    sources: AiAnswersSource[];
  };
  errors: string[];
  status: number;
}

/**
 * Sentiment value type for rating AI Answers
 */
export type SentimentValue = 'positive' | 'negative' | 'neutral';

/**
 * Execute AI Answers query with streaming support
 *
 * @param apiHostname - API hostname
 * @param sitekey - Site key
 * @param settings - Query settings
 * @param cb - Callback function called progressively during streaming
 * @param useStreaming - Whether to use streaming endpoint (default: false)
 */
export const executeAiAnswersFetch = (
  apiHostname: string,
  sitekey: string,
  settings: Settings | null,
  cb: ApiFetchCallback<AiAnswersResponse>,
  useStreaming: boolean = false
): void => {
  if (useStreaming) {
    executeStreamingAiAnswers(apiHostname, sitekey, settings, cb);
  } else {
    executeNonStreamingAiAnswers(apiHostname, sitekey, settings, cb);
  }
};

/**
 * Execute AI Answers with streaming (new endpoint)
 */
const executeStreamingAiAnswers = (
  apiHostname: string,
  sitekey: string,
  settings: Settings | null,
  cb: ApiFetchCallback<AiAnswersResponse>
): void => {
  const streamingEndpoint = `https://${apiHostname}/v2/indices/${sitekey}/conversations_new`;

  // Throttling state at outer scope for proper cleanup
  const THROTTLE_MS = 500;
  let lastCallbackTime = 0;
  let throttleTimeout: ReturnType<typeof setTimeout> | null = null;
  let pendingCallback = false;

  // Cleanup helper
  const cleanup = () => {
    if (throttleTimeout) {
      clearTimeout(throttleTimeout);
      throttleTimeout = null;
    }
    pendingCallback = false;
  };

  fetch(streamingEndpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      question: settings?.keyword,
      filter: settings?.aiAnswersFilterObject
    })
  })
    .then(async (response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('No response body reader available');
      }

      let conversationId = '';
      let answer = '';
      let sources: AiAnswersSource[] = [];
      let done = false;
      let buffer = ''; // Buffer for incomplete lines

      // Helper to call callback with throttling for tokens
      const throttledCallback = (response: AiAnswersResponse, immediate: boolean = false) => {
        if (immediate) {
          // Clear any pending throttled callback
          cleanup();
          lastCallbackTime = Date.now();
          cb(response);
        } else {
          // Throttle token callbacks
          const now = Date.now();
          const timeSinceLastCallback = now - lastCallbackTime;

          if (timeSinceLastCallback >= THROTTLE_MS) {
            // Enough time has passed, call immediately
            lastCallbackTime = now;
            pendingCallback = false;
            cb(response);
          } else {
            // Schedule for later, replacing any existing scheduled callback
            pendingCallback = true;
            if (throttleTimeout) {
              clearTimeout(throttleTimeout);
            }
            throttleTimeout = setTimeout(() => {
              if (pendingCallback) {
                lastCallbackTime = Date.now();
                pendingCallback = false;
                cb(response);
              }
            }, THROTTLE_MS - timeSinceLastCallback);
          }
        }
      };

      let completedNormally = false;

      while (!done) {
        const { value, done: readerDone } = await reader.read();

        done = readerDone;

        if (value) {
          const chunk = decoder.decode(value, { stream: true });
          buffer += chunk;

          // Split by newlines, keeping incomplete line in buffer
          const lines = buffer.split('\n');
          buffer = lines.pop() || ''; // Keep the last (potentially incomplete) line

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const dataStr = line.substring(6).trim(); // Remove "data: " prefix and trim

              // Check for [DONE] marker
              if (dataStr === '[DONE]') {
                done = true;
                break;
              }

              try {
                const event = JSON.parse(dataStr);

                switch (event.type) {
                  case 'conversation':
                    conversationId = event.conversation_id;

                    // Call callback immediately with initial conversation data
                    throttledCallback(
                      {
                        conversation_id: conversationId,
                        answer: '',
                        sources: [],
                        is_streaming_complete: false
                      },
                      true // immediate
                    );
                    break;

                  case 'token':
                    answer += event.content;
                    // Call callback with throttling for token updates
                    throttledCallback(
                      {
                        conversation_id: conversationId,
                        answer: answer,
                        sources: sources,
                        is_streaming_complete: false
                      },
                      false // throttled
                    );
                    break;

                  case 'sources':
                    sources = event.sources;
                    // Call callback immediately with sources
                    throttledCallback(
                      {
                        conversation_id: conversationId,
                        answer: answer,
                        sources: sources,
                        is_streaming_complete: false
                      },
                      true // immediate
                    );
                    break;

                  case 'complete':
                    // Response is complete - always call immediately
                    completedNormally = true;
                    if (event.status === 200) {
                      // Call callback with final complete data
                      throttledCallback(
                        {
                          conversation_id: conversationId,
                          answer: answer,
                          sources: sources,
                          is_streaming_complete: true
                        },
                        true // immediate
                      );
                    } else {
                      throttledCallback(
                        {
                          conversation_id: conversationId,
                          answer: answer,
                          sources: sources,
                          is_streaming_complete: true,
                          error: {
                            response: event.status,
                            message: event.errors.join(', ') || 'Unknown error'
                          }
                        },
                        true // immediate
                      );
                    }
                    break;

                  default:
                    break;
                }
              } catch (parseError) {
                console.error(
                  'AI Answers: Error parsing Streaming event:',
                  parseError,
                  'Data:',
                  dataStr
                );
              }
            }
          }
        }
      }

      // Handle unexpected disconnection (stream ended without 'complete' event)
      if (!completedNormally) {
        console.warn('AI Answers: Stream ended unexpectedly, returning partial data');

        // Clean up any pending throttle timeout
        cleanup();

        // Call callback with whatever data we have
        cb({
          conversation_id: conversationId || '',
          answer: answer,
          sources: sources,
          is_streaming_complete: true,
          error: {
            response: RESPONSE_SERVER_ERROR,
            message: 'Connection closed unexpectedly. Partial response returned.'
          }
        });
      }
    })
    .catch(function (error) {
      console.error('AI Answers streaming error:', error);

      // Clean up any pending throttle timeout
      cleanup();

      // Call error callback immediately
      cb({
        conversation_id: '',
        answer: '',
        sources: [],
        is_streaming_complete: true,
        error: {
          response: RESPONSE_SERVER_ERROR,
          message: 'Streaming request failed: ' + error.message
        }
      });
    });
};

/**
 * Execute AI Answers with non-streaming endpoint
 */
const executeNonStreamingAiAnswers = (
  apiHostname: string,
  sitekey: string,
  settings: Settings | null,
  cb: ApiFetchCallback<AiAnswersResponse>
): void => {
  fetch(`https://${apiHostname}/v2/indices/${sitekey}/conversations`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      question: settings?.keyword,
      filter: settings?.aiAnswersFilterObject
    })
  })
    .then((response) => response.json())
    .then((data: ConversationsApiResponse) => {
      if (data.response) {
        cb({
          conversation_id: data.response.conversation_id,
          answer: data.response.answer,
          sources: data.response.sources,
          is_streaming_complete: true
        });
      } else {
        cb({
          conversation_id: '',
          answer: '',
          sources: [],
          is_streaming_complete: true,
          error: {
            response: RESPONSE_SERVER_ERROR,
            message: 'Could not get ai-answers response in the expected data format'
          }
        });
      }
    })
    .catch((error) => {
      console.error(error);
      cb({
        conversation_id: '',
        answer: '',
        sources: [],
        is_streaming_complete: true,
        error: {
          response: RESPONSE_SERVER_ERROR,
          message: 'invalid server response'
        }
      });
    });
};

/**
 * Submit a sentiment rating for an AI Answers conversation
 *
 * @param apiHostname - API hostname
 * @param sitekey - Site key
 * @param conversationId - Conversation ID to rate
 * @param sentimentValue - Sentiment value ('positive', 'negative', or 'neutral')
 * @returns Promise that resolves to true on success
 */
export const putSentimentClick = (
  apiHostname: string,
  sitekey: string,
  conversationId: string,
  sentimentValue: SentimentValue
): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    aiAnswersInteractionsInstance
      .put(`https://${apiHostname}/v2/indices/${sitekey}/conversations/${conversationId}/rating`, {
        value: sentimentValue === 'positive' ? 1 : sentimentValue === 'negative' ? -1 : 0
      })
      .then((response) => {
        if (response.status === 200) {
          resolve(true);
        } else {
          reject(
            new Error(
              JSON.stringify({
                type: RESPONSE_SERVER_ERROR,
                message: 'Unable to put sentiment click value.'
              })
            )
          );
        }
      })
      .catch((error) => {
        console.error(error);
        reject(
          new Error(
            JSON.stringify({
              type: RESPONSE_SERVER_ERROR,
              message: 'Unable to put sentiment click value.'
            })
          )
        );
      });
  });
};
