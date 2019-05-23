'use strict';

var settings = {};

var getSettings = function() {
  return settings;
}

var setLanguage = function(language) {
  settings.lang = language;
}

module.exports = {
  getSettings,
  setLanguage
};