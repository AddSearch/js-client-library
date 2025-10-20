import { validateSetPagingParams } from './util';

export type SortOrder = 'asc' | 'desc';
export type SortByOptions = string | string[];
export type SortOrderOptions = SortOrder | SortOrder[];
export type SearchOperator = 'and' | 'or';
export type FromToRange = {
  from?: number;
  to?: number;
};
export type MinMaxRange = {
  min?: number;
  max?: number;
};

export type PagingSettings = {
  page: number;
  pageSize: number;
  sortBy: SortByOptions;
  sortOrder: SortOrderOptions;
};

export type AutocompleteSettings = {
  size: number;
  field?: string;
  prefix?: string;
};

export type PersonalizationEvent = {
  [key: string]: string;
};

export type FuzzyMatch = boolean | 'auto' | 'retry';

export type Settings = {
  keyword: string;
  callback: (() => void) | null;
  throttleTimeMs: number;
  fuzzy: FuzzyMatch;
  paging: PagingSettings;
  customFieldFilters: string[];
  userToken: string | null;
  suggestionsSize: number;
  facetFields: string[];
  autocomplete: AutocompleteSettings;
  searchOperator: SearchOperator | null;
  enableLogicalOperators: boolean;
  cacheResponseTime: number | null;
  statsRequestIntercepted: boolean;
  suggestionsPrefix?: string;
  lang?: string;
  postfixWildcard?: boolean;
  collectAnalytics?: boolean;
  analyticsTag?: string;
  categories?: string;
  filterObject?: object;
  aiAnswersFilterObject?: object;
  priceFromCents?: string;
  priceToCents?: string;
  dateFrom?: string;
  dateTo?: string;
  jwt?: string;
  personalizationEvents?: PersonalizationEvent[];
  resultType?: 'organic' | null;
  hierarchicalFacetSetting?: object;
  rangeFacets?: Array<{ field: string; ranges: FromToRange[] }>;
  statsFields?: string[];
  numFacets?: number;
  shuffleAndLimitTo?: number;
  apiMethod?: ApiMethod;
};

export type ApiMethod = 'GET' | 'POST';

class SettingsManager {
  private settings: Settings;

  constructor() {
    this.settings = {
      keyword: '*',
      callback: null,
      throttleTimeMs: 200,
      fuzzy: 'auto',
      paging: {
        page: 1,
        pageSize: 10,
        sortBy: 'relevance',
        sortOrder: 'desc'
      },
      customFieldFilters: [],
      userToken: null,
      suggestionsSize: 10,
      facetFields: [],
      autocomplete: {
        size: 10
      },
      searchOperator: null,
      enableLogicalOperators: false,
      cacheResponseTime: null,
      statsRequestIntercepted: false,
      apiMethod: 'GET'
    };
  }

  getSettings(): Settings {
    return this.settings;
  }

  setKeyword(keyword: string): void {
    this.settings.keyword = keyword || '*';
  }

  setCallback(cb: (() => void) | null): void {
    this.settings.callback = cb;
  }

  setThrottleTime(delay: number): void {
    this.settings.throttleTimeMs = delay;
  }

  setSuggestionsPrefix(prefix: string): void {
    this.settings.suggestionsPrefix = prefix;
  }

  setSuggestionsSize(size: number): void {
    this.settings.suggestionsSize = size;
  }

  setAutocompleteSize(size: number): void {
    this.settings.autocomplete.size = size;
  }

  setAutocompleteParams(field: string, prefix: string): void {
    this.settings.autocomplete.field = field;
    this.settings.autocomplete.prefix = prefix;
  }

  setLanguage(language: string): void {
    let languageIntlLocale: string | null;
    if (Intl && Intl.Locale) {
      try {
        languageIntlLocale = new Intl.Locale(language).language;
      } catch (e) {
        console.debug(e);
        throw new Error(
          `Use an accepted language code provided by the ECMAScript Internationalization API (e.g., "en", "en-GB").`
        );
      }
    } else {
      languageIntlLocale = language;
    }
    if (languageIntlLocale && languageIntlLocale.length !== 2) {
      throw new Error('Use a 2-char/4-char language code (e.g., "en", "en-GB")');
    }
    this.settings.lang = languageIntlLocale;
  }

  setFuzzyMatch(fuzzy: boolean | 'auto' | 'retry'): void {
    if (fuzzy !== true && fuzzy !== false && fuzzy !== 'auto' && fuzzy !== 'retry') {
      throw new Error("Fuzzy matching can be true, false, 'auto', or 'retry'");
    }
    this.settings.fuzzy = fuzzy;
  }

