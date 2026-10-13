import { strict as assert } from 'assert';
import MockAdapter from 'axios-mock-adapter';
import { apiInstance } from '../src/api';
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
  let mock: MockAdapter;
  let requests: RecordedRequest[];

  /** Run a client call and resolve with the request it made. */
  const requestOf = (call: (done: () => void) => void): Promise<RecordedRequest> =>
    new Promise((resolve) => call(() => resolve(requests[requests.length - 1])));

  beforeEach(function () {
    requests = [];
    mock = new MockAdapter(apiInstance);
    mock.onAny().reply((config) => {
      requests.push({ method: config.method, url: config.url, data: config.data as string });
      return [200, {}];
    });
  });

  afterEach(function () {
    mock.restore();
  });

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
});
