import { strict as assert } from 'assert';
import apifetch from '../src/apifetch';
import MockAdapter from 'axios-mock-adapter';
import { apiInstance } from '../src/api';
import { Settings } from '../src/settings';

// Create a new mock adapter for axios instance
const mock = new MockAdapter(apiInstance);

// Mock all requests to return a 200 response
mock.onAny().reply(200, { response: 200 });

describe('apifetch', function () {
  describe('executeApiFetch', function () {
    it('should call callback with response data when query is successful', function (done) {
      const expectedResponse = { response: 200 };

      apifetch(
        'api.addsearch.com',
        'sitekey',
        'search',
        { paging: {}, keyword: 'foo' } as Settings,
        (res: { response: number }) => {
          assert.deepEqual(res, expectedResponse);
          done(); // Call `done` to signal the test is complete
        }
      );
    });

    it('should return client error when request type is invalid', function (done) {
      const expectedError = 400;

      apifetch(
        'api.addsearch.com',
        'sitekey',
        'ping',
        { paging: {}, keyword: 'foo' } as Settings,
        (res: { error: { response: number } }) => {
          assert.equal(res.error.response, expectedError);
          done(); // Call `done` to signal the test is complete
        }
      );
    });
  });
});
