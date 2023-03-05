'use strict';

import { Settings } from "./settings.js";
import Util from './util.js';
import Throttle from "./throttle.js";
import ExecuteApiFetch from "./apifetch.js";
import SendStats from "./stats.js";
import IndexingApi from "./indexingapi.js";

const API_HOSTNAME = 'api.addsearch.com';

export default class AddSearchClient {
  constructor(sitekey, privatekey) {
    this.sitekey = sitekey;
    this.privatekey = privatekey;
    this.apiHostname = API_HOSTNAME;
    this.settings = new Settings();
    this.sessionId = ('a-' + (Math.random() * 100000000)).substring(0, 10);
  }

  /**
   * Fetch search results
   *
   * @param a1  Argument 1: Keyword. If no Argument 2, then this is the callback function and search is executed with
   *            the previous keyword. If there is no Argument 2 and no previous keywords, then search is executed
   *            without keyword (i.e. match all query)
   * @param a2  Callback function to call with search results
   */
  search(keyword, callback) {
    this.settings.setCallback(callback);
    this.settings.setKeyword(keyword);

    if (!this.throttledSearchFetch) {
      this.throttledSearchFetch = Throttle(this.settings.getSettings().throttleTimeMs, ExecuteApiFetch);
    }
    this.throttledSearchFetch(this.apiHostname, this.sitekey, 'search', this.settings.getSettings(), callback);
  }


  /**
   * Fetch search suggestions
   *
   * @param keyword
   */
  suggestions(prefix, callback) {
    if (!prefix || !callback || !Util.isFunction(callback)) {
      throw "Illegal suggestions parameters. Should be (prefix, callbackFunction)";
    }
    this.settings.setSuggestionsPrefix(prefix);

    if (!this.throttledSuggestionsFetch) {
      this.throttledSuggestionsFetch = Throttle(this.settings.getSettings().throttleTimeMs, ExecuteApiFetch);
    }
    this.throttledSuggestionsFetch(this.apiHostname, this.sitekey, 'suggest', this.settings.getSettings(), callback);
  }


  /**
   * Fetch field autocompletes
   *
   * @param keyword
   */
  autocomplete(field, prefix, callback) {
    if (!field || !prefix || !callback || !Util.isFunction(callback)) {
      throw "Illegal autocomplete parameters. Should be (field, prefix, callbackFunction)";
    }
    this.settings.setAutocompleteParams(field, prefix);

    if (!this.throttledAutocompleteFetch) {
      this.throttledAutocompleteFetch = Throttle(this.settings.getSettings().throttleTimeMs, ExecuteApiFetch);
    }
    this.throttledAutocompleteFetch(this.apiHostname, this.sitekey, 'autocomplete', this.settings.getSettings(), callback);
  }



  /**
   * Fetch API with a custom filter object
   */
  fetchCustomApi(field, customFilterObject, callback) {
    var settingsCloned = Object.assign({}, this.settings.getSettings());

    settingsCloned.facetFields = settingsCloned.facetFields.filter(facetField => field === facetField);
    ExecuteApiFetch(this.apiHostname, this.sitekey, 'search', settingsCloned, callback, null, customFilterObject);
  }

  /**
   * Fetch Range Facets
   */
  fetchRangeFacets(options, customFilterObject, callback) {
    var settingsCloned = Object.assign({}, this.settings.getSettings());

    if (!settingsCloned.rangeFacets) {
      settingsCloned.rangeFacets = [];
    }
    settingsCloned.rangeFacets.push({
      field: options.field,
      ranges: options.ranges
    });
    ExecuteApiFetch(this.apiHostname, this.sitekey, 'search', settingsCloned, callback, null, customFilterObject);
  }

  /**
   * Fetch recommendations
   */
  recommendations(options, callback) {
    if (!options || !callback || !Util.isFunction(callback)) {
      throw "Illegal recommendations parameters. Should be (options, callbackFunction)";
    }

    if (!this.throttledSuggestionsFetch) {
      this.throttledSuggestionsFetch = Throttle(this.settings.getSettings().throttleTimeMs, ExecuteApiFetch);
    }
    this.throttledSuggestionsFetch(this.apiHostname, this.sitekey, 'recommend', null, callback, false, null, options);
  }

  /**
   * Indexing API functions
   */
  getDocument(id) {
    return IndexingApi.getDocument(this.apiHostname, this.sitekey, this.privatekey, id);
  }

  saveDocument(document) {
    return IndexingApi.saveDocument(this.apiHostname, this.sitekey, this.privatekey, document);
  }

