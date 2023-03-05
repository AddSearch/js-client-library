import assert from "assert";
import apifetch from "../src/apifetch.js";
import MockAdapter from "axios-mock-adapter";
import axios from "axios";
const mock = new MockAdapter(axios);


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
