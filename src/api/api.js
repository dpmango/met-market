import React from 'react';
import axios from 'axios';
import * as rax from 'retry-axios';
import { getEnv } from '@helpers';

const api = axios.create({
  baseURL: getEnv('GATEWAY_URL'),
  timeout: getEnv('API_TIMEOUT'),
  raxConfig: {
    retry: 3,
    retryDelay: getEnv('API_RETRY_DELAY'),
    noResponseRetries: 3,
    backoffType: 'static',
  },
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    // 'X-Requested-With': 'XMLHttpRequest',
  },
});

const interceptorId = rax.attach(api);

api.interceptors.request.use((x) => {
  if (x.url.indexOf('version.txt') === -1) {
    console.log(`${x.method.toUpperCase()} | ${x.url}`, x.params, x.data);
  }

  return x;
});

api.interceptors.response.use((x) => {
  if (x.config.url.indexOf('version.txt') === -1) {
    console.log(`${x.status} | ${x.config.url}`, x.data);
  }

  return x;
});

export const setDefaultAxiosParam = (param, value) => {
  api.defaults.params = api.defaults.params || {};
  api.defaults.params[param] = value;
};

export default api;
