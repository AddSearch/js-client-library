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

  describe('fuzzy retry', function () {
    const fuzzyHits = { total_hits: 918, hits: [{ id: '1' }] };

    beforeEach(function () {
      mock.reset();
      mock.onGet(/[?&]fuzzy=false/).reply(200, { total_hits: 0, hits: [] });
      mock.onGet(/[?&]fuzzy=true/).reply(200, fuzzyHits);
    });

    after(function () {
      mock.reset();
      mock.onAny().reply(200, { response: 200 });
    });

    it('should retry with fuzzy matching and set fuzzyRetry when there are no exact matches', function (done) {
      apifetch(
        'api.addsearch.com',
        'sitekey',
        'search',
        { paging: { pageSize: 10 }, keyword: 'cancle subscription', fuzzy: 'retry' } as Settings,
        (res: { total_hits: number; fuzzyRetry?: boolean }) => {
          assert.equal(mock.history.get.length, 2);
          assert.match(mock.history.get[0].url as string, /[?&]fuzzy=false/);
          assert.match(mock.history.get[1].url as string, /[?&]fuzzy=true/);
          assert.equal(res.fuzzyRetry, true);
          assert.equal(res.total_hits, 10); // capped to one page
          done();
        }
      );
    });

    it('should not retry or set fuzzyRetry when there are exact matches', function (done) {
      mock.reset();
      mock.onGet(/[?&]fuzzy=false/).reply(200, { total_hits: 3, hits: [{ id: '1' }] });

      apifetch(
        'api.addsearch.com',
        'sitekey',
        'search',
        { paging: { pageSize: 10 }, keyword: 'cancel subscription', fuzzy: 'retry' } as Settings,
        (res: { total_hits: number; fuzzyRetry?: boolean }) => {
          assert.equal(mock.history.get.length, 1);
          assert.equal(res.fuzzyRetry, undefined);
          assert.equal(res.total_hits, 3);
          done();
        }
      );
    });

    it('should not set fuzzyRetry when fuzzy matching is not in retry mode', function (done) {
      mock.reset();
      mock.onGet(/[?&]fuzzy=auto/).reply(200, { total_hits: 0, hits: [] });

      apifetch(
        'api.addsearch.com',
        'sitekey',
        'search',
        { paging: { pageSize: 10 }, keyword: 'cancle subscription', fuzzy: 'auto' } as Settings,
        (res: { total_hits: number; fuzzyRetry?: boolean }) => {
          assert.equal(mock.history.get.length, 1);
          assert.equal(res.fuzzyRetry, undefined);
          done();
        }
      );
    });
  });
});
