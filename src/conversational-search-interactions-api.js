'use strict';
const RESPONSE_SERVER_ERROR = require('./api').RESPONSE_SERVER_ERROR;
require('es6-promise').polyfill();

const conversationalSearchInteractionsInstance =
  require('./api').conversationalSearchInteractionsInstance;

var putSentimentClick = function (apiHostname, sitekey, conversationId, sentimentValue) {
  return new Promise((resolve, reject) => {
    conversationalSearchInteractionsInstance
      .put(`https://${apiHostname}/v2/indices/${sitekey}/conversations/${conversationId}/rating`, {
        value: sentimentValue === 'positive' ? 1 : sentimentValue === 'negative' ? -1 : 0
      })
      .then(function (response) {
        if (response.status === 200) {
          resolve(true);
        } else {
          reject({
            type: RESPONSE_SERVER_ERROR,
            message: 'Unable to put sentiment click value.'
          });
        }
      })
      .catch(function (error) {
        console.error(error);
        reject({
          type: RESPONSE_SERVER_ERROR,
          message: 'Unable to put sentiment click value.'
        });
      });
  });
};

module.exports = { putSentimentClick };
