type ThrottleCallback = (...args: unknown[]) => void;

const throttle = (delay: number, callback: ThrottleCallback): ((...args: unknown[]) => void) => {
  // Last time the callback was executed
  let lastExec = 0;

  // Returned by setTimeout
  let timeout: ReturnType<typeof setTimeout> | null = null;

  // Clear existing timeout
  function clearExistingTimeout(): void {
    if (timeout !== null) {
      clearTimeout(timeout);
      timeout = null;
    }
  }

  /*
   * Wrap the callback inside a throttled function
   */
  function wrapper(this: unknown, ...args: unknown[]): void {
    const elapsed = Date.now() - lastExec;

    // Execute callback function
    const exec = (): void => {
      lastExec = Date.now();
      callback.apply(this, args);
    };

    clearExistingTimeout();

    // Execute immediately if the delay has passed
    if (elapsed > delay) {
      exec();
    }
    // Schedule for a later execution
    else {
      timeout = setTimeout(exec, delay - elapsed);
    }
  }

  // Return the wrapper function
  return wrapper;
};

export default throttle;
