'use strict';

const util = require('./util');
const Promise = require('es6-promise').Promise;
const axios = require('axios').default;

const getHeaders = function (sitekey, privatekey) {
  return {
    'Authorization': 'Basic ' + util.base64(sitekey + ':' + privatekey),
    'Content-Type': 'application/json'
  };
};

/**
 * Fetch document
 */
var getDocument = function (apiHostname, sitekey, privatekey, id) {
  const promise = new Promise((resolve, reject) => {
    axios
      .get('https://' + apiHostname + '/v2/indices/' + sitekey + '/documents/' + id, {
        headers: getHeaders(sitekey, privatekey)
      })
      .then((response) => {
        if (response.status == 200) {
          resolve(response.data);
        } else {
          reject({ status: response.status, text: response.statusText });
        }
      })
      .catch((ex) => {
        reject({ status: 400, text: ex });
      });
  });

  return promise;
};

/**
 * Add document
 */
var saveDocument = function (apiHostname, sitekey, privatekey, document) {
  // If the doc has id or url field, PUT instead of POST

  const isPut = document.id || document.url;

  const promise = new Promise((resolve, reject) => {
    axios({
      url: 'https://' + apiHostname + '/v2/indices/' + sitekey + '/documents/',
      method: isPut ? 'put' : 'post',
      headers: getHeaders(sitekey, privatekey),
      data: document
    })
      .then((response) => {
        if (response.status == 202) {
          resolve({ status: response.status, text: response.statusText });
        } else {
          reject({ status: response.status, text: response.statusText });
        }
      })
      .catch((ex) => {
        reject({ status: 400, text: ex });
      });
  });

  return promise;
};

/**
 * Batch add documents
 */
var saveDocumentsBatch = function (apiHostname, sitekey, privatekey, documents) {
  const promise = new Promise((resolve, reject) => {
    axios({
      method: 'put',
      url: 'https://' + apiHostname + '/v2/indices/' + sitekey + '/documents:batch',
      headers: getHeaders(sitekey, privatekey),
      data: documents
    })
      .then((response) => {
        if (response.status == 202) {
          resolve({ status: response.status, text: response.statusText });
        } else {
          reject({ status: response.status, text: response.statusText });
        }
      })
      .catch((ex) => {
        reject({ status: 400, text: ex });
      });
  });

  return promise;
};

/**
 * Delete documents
 */
var deleteDocument = function (apiHostname, sitekey, privatekey, id) {
  const promise = new Promise((resolve, reject) => {
    axios
      .delete('https://' + apiHostname + '/v2/indices/' + sitekey + '/documents/' + id, {
        headers: getHeaders(sitekey, privatekey)
      })
      .then((response) => {
        if (response.status == 202) {
          resolve({ status: response.status, text: response.statusText });
        } else {
          reject({ status: response.status, text: response.statusText });
        }
      })
      .catch((ex) => {
        reject({ status: 400, text: ex });
      });
  });

  return promise;
};

/**
 * Batch delete documents
 */
var deleteDocumentsBatch = function (apiHostname, sitekey, privatekey, batch) {
  const promise = new Promise((resolve, reject) => {
    axios
      .delete('https://' + apiHostname + '/v2/indices/' + sitekey + '/documents:batch', {
        headers: getHeaders(sitekey, privatekey),
        data: batch
      })
      .then((response) => {
        if (response.status == 202) {
          resolve({ status: response.status, text: response.statusText });
        } else {
          reject({ status: response.status, text: response.statusText });
        }
      })
      .catch((ex) => {
        reject({ status: 400, text: ex });
      });
  });

  return promise;
};

module.exports = {
  getDocument,
  saveDocument,
  saveDocumentsBatch,
  deleteDocument,
  deleteDocumentsBatch
};