  saveDocumentsBatch(batch) {
    if (!batch || !batch.documents || !Array.isArray(batch.documents)) {
      throw "Please provide an array of documents: {documents: []}";
    }
    return IndexingApi.saveDocumentsBatch(this.apiHostname, this.sitekey, this.privatekey, batch);
  }

  deleteDocument(id) {
    return IndexingApi.deleteDocument(this.apiHostname, this.sitekey, this.privatekey, id);
  }

  deleteDocumentsBatch(batch) {
    if (!batch || !batch.documents || !Array.isArray(batch.documents)) {
      throw "Please provide an array of document ids: {documents: []}";
    }
    return IndexingApi.deleteDocumentsBatch(this.apiHostname, this.sitekey, this.privatekey, batch);
  }



  /**
   * Public functions
   */
  setApiHostname(hostname) {this.apiHostname = hostname;}

  getSettings() {return this.settings.getSettings();}

  setLanguage(lang) {this.settings.setLanguage(lang);}

  setCategoryFilters(categories) {this.settings.setCategoryFilters(categories);}

  addCustomFieldFilter(fieldName, value) {this.settings.addCustomFieldFilter(fieldName, value);}

  removeCustomFieldFilter(fieldName, value) {this.settings.removeCustomFieldFilter(fieldName, value);}

  setPriceRangeFilter(minCents, maxCents) {this.settings.setPriceRangeFilter(minCents, maxCents);}

  setDateFilter(dateFrom, dateTo) {this.settings.setDateFilter(dateFrom, dateTo);}

  setJWT(jwt) {this.settings.setJWT(jwt);}

  setUserToken(token) {this.settings.setUserToken(token);}

  setPaging(page, pageSize, sortBy, sortOder) {this.settings.setPaging(page, pageSize, sortBy, sortOder);}

  nextPage() {this.settings.nextPage();}

  previousPage() {this.settings.previousPage();}

  setSuggestionsSize(size) {this.settings.setSuggestionsSize(size);}

  setAutocompleteSize(size) {this.settings.setAutocompleteSize(size);}

  addFacetField(fieldName) {this.settings.addFacetField(fieldName);}

  addHierarchicalFacetSetting(setting) {this.settings.addHierarchicalFacetSetting(setting);}

  addRangeFacet(field, ranges) {this.settings.addRangeFacet(field, ranges);}

  addStatsField(field) {this.settings.addStatsField(field);}

  setNumberOfFacets(numFacets) {this.settings.setNumberOfFacets(numFacets);}

  setResultType(type) {this.settings.setResultType(type);}

  setPersonalizationEvents(events) {this.settings.setPersonalizationEvents(events);}

  setFilterObject(filter) {this.settings.setFilterObject(filter);}

  // might be deprecated - not typed yet
  setShuffleAndLimitTo(shuffleAndLimitTo) {this.settings.setShuffleAndLimitTo(shuffleAndLimitTo);}

  setFuzzyMatch(fuzzy) {this.settings.setFuzzyMatch(fuzzy);}

  setPostfixWildcard(wildcard) {this.settings.setPostfixWildcard(wildcard);}

  setCacheResponseTime(cacheResponseTime) {this.settings.setCacheResponseTime(cacheResponseTime)}

  setCollectAnalytics(collectAnalytics) {this.settings.setCollectAnalytics(collectAnalytics);}

  setAnalyticsTag(tagName) {this.settings.setAnalyticsTag(tagName)}

  setThrottleTime(delay) {this.settings.setThrottleTime(delay);}

  setStatsSessionId(id) {this.sessionId = id;}

  getStatsSessionId() {return this.sessionId;}

  enableLogicalOperators(enableLogicalOperators) {this.settings.enableLogicalOperators(enableLogicalOperators)}

  setSearchOperator(operator) {this.settings.setSearchOperator(operator)}



  /**
   *  Analytics events
   */
  sendStatsEvent(type, keyword, data) {
    if (type === 'search') {
      let payload = {
        action: 'search',
        session: this.sessionId,
        keyword: keyword,
        numberOfResults: data.numberOfResults,
        tag: this.getSettings().analyticsTag
      };
      SendStats(this.apiHostname, this.sitekey, payload);
    }

    else if (type === 'click') {
      let payload = {
        action: 'click',
        session: this.sessionId,
        keyword: keyword,
        docid: data.documentId,
        position: data.position,
        tag: this.getSettings().analyticsTag
      };
      SendStats(this.apiHostname, this.sitekey, payload);
    }

    else {
      throw "Illegal sendStatsEvent type parameters. Should be search or click)";
    }
  }


  // // Deprecated
  // searchResultClicked(documentId, position) {
  //   this.sendStatsEvent('click', this.settings.getSettings().keyword, {documentId: documentId, position: position});
  // }

}
