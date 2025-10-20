import 'es6-promise/auto';
import { apiInstance, RESPONSE_BAD_REQUEST, RESPONSE_SERVER_ERROR } from './api';
import { Settings } from './settings';
import { AxiosResponse } from 'axios';
import { isEmptyObject } from './util';

interface RecommendOptions {
  type: 'RELATED_ITEMS' | 'FREQUENTLY_BOUGHT_TOGETHER';
  itemId?: string;
  blockId?: string;
  configurationKey?: string;
}

export interface SearchResponseDocument {
  id: string;
  score: number;
  url: string;
  title: string;
  ts: string;
  images: {
    main: string;
    mainB64: string;
    capture: string;
  };
  categories: string[];
  type: string;
  custom_fields: Record<string, string>;
  document_type: string;
  meta_description: string;
  highlight: string;
}

export interface SearchResponse {
  total_hits: number;
  hits: SearchResponseDocument[];
  facets: any;
  stats: any;
  response_time: number;
}

interface Suggestion {
  value: string;
}

export interface SuggestionsResponse {
  suggestions: Suggestion[];
}

export interface ApiFetchCallback<T = any> {
  (response: T): void;
}

interface SourceDocuments {
  page: number;
  hits: Document[];
  total_hits: number;
}

interface GenericApiResponse {
  total_hits?: number;
}

interface ConversationsApiResponse {
  response: {
    conversation_id: string;
    answer: string;
    ids: string[];
    source_documents: SourceDocuments;
  };
  errors: string[];
  status: number;
}

/* eslint-disable @typescript-eslint/no-explicit-any */
export type ExecuteApiFetch = (
  apiHostname: string,
  sitekey: string,
  type: string,
  settings: Settings | null,
  cb: ApiFetchCallback,
  fuzzyRetry?: boolean | null,
  customFilterObject?: any,
  recommendOptions?: RecommendOptions
) => void;
/* eslint-enable @typescript-eslint/no-explicit-any */

/**
 * Fetch search results of search suggestions from the Addsearch API
 */
