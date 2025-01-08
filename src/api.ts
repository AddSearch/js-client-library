import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';

const apiInstance: AxiosInstance = axios.create();
const statsInstance: AxiosInstance = axios.create();
const conversationalSearchInteractionsInstance: AxiosInstance = axios.create();

const RESPONSE_BAD_REQUEST = 400;
const RESPONSE_SERVER_ERROR = 500;

export type RequestInterceptorCallback = (config: {
  url?: string;
  headers?: Record<string, string>;
}) => Partial<InternalAxiosRequestConfig>;

type RequestType = 'searchApi' | 'statsApi';

const setRequestInterceptor = (
  callback: RequestInterceptorCallback,
  requestType: RequestType
): void => {
  const axiosInstance = requestType === 'searchApi' ? apiInstance : statsInstance;

  axiosInstance.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      const updatedConfig = callback({
        url: config.url,
        headers: config.headers as Record<string, string>
      });
      config = { ...config, ...updatedConfig };
      return config;
    },
    (error) => {
      return Promise.reject(new Error(JSON.stringify(error)));
    }
  );
};

export {
  apiInstance,
  statsInstance,
  conversationalSearchInteractionsInstance,
  setRequestInterceptor,
  RESPONSE_BAD_REQUEST,
  RESPONSE_SERVER_ERROR
};
