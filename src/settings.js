export var settings = {}

export function getSettings() {
  return settings;
}

export function setLanguage(language) {
  settings.language = language;
}

export function setPageSize(pageSize) {
  if (!settings.paging) {
    settings.paging = {};
  }
  settings.paging.pageSize = pageSize;
}

/*  "paging": {
 "page": 1,
 "pageSize": 5,
 "sortBy": null,
 "sortOrder": null
 },
 "term": "*",
 "language": "fi",
 "jsonp": null,
 "fuzzy": "false",
 "dateFrom": "2019-05-14",
 "dateTo": "2019-05-15",*/
