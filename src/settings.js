'use strict';

import Util from './util';

export class Settings {
  constructor() {
    this.settings = {
      keyword: '*',
      callback: null,
      throttleTimeMs: 200,
      fuzzy: 'auto',
      paging: {
        page: 1,
        pageSize: 10,
        sortBy: 'relevance',
        sortOrder: 'desc'
      },
      customFieldFilters: [],
      userToken: null,
      suggestionsSize: 10,
      facetFields: [],
      autocomplete: {
        size: 10
      },
      searchOperator: null,
      enableLogicalOperators: false,
      cacheResponseTime: null
    };
  }

  getSettings() {
    return this.settings;
  }

  setKeyword(keyword) {
    this.settings.keyword = keyword || '*';
  }

  setCallback(cb) {
    this.settings.callback = cb;
  }

  setThrottleTime(delay) {
    this.settings.throttleTimeMs = delay;
  }

  setSuggestionsPrefix(prefix) {
    this.settings.suggestionsPrefix = prefix;
  }

  setSuggestionsSize(size) {
    this.settings.suggestionsSize = size;
  }

  setAutocompleteSize(size) {
    this.settings.autocomplete.size = size;
  }

  setAutocompleteParams(field, prefix) {
    this.settings.autocomplete.field = field;
    this.settings.autocomplete.prefix = prefix;
  }

  setLanguage(language) {
    var languageIntlLocale;
    if (Intl && Intl.Locale) {
      try {
        languageIntlLocale = new Intl.Locale(language).language;
      } catch (e) {
        throw "use accepted language code provided by ECMAScript Internationalization API (e.g. \"en\", \"en-GB\")";
      }
    } else {
      languageIntlLocale = language;
    }
    if (languageIntlLocale && languageIntlLocale.length !== 2) {
      throw "use 2-char/4-char language code (e.g. \"en\", \"en-GB\")";
    }
    this.settings.lang = languageIntlLocale;
  }

  setFuzzyMatch(fuzzy) {
    if (fuzzy !== true && fuzzy !== false && fuzzy !== 'auto' && fuzzy !== 'retry') {
      throw "fuzzy matching can be true, false, 'auto', or 'retry'";
    }
    this.settings.fuzzy = fuzzy;
  }

  enableLogicalOperators(enableLogicalOperators) {
    this.settings.enableLogicalOperators = enableLogicalOperators;
  }

  setCacheResponseTime(cacheResponseTime) {
    this.settings.cacheResponseTime = cacheResponseTime;
  }

  setPostfixWildcard(wildcard) {
    this.settings.postfixWildcard = wildcard;
  }

  setCollectAnalytics(collectAnalytics) {
    this.settings.collectAnalytics = collectAnalytics;
  }

  setAnalyticsTag(tagName) {
    this.settings.analyticsTag = tagName;
  }

  setCategoryFilters(categories) {
    this.settings.categories = categories;
  }

  setFilterObject(filter) {
    this.settings.filterObject= filter;
  }

  setPriceRangeFilter(minCents, maxCents) {
    this.settings.priceFromCents = minCents;
    this.settings.priceToCents = maxCents;
  }

  addCustomFieldFilter(fieldName, value) {
    var filter = encodeURIComponent(fieldName + '=' + value);
    if (this.settings.customFieldFilters.indexOf(filter) === -1) {
      this.settings.customFieldFilters.push(filter);
    }
  }

  removeCustomFieldFilter(fieldName, value) {
    var removeAll = false;
    var filter = encodeURIComponent(fieldName + '=' + value);

    // Remove all by fieldName
    if (!value) {
      removeAll = true;
      filter = encodeURIComponent(fieldName + '=');
    }

    for (var i=this.settings.customFieldFilters.length; i>0; i--) {
      var v = this.settings.customFieldFilters[i-1];

      if (removeAll && v.indexOf(filter) === 0) {
        this.settings.customFieldFilters.splice(i-1, 1);
      }
      else if (v === filter) {
        this.settings.customFieldFilters.splice(i-1, 1);
      }
    }
  }

  setDateFilter(dateFrom, dateTo) {
    this.settings.dateFrom = dateFrom;
    this.settings.dateTo = dateTo;
  }

  setJWT(jwt) {
    this.settings.jwt = jwt;
  }

  setUserToken(token) {
    this.settings.userToken = token;
  }

  setPersonalizationEvents(events) {
    this.settings.personalizationEvents = events;
  }

  setResultType(type) {
    this.settings.resultType = type;
  }

  addFacetField(field) {
    if (this.settings.facetFields.indexOf(field) === -1) {
      this.settings.facetFields.push(field);
    }
  }

  addHierarchicalFacetSetting(setting) {
    this.settings.hierarchicalFacetSetting = JSON.stringify(setting);
  }

  addRangeFacet(field, ranges) {
    if (!this.settings.rangeFacets) {
      this.settings.rangeFacets = [];
    }
    this.settings.rangeFacets.push({
      field: field,
      ranges: ranges
    });
  }

  addStatsField(field) {
    if (!this.settings.statsFields) {
      this.settings.statsFields = [];
    }
    if (this.settings.statsFields.indexOf(field) === -1) {
      this.settings.statsFields.push(field);
    }
  }

  setNumberOfFacets(numFacets) {
    this.settings.numFacets = numFacets;
  }

  setPaging(page, pageSize, sortBy, sortOrder) {
    // Validate
    Util.validateSetPagingParams(page, pageSize, sortBy, sortOrder);

    this.settings.paging.page = page;
    this.settings.paging.pageSize = pageSize;
    this.settings.paging.sortBy = sortBy;
    this.settings.paging.sortOrder = sortOrder;
  }

  setShuffleAndLimitTo(shuffleAndLimitTo) {
    this.settings.shuffleAndLimitTo = shuffleAndLimitTo;
  }

  nextPage() {
    this.settings.paging.page = this.settings.paging.page + 1;
  }

  previousPage() {
    if (this.settings.paging.page > 0) {
      this.settings.paging.page = this.settings.paging.page - 1;
    }
  }

  setSearchOperator(operator) {
    if (operator !== 'and' && operator !== 'or') {
      throw "operator must be 'and' || 'or'"
    }
    this.settings.searchOperator = operator;
  }
}
