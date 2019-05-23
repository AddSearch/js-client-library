'use strict';

var executeApiFetch = require('./apifetch');
var settings = require('./settings');

var client = function(sitekey) {
  this.sitekey = sitekey;

  /**
   * Fetch search results
   *
   * @param keyword
   */
  this.search = function(keyword, cb) {
    executeApiFetch(this.sitekey, 'search', keyword, settings.getSettings(), cb);
  };


  /**
   * Fetch search suggestions
   *
   * @param keyword
   */
  this.suggest = function(keyword, cb) {
    executeApiFetch(this.sitekey, 'suggest', keyword, settings.getSettings(), cb);
  };


  /**
   * Public functions
   */
  this.setLanguage = settings.setLanguage;
}

module.exports = client;