var assert = require('assert');
var fetchMock = require('fetch-mock');
var apifetch = require('../src/apifetch');


describe('apifetch', function() {
  describe('executeApiFetch', function() {

    it('should call callback with response data when query is successful', function() {
      fetchMock.get('*', { response: 200 });
      const expect = {response: 200};

      apifetch.executeApiFetch('search', 'keyword', (res) => {
        assert.deepEqual(res, expect);
      });
    });

    it('should return server error when response is not JSON', function() {
      fetchMock.config.overwriteRoutes = true;
      fetchMock.get('*', 'foo');
      const expect = {response: 500};

      apifetch.executeApiFetch('search', 'keyword', (res) => {
        assert.equal(res.response, expect.response);
      });
    });


    it('should return client error when request type is invalid', function() {
      fetchMock.config.overwriteRoutes = true;
      fetchMock.get('*', 'foo');
      const expect = {response: 400};

      apifetch.executeApiFetch('ping', 'keyword', (res) => {
        assert.equal(res.response, expect.response);
      });
    });

  });
});
