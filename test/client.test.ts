import { strict as assert } from 'assert';
import MockAdapter from 'axios-mock-adapter';
import { apiInstance } from '../src/api';
import AddSearchClient from '../src/index';

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const createClient = (): AddSearchClient => {
  const client = new AddSearchClient('sitekey');
  client.setThrottleTime(0);
  return client;
};

describe('AddSearchClient', function () {
  let mock: MockAdapter;

  beforeEach(function () {
    mock = new MockAdapter(apiInstance);
  });

  afterEach(function () {
    mock.restore();
  });

  // CR-01
  describe('search()', function () {
    it('reuses the stored callback when called without arguments', async function () {
      mock.onAny().reply(200, { total_hits: 1, hits: [] });
      const client = createClient();
      let calls = 0;

      client.search('foo', () => calls++);
      await wait(20);
      client.search();
      await wait(20);

      assert.equal(calls, 2);
    });
  });

  // CR-02
  describe('fetchRangeFacets()', function () {
    it('does not change the client settings', async function () {
      mock.onAny().reply(200, {});
      const client = createClient();
      client.addRangeFacet('price', [{ from: 0, to: 10 }]);

      client.fetchRangeFacets({ field: 'x', ranges: [] }, {}, () => {});
      client.fetchRangeFacets({ field: 'y', ranges: [] }, {}, () => {});
      await wait(20);

      assert.deepEqual(
        client.getSettings().rangeFacets?.map((r) => r.field),
        ['price']
      );
    });
  });

  // CR-04
  describe("fuzzy 'retry'", function () {
    it('keeps the custom filter on the retry request', async function () {
      const requestUrls: string[] = [];
      mock.onAny().reply((config) => {
        requestUrls.push(config.url as string);
        return [200, { total_hits: 0, hits: [] }];
      });
      const client = createClient();
      client.setFuzzyMatch('retry');

      client.fetchCustomApi('category', { and: [{ custom_fields: { a: 'b' } }] }, () => {});
      await wait(20);

      assert.equal(requestUrls.length, 2);
      assert.ok(requestUrls.every((url) => url.includes('filter=')));
    });
  });
});
