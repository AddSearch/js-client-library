import { Buffer } from "buffer";
import { v4 as uuidv4 } from 'uuid';

const isFunction = (fn) => {
  return fn && {}.toString.call(fn) === '[object Function]';
}

const base64 = (s) => {
  const global = typeof globalThis !== 'undefined' ? globalThis : window;
  if (!global.window) {
    global.window = {};
  }
  if (global.window && global.window.btoa) {
    return global.window.btoa(s);
  }
  else if (Buffer) {
    return Buffer.from(s).toString('base64');
  }
}

const validateSetPagingParams = (page, pageSize, sortBy, sortOrder) => {
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
  return uuidv4().replace(/-/g, '');
};

export default {
  validateSetPagingParams,
  isFunction,
  base64,
  generateUUID
}
