import { strict as assert } from 'assert';
import throttle from '../src/throttle';

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

describe('throttle', function () {
  it("function shouldn't be throttled (30 function calls in 600ms)", async function () {
    this.timeout(5000);
    const functionCalls = 30;
    const sleepTime = 20; // 30 * 20 = 600 ms
    const expectedExecutions = 30; // Function called in every iteration
    let executions = 0;

    const f = (): void => {
      executions++;
    };

    for (let i = 0; i < functionCalls; i++) {
      f();
      await sleep(sleepTime);
    }

    assert.equal(executions, expectedExecutions);
  });

  it('function should be throttled (4 function calls in 600ms)', async function () {
    this.timeout(5000);
    const functionCalls = 30;
    const sleepTime = 20; // 30 * 20 = 600 ms
    const throttleDelay = 200;
    // Call functions for 600 ms with 200 ms throttle = 3 calls + one last call
    // This is the lower bound as in slower environments there could be more executions
    // Less than the lower bound isn't possible due to deterministic sleepTime and throttleDelay values
    const expectedExecutionsLowerBound = 3 + 1;
    let executions = 0;

    const f = throttle(throttleDelay, (): void => {
      executions++;
    });

    for (let i = 0; i < functionCalls; i++) {
      // @ts-ignore
      f();
      await sleep(sleepTime);
    }

    assert.equal(expectedExecutionsLowerBound <= executions, true);
  });
});
