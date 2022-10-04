var assert = require('assert');
var apifetch = require('../src/apifetch');
var MockAdapter = require("axios-mock-adapter");
const axios = require('axios').default;
var mock = new MockAdapter(axios);

mock.onAny().reply(200, { response: 200 });

describe('apifetch', function() {
  describe('executeApiFetch', function() {

    it('should call callback with response data when query is successful', function() {
      const expect = {response: 200};

      apifetch('api.addsearch.com', 'sitekey', 'search', {paging:{}, keyword: 'foo'}, (res) => {
        assert.deepEqual(res, expect);
      });
    });

    it('should return client error when request type is invalid', function() {
      const expect = 400;

      apifetch('api.addsearch.com', 'sitekey', 'ping', {paging:{}, keyword: 'foo'}, (res) => {
        assert.equal(res.error.response, expect);
      });
    });

  });
});
