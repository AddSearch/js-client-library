const Buffer = require('buffer/').Buffer;
const { v4: uuidv4 } = require('uuid');

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

const validateSetPagingParams = function(page, pageSize, sortBy, sortOrder) {
  if (page < 1) {
    throw "page must be 1 or bigger";
  }
  if (pageSize < 1 || pageSize > 300) {
    throw "pageSize must be 1-300";
  }
  if (!sortBy || !sortOrder) {
    throw "invalid values for sortBy or sortOrder: " + sortBy + ", " + sortOrder;
  }
  if (!((typeof sortBy == 'string' && typeof sortOrder == 'string') || (Array.isArray(sortBy) && Array.isArray(sortOrder)))) {
    throw "sortBy and sortOrder must have the same type: string or Array";
  }
  if (Array.isArray(sortBy) && sortBy.length !== sortOrder.length) {
    throw "sortBy and sortOrder must have the same size";
  }
  if (typeof sortOrder == 'string' && sortOrder !== 'asc' && sortOrder !== 'desc') {
    throw "sortOrder must be asc or desc";
  }
  if (Array.isArray(sortOrder) &&
    sortOrder.filter(function(e) {return e !== 'desc' && e!=='asc'}).length > 0) {
    throw "all values of sortOrder array must be asc or desc";
  }
}

const generateUUID = function() {
  return uuidv4();
};

module.exports = {
  isFunction,
  base64,
  validateSetPagingParams: validateSetPagingParams,
  generateUUID
}