import { strict as assert } from 'assert';
import Settings from '../src/settings';

describe('settings', function () {
  describe('setLanguage', function () {
    it('language setting should be set', function () {
      const expected = { lang: 'en' };
      const settings = new Settings();
      settings.setLanguage('en');
      assert.equal(settings.getSettings().lang, expected.lang);
    });

    const sharedSettings = new Settings();

    it('city london should be added to custom field filters', function () {
      sharedSettings.addCustomFieldFilter('city', 'london');
      const expected = '["city%3Dlondon"]';
      assert.equal(JSON.stringify(sharedSettings.getSettings().customFieldFilters), expected);
    });

    it('city berlin and color red should be added to custom field filters', function () {
      sharedSettings.addCustomFieldFilter('city', 'berlin');
      let expected = '["city%3Dlondon","city%3Dberlin"]';
      assert.equal(JSON.stringify(sharedSettings.getSettings().customFieldFilters), expected);

      sharedSettings.addCustomFieldFilter('color', 'red');
      expected = '["city%3Dlondon","city%3Dberlin","color%3Dred"]';
      assert.equal(JSON.stringify(sharedSettings.getSettings().customFieldFilters), expected);
    });

    it('color blue should be added and red removed from custom field filters', function () {
      sharedSettings.addCustomFieldFilter('color', 'blue');
      let expected = '["city%3Dlondon","city%3Dberlin","color%3Dred","color%3Dblue"]';
      assert.equal(JSON.stringify(sharedSettings.getSettings().customFieldFilters), expected);

      sharedSettings.removeCustomFieldFilter('color', 'red');
      expected = '["city%3Dlondon","city%3Dberlin","color%3Dblue"]';
      assert.equal(JSON.stringify(sharedSettings.getSettings().customFieldFilters), expected);
    });

    it('all cities should be removed from custom field filters', function () {
      sharedSettings.removeCustomFieldFilter('city');
      const expected = '["color%3Dblue"]';
      assert.equal(JSON.stringify(sharedSettings.getSettings().customFieldFilters), expected);
    });

    it('all colors should be removed from custom field filters', function () {
      sharedSettings.removeCustomFieldFilter('foo');
      let expected = '["color%3Dblue"]';
      assert.equal(JSON.stringify(sharedSettings.getSettings().customFieldFilters), expected);

      sharedSettings.removeCustomFieldFilter('color');
      expected = '[]';
      assert.equal(JSON.stringify(sharedSettings.getSettings().customFieldFilters), expected);
    });

    it('adding custom fields filter should be idempotent', function () {
      sharedSettings.addCustomFieldFilter('city', 'helsinki');
      sharedSettings.addCustomFieldFilter('city', 'helsinki');
      const expected = '["city%3Dhelsinki"]';
      assert.equal(JSON.stringify(sharedSettings.getSettings().customFieldFilters), expected);
    });
  });
});