  enableLogicalOperators(enable: boolean): void {
    this.settings.enableLogicalOperators = enable;
  }

  setCacheResponseTime(cacheResponseTime: number | null): void {
    this.settings.cacheResponseTime = cacheResponseTime;
  }

  setPostfixWildcard(wildcard: boolean): void {
    this.settings.postfixWildcard = wildcard;
  }

  setCollectAnalytics(collectAnalytics: boolean): void {
    this.settings.collectAnalytics = collectAnalytics;
  }

  setAnalyticsTag(tagName: string): void {
    this.settings.analyticsTag = tagName;
  }

  setCategoryFilters(categories: string): void {
    this.settings.categories = categories;
  }

  setFilterObject(filter: object): void {
    this.settings.filterObject = filter;
  }

  setAiAnswersFilterObject(filter: object): void {
    this.settings.aiAnswersFilterObject = filter;
  }

  setPriceRangeFilter(minCents: string, maxCents: string): void {
    this.settings.priceFromCents = minCents;
    this.settings.priceToCents = maxCents;
  }

  addCustomFieldFilter(fieldName: string, value: string): void {
    const filter = encodeURIComponent(`${fieldName}=${value}`);
    if (!this.settings.customFieldFilters.includes(filter)) {
      this.settings.customFieldFilters.push(filter);
    }
  }

  removeCustomFieldFilter(fieldName: string, value?: string): void {
    const removeAll = !value;
    const filter = encodeURIComponent(`${fieldName}=${value || ''}`);

    this.settings.customFieldFilters = this.settings.customFieldFilters.filter((v) => {
      if (removeAll) {
        return !v.startsWith(filter);
      }
      return v !== filter;
    });
  }

  setDateFilter(dateFrom: string, dateTo: string): void {
    this.settings.dateFrom = dateFrom;
    this.settings.dateTo = dateTo;
  }

  setJWT(jwt: string): void {
    this.settings.jwt = jwt;
  }

  setUserToken(token: string): void {
    this.settings.userToken = token;
  }

  setPersonalizationEvents(events: PersonalizationEvent[]): void {
    if (Array.isArray(events)) {
      this.settings.personalizationEvents = events;
    }
  }

  setResultType(type: 'organic' | null): void {
    this.settings.resultType = type;
  }

  addFacetField(field: string): void {
    if (!this.settings.facetFields.includes(field)) {
      this.settings.facetFields.push(field);
    }
  }

  addHierarchicalFacetSetting(setting: object): void {
    this.settings.hierarchicalFacetSetting = setting;
  }

  addRangeFacet(field: string, ranges: FromToRange[]): void {
    this.settings.rangeFacets ??= [];
    this.settings.rangeFacets.push({ field, ranges });
  }

  addStatsField(field: string): void {
    this.settings.statsFields ??= [];
    if (!this.settings.statsFields.includes(field)) {
      this.settings.statsFields.push(field);
    }
  }

  setNumberOfFacets(numFacets: number): void {
    this.settings.numFacets = numFacets;
  }

  setPaging(
    page: number,
    pageSize: number,
    sortBy: SortByOptions,
    sortOrder: SortOrderOptions
  ): void {
    validateSetPagingParams(page, pageSize, sortBy, sortOrder);
    this.settings.paging = { page, pageSize, sortBy, sortOrder };
  }

  setShuffleAndLimitTo(shuffleAndLimitTo: number): void {
    this.settings.shuffleAndLimitTo = shuffleAndLimitTo;
  }

  nextPage(): void {
    this.settings.paging.page++;
  }

  previousPage(): void {
    if (this.settings.paging.page > 0) {
      this.settings.paging.page--;
    }
  }

  setSearchOperator(operator: SearchOperator): void {
    if (operator !== 'and' && operator !== 'or') {
      throw new Error("Operator must be 'and' or 'or'");
    }
    this.settings.searchOperator = operator;
  }

  setStatsRequestIntercepted(isIntercepted: boolean): void {
    this.settings.statsRequestIntercepted = isIntercepted;
  }

  setApiMethod(method: ApiMethod): void {
    if (method !== 'GET' && method !== 'POST') {
      throw new Error("API method must be 'GET' or 'POST'");
    }
    this.settings.apiMethod = method;
  }
}

export default SettingsManager;
