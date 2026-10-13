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
});
