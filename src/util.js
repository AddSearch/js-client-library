const Buffer = require('buffer/').Buffer;

const isFunction = function(fn) {
  return fn && {}.toString.call(fn) === '[object Function]';
}

const base64 = function(s) {
  global.window = {};
  if (window && window.btoa) {
    return window.btoa(s);
  }
  else if (Buffer) {
    return Buffer.from(s).toString('base64');
  }
}

module.exports = {
  isFunction,
  base64
}