'use strict';
require('es6-promise').polyfill();
const apiInstance = require('./api').apiInstance;

/**
 * Fetch search results of search suggestions from the Addsearch API
 */
var executeApiFetch = function (
  apiHostname,
  sitekey,
  type,
  settings,
  cb,
  fuzzyRetry,
  customFilterObject,
  recommendOptions
) {
  const RESPONSE_BAD_REQUEST = 400;
  const RESPONSE_SERVER_ERROR = 500;

  var settingToQueryParam = function (setting, key) {
    if (setting || setting === false) {
      return '&' + key + '=' + setting;
    }
    return '';
  };

  // Validate query type
  if (
    type !== 'search' &&
    type !== 'conversational-search' &&
    type !== 'suggest' &&
    type !== 'autocomplete' &&
    type !== 'recommend'
  ) {
    cb({
      error: { response: RESPONSE_BAD_REQUEST, message: 'invalid query type' }
    });
    return;
  }

  var keyword = '';
  var queryParamsString = '';

  // API Path (eq. /search, /suggest, /autocomplete/document-field)
  var apiEndpoint = null;
  var apiPath = null;

  // Search
  if (type === 'search') {
    // Path
    apiPath = type;

    // Keyword
    keyword = settings.keyword;

    // Boolean operators (AND, OR, NOT) uppercase
    keyword = settings.enableLogicalOperators
      ? keyword.replace(/ and /g, ' AND ').replace(/ or /g, ' OR ').replace(/ not /g, ' NOT ')
      : keyword.replace(/ AND /g, ' and ').replace(/ OR /g, ' or ').replace(/ NOT /g, ' not ');

    // Escape
    keyword = encodeURIComponent(keyword);

    // Fuzzy
    var fuzzy = settings.fuzzy;
    if (fuzzy === 'retry') {
      // First call, non fuzzy
      if (fuzzyRetry !== true) {
        fuzzy = false;
      }
      // Second call, fuzzy
      else {
        fuzzy = true;
      }
    }

    queryParamsString =
      settingToQueryParam(settings.lang, 'lang') +
      settingToQueryParam(fuzzy, 'fuzzy') +
      settingToQueryParam(settings.collectAnalytics, 'collectAnalytics') +
      settingToQueryParam(settings.postfixWildcard, 'postfixWildcard') +
      settingToQueryParam(settings.categories, 'categories') +
      settingToQueryParam(settings.priceFromCents, 'priceFromCents') +
      settingToQueryParam(settings.priceToCents, 'priceToCents') +
      settingToQueryParam(settings.dateFrom, 'dateFrom') +
      settingToQueryParam(settings.dateTo, 'dateTo') +
      settingToQueryParam(settings.paging.page, 'page') +
      settingToQueryParam(settings.paging.pageSize, 'limit') +
      settingToQueryParam(settings.shuffleAndLimitTo, 'shuffleAndLimitTo') +
      settingToQueryParam(settings.jwt, 'jwt') +
      settingToQueryParam(settings.resultType, 'resultType') +
      settingToQueryParam(settings.userToken, 'userToken') +
      settingToQueryParam(settings.numFacets, 'numFacets') +
      settingToQueryParam(settings.cacheResponseTime, 'cacheResponseWithTtlSeconds') +
      settingToQueryParam(settings.searchOperator, 'defaultOperator') +
      settingToQueryParam(settings.analyticsTag, 'analyticsTag');

    // Add sortBy and sortOrder
    if (Array.isArray(settings.paging.sortBy)) {
      settings.paging.sortBy.forEach(function (value, index) {
        queryParamsString =
          queryParamsString +
          settingToQueryParam(value, 'sort') +
          settingToQueryParam(settings.paging.sortOrder[index], 'order');
      });
    } else {
      queryParamsString =
        queryParamsString +
        settingToQueryParam(settings.paging.sortBy, 'sort') +
        settingToQueryParam(settings.paging.sortOrder, 'order');
    }

    // Add custom field filters
    if (settings.customFieldFilters) {
      for (let i = 0; i < settings.customFieldFilters.length; i++) {
        queryParamsString = queryParamsString + '&customField=' + settings.customFieldFilters[i];
      }
    }

    // Add facet fields
    if (settings.facetFields) {
      for (let i = 0; i < settings.facetFields.length; i++) {
        queryParamsString = queryParamsString + '&facet=' + settings.facetFields[i];
      }
    }

    // Range facets
    if (settings.rangeFacets) {
      queryParamsString =
        queryParamsString +
        '&rangeFacets=' +
        encodeURIComponent(JSON.stringify(settings.rangeFacets));
    }

    // Hierarchical facets
    if (settings.hierarchicalFacetSetting) {
      queryParamsString =
        queryParamsString +
        '&hierarchicalFacets=' +
        encodeURIComponent(JSON.stringify(settings.hierarchicalFacetSetting));
    }

    // Stats fields
    if (settings.statsFields) {
      for (var i = 0; i < settings.statsFields.length; i++) {
        queryParamsString = queryParamsString + '&fieldStat=' + settings.statsFields[i];
      }
    }

    // Personalization events
    if (settings.personalizationEvents && Array.isArray(settings.personalizationEvents)) {
      for (let i = 0; i < settings.personalizationEvents.length; i++) {
        var obj = settings.personalizationEvents[i];
        var key = Object.keys(obj);
        queryParamsString =
          queryParamsString + '&personalizationEvent=' + encodeURIComponent(key + '=' + obj[key]);
      }
    }

    // Filter object
    if (customFilterObject) {
      queryParamsString =
        queryParamsString + '&filter=' + encodeURIComponent(JSON.stringify(customFilterObject));
    } else if (settings.filterObject) {
      queryParamsString =
        queryParamsString + '&filter=' + encodeURIComponent(JSON.stringify(settings.filterObject));
    }

    apiEndpoint =
      'https://' +
      apiHostname +
      '/v1/' +
      apiPath +
      '/' +
      sitekey +
      '?term=' +
      keyword +
      queryParamsString;
  }

  // Conversational Search
  else if (type === 'conversational-search') {
    // TODO use apiHostname instead of hardcoded URL
    apiInstance
      .post(`https://api.addsearch.com/v2/indices/${sitekey}/conversations`, {
        question: settings.keyword
      })
      .then(function (response) {
        if (response.data.response) {
          cb(response.data.response);
        } else {
          cb({
            error: {
              response: RESPONSE_SERVER_ERROR,
              message: 'Could not get conversational search response in the expected data format'
            }
          });
        }
      })
      .catch(function (error) {
        console.error(error);
        cb({
          error: {
            response: RESPONSE_SERVER_ERROR,
            message: 'invalid server response'
          }
        });
      });
  }

  // Suggest
  else if (type === 'suggest') {
    apiPath = type;
    queryParamsString =
      settingToQueryParam(settings.suggestionsSize, 'size') +
      settingToQueryParam(settings.lang, 'language');
    keyword = settings.suggestionsPrefix;
    apiEndpoint =
      'https://' +
      apiHostname +
      '/v1/' +
      apiPath +
      '/' +
      sitekey +
      '?term=' +
      keyword +
      queryParamsString;
  }

  // Autocomplete
  else if (type === 'autocomplete') {
    apiPath = 'autocomplete/document-field';
    queryParamsString =
      settingToQueryParam(settings.autocomplete.field, 'source') +
      settingToQueryParam(settings.autocomplete.size, 'size');
    keyword = settings.autocomplete.prefix;
    apiEndpoint =
      'https://' +
      apiHostname +
      '/v1/' +
      apiPath +
      '/' +
      sitekey +
      '?term=' +
      keyword +
      queryParamsString;
  } else if (type === 'recommend') {
    if (recommendOptions.type === 'RELATED_ITEMS') {
      queryParamsString = settingToQueryParam(recommendOptions.itemId, 'itemId');
      apiPath =
        'recommendations/index/' +
        sitekey +
        '/block/' +
        recommendOptions.blockId +
        '?' +
        queryParamsString;
    } else if (recommendOptions.type === 'FREQUENTLY_BOUGHT_TOGETHER') {
      queryParamsString = settingToQueryParam(recommendOptions.itemId, 'itemId');
      apiPath =
        'recommendations/' +
        sitekey +
        '?configurationKey=' +
        recommendOptions.configurationKey +
        queryParamsString;
    }
    apiEndpoint = 'https://' + apiHostname + '/v1/' + apiPath;
  }

  if (type !== 'conversational-search') {
    apiInstance
      .get(apiEndpoint)
      .then(function (response) {
        var json = response.data;

        // Search again with fuzzy=true if no hits
        if (
          type === 'search' &&
          settings.fuzzy === 'retry' &&
          json.total_hits === 0 &&
          fuzzyRetry !== true
        ) {
          executeApiFetch(apiHostname, sitekey, type, settings, cb, true);
        }
        // Fuzzy not "retry" OR fuzzyRetry already returning
        else {
          // Cap fuzzy results to one page as quality decreases quickly
          if (fuzzyRetry === true) {
            var pageSize = settings.paging.pageSize;
            if (json.total_hits >= pageSize) {
              json.total_hits = pageSize;
            }
          }

          // Callback
          cb(json);
        }
      })
      .catch(function (error) {
        console.error(error);

        cb({
          error: {
            response: RESPONSE_SERVER_ERROR,
            message: 'invalid server response'
          }
        });
      });
  }
};
module.exports = executeApiFetch;
