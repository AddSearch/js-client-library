'use strict';

const axios = require('axios').default;
const apiInstance = axios.create();

const setRequestInterceptor = (callback) => {
  apiInstance.interceptors.request.use( (config) => {
    const updatedConfig = callback({
      url: config.url,
      headers: config.headers
    });
    config = {...config, ...updatedConfig};
    return config;
  }, function (error) {
    return Promise.reject(error);
  });
};

module.exports = {
  apiInstance,
  setRequestInterceptor
};
