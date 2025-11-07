import executeApiFetch, {
  ApiFetchCallback,
  ExecuteApiFetch,
  SuggestionsResponse
} from './apifetch';
import {
  getDocument,
  saveDocument,
  saveDocumentsBatch,
  deleteDocumentsBatch,
  deleteDocument
} from './indexingapi';
import sendStats from './stats';
import { putSentimentClick, SentimentValue } from './ai-answers-api';
import SettingsManager, {
  Settings,
  PersonalizationEvent,
  SearchOperator,
  SortByOptions,
  SortOrderOptions,
  FromToRange,
  FuzzyMatch,
  ApiMethod
} from './settings';

import * as util from './util';
import throttle from './throttle';
import * as cookie from './cookie';
import { RequestInterceptorCallback, setRequestInterceptor } from './api';

const API_HOSTNAME = 'api.addsearch.com';
const USER_TOKEN_COOKIE_NAME = 'addsearchUserToken';

interface RangeFacetOption {
  field: string;
  ranges: FromToRange[];
}

interface RecommendationsOptions {
  type: 'RELATED_ITEMS' | 'FREQUENTLY_BOUGHT_TOGETHER';
  itemId?: string;
  blockId?: string;
  configurationKey?: string;
}

interface CustomFilterObject {
  [key: string]: unknown;
}

type SearchEventPayload = {
  numberOfResults: number;
};
type ClickEventPayload = {
  documentId: string;
  position: number;
};
type StatsEventPayload = SearchEventPayload | ClickEventPayload;

class AddSearchClient {
  private readonly sitekey: string;
  private readonly privatekey: string;
  private apiHostname: string;
  private statsApiHostname: string;
  private settings: SettingsManager;
  private sessionId: string;
  private userTokenInPersonalization: string;
  private useStatsSessionId = false;
  private throttledSearchFetch?: ExecuteApiFetch;
  private throttledAiAnswersFetch?: ExecuteApiFetch;
  private throttledSuggestionsFetch?: ExecuteApiFetch;
  private throttledRecommendationFetch?: ExecuteApiFetch;
  private throttledAutocompleteFetch?: ExecuteApiFetch;

  constructor(sitekey: string, privatekey?: string) {
    this.sitekey = sitekey;
    this.privatekey = privatekey || '';
    this.apiHostname = API_HOSTNAME;
    this.statsApiHostname = API_HOSTNAME;
    this.settings = new SettingsManager();
    this.sessionId = `a-${Math.random() * 100000000}`.substring(0, 10);
    this.userTokenInPersonalization =
      cookie.getCookie(USER_TOKEN_COOKIE_NAME) || util.generateUUID();
  }

  search(): void;
  search(a1: string, a2: ApiFetchCallback): void;
  search(a1: ApiFetchCallback): void;
  search(a1?: string | ApiFetchCallback, a2?: ApiFetchCallback): void {
    let keyword: string | null = null;
    let callback: ApiFetchCallback | null = null;

    if (typeof a1 === 'string' && typeof a2 === 'function') {
      keyword = a1;
      callback = a2;
    } else if (typeof a1 === 'function' && !a2) {
      keyword = this.settings.getSettings().keyword || null;
      callback = a1;
    } else if (this.settings.getSettings().callback) {
      keyword = this.settings.getSettings().keyword || null;
      callback = this.settings.getSettings().callback;
    } else {
      throw new Error(
        'Illegal search parameters. Should be (keyword, callbackFunction) or (callbackFunction)'
      );
    }

    this.settings.setCallback(() => callback);
    this.settings.setKeyword(keyword as string);

    this.throttledSearchFetch ??= throttle(
      this.settings.getSettings().throttleTimeMs,
      executeApiFetch
    );

    this.throttledSearchFetch(
      this.apiHostname,
      this.sitekey,
      'search',
      this.settings.getSettings(),
      callback as ApiFetchCallback
    );
  }

  aiAnswers(keyword: string, callback: ApiFetchCallback): void {
    this.settings.setCallback(() => callback);
    this.settings.setKeyword(keyword);

    this.throttledAiAnswersFetch ??= throttle(
      this.settings.getSettings().throttleTimeMs,
      executeApiFetch
    );

    this.throttledAiAnswersFetch(
      this.apiHostname,
      this.sitekey,
      'ai-answers',
      this.settings.getSettings(),
      callback
    );
  }

