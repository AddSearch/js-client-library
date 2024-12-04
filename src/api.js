'use strict';

const axios = require('axios').default;
const apiInstance = axios.create();
const statsInstance = axios.create();
const conversationalSearchInteractionsInstance = axios.create();

const RESPONSE_BAD_REQUEST = 400;
const RESPONSE_SERVER_ERROR = 500;

const setRequestInterceptor = (callback, requestType) => {
  const axiosInstance = requestType === 'searchApi' ? apiInstance : statsInstance;
  axiosInstance.interceptors.request.use(
    (config) => {
      const updatedConfig = callback({
        url: config.url,
        headers: config.headers
      });
      config = { ...config, ...updatedConfig };
      return config;
    },
    function (error) {
      return Promise.reject(error);
    }
  );
};

module.exports = {
  apiInstance,
  statsInstance,
  conversationalSearchInteractionsInstance,
  setRequestInterceptor,
  RESPONSE_BAD_REQUEST,
  RESPONSE_SERVER_ERROR
};
