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
 * Execute AI Answers query with streaming
 *
 * @param apiHostname - API hostname
 * @param sitekey - Site key
 * @param settings - Query settings
 * @param cb - Callback function called progressively during streaming
 */
export const executeAiAnswersStreamingFetch = (
  apiHostname: string,
  sitekey: string,
  settings: Settings | null,
  cb: ApiFetchCallback<AiAnswersResponse>
): void => {
  executeStreamingAiAnswers(apiHostname, sitekey, settings, cb);
};

/**
 * Execute AI Answers query without streaming
 *
 * @param apiHostname - API hostname
 * @param sitekey - Site key
 * @param settings - Query settings
 * @param cb - Callback function called once when complete
 */
export const executeAiAnswersNonStreamingFetch = (
  apiHostname: string,
  sitekey: string,
  settings: Settings | null,
  cb: ApiFetchCallback<AiAnswersResponse>
): void => {
  executeNonStreamingAiAnswers(apiHostname, sitekey, settings, cb);
};

/**
 * Manages throttled callback execution for streaming responses
 */
class CallbackThrottler {
  private static readonly THROTTLE_MS = 100;
  private lastCallbackTime = 0;
  private throttleTimeout: ReturnType<typeof setTimeout> | null = null;
  private pendingCallback = false;

  constructor(private cb: ApiFetchCallback<AiAnswersResponse>) {}

  /**
   * Call callback immediately, bypassing throttling
   * @param response - Response data to pass to callback
   */
  callImmediate(response: AiAnswersResponse): void {
    this.cleanup();
    this.lastCallbackTime = Date.now();
    this.cb(response);
  }

  /**
   * Call callback with throttling applied
   * @param response - Response data to pass to callback
   */
  callThrottled(response: AiAnswersResponse): void {
    this.throttle(response);
  }

  /**
   * Cleanup any pending throttled callbacks
   */
  cleanup(): void {
    if (this.throttleTimeout) {
      clearTimeout(this.throttleTimeout);
      this.throttleTimeout = null;
    }
    this.pendingCallback = false;
  }

  private throttle(response: AiAnswersResponse): void {
    const now = Date.now();
    const timeSinceLastCallback = now - this.lastCallbackTime;

    if (timeSinceLastCallback >= CallbackThrottler.THROTTLE_MS) {
      this.lastCallbackTime = now;
      this.pendingCallback = false;
      this.cb(response);
    } else {
      this.scheduleCallback(response, CallbackThrottler.THROTTLE_MS - timeSinceLastCallback);
    }
  }

  private scheduleCallback(response: AiAnswersResponse, delay: number): void {
    this.pendingCallback = true;
    if (this.throttleTimeout) {
      clearTimeout(this.throttleTimeout);
    }
    this.throttleTimeout = setTimeout(() => {
      if (this.pendingCallback) {
        this.lastCallbackTime = Date.now();
        this.pendingCallback = false;
        this.cb(response);
      }
    }, delay);
  }
}

/**
 * Manages accumulated state during streaming
 */
class StreamState {
  conversationId = '';
  answer = '';
  sources: AiAnswersSource[] = [];
  completedNormally = false;

  getCurrentResponse(isComplete: boolean): AiAnswersResponse {
    return {
      conversation_id: this.conversationId,
      answer: this.answer,
      sources: this.sources,
      is_streaming_complete: isComplete
    };
  }
}

/**
 * SSE event types
 */
interface SSEEvent {
  type: 'metadata' | 'token' | 'sources' | 'done';
  conversation_id?: string;
  content?: string;
  sources?: AiAnswersSource[];
}

/**
 * Parse SSE data line into event object
 */
const parseSSEEvent = (line: string): SSEEvent | null => {
  if (!line.startsWith('data: ')) {
    return null;
  }

  const dataStr = line.substring(6).trim();
  try {
    return JSON.parse(dataStr) as SSEEvent;
  } catch (parseError) {
    console.error('AI Answers: Error parsing Streaming event:', parseError, 'Data:', dataStr);
    throw new Error('Streaming request failed: ' + parseError);
  }
};

/**
 * Handle a single SSE event and update state
 * @returns true if stream should end
 */
const handleSSEEvent = (
  event: SSEEvent,
  state: StreamState,
  throttler: CallbackThrottler
): boolean => {
  switch (event.type) {
    case 'metadata':
      state.conversationId = event.conversation_id || '';
      throttler.callImmediate(state.getCurrentResponse(false));
      return false;

    case 'token':
      state.answer += event.content || '';
      throttler.callThrottled(state.getCurrentResponse(false));
      return false;

    case 'sources':
      state.sources = event.sources || [];
      throttler.callImmediate(state.getCurrentResponse(false));
      return false;

    case 'done':
      state.completedNormally = true;
      throttler.callImmediate(state.getCurrentResponse(true));
      return true;

    default:
      return false;
  }
};

/**
 * Process lines from stream buffer
 * @returns true if stream should end
 */
const processStreamLines = (
  lines: string[],
  state: StreamState,
  throttler: CallbackThrottler
): boolean => {
  for (const line of lines) {
    const event = parseSSEEvent(line);
    if (event) {
      const shouldEnd = handleSSEEvent(event, state, throttler);
      if (shouldEnd) {
        return true;
      }
    }
  }
  return false;
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
  const streamingEndpoint = `https://${apiHostname}/v2/indices/${sitekey}/conversations`;
  const throttler = new CallbackThrottler(cb);
  const state = new StreamState();

  const handleError = (error: Error) => {
    console.error('AI Answers streaming error:', error);
    throttler.cleanup();
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
  };

  const handleUnexpectedDisconnection = () => {
    console.warn('AI Answers: Stream ended unexpectedly, returning partial data');
    throttler.cleanup();
    cb({
      conversation_id: state.conversationId || '',
      answer: state.answer,
      sources: state.sources,
      is_streaming_complete: true,
      error: {
        response: RESPONSE_SERVER_ERROR,
        message: 'Connection closed unexpectedly. Partial response returned.'
      }
    });
  };

  fetch(streamingEndpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      question: settings?.keyword,
      filter: settings?.aiAnswersFilterObject,
      streaming: true
    })
  })
    .then(async (response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No response body reader available');
      }

      await readStream(reader, state, throttler);

      if (!state.completedNormally) {
        handleUnexpectedDisconnection();
      }
    })
    .catch(handleError);
};

/**
 * Read and process SSE stream
 */
const readStream = async (
  reader: ReadableStreamDefaultReader<Uint8Array>,
  state: StreamState,
  throttler: CallbackThrottler
): Promise<void> => {
  const decoder = new TextDecoder();
  let buffer = '';
  let done = false;

  while (!done) {
    const { value, done: readerDone } = await reader.read();
    done = readerDone;

    if (value) {
      const chunk = decoder.decode(value, { stream: true });
      buffer += chunk;

      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      try {
        const shouldEnd = processStreamLines(lines, state, throttler);
        if (shouldEnd) {
          done = true;
        }
      } catch (error) {
        throttler.cleanup();
        throw error;
      }
    }
  }
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
          sources: data.response.sources
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
 * Convert sentiment value to numeric rating
 * @param sentimentValue - Sentiment value ('positive', 'negative', or 'neutral')
 * @returns Numeric rating: 1 for positive, -1 for negative, 0 for neutral
 */
const sentimentToNumericRating = (sentimentValue: SentimentValue): number => {
  if (sentimentValue === 'positive') {
    return 1;
  }
  if (sentimentValue === 'negative') {
    return -1;
  }
  return 0;
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
        value: sentimentToNumericRating(sentimentValue)
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