  putSentimentClick(
    conversationId: string,
    sentimentValue: SentimentValue
  ): Promise<boolean | object> {
    return putSentimentClick(this.apiHostname, this.sitekey, conversationId, sentimentValue);
  }

  suggestions(prefix: string, callback: ApiFetchCallback<SuggestionsResponse>): void {
    if (!prefix || !callback || !util.isFunction(callback)) {
      throw new Error('Illegal suggestions parameters. Should be (prefix, callbackFunction)');
    }
    this.settings.setSuggestionsPrefix(prefix);

    this.throttledSuggestionsFetch ??= throttle(
      this.settings.getSettings().throttleTimeMs,
      executeApiFetch
    );

    this.throttledSuggestionsFetch(
      this.apiHostname,
      this.sitekey,
      'suggest',
      this.settings.getSettings(),
      callback
    );
  }

  autocomplete(field: string, prefix: string, callback: ApiFetchCallback): void {
    if (!field || !prefix || !callback || !util.isFunction(callback)) {
      throw new Error(
        'Illegal autocomplete parameters. Should be (field, prefix, callbackFunction)'
      );
    }
    this.settings.setAutocompleteParams(field, prefix);

    this.throttledAutocompleteFetch ??= throttle(
      this.settings.getSettings().throttleTimeMs,
      executeApiFetch
    );

    this.throttledAutocompleteFetch(
      this.apiHostname,
      this.sitekey,
      'autocomplete',
      this.settings.getSettings(),
      callback
    );
  }

  fetchCustomApi(
    field: string,
    customFilterObject: CustomFilterObject,
    callback: ApiFetchCallback
  ): void {
    const settingsCloned = { ...this.settings.getSettings() };
    settingsCloned.facetFields = settingsCloned.facetFields?.filter(
      (facetField: string) => field === facetField
    );

    executeApiFetch(
      this.apiHostname,
      this.sitekey,
      'search',
      settingsCloned,
      callback,
      null,
      customFilterObject
    );
  }

  fetchRangeFacets(
    options: RangeFacetOption,
    customFilterObject: CustomFilterObject,
    callback: ApiFetchCallback
  ): void {
    const settingsCloned = { ...this.settings.getSettings() };

    settingsCloned.rangeFacets ??= [];
    settingsCloned.rangeFacets.push({ field: options.field, ranges: options.ranges });

    executeApiFetch(
      this.apiHostname,
      this.sitekey,
      'search',
      settingsCloned,
      callback,
      null,
      customFilterObject
    );
  }

  recommendations(options: RecommendationsOptions, callback: ApiFetchCallback): void {
    if (!options || !callback || !util.isFunction(callback)) {
      throw new Error('Illegal recommendations parameters. Should be (options, callbackFunction)');
    }

    this.throttledRecommendationFetch ??= throttle(
      this.settings.getSettings().throttleTimeMs,
      executeApiFetch
    );

    this.throttledRecommendationFetch(
      this.apiHostname,
      this.sitekey,
      'recommend',
      this.settings.getSettings(),
      callback,
      false,
      null,
      options
    );
  }

  getDocument(id: string): Promise<object> {
    return getDocument(this.apiHostname, this.sitekey, this.privatekey, id);
  }

  saveDocument(document: Document): Promise<object> {
    return saveDocument(this.apiHostname, this.sitekey, this.privatekey, document);
  }

  saveDocumentsBatch(batch: { documents: Document[] }): Promise<object> {
    if (!batch || !batch.documents || !Array.isArray(batch.documents)) {
      throw new Error('Please provide an array of documents: {documents: []}');
    }
    return saveDocumentsBatch(this.apiHostname, this.sitekey, this.privatekey, batch);
  }

  deleteDocument(id: string): Promise<object> {
    return deleteDocument(this.apiHostname, this.sitekey, this.privatekey, id);
  }

