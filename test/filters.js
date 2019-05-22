var util = require('util');
var assert = require('assert');

var Filter = require('../src/filter');
var ORFilter = require('../src/orFilter');
var ANDFilter = require('../src/andFilter');


describe('filters', function() {
  describe('createFilters', function() {

    it('filters should work with hierarchy', function() {

      var expect = {
        "and": [
          {
            "doc.custom_fields.diet": "munaton"
          },
          {
            "or": [
              {
                "doc.category": "0xyhteishyva.fi"
              },
              {
                "doc.category": "1xreseptit"
              }
            ]
          }
        ]
      };

// Individual filters
var diet = new Filter('doc.custom_fields.diet', 'munaton');
var category1 = new Filter('doc.category', '0xyhteishyva.fi');
var category2 = new Filter('doc.category', '1xreseptit');

// Any category is ok (OR filter)
var categories = new ORFilter(category1, category2);

// Require proper diet and one of the categories (AND filter)
var filters = new ANDFilter(diet, categories);

      console.log(JSON.stringify(filters));
      assert.deepEqual(filters, expect);


    });

  });
});
