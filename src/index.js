'use strict';

var executeApiFetch = require('./apifetch');
var Settings = require('./settings');
var util = require('./util');
//var sendClickHit = require('./stats');

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

    var keyword = null;
    var callback = null;

    // Keyword and callback
    if (a1 && util.isFunction(a2)) {
      keyword = a1;
      callback = a2;
    }
    // If function is called with callback only, use previous keyword from settings object
    else if (!a2 && util.isFunction(a1)) {
      keyword = this.settings.getSettings().keyword;
      callback = a1;
    }
    else {
      throw "Illegal search parameters. Should be (keyword, callbackFunction) or just (callbackFunction)";
    }

    this.settings.setKeyword(keyword);
    executeApiFetch(this.sitekey, 'search', this.settings.getSettings(), callback);
  }


  /**
   * Fetch search suggestions
   *
   * @param keyword
   */
  this.suggestions = function(prefix, callback) {
    if (!prefix || !callback || !util.isFunction(callback)) {
      throw "Illegal suggestions parameters. Should be (prefix, callbackFunction)";
    }
    this.settings.setSuggestionsPrefix(prefix);
    executeApiFetch(this.sitekey, 'suggest', this.settings.getSettings(), callback);
  }


  /**
   * Public functions
   */
  this.getSettings = function() { return this.settings.getSettings(); }
  this.setLanguage = function(lang) { this.settings.setLanguage(lang); }
  this.useFuzzyMatch = function(use) { this.settings.useFuzzyMatch(use); }
  this.setCategoryFilters = function(categories) { this.settings.setCategoryFilters(categories); }
  this.addCustomFieldFilter = function(fieldName, value) { this.settings.addCustomFieldFilter(fieldName, value); }
  this.removeCustomFieldFilter = function(fieldName, value) { this.settings.removeCustomFieldFilter(fieldName, value); }
  this.setDateFilter = function(dateFrom, dateTo) { this.settings.setDateFilter(dateFrom, dateTo); }
  this.setJWT = function(jwt) { this.settings.setJWT(jwt); }
  this.setPaging = function(page, pageSize, sortBy, sortOder) { this.settings.setPaging(page, pageSize, sortBy, sortOder); }
  this.nextPage = function() { this.settings.nextPage(); }
  this.previousPage = function() { this.settings.previousPage(); }
  //this.hitClicked = function(docid, position) { sendClickHit(this.sitekey, this.settings.getSettings().keyword, docid, position); }
}

module.exports = client;