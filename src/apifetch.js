'use strict';

require('es6-promise').polyfill();
require('isomorphic-fetch');

/**
 * Fetch search results of search suggestions from the Addsearch API
 */
var executeApiFetch = function(sitekey, type, settings, cb) {

  const RESPONSE_BAD_REQUEST = 400;
  const RESPONSE_SERVER_ERROR = 500;

  var settingToQueryParam = function(setting, key) {
    if (setting) {
      return '&' + key + '=' + setting;
    }
    return '';
  }


  // Validate query type
  if (type !== 'search' && type !== 'suggest') {
    cb({error: {response: RESPONSE_BAD_REQUEST, message: 'invalid query type'}});
    return;
  }

  // Keyword and query string
  var kw = '';
  var qs = '';

  // Search
  if (type === 'search') {
    // Keyword
    kw = settings.keyword;

    // Boolean operators (AND, OR, NOT) uppercase
    kw = kw.replace(/ and /g, ' AND ').replace(/ or /g, ' OR ').replace(/ not /g, ' NOT ');

    // Escape
    kw = encodeURIComponent(kw);

    // Construct query string from settings
    if (type === 'search') {
      qs = settingToQueryParam(settings.lang, 'lang') +
        settingToQueryParam(settings.fuzzy, 'fuzzy') +
        settingToQueryParam(settings.categories, 'categories') +
        settingToQueryParam(settings.priceFromCents, 'priceFromCents') +
        settingToQueryParam(settings.priceToCents, 'priceToCents') +
        settingToQueryParam(settings.dateFrom, 'dateFrom') +
        settingToQueryParam(settings.dateTo, 'dateTo') +
        settingToQueryParam(settings.paging.page, 'page') +
        settingToQueryParam(settings.paging.pageSize, 'limit') +
        settingToQueryParam(settings.paging.sortBy, 'sort') +
        settingToQueryParam(settings.paging.sortOrder, 'order') +
        settingToQueryParam(settings.shuffleAndLimitTo, 'shuffleAndLimitTo') +
        settingToQueryParam(settings.jwt, 'jwt') +
        settingToQueryParam(settings.resultType, 'resultType') +
        settingToQueryParam(settings.userToken, 'userToken') +
        settingToQueryParam(settings.numFacets, 'numFacets');

      // Add custom field filters
      if (settings.customFieldFilters) {
        for (var i = 0; i < settings.customFieldFilters.length; i++) {
          qs = qs + '&customField=' + settings.customFieldFilters[i];
        }
      }

      // Add facet fields
      if (settings.facetFields) {
        for (var i = 0; i<settings.facetFields.length; i++) {
          qs = qs + '&facet=' + settings.facetFields[i];
        }
      }

      // Personalization events
      if (settings.personalizationEvents && Array.isArray(settings.personalizationEvents)) {
        for (var i = 0; i<settings.personalizationEvents.length; i++) {
          var obj = settings.personalizationEvents[i];
          var key = Object.keys(obj);
          qs = qs + '&personalizationEvent=' + encodeURIComponent(key + '=' + obj[key]);
        }
      }

      // Filter object
      if (settings.filterObject) {
        qs = qs + '&filter=' + JSON.stringify(settings.filterObject);
      }

    }
  }

  // Suggest
  else if (type === 'suggest') {
    qs = settingToQueryParam(settings.suggestionsSize, 'size');
    kw = settings.suggestionsPrefix;
  }


  // Execute API call
  fetch('https://api.addsearch.com/v1/' + type + '/' + sitekey + '?term=' + kw + qs)
    .then(function(response) {
      return response.json();
    }).then(function(json) {
    cb(json);
  }).catch(function(ex) {
    console.log(ex);
    cb({error: {response: RESPONSE_SERVER_ERROR, message: 'invalid server response'}});
  });
};
module.exports = executeApiFetch;