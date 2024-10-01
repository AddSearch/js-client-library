'use strict';

const axios = require('axios').default;
const apiInstance = axios.create();
const statsInstance = axios.create();

const setRequestInterceptor = (callback, requestType) => {
  const axiosInstance = requestType === 'searchApi' ? apiInstance : statsInstance;
  axiosInstance.interceptors.request.use( (config) => {
    const updatedConfig = callback({
      url: config.url,
      headers: config.headers,
      // todo remove when releasing: this is for adding customized "prompt" in the conversational search demo
      data: config.data
    });
    config = {...config, ...updatedConfig};
    return config;
  }, function (error) {
    return Promise.reject(error);
  });
};

module.exports = {
  apiInstance,
  statsInstance,
  setRequestInterceptor
};
