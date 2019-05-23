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

  this.getSettings = function () {
    return this.settings;
  }

  this.setKeyword = function (keyword) {
    this.settings.keyword = keyword || '*';
  }

  this.setLanguage = function (language) {
    console.log('LANG SET TO ' + language);
    this.settings.lang = language;
  }

  this.setPaging = function (page, pageSize, sortBy, sortOder) {
    this.settings.paging.page = page;
    this.settings.paging.pageSize = pageSize;
    this.settings.paging.sortBy = sortBy;
    this.settings.paging.sortOder = sortOder;
  }
  this.nextPage = function () {
    this.settings.paging.page = this.settings.paging.page + 1;
  }
  this.previousPage = function () {
    if (this.settings.paging.page > 0) {
      this.settings.paging.page = this.settings.paging.page - 1;
    }
  }
}

module.exports = settings;