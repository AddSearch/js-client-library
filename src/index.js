'use strict';

var executeApiFetch = require('./apifetch');
var sendStats = require('./stats');
var Settings = require('./settings');
var util = require('./util');
var throttle = require('./throttle');

var API_THROTTLE_TIME_MS = 200;

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

    if (!this.throttledSearchFetch) {
      this.throttledSearchFetch = throttle(API_THROTTLE_TIME_MS, executeApiFetch);
    }
    this.throttledSearchFetch(this.sitekey, 'search', this.settings.getSettings(), callback);
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

    if (!this.throttledSuggestionsFetch) {
      this.throttledSuggestionsFetch = throttle(API_THROTTLE_TIME_MS, executeApiFetch);
    }
    this.throttledSuggestionsFetch(this.sitekey, 'suggest', this.settings.getSettings(), callback);
  }


  /**
   * Fetch field autocompletes
   *
   * @param keyword
   */
  this.autocomplete = function(field, prefix, callback) {
    if (!field || !prefix || !callback || !util.isFunction(callback)) {
      throw "Illegal autocomplete parameters. Should be (field, prefix, callbackFunction)";
    }
    this.settings.setAutocompleteParams(field, prefix);

    if (!this.throttledAutocompleteFetch) {
      this.throttledAutocompleteFetch = throttle(API_THROTTLE_TIME_MS, executeApiFetch);
    }
    this.throttledAutocompleteFetch(this.sitekey, 'autocomplete', this.settings.getSettings(), callback);
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
  this.setAutocompleteSize = function(size) { this.settings.setAutocompleteSize(size); }
  this.addFacetField = function(fieldName) { this.settings.addFacetField(fieldName); }
  this.setNumberOfFacets = function(numFacets) { this.settings.setNumberOfFacets(numFacets); }
  this.setResultType = function(type) { this.settings.setResultType(type); }
  this.setPersonalizationEvents = function(events) { this.settings.setPersonalizationEvents(events); }
  this.setFilterObject = function(filter) { this.settings.setFilterObject(filter); }
  this.setShuffleAndLimitTo = function(shuffleAndLimitTo) { this.settings.setShuffleAndLimitTo(shuffleAndLimitTo); }
  this.setFuzzyMatch = function(fuzzy) { this.settings.setFuzzyMatch(fuzzy); }
  this.setPostfixWildcard = function(wildcard) { this.settings.setPostfixWildcard(wildcard); }
  this.setCollectAnalytics = function(collectAnalytics) { this.settings.setCollectAnalytics(collectAnalytics); }
  this.setThrottleTime = function(delay) { API_THROTTLE_TIME_MS = delay; }
  this.setStatsSessionId = function(id) { this.sessionId = id; }
  this.getStatsSessionId = function() { return this.sessionId; }

  this.sendStatsEvent = function(type, keyword, data) {
    if (type === 'search') {
      var data = {
        action: 'search',
        session: this.sessionId,
        keyword: keyword,
        numberOfResults: data.numberOfResults
      };
      sendStats(this.sitekey, data);
    }

    else if (type === 'click') {
      var data = {
        action: 'click',
        session: this.sessionId,
        keyword: keyword,
        docid: data.documentId,
        position: data.position
      };
      sendStats(this.sitekey, data);
    }

    else {
      throw "Illegal sendStatsEvent type parameters. Should be search or click)";
    }
  }


  // Deprecated
  this.searchResultClicked = function(documentId, position) {
    this.sendStatsEvent('click', this.settings.getSettings().keyword, {documentId: documentId, position: position});
  }
}

module.exports = client;