'use strict';

var settings = function() {
  this.settings = {
    keyword: '*',
    fuzzy: true,
    paging: {
      page: 1,
      pageSize: 10,
      sortBy: 'relevance',
      sortOrder: 'desc'
    },
    customFieldFilters: []
  };

  this.getSettings = function() {
    return this.settings;
  }

  this.setKeyword = function(keyword) {
    this.settings.keyword = keyword || '*';
  }

  this.setSuggestionsPrefix = function(prefix) {
    this.settings.suggestionsPrefix = prefix;
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

  this.addCustomFieldFilter = function(fieldName, value) {
    var filter = encodeURIComponent(fieldName + '=' + value);
    this.settings.customFieldFilters.push(filter);
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

  this.setPaging = function(page, pageSize, sortBy, sortOrder) {
    // Validate
    if (page < 1) {
      throw "page must be 1 or bigger";
    }
    if (pageSize < 1 || pageSize > 50) {
      throw "pageSize must be 1-50";
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