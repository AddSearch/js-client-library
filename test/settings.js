var assert = require('assert');
var Settings = require('../src/settings');


describe('settings', function() {
  describe('setLanguage', function() {

    it('language setting should be set', function() {
      const expect = {lang: 'en'};
      var s = new Settings();
      s.setLanguage('en');
      assert.equal(s.getSettings().lang, expect.lang);
    });

  });
});
