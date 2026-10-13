import { strict as assert } from 'assert';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { aiAnswersInteractionsInstance, apiInstance } from '../src/api';
import AddSearchClient from '../src/index';

interface RecordedRequest {
  method?: string;
  url?: string;
  data?: string;
}

const createClient = (): AddSearchClient => {
  const client = new AddSearchClient('sitekey');
  client.setThrottleTime(0);
  return client;
};

describe('request URLs and bodies', function () {
  let mocks: MockAdapter[];
  let requests: RecordedRequest[];

  /** Run a client call and resolve with the request it made. */
  const requestOf = (call: (done: () => void) => void): Promise<RecordedRequest> =>
    new Promise((resolve) => call(() => resolve(requests[requests.length - 1])));

  beforeEach(function () {
    requests = [];
    // Search uses apiInstance, indexing uses the default axios instance, sentiment uses its own.
    mocks = [apiInstance, axios, aiAnswersInteractionsInstance].map((instance) => {
      const mock = new MockAdapter(instance);
      mock.onAny().reply((config) => {
        requests.push({ method: config.method, url: config.url, data: config.data as string });
        // Indexing deletes answer 202 Accepted; everything else used here answers 200.
        return [config.method === 'delete' ? 202 : 200, {}];
      });
      return mock;
    });
  });

  afterEach(function () {
    mocks.forEach((mock) => mock.restore());
  });

  const searchUrl = async (configure: (client: AddSearchClient) => void): Promise<URL> => {
    const client = createClient();
    configure(client);
    const request = await requestOf((done) => client.search('test', done));
    return new URL(request.url as string);
  };

  describe('suggestions and autocomplete text', function () {
    const typed = 'a&b #c+d%';

    it('is encoded in the suggest URL', async function () {
      const request = await requestOf((done) => createClient().suggestions(typed, done));
      assert.equal(new URL(request.url as string).searchParams.get('term'), typed);
    });

    it('is encoded in the autocomplete URL', async function () {
      const request = await requestOf((done) => createClient().autocomplete('title', typed, done));
      assert.equal(new URL(request.url as string).searchParams.get('term'), typed);
    });

    it('is sent unchanged in the POST body', async function () {
      const client = createClient();
      client.setApiMethod('POST');
      const suggest = await requestOf((done) => client.suggestions(typed, done));
      const autocomplete = await requestOf((done) => client.autocomplete('title', typed, done));
      assert.equal(JSON.parse(suggest.data as string).term, typed);
      assert.equal(JSON.parse(autocomplete.data as string).term, typed);
    });
  });

  describe('IDs and field names', function () {
    const value = 'a/b?c#d&e';

    it('encodes document IDs in indexing URLs', async function () {
      const client = new AddSearchClient('sitekey', 'privatekey');
      await client.getDocument(value);
      await client.deleteDocument(value);
      assert.deepEqual(
        requests.map((r) => r.url),
        [
          'https://api.addsearch.com/v2/indices/sitekey/documents/a%2Fb%3Fc%23d%26e',
          'https://api.addsearch.com/v2/indices/sitekey/documents/a%2Fb%3Fc%23d%26e'
        ]
      );
    });

    it('encodes the conversation ID in the sentiment URL', async function () {
      await createClient().putSentimentClick(value, 'positive');
      assert.equal(
        requests[0].url,
        'https://api.addsearch.com/v2/indices/sitekey/conversations/a%2Fb%3Fc%23d%26e/rating'
      );
    });

    it('encodes facet and stats field names', async function () {
      const url = await searchUrl((client) => {
        client.addFacetField(value);
        client.addStatsField(value);
      });
      assert.deepEqual(url.searchParams.getAll('facet'), [value]);
      assert.deepEqual(url.searchParams.getAll('fieldStat'), [value]);
    });

    it('encodes sort fields', async function () {
      const url = await searchUrl((client) => client.setPaging(1, 10, value, 'desc'));
      assert.equal(url.searchParams.get('sort'), value);
    });

    it('encodes other settings such as the analytics tag', async function () {
      const url = await searchUrl((client) => client.setAnalyticsTag(value));
      assert.equal(url.searchParams.get('analyticsTag'), value);
    });

    it('encodes recommendation block IDs and configuration keys', async function () {
      const client = createClient();
      const related = await requestOf((done) =>
        client.recommendations({ type: 'RELATED_ITEMS', blockId: value, itemId: value }, done)
      );
      const together = await requestOf((done) =>
        client.recommendations(
          { type: 'FREQUENTLY_BOUGHT_TOGETHER', configurationKey: value, itemId: value },
          done
        )
      );
      const relatedUrl = new URL(related.url as string);
      const togetherUrl = new URL(together.url as string);
      assert.equal(
        relatedUrl.pathname,
        '/v1/recommendations/index/sitekey/block/a%2Fb%3Fc%23d%26e'
      );
      assert.equal(relatedUrl.searchParams.get('itemId'), value);
      assert.equal(togetherUrl.searchParams.get('configurationKey'), value);
      assert.equal(togetherUrl.searchParams.get('itemId'), value);
    });
  });
});
