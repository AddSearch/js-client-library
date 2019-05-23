var assert = require('assert');
var fetchMock = require('fetch-mock');
var apifetch = require('../src/apifetch');


describe('apifetch', function() {
  describe('executeApiFetch', function() {

    it('should call callback with response data when query is successful', function() {
      fetchMock.get('*', { response: 200 });
      const expect = {response: 200};

      apifetch('sitekey', 'search', 'keyword', {}, (res) => {
        assert.deepEqual(res, expect);
      });
    });

    it('should return client error when request type is invalid', function() {
      fetchMock.config.overwriteRoutes = true;
      fetchMock.get('*', 'foo');
      const expect = 400;

      apifetch('sitekey', 'ping', 'keyword', {}, (res) => {
        assert.equal(res.error.response, expect);
      });
    });

  });
});
