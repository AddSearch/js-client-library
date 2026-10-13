import { strict as assert } from 'assert';
import MockAdapter from 'axios-mock-adapter';
import { apiInstance } from '../src/api';
import AddSearchClient from '../src/index';

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Collect errors thrown asynchronously (e.g. a user callback error rethrown by the library)
 * instead of letting Mocha fail the test on them.
 */
const captureUncaughtErrors = () => {
  const mochaListeners = process.listeners('uncaughtException');
  const errors: unknown[] = [];
  const listener = (error: unknown) => errors.push(error);
  process.removeAllListeners('uncaughtException');
  process.on('uncaughtException', listener);
  return {
    errors,
    restore() {
      process.removeListener('uncaughtException', listener);
      mochaListeners.forEach((l) => process.on('uncaughtException', l));
    }
  };
};

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

  // CR-03
  describe('a callback that throws', function () {
    it('is called only once and its error is not swallowed', async function () {
      mock.onAny().reply(200, { total_hits: 1, hits: [] });
      const client = createClient();
      const responses: unknown[] = [];
      const uncaught = captureUncaughtErrors();

      try {
        client.search('foo', (response) => {
          responses.push(response);
          throw new Error('bug in user callback');
        });
        await wait(20);
      } finally {
        uncaught.restore();
      }

      assert.equal(responses.length, 1);
      assert.equal((responses[0] as { error?: unknown }).error, undefined);
      assert.equal((uncaught.errors[0] as Error).message, 'bug in user callback');
    });

    it('is called only once for streaming AI Answers', async function () {
      const originalFetch = globalThis.fetch;
      const sse =
        'data: {"type":"metadata","conversation_id":"c1"}\n\n' + 'data: {"type":"done"}\n\n';
      globalThis.fetch = () => Promise.resolve(new Response(sse, { status: 200 }));
      const client = createClient();
      client.useAiAnswersStream(true);
      const responses: { error?: unknown; is_streaming_complete?: boolean }[] = [];
      const uncaught = captureUncaughtErrors();

      try {
        client.aiAnswers('question', (response) => {
          responses.push(response);
          if (responses.length === 1) {
            throw new Error('bug in user callback');
          }
        });
        await wait(50);
      } finally {
        uncaught.restore();
        globalThis.fetch = originalFetch;
      }

      assert.ok(responses.every((r) => r.error === undefined));
      assert.equal(responses[responses.length - 1].is_streaming_complete, true);
      assert.equal(uncaught.errors.length, 1);
    });
  });
});
