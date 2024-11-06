var throttle = function (delay, callback) {
  // last time callback was executed.
  var lastExec = 0;

  // returned by setTimeout
  var timeout;

  // Clear existing timeout
  function clearExistingTimeout() {
    if (timeout) {
      clearTimeout(timeout);
    }
  }

  /*
   * Wrap the callback inside a throttled function
   */
  function wrapper() {
    var self = this;
    var elapsed = Date.now() - lastExec;
    var args = arguments;

    // Execute callback function
    function exec() {
      lastExec = Date.now();
      callback.apply(self, args);
    }

    clearExistingTimeout();

    // Execute
    if (elapsed > delay) {
      exec();
    }
    // Schedule for a later execution
    else {
      timeout = setTimeout(exec, delay - elapsed);
    }
  }

  // Return the wrapper function.
  return wrapper;
};

module.exports = throttle;
