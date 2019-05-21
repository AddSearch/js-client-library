'use strict';

var executeApiFetch = require ('./apifetch');

var client = function(sitekey) {
  this.sitekey = sitekey;

  /**
   * Fetch search results
   *
   * @param keyword
   */
  this.search = function(keyword, cb) {
    this.apiFetch('search', keyword, cb);
  };


  /**
   * Fetch search suggestions
   *
   * @param keyword
   */
  this.suggest = function(keyword, cb) {
    this.apiFetch('suggest', keyword, cb);
  };


  /**
   *
   */
  this.apiFetch = executeApiFetch;
}

module.exports = client;