var assert = require('assert');
var throttle = require('../src/throttle');

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

describe('throttle', function() {

  it('function shouldn\'t be throttled (30 function calls in 600ms)', async function() {
    this.timeout(5000);
    var functionCalls = 30;
    var sleepTime = 20; // 30*20 = 600 ms
    var expectedExecutions = 30; // Function called in every iteration
    var executions = 0;

    var f = function() {
      executions++;
    };

    for (var i=0; i<functionCalls; i++) {
      f();
      await sleep(sleepTime);
    }

    assert.equal(expectedExecutions, executions);
  });

  it('function should be throttled (4 function calls in 600ms', async function() {
    this.timeout(5000);
    var functionCalls = 30;
    var sleepTime = 20; // 30*20 = 600 ms
    var throttleDelay = 200;
    var expectedExecutions = 3 + 1; // Call functions for 600 ms with 200 ms throttle = 3 calls + one last call
    var executions = 0;

    var f = throttle(throttleDelay, function() {
      executions++;
    });

    for (var i=0; i<functionCalls; i++) {
      f();
      await sleep(sleepTime);
    }

    assert.equal(expectedExecutions, executions);
  });

});
