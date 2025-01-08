import { ExecuteApiFetch } from './apifetch';

const throttle = (
  delay: number,
  callback: ExecuteApiFetch
): ((...args: Parameters<ExecuteApiFetch>) => void) => {
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
  function wrapper(...args: Parameters<ExecuteApiFetch>) {
    const elapsed = Date.now() - lastExec;

    // Execute callback function
    const exec = () => {
      lastExec = Date.now();
      callback(...args);
    };

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

  // Return the wrapper function
  return wrapper;
};

export default throttle;