const executeApiFetch: ExecuteApiFetch = function (
  apiHostname,
  sitekey,
  type,
  settings,
  cb,
  fuzzyRetry,
  customFilterObject,
  recommendOptions
) {
  /* eslint-disable @typescript-eslint/no-explicit-any */
  const settingToQueryParam = function (setting: any, key: string) {
    if (setting || setting === false) {
      return '&' + key + '=' + setting;
    }
    return '';
  };
  /* eslint-enable @typescript-eslint/no-explicit-any */

  // Validate query type
  if (
    type !== 'search' &&
    type !== 'ai-answers' &&
    type !== 'suggest' &&
    type !== 'autocomplete' &&
    type !== 'recommend'
  ) {
    cb({
      error: { response: RESPONSE_BAD_REQUEST, message: 'invalid query type' }
    });
    return;
  }

  let keyword = '';
  let queryParamsString = '';
  let requestPayloadObject = {};

  // API Path (eq. /search, /suggest, /autocomplete/document-field)
  let apiEndpoint: string | null = null;
  let apiPath = null;

  // Search
  if (type === 'search') {
    // Path
    apiPath = type;

    // Keyword
    keyword = settings?.keyword as string;

    // Boolean operators (AND, OR, NOT) uppercase
    keyword = settings?.enableLogicalOperators
      ? keyword.replace(/ and /g, ' AND ').replace(/ or /g, ' OR ').replace(/ not /g, ' NOT ')
      : keyword.replace(/ AND /g, ' and ').replace(/ OR /g, ' or ').replace(/ NOT /g, ' not ');

    // Escape
    keyword = encodeURIComponent(keyword);

    // Fuzzy
    let fuzzy = settings?.fuzzy;
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

    // GET Parameters
    queryParamsString =
      settingToQueryParam(settings?.lang, 'lang') +
      settingToQueryParam(fuzzy, 'fuzzy') +
      settingToQueryParam(settings?.collectAnalytics, 'collectAnalytics') +
      settingToQueryParam(settings?.postfixWildcard, 'postfixWildcard') +
      settingToQueryParam(settings?.categories, 'categories') +
      settingToQueryParam(settings?.priceFromCents, 'priceFromCents') +
      settingToQueryParam(settings?.priceToCents, 'priceToCents') +
      settingToQueryParam(settings?.dateFrom, 'dateFrom') +
      settingToQueryParam(settings?.dateTo, 'dateTo') +
      settingToQueryParam(settings?.paging.page, 'page') +
      settingToQueryParam(settings?.paging.pageSize, 'limit') +
      settingToQueryParam(settings?.shuffleAndLimitTo, 'shuffleAndLimitTo') +
      settingToQueryParam(settings?.jwt, 'jwt') +
      settingToQueryParam(settings?.resultType, 'resultType') +
      settingToQueryParam(settings?.userToken, 'userToken') +
      settingToQueryParam(settings?.numFacets, 'numFacets') +
      settingToQueryParam(settings?.cacheResponseTime, 'cacheResponseWithTtlSeconds') +
      settingToQueryParam(settings?.searchOperator, 'defaultOperator') +
      settingToQueryParam(settings?.analyticsTag, 'analyticsTag');

    // POST Parameters

    requestPayloadObject = {
      ...requestPayloadObject,
      language: settings?.lang,
      fuzzy: fuzzy !== true && fuzzy !== false ? fuzzy : JSON.stringify(fuzzy),
      collectAnalytics: settings?.collectAnalytics,
      postfixWildcard: settings?.postfixWildcard,
      categories: settings?.categories ? settings?.categories.split(',') : undefined,
      priceFromCents: settings?.priceFromCents ? parseInt(settings?.priceFromCents, 10) : undefined,
      priceToCents: settings?.priceToCents ? parseInt(settings?.priceToCents, 10) : undefined,
      dateFrom: settings?.dateFrom,
      dateTo: settings?.dateTo,
      paging: {
        page: settings?.paging.page ?? 1,
        pageSize: settings?.paging.pageSize ?? 10,
        shuffleAndLimitTo: settings?.shuffleAndLimitTo ?? undefined,
        sortByField: settings?.paging.sortBy,
        sortOrder: settings?.paging.sortOrder
      },
      jwt: settings?.jwt,
      resultType: settings?.resultType,
      userToken: settings?.userToken ?? undefined,
      numFacets: settings?.numFacets,
      cacheResponseWithTtlSeconds: settings?.cacheResponseTime ?? undefined,
      defaultOperator: settings?.searchOperator ?? undefined,
      analyticsTag: settings?.analyticsTag
    };

    // Add sortBy and sortOrder
    if (Array.isArray(settings?.paging.sortBy) && settings?.paging.sortBy.length > 1) {
      settings?.paging.sortBy.forEach(function (value, index) {
        queryParamsString =
          queryParamsString +
          settingToQueryParam(value, 'sort') +
          settingToQueryParam(settings?.paging.sortOrder[index], 'order');
      });
    } else {
      queryParamsString =
        queryParamsString +
        settingToQueryParam(settings?.paging.sortBy, 'sort') +
        settingToQueryParam(settings?.paging.sortOrder, 'order');
    }

    // Add custom field filters
    if (settings?.customFieldFilters) {
      const customFieldFiltersValues: any = {};
      for (let i = 0; i < settings?.customFieldFilters.length; i++) {
        queryParamsString = queryParamsString + '&customField=' + settings?.customFieldFilters[i];

        const decodedCustomFieldFilter = decodeURIComponent(settings?.customFieldFilters[i]);
        const customFieldFilterPair = decodedCustomFieldFilter.split('=');
        const customFieldName = customFieldFilterPair[0];
        const customFieldValue = customFieldFilterPair[1];
        customFieldFiltersValues[customFieldName] = customFieldValue;
      }

      requestPayloadObject = {
        ...requestPayloadObject,
        customField: isEmptyObject(customFieldFiltersValues) ? undefined : customFieldFiltersValues
      };
    }

    // Add facet fields
    if (settings?.facetFields) {
      const facetFieldsValues: string[] = [];
      for (let i = 0; i < settings?.facetFields.length; i++) {
        queryParamsString = queryParamsString + '&facet=' + settings?.facetFields[i];
        facetFieldsValues.push(settings?.facetFields[i]);
      }
      requestPayloadObject = {
        ...requestPayloadObject,
        facet: facetFieldsValues.length > 0 ? facetFieldsValues : undefined
      };
    }

    // Range facets
    if (settings?.rangeFacets) {
      queryParamsString =
        queryParamsString +
        '&rangeFacets=' +
        encodeURIComponent(JSON.stringify(settings?.rangeFacets));
      requestPayloadObject = {
        ...requestPayloadObject,
        rangeFacets: settings?.rangeFacets
      };
    }

    // Hierarchical facets
    if (settings?.hierarchicalFacetSetting) {
      queryParamsString =
        queryParamsString +
        '&hierarchicalFacets=' +
        encodeURIComponent(JSON.stringify(settings?.hierarchicalFacetSetting));
      requestPayloadObject = {
        ...requestPayloadObject,
        hierarchicalFacets: settings?.hierarchicalFacetSetting
      };
    }

    // Stats fields
    if (settings?.statsFields) {
      const statsFieldsValues: string[] = [];
      for (let i = 0; i < settings?.statsFields.length; i++) {
        queryParamsString = queryParamsString + '&fieldStat=' + settings?.statsFields[i];
        statsFieldsValues.push(settings?.statsFields[i]);
      }
      requestPayloadObject = {
        ...requestPayloadObject,
        statsFields: statsFieldsValues
      };
    }

    // Personalization events
    if (settings?.personalizationEvents && Array.isArray(settings?.personalizationEvents)) {
      const personalizationEventsValues: any[] = [];
      for (let i = 0; i < settings?.personalizationEvents.length; i++) {
        const obj = settings?.personalizationEvents[i];
        const key = Object.keys(obj)[0];
        queryParamsString =
          queryParamsString + '&personalizationEvent=' + encodeURIComponent(key + '=' + obj[key]);
        personalizationEventsValues.push(obj);
      }
      requestPayloadObject = {
        ...requestPayloadObject,
        personalizationEvents: personalizationEventsValues
      };
    }

    // Filter object
    if (customFilterObject) {
      queryParamsString =
        queryParamsString + '&filter=' + encodeURIComponent(JSON.stringify(customFilterObject));
      requestPayloadObject = {
        ...requestPayloadObject,
        filter: customFilterObject
      };
    } else if (settings?.filterObject) {
      queryParamsString =
        queryParamsString + '&filter=' + encodeURIComponent(JSON.stringify(settings?.filterObject));
      requestPayloadObject = {
        ...requestPayloadObject,
        filter: isEmptyObject(settings?.filterObject) ? undefined : settings?.filterObject
      };
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

  // Ai Answers
  else if (type === 'ai-answers') {
    apiInstance
      .post(`https://${apiHostname}/v2/indices/${sitekey}/conversations`, {
        question: settings?.keyword,
        filter: settings?.aiAnswersFilterObject
      })
      .then(function (response: AxiosResponse<ConversationsApiResponse>) {
        if (response.data.response) {
          cb(response.data.response);
        } else {
          cb({
            error: {
              response: RESPONSE_SERVER_ERROR,
              message: 'Could not get ai-answers response in the expected data format'
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
      settingToQueryParam(settings?.suggestionsSize, 'size') +
      settingToQueryParam(settings?.lang, 'language');
    requestPayloadObject = {
      ...requestPayloadObject,
      size: settings?.suggestionsSize,
      language: settings?.lang
    };

    keyword = settings?.suggestionsPrefix as string;
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
      settingToQueryParam(settings?.autocomplete.field, 'source') +
      settingToQueryParam(settings?.autocomplete.size, 'size');
    keyword = settings?.autocomplete.prefix || '';
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

    requestPayloadObject = {
      ...requestPayloadObject,
      source: settings?.autocomplete.field,
      size: settings?.autocomplete.size
    };
  } else if (type === 'recommend') {
    if (recommendOptions?.type === 'RELATED_ITEMS') {
      queryParamsString = settingToQueryParam(recommendOptions.itemId, 'itemId');
      apiPath =
        'recommendations/index/' +
        sitekey +
        '/block/' +
        recommendOptions.blockId +
        '?' +
        queryParamsString;

      requestPayloadObject = {
        ...requestPayloadObject,
        itemId: recommendOptions.itemId ?? undefined,
        blockId: recommendOptions.blockId
      };
    } else if (recommendOptions?.type === 'FREQUENTLY_BOUGHT_TOGETHER') {
      queryParamsString = settingToQueryParam(recommendOptions.itemId, 'itemId');
      apiPath =
        'recommendations/' +
        sitekey +
        '?configurationKey=' +
        recommendOptions.configurationKey +
        queryParamsString;

      requestPayloadObject = {
        ...requestPayloadObject,
        itemId: recommendOptions.itemId ?? undefined,
        configurationKey: recommendOptions.configurationKey
      };
    }
    apiEndpoint = 'https://' + apiHostname + '/v1/' + apiPath;
  }

  // Handle API response for all types except ai-answers
  if (type !== 'ai-answers') {
    const handleApiResponse = function (response: AxiosResponse<GenericApiResponse>) {
      const json = response.data;

      // Search again with fuzzy=true if no hits
      if (
        type === 'search' &&
        settings?.fuzzy === 'retry' &&
        json.total_hits === 0 &&
        fuzzyRetry !== true
      ) {
        executeApiFetch(apiHostname, sitekey, type, settings, cb, true);
      } else {
        // Cap fuzzy results to one page as quality decreases quickly
        if (fuzzyRetry === true) {
          json.total_hits = Math.min(
            json.total_hits ?? Infinity,
            settings?.paging?.pageSize ?? Infinity
          );
        }

        // Callback
        cb(json);
      }
    };

    const handleApiError = function (error: any) {
      console.error(error);
      cb({
        error: {
          response: RESPONSE_SERVER_ERROR,
          message: 'invalid server response'
        }
      });
    };

    if (settings?.apiMethod === 'POST' && ['search', 'suggest', 'autocomplete'].includes(type)) {
      apiEndpoint = 'https://' + apiHostname + '/v1/' + apiPath + '/' + sitekey;
      const term = type === 'search' ? decodeURIComponent(keyword) : keyword;
      requestPayloadObject = {
        term,
        ...requestPayloadObject
      };
      apiInstance
        .post(apiEndpoint, requestPayloadObject)
        .then(handleApiResponse)
        .catch(handleApiError);
    } else {
      apiInstance
        .get(apiEndpoint as string)
        .then(handleApiResponse)
        .catch(handleApiError);
    }
  }
};

export default executeApiFetch;
