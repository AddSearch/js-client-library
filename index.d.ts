declare module 'addsearch-js-client' {
    export default class AddSearchClient {
      constructor(sitekey: string, privatekey?: string);
  
      search(keyword: string, callback: (results: any) => void): void;
      search(callback: (results: any) => void): void;
  
      suggestions(prefix: string, callback: (suggestions: any) => void): void;
  
      autocomplete(field: string, prefix: string, callback: (autocomplete: any) => void): void;
  
      fetchCustomApi(field: string, customFilterObject: any, callback: (results: any) => void): void;
  
      fetchRangeFacets(options: { field: string, ranges: any[] }, customFilterObject: any, callback: (results: any) => void): void;
  
      recommendations(options: any, callback: (recommendations: any) => void): void;
  
      getDocument(id: string): Promise<any>;
      saveDocument(document: any): Promise<any>;
      saveDocumentsBatch(batch: { documents: any[] }): Promise<any>;
      deleteDocument(id: string): Promise<any>;
      deleteDocumentsBatch(batch: { documents: string[] }): Promise<any>;
  
      setApiHostname(hostname: string, conf?: { statsApiRequestOnly?: boolean, searchApiRequestOnly?: boolean }): void;
      getSettings(): any;
      setLanguage(lang: string): void;
      setCategoryFilters(categories: string[]): void;
      addCustomFieldFilter(fieldName: string, value: any): void;
      removeCustomFieldFilter(fieldName: string, value: any): void;
      setPriceRangeFilter(minCents: number, maxCents: number): void;
      setDateFilter(dateFrom: string, dateTo: string): void;
      setJWT(jwt: string): void;
      setUserToken(token: string): void;
      setPaging(page: number, pageSize: number, sortBy?: string, sortOrder?: 'asc' | 'desc'): void;
      nextPage(): void;
      previousPage(): void;
      setSuggestionsSize(size: number): void;
      setAutocompleteSize(size: number): void;
      addFacetField(fieldName: string): void;
      addHierarchicalFacetSetting(setting: any): void;
      addRangeFacet(field: string, ranges: any[]): void;
      addStatsField(field: string): void;
      setNumberOfFacets(numFacets: number): void;
      setResultType(type: string): void;
      setPersonalizationEvents(events: any[]): void;
      setFilterObject(filter: any): void;
      setShuffleAndLimitTo(shuffleAndLimitTo: number): void;
      setFuzzyMatch(fuzzy: boolean): void;
      setPostfixWildcard(wildcard: boolean): void;
      setCacheResponseTime(cacheResponseTime: number): void;
      setCollectAnalytics(collectAnalytics: boolean): void;
      setAnalyticsTag(tagName: string): void;
      setThrottleTime(delay: number): void;
      setStatsSessionId(id: string): void;
      getStatsSessionId(): string;
      enableLogicalOperators(enableLogicalOperators: boolean): void;
      setSearchOperator(operator: string): void;
  
      sendStatsEvent(type: 'search' | 'click', keyword: string, data: any): void;
  
      getUserTokenInPersonalization(): string;
      enablePersonalizationTracking(isEnabled: boolean, cookieExpireDays?: number): void;
      consentAddSearchCookie(isEnabled: boolean): void;
  
      setApiRequestInterceptor(callback: (request: any) => any, option?: { searchApiRequestOnly?: boolean, statsApiRequestOnly