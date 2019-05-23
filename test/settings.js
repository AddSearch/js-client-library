var assert = require('assert');
var settings = require('../src/settings');


describe('settings', function() {
  describe('setLanguage', function() {

    it('language setting should be set', function() {
      const expect = {lang: 'en'};
      settings.setLanguage('en');
      assert.deepEqual(settings.getSettings(), expect);
    });

  });
});