  deleteDocumentsBatch(batch: { documents: string[] }): Promise<object> {
    if (!batch || !batch.documents || !Array.isArray(batch.documents)) {
      throw new Error('Please provide an array of document ids: {documents: []}');
    }
    return deleteDocumentsBatch(this.apiHostname, this.sitekey, this.privatekey, batch);
  }

  setApiHostname(
    hostname: string,
    conf?: { statsApiRequestOnly?: boolean; searchApiRequestOnly?: boolean }
  ): void {
    if (!conf || !conf.statsApiRequestOnly) {
      this.apiHostname = hostname;
    }
    if (!conf || !conf.searchApiRequestOnly) {
      this.statsApiHostname = hostname;
    }
  }

  getSettings(): Settings {
    return this.settings.getSettings();
  }

  setLanguage(lang: string): void {
    this.settings.setLanguage(lang);
  }

  setCategoryFilters(categories: string): void {
    this.settings.setCategoryFilters(categories);
  }

  addCustomFieldFilter(fieldName: string, value: string): void {
    this.settings.addCustomFieldFilter(fieldName, value);
  }

  removeCustomFieldFilter(fieldName: string, value?: string): void {
    this.settings.removeCustomFieldFilter(fieldName, value);
  }

  setPriceRangeFilter(minCents: string, maxCents: string): void {
    this.settings.setPriceRangeFilter(minCents, maxCents);
  }

  setDateFilter(dateFrom: string, dateTo: string): void {
    this.settings.setDateFilter(dateFrom, dateTo);
  }

  setJWT(jwt: string): void {
    this.settings.setJWT(jwt);
  }

  setUserToken(token: string): void {
    this.settings.setUserToken(token);
  }

  setPaging(
    page: number,
    pageSize: number,
    sortBy: SortByOptions,
    sortOder: SortOrderOptions
  ): void {
    this.settings.setPaging(page, pageSize, sortBy, sortOder);
  }

  nextPage(): void {
    this.settings.nextPage();
  }

  previousPage(): void {
    this.settings.previousPage();
  }

  setSuggestionsSize(size: number): void {
    this.settings.setSuggestionsSize(size);
  }

  setAutocompleteSize(size: number): void {
    this.settings.setAutocompleteSize(size);
  }

  addFacetField(fieldName: string): void {
    this.settings.addFacetField(fieldName);
  }

  addHierarchicalFacetSetting(setting: object): void {
    this.settings.addHierarchicalFacetSetting(setting);
  }

  addRangeFacet(field: string, ranges: FromToRange[]): void {
    this.settings.addRangeFacet(field, ranges);
  }

  addStatsField(field: string): void {
    this.settings.addStatsField(field);
  }

  setNumberOfFacets(numFacets: number): void {
    this.settings.setNumberOfFacets(numFacets);
  }

  setResultType(type: 'organic' | null): void {
    this.settings.setResultType(type);
  }

  setPersonalizationEvents(events: PersonalizationEvent[]): void {
    this.settings.setPersonalizationEvents(events);
  }

  setFilterObject(filter: object): void {
    this.settings.setFilterObject(filter);
  }

  setAiAnswersFilterObject(filter: object): void {
    this.settings.setAiAnswersFilterObject(filter);
  }

  setShuffleAndLimitTo(shuffleAndLimitTo: number): void {
    this.settings.setShuffleAndLimitTo(shuffleAndLimitTo);
  }

  setFuzzyMatch(fuzzy: FuzzyMatch): void {
    this.settings.setFuzzyMatch(fuzzy);
  }

  setPostfixWildcard(wildcard: boolean): void {
    this.settings.setPostfixWildcard(wildcard);
  }

  setCacheResponseTime(cacheResponseTime: number): void {
    this.settings.setCacheResponseTime(cacheResponseTime);
  }

  setCollectAnalytics(collectAnalytics: boolean): void {
    this.settings.setCollectAnalytics(collectAnalytics);
  }

  setAnalyticsTag(tagName: string): void {
    this.settings.setAnalyticsTag(tagName);
  }

  setThrottleTime(delay: number): void {
    this.settings.setThrottleTime(delay);
  }

  setStatsSessionId(id: string): void {
    this.sessionId = id;
    this.userTokenInPersonalization = id;
    this.useStatsSessionId = true;
  }

