var assert = require('assert');
var Settings = require('../src/settings');

describe('settings', function () {
  describe('setLanguage', function () {
    it('language setting should be set', function () {
      const expect = { lang: 'en' };
      var set = new Settings();
      set.setLanguage('en');
      assert.equal(set.getSettings().lang, expect.lang);
    });

    var s = new Settings();
    it('city london should be added to custom field filters', function () {
      s.addCustomFieldFilter('city', 'london');
      var expect = '["city%3Dlondon"]';
      assert.equal(JSON.stringify(s.getSettings().customFieldFilters), expect);
    });

    it('city berlin and color red should be added to custom field filters', function () {
      s.addCustomFieldFilter('city', 'berlin');
      var expect = '["city%3Dlondon","city%3Dberlin"]';
      assert.equal(JSON.stringify(s.getSettings().customFieldFilters), expect);

      s.addCustomFieldFilter('color', 'red');
      expect = '["city%3Dlondon","city%3Dberlin","color%3Dred"]';
      assert.equal(JSON.stringify(s.getSettings().customFieldFilters), expect);
    });

    it('color blue should be added and red removed from custom field filters', function () {
      s.addCustomFieldFilter('color', 'blue');
      var expect = '["city%3Dlondon","city%3Dberlin","color%3Dred","color%3Dblue"]';
      assert.equal(JSON.stringify(s.getSettings().customFieldFilters), expect);

      s.removeCustomFieldFilter('color', 'red');
      expect = '["city%3Dlondon","city%3Dberlin","color%3Dblue"]';
      assert.equal(JSON.stringify(s.getSettings().customFieldFilters), expect);
    });

    it('all cities should be removed from custom field filters', function () {
      s.removeCustomFieldFilter('city');
      var expect = '["color%3Dblue"]';
      assert.equal(JSON.stringify(s.getSettings().customFieldFilters), expect);
    });

    it('all colors should be removed from custom field filters', function () {
      s.removeCustomFieldFilter('foo');
      var expect = '["color%3Dblue"]';
      assert.equal(JSON.stringify(s.getSettings().customFieldFilters), expect);

      s.removeCustomFieldFilter('color');
      expect = '[]';
      assert.equal(JSON.stringify(s.getSettings().customFieldFilters), expect);
    });

    it('adding custom fields filter should be idempotent', function () {
      s.addCustomFieldFilter('city', 'helsinki');
      s.addCustomFieldFilter('city', 'helsinki');
      var expect = '["city%3Dhelsinki"]';
      assert.equal(JSON.stringify(s.getSettings().customFieldFilters), expect);
    });
  });
});
