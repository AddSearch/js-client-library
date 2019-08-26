var isFunction = function(fn) {
  return fn && {}.toString.call(fn) === '[object Function]';
}

module.exports = {
  isFunction: isFunction
}