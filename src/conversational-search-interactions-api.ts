'use strict';

import 'es6-promise/auto';
import { RESPONSE_SERVER_ERROR, conversationalSearchInteractionsInstance } from './api';

const putSentimentClick = (
  apiHostname: string,
  sitekey: string,
  conversationId: string,
  sentimentValue: 'positive' | 'negative' | 'neutral'
): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    conversationalSearchInteractionsInstance
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

export { putSentimentClick };
