'use strict';

var executeApiFetch = require('./apifetch');
var indexingapi = require('./indexingapi');
var sendStats = require('./stats');
var Settings = require('./settings');
var util = require('./util');
var throttle = require('./throttle');

var API_HOSTNAME = 'api.addsearch.com';

var client = function(sitekey, privatekey) {
  this.sitekey = sitekey;
  this.privatekey = privatekey;
  this.apiHostname = API_HOSTNAME;
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
      this.throttledSearchFetch = throttle(this.settings.getSettings().throttleTimeMs, executeApiFetch);
    }
    this.throttledSearchFetch(this.apiHostname, this.sitekey, 'search', this.settings.getSettings(), callback);
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
      this.throttledSuggestionsFetch = throttle(this.settings.getSettings().throttleTimeMs, executeApiFetch);
    }
    this.throttledSuggestionsFetch(this.apiHostname, this.sitekey, 'suggest', this.settings.getSettings(), callback);
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
      this.throttledAutocompleteFetch = throttle(this.settings.getSettings().throttleTimeMs, executeApiFetch);
    }
    this.throttledAutocompleteFetch(this.apiHostname, this.sitekey, 'autocomplete', this.settings.getSettings(), callback);
  }

  /**
   * Fetch API with a custom filter object
   */
  this.fetchCustomApi = function(field, customFilterObject, callback) {
    var settingsCloned = Object.assign({}, this.settings.getSettings());

    settingsCloned.facetFields = settingsCloned.facetFields.filter(facetField => field === facetField);
    executeApiFetch(this.apiHostname, this.sitekey, 'search', settingsCloned, callback, null, customFilterObject);
  }

  /**
   * Fetch recommendations
   *
   * @param item
   */
  this.recommendations = function(options, callback) {
    if (!options || !callback || !util.isFunction(callback)) {
      throw "Illegal recommendations parameters. Should be (options, callbackFunction)";
    }

    if (!this.throttledSuggestionsFetch) {
      this.throttledSuggestionsFetch = throttle(this.settings.getSettings().throttleTimeMs, executeApiFetch);
    }
    this.throttledSuggestionsFetch(this.apiHostname, this.sitekey, 'recommend', null, callback, false, null, options);

  /**
   * Fetch Range Facets
   */
  this.fetchRangeFacets = function(options, customFilterObject, callback) {
    var settingsCloned = Object.assign({}, this.settings.getSettings());

    if (!settingsCloned.rangeFacets) {
      settingsCloned.rangeFacets = [];
    }
    settingsCloned.rangeFacets.push({
      field: options.field,
      ranges: options.ranges
    });
    executeApiFetch(this.apiHostname, this.sitekey, 'search', settingsCloned, callback, null, customFilterObject);
  }

  /**
   * Indexing API functions
   */
  this.getDocument = function(id) {
    return indexingapi.getDocument(this.apiHostname, this.sitekey, this.privatekey, id);
  }

  this.saveDocument = function(document) {
    return indexingapi.saveDocument(this.apiHostname, this.sitekey, this.privatekey, document);
  }

  this.saveDocumentsBatch = function(batch) {
    if (!batch || !batch.documents || !Array.isArray(batch.documents)) {
      throw "Please provide an array of documents: {documents: []}";
    }
    return indexingapi.saveDocumentsBatch(this.apiHostname, this.sitekey, this.privatekey, batch);
  }

  this.deleteDocument = function(id) {
    return indexingapi.deleteDocument(this.apiHostname, this.sitekey, this.privatekey, id);
  }

  this.deleteDocumentsBatch = function(batch) {
    if (!batch || !batch.documents || !Array.isArray(batch.documents)) {
      throw "Please provide an array of document ids: {documents: []}";
    }
    return indexingapi.deleteDocumentsBatch(this.apiHostname, this.sitekey, this.privatekey, batch);
  }




  /**
   * Public functions
   */
  this.setApiHostname = function(hostname) { this.apiHostname = hostname; }
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
  this.addHierarchicalFacetSetting = function(setting) { this.settings.addHierarchicalFacetSetting(setting); }
  this.addRangeFacet = function(field, ranges) { this.settings.addRangeFacet(field, ranges); }
  this.addStatsField = function(field) { this.settings.addStatsField(field); }
  this.setNumberOfFacets = function(numFacets) { this.settings.setNumberOfFacets(numFacets); }
  this.setResultType = function(type) { this.settings.setResultType(type); }
  this.setPersonalizationEvents = function(events) { this.settings.setPersonalizationEvents(events); }
  this.setFilterObject = function(filter) { this.settings.setFilterObject(filter); }
  this.setShuffleAndLimitTo = function(shuffleAndLimitTo) { this.settings.setShuffleAndLimitTo(shuffleAndLimitTo); }
  this.setFuzzyMatch = function(fuzzy) { this.settings.setFuzzyMatch(fuzzy); }
  this.setPostfixWildcard = function(wildcard) { this.settings.setPostfixWildcard(wildcard); }
  this.setCacheResponseTime = function(cacheResponseTime) { this.settings.setCacheResponseTime(cacheResponseTime) }
  this.setCollectAnalytics = function(collectAnalytics) { this.settings.setCollectAnalytics(collectAnalytics); }
  this.setAnalyticsTag = function(tagName) { this.settings.setAnalyticsTag(tagName) }
  this.setThrottleTime = function(delay) { this.settings.setThrottleTime(delay); }
  this.setStatsSessionId = function(id) { this.sessionId = id; }
  this.getStatsSessionId = function() { return this.sessionId; }
  this.enableLogicalOperators = function(enableLogicalOperators) { this.settings.enableLogicalOperators(enableLogicalOperators) }
  this.setSearchOperator = function(operator) { this.settings.setSearchOperator(operator) }

  this.sendStatsEvent = function(type, keyword,data) {
    if (type === 'search') {
      var payload = {
        action: 'search',
        session: this.sessionId,
        keyword: keyword,
        numberOfResults: data.numberOfResults,
        analyticsTag: this.getSettings().analyticsTag
      };
      sendStats(this.apiHostname, this.sitekey, payload);
    }

    else if (type === 'click') {
      var payload = {
        action: 'click',
        session: this.sessionId,
        keyword: keyword,
        docid: data.documentId,
        position: data.position,
        analyticsTag: this.getSettings().analyticsTag
      };
      sendStats(this.apiHostname, this.sitekey, payload);
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