  getStatsSessionId(): string {
    return this.sessionId;
  }

  enableLogicalOperators(enableLogicalOperators: boolean): void {
    this.settings.enableLogicalOperators(enableLogicalOperators);
  }

  setSearchOperator(operator: SearchOperator): void {
    this.settings.setSearchOperator(operator);
  }

  setApiMethod(method: ApiMethod): void {
    this.settings.setApiMethod(method);
  }

  sendStatsEvent(type: 'search' | 'click', keyword: string, data: StatsEventPayload): void {
    const useUserTokenInCookie =
      !this.useStatsSessionId && isPersonalizationTrackingEnabled && isAddSearchCookieConsented;
    if (useUserTokenInCookie && !cookie.getCookie(USER_TOKEN_COOKIE_NAME)) {
      cookie.setCookie(
        USER_TOKEN_COOKIE_NAME,
        this.userTokenInPersonalization,
        personalizationCookieExpireDays
      );
    }

    if (type === 'search') {
      const payload = {
        action: 'search',
        session: useUserTokenInCookie ? this.userTokenInPersonalization : this.sessionId,
        keyword,
        numberOfResults: (data as SearchEventPayload).numberOfResults,
        tag: this.getSettings().analyticsTag
      };
      sendStats(
        this.statsApiHostname,
        this.sitekey,
        payload,
        this.settings.getSettings().statsRequestIntercepted
      );
    } else if (type === 'click') {
      const payload = {
        action: 'click',
        session: useUserTokenInCookie ? this.userTokenInPersonalization : this.sessionId,
        keyword,
        docid: (data as ClickEventPayload).documentId,
        position: (data as ClickEventPayload).position,
        tag: this.getSettings().analyticsTag
      };
      sendStats(
        this.statsApiHostname,
        this.sitekey,
        payload,
        this.settings.getSettings().statsRequestIntercepted
      );
    } else {
      throw new Error('Illegal sendStatsEvent type parameters. Should be search or click)');
    }
  }

  getUserTokenInPersonalization(): string {
    return this.userTokenInPersonalization;
  }

  enablePersonalizationTracking(isEnabled: boolean, cookieExpireDays?: number): void {
    isPersonalizationTrackingEnabled = isEnabled;
    if (cookieExpireDays) {
      personalizationCookieExpireDays = cookieExpireDays;
    }
  }

  consentAddSearchCookie(isEnabled: boolean): void {
    isAddSearchCookieConsented = isEnabled;
  }

  setApiRequestInterceptor(
    callback: RequestInterceptorCallback,
    option: { searchApiRequestOnly?: boolean; statsApiRequestOnly?: boolean } = {}
  ): void {
    if (typeof callback !== 'function') {
      console.error('API interceptor must be a function');
      return;
    }

    const { searchApiRequestOnly = false, statsApiRequestOnly = false } = option;

    if (!searchApiRequestOnly && !statsApiRequestOnly) {
      setRequestInterceptor(callback, 'searchApi');
      setRequestInterceptor(callback, 'statsApi');
      this.settings.setStatsRequestIntercepted(true);
    } else {
      if (searchApiRequestOnly) {
        setRequestInterceptor(callback, 'searchApi');
      }
      if (statsApiRequestOnly) {
        setRequestInterceptor(callback, 'statsApi');
        this.settings.setStatsRequestIntercepted(true);
      }
    }
  }

  setCookie(cookieName: string, cookieValue: string, expireDays: number): void {
    cookie.setCookie(cookieName, cookieValue, expireDays);
  }

  getCookie(cookieName: string): string | undefined {
    return cookie.getCookie(cookieName);
  }

  searchResultClicked(documentId: string, position: number): void {
    this.sendStatsEvent('click', this.settings.getSettings().keyword || '', {
      documentId,
      position
    });
  }

  useAiAnswersStream(enable: boolean): void {
    this.settings.useAiAnswersStream(enable);
  }
}

let isPersonalizationTrackingEnabled = false;
let isAddSearchCookieConsented = false;
let personalizationCookieExpireDays = 180;

export = AddSearchClient;
