var assert = require('assert');
var util = require('../src/util');

describe('util', function () {
  describe('isFunction', function () {
    it('function should be properly detected', function () {
      var f = function (f) {
        console.log(f);
      };
      assert.equal(util.isFunction(f), true);
      assert.equal(util.isFunction(console.log), true);
      assert.equal(util.isFunction('foo'), false);
      assert.equal(util.isFunction([1, 2]), false);
    });
  });

  describe('base64', function () {
    it('string should be encoded properly', function () {
      assert.equal(util.base64('test'), 'dGVzdA==');
    });
  });
});
