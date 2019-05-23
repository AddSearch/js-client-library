'use strict';

var executeApiFetch = require('./apifetch');
var Settings = require('./settings');
var util = require('./util');

var client = function(sitekey) {
  this.sitekey = sitekey;
  this.settings = new Settings();

  /**
   * Fetch search results
   *
   * @param a1  Argument 1: Keyword. If no Argument 2, then this is the callback function and search is executed with
   *            the previous keyword. If there is no Argument 2 and no previous keywords, then search is executed
   *            without keyword (i.e. match all query)
   * @param a2  Callback function to call with search results
   */
  this.search = function(a1, a2) {

    var keyword = a1;
    var callback = a2;

    // If function is called with callback only, use previous keyword from settings object
    if (!a2 && util.isFunction(a1)) {
      keyword = this.settings.getSettings().keyword;
      callback = a1;
    }

    this.settings.setKeyword(keyword);
    executeApiFetch(this.sitekey, 'search', this.settings.getSettings(), callback);
  };


  /**
   * Fetch search suggestions
   *
   * @param keyword
   */
  this.suggest = function(keyword, callback) {
    executeApiFetch(this.sitekey, 'suggest', this.settings.getSettings(), callback);
  };


  /**
   * Public functions
   */
  this.getSettings = function() { return this.settings.getSettings(); }
  this.setLanguage = function(lang) { this.settings.setLanguage(lang); };
  this.setPaging = function(page, pageSize, sortBy, sortOder) { this.settings.setPaging(page, pageSize, sortBy, sortOder); };
  this.nextPage = function() { this.settings.nextPage(); };
  this.previousPage = function() { this.settings.previousPage(); };

}

module.exports = client;