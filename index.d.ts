export declare class AddSearchClient
{
  constructor(sitekey: string, privatekey?: string);

  sitekey: string;
  privatekey: string;

  search(keyword: string, cb: (response: any) => void): void;

  suggestions(prefix: string, cb: (response: any) => void): void;

  autocomplete(customField: string, prefix: string, cb: (response: any) => void): void;

  // Public methods
  setApiHostname(hostname: string): void;

  getSettings(): any;

  setLanguage(languageCode: string): void;

  setCategoryFilters(categories: string): void;

  addCustomFieldFilter(customFieldName: string, customFieldValue: string): void;

  removeCustomFieldFilter(customFieldName: string, customFieldValue: string): void;

  setPriceRangeFilter(min: string, max: string): void;

  setDateFilter(dateFrom: string, dateTo: string): void;

  setJWT(token: string): void;

  setUserToken(uuid: string): void;

  setPaging(page: number, pageSize: number, sortBy: Array<string>, sortOrder: Array<string>): void;

  nextPage(): void;

  previousPage(): void;

  setSuggestionsSize(size: number): void;

  setAutocompleteSize(size: number): void;

  addFacetField(field: string): void;

  addHierarchicalFacetSetting(settings: any): void;

  addRangeFacet(fieldName: string, rangeArray: Array<any>): void;

  addStatsField(field: string): void;

  setNumberOfFacets(size: number): void;

  setResultType(type?: string): void;

  setPersonalizationEvents(events: Array<any>): void;

  setFilterObject(filterObject: any): void;

  setFuzzyMatch(fuzzy: boolean | "auto" | "retry"): void;

  setPostfixWildcard(isEnabled: boolean): void;

  setCacheResponseTime(timeToLiveInMs: number): void;

  setCollectAnalytics(isAddSearchAnalyticsCollected: boolean): void;

  setAnalyticsTag(tagName: string): void;

  setThrottleTime(throttleTimeInMs: number): void;

  setStatsSessionId(id: string): void;

  getStatsSessionId(): string;

  enableLogicalOperators(isEnabled: boolean): void;

  setSearchOperator(operator: "or" | "and"): void;

  sendStatsEvent(type: "search" | "click", keyword: string, data: any): void;

  // Indexing API's methods
  getDocument(id: string): Promise<any>;

  saveDocument(document: any): Promise<any>;

  saveDocumentsBatch(batch: Array<any>): Promise<any>;

  deleteDocument(id: string): Promise<any>;

  deleteDocumentsBatch(documents: Array<string>): Promise<any>;

  // Search-UI's supported
  fetchCustomApi(field: string, customFilterObject: any, callback: (response: any) => void): void;

  fetchRangeFacets(options: any, customFilterObject: any, callback: (response: any) => void): void;

  recommendations(options: any, callback: (response: any) => void): void;

  // Deprecated
  searchResultClicked(documentId: string, position: number): void;

}