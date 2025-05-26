import { Buffer } from 'buffer/';
import { v4 as uuidv4 } from 'uuid';
import { SortByOptions, SortOrderOptions } from './settings';

const isFunction = (fn: unknown): boolean => {
  return typeof fn === 'function';
};

const base64 = (s: string): string | undefined => {
  if (typeof window !== 'undefined' && window.btoa) {
    return window.btoa(s);
  } else if (Buffer) {
    return Buffer.from(s).toString('base64');
  }
  return undefined;
};

const validateSetPagingParams = (
  page: number,
  pageSize: number,
  sortBy: SortByOptions,
  sortOrder: SortOrderOptions
): void => {
  if (page < 1) {
    throw new Error('Page must be 1 or bigger');
  }
  if (pageSize < 1 || pageSize > 300) {
    throw new Error('PageSize must be between 1 and 300');
  }
  if (!sortBy || !sortOrder) {
    throw new Error(`Invalid values for sortBy or sortOrder:`);
  }
  if (
    !(
      (typeof sortBy === 'string' && typeof sortOrder === 'string') ||
      (Array.isArray(sortBy) && Array.isArray(sortOrder))
    )
  ) {
    throw new Error('sortBy and sortOrder must have the same type: string or Array');
  }
  if (Array.isArray(sortBy) && sortBy.length !== sortOrder.length) {
    throw new Error('sortBy and sortOrder must have the same size');
  }
  if (typeof sortOrder === 'string' && sortOrder !== 'asc' && sortOrder !== 'desc') {
    throw new Error('sortOrder must be asc or desc');
  }
  if (Array.isArray(sortOrder) && sortOrder.some((e) => e !== 'desc' && e !== 'asc')) {
    throw new Error('All values of sortOrder array must be asc or desc');
  }
};

const generateUUID = (): string => {
  return uuidv4().replace(/-/g, '');
};

const isEmptyObject = (obj: unknown): boolean => {
  if (obj == null) {
    return true;
  }

  if (Array.isArray(obj) || Object.prototype.toString.call(obj) !== '[object Object]') {
    return true;
  }

  return Object.keys(obj as Record<string, unknown>).length === 0;
};

export { isFunction, base64, validateSetPagingParams, generateUUID, isEmptyObject };
