'use strict';

var settings = function() {
  this.settings = {
    keyword: '*',
    paging: {
      page: 1,
      pageSize: 10,
      sortBy: 'relevance',
      sortOrder: 'desc'
    }
  };

  this.getSettings = function() {
    return this.settings;
  }

  this.setKeyword = function(keyword) {
    this.settings.keyword = keyword || '*';
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

  this.setDateFilter = function(dateFrom, dateTo) {
    this.settings.dateFrom = dateFrom;
    this.settings.dateTo = dateTo;
  }

  this.setKeyword = function(keyword) {
    this.settings.keyword = keyword || '*';
  }

  this.setPaging = function(page, pageSize, sortBy, sortOder) {
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
    this.settings.paging.sortOder = sortOder;
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