'use strict';

var settings = function() {
  this.settings = {
    keyword: '*',
    callback: null,
    fuzzy: true,
    paging: {
      page: 1,
      pageSize: 10,
      sortBy: 'relevance',
      sortOrder: 'desc'
    },
    customFieldFilters: [],
    userToken: null,
    suggestionsSize: 10,
    facetFields: []
  };

  this.getSettings = function() {
    return this.settings;
  }

  this.setKeyword = function(keyword) {
    this.settings.keyword = keyword || '*';
  }

  this.setCallback = function(cb) {
    this.settings.callback = cb;
  }

  this.setSuggestionsPrefix = function(prefix) {
    this.settings.suggestionsPrefix = prefix;
  }

  this.setSuggestionsSize = function(size) {
    this.settings.suggestionsSize = size;
  }

  this.setLanguage = function(language) {
    if (language && language.length !== 2) {
      throw "use 2-char language code (e.g. \"en\")";
    }
    this.settings.lang = language;
  }

  this.useFuzzyMatch = function(fuzzy) {
    this.settings.fuzzy = fuzzy;
  }

  this.setCategoryFilters = function(categories) {
    this.settings.categories = categories;
  }

  this.setFilterObject = function(filter) {
    this.settings.filterObject= filter;
  }

  this.setPriceRangeFilter = function(minCents, maxCents) {
    this.settings.priceFromCents = minCents;
    this.settings.priceToCents = maxCents;
  }

  this.addCustomFieldFilter = function(fieldName, value) {
    var filter = encodeURIComponent(fieldName + '=' + value);
    if (this.settings.customFieldFilters.indexOf(filter) === -1) {
      this.settings.customFieldFilters.push(filter);
    }
  }

  this.removeCustomFieldFilter = function(fieldName, value) {
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

  this.setDateFilter = function(dateFrom, dateTo) {
    this.settings.dateFrom = dateFrom;
    this.settings.dateTo = dateTo;
  }

  this.setKeyword = function(keyword) {
    this.settings.keyword = keyword || '*';
  }

  this.setJWT = function(jwt) {
    this.settings.jwt = jwt;
  }

  this.setUserToken = function(token) {
    this.settings.userToken = token;
  }

  this.setPersonalizationEvents = function(events) {
    this.settings.personalizationEvents = events;
  }

  this.setResultType = function(type) {
    this.settings.resultType = type;
  }

  this.addFacetField = function(field) {
    if (this.settings.facetFields.indexOf(field) === -1) {
      this.settings.facetFields.push(field);
    }
  }

  this.setNumberOfFacets = function(numFacets) {
    this.settings.numFacets = numFacets;
  }

  this.setPaging = function(page, pageSize, sortBy, sortOrder) {
    // Validate
    if (page < 1) {
      throw "page must be 1 or bigger";
    }
    if (pageSize < 1 || pageSize > 300) {
      throw "pageSize must be 1-300";
    }
    if (sortOrder !== 'asc' && sortOrder !== 'desc') {
      throw "sortOrder must be asc or desc";
    }

    this.settings.paging.page = page;
    this.settings.paging.pageSize = pageSize;
    this.settings.paging.sortBy = sortBy;
    this.settings.paging.sortOrder = sortOrder;
  }

  this.nextPage = function() {
    this.settings.paging.page = this.settings.paging.page + 1;
  }

  this.previousPage = function() {
    if (this.settings.paging.page > 0) {
      this.settings.paging.page = this.settings.paging.page - 1;
    }
  }
}

module.exports = settings;