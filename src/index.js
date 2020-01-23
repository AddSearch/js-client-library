'use strict';

var executeApiFetch = require('./apifetch');
var sendStats = require('./stats');
var Settings = require('./settings');
var util = require('./util');

var client = function(sitekey) {
  this.sitekey = sitekey;
  this.settings = new Settings();
  this.sessionId = ('a-' + (Math.random() * 100000000)).substring(0, 10);

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
    // Use previous keyword and callback
    else if (this.settings.getSettings().callback) {
      keyword = this.settings.getSettings().keyword;
      callback = this.settings.getSettings().callback;
    }
    else {
      throw "Illegal search parameters. Should be (keyword, callbackFunction) or (callbackFunction)";
    }

    this.settings.setCallback(callback);
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
  this.setCategoryFilters = function(categories) { this.settings.setCategoryFilters(categories); }
  this.addCustomFieldFilter = function(fieldName, value) { this.settings.addCustomFieldFilter(fieldName, value); }
  this.removeCustomFieldFilter = function(fieldName, value) { this.settings.removeCustomFieldFilter(fieldName, value); }
  this.setPriceRangeFilter = function(minCents, maxCents) { this.settings.setPriceRangeFilter(minCents, maxCents); }
  this.setDateFilter = function(dateFrom, dateTo) { this.settings.setDateFilter(dateFrom, dateTo); }
  this.setJWT = function(jwt) { this.settings.setJWT(jwt); }
  this.setUserToken = function(token) { this.settings.setUserToken(token); }
  this.setPaging = function(page, pageSize, sortBy, sortOder) { this.settings.setPaging(page, pageSize, sortBy, sortOder); }
  this.nextPage = function() { this.settings.nextPage(); }
  this.previousPage = function() { this.settings.previousPage(); }
  this.setSuggestionsSize = function(size) { this.settings.setSuggestionsSize(size); }
  this.addFacetField = function(fieldName) { this.settings.addFacetField(fieldName); }
  this.setNumberOfFacets = function(numFacets) { this.settings.setNumberOfFacets(numFacets); }
  this.setResultType = function(type) { this.settings.setResultType(type); }
  this.setPersonalizationEvents = function(events) { this.settings.setPersonalizationEvents(events); }
  this.setFilterObject = function(filter) { this.settings.setFilterObject(filter); }
  this.setShuffleAndLimitTo = function(shuffleAndLimitTo) { this.settings.setShuffleAndLimitTo(shuffleAndLimitTo); }
  this.setFuzzyMatch = function(fuzzy) { this.settings.setFuzzyMatch(fuzzy); }
  this.setCollectAnalytics = function(collectAnalytics) { this.settings.setCollectAnalytics(collectAnalytics); }
  this.searchResultClicked = function(documentId, position) {
    var data = {
      action: 'click',
      session: this.sessionId,
      keyword: this.settings.getSettings().keyword,
      docid: documentId,
      position: position
    };
    sendStats(this.sitekey, data);
  }

  // Deprecated
  this.useFuzzyMatch = function(use) { this.settings.setFuzzyMatch(use); }
}

module.exports = client;