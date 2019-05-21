"use strict";

/**
 * Fetch search results of search suggestions from the Addsearch API
 */
function executeApiFetch(type, keyword, cb) {
  const RESPONSE_BAD_REQUEST = 400;
  const RESPONSE_SERVER_ERROR = 500; // Validate query type

  if (type !== 'search' && type !== 'suggest') {
    cb({
      error: {
        response: RESPONSE_BAD_REQUEST,
        message: 'invalid query type'
      }
    });
    return;
  } // If no keyword, fetch all results


  let kw = keyword || '*'; // Boolean operators (AND, OR, NOT) uppercase

  kw = kw.replace(/ and /g, ' AND ').replace(/ or /g, ' OR ').replace(/ not /g, ' NOT '); // Escape

  kw = encodeURIComponent(kw); // Execute API call

  fetch('https://api.addsearch.com/v1/' + type + '/' + this.sitekey + '?term=' + kw).then(function (response) {
    return response.json();
  }).then(function (json) {
    cb(json);
  }).catch(function (ex) {
    cb({
      error: {
        response: RESPONSE_SERVER_ERROR,
        message: 'invalid server response'
      }
    });
  });
}

exports.executeApiFetch = executeApiFetch;
;
"use strict";

var _apifetch = require('./apifetch');

var executeApiFetch = _apifetch.executeApiFetch;

require('whatwg-fetch');

function client(sitekey) {
  this.sitekey = sitekey;
  /**
   * Fetch search results
   *
   * @param keyword
   */

  this.search = function (keyword, cb) {
    this.executeApiFetch('search', keyword, cb);
  };
  /**
   * Fetch search suggestions
   *
   * @param keyword
   */


  this.suggest = function (keyword, cb) {
    this.executeApiFetch('suggest', keyword, cb);
  };
  /**
   *
   */


  this.executeApiFetch = executeApiFetch;
}

module.exports = client;