import React from 'react';
import { render } from 'react-dom';
import 'core-js/stable';
import fetch from '@ocean/fetch';
import Root from './root';

fetch.setResponseInterceptor(
  res => {
    const { data } = res;
    const { code, errorCode, errorMessage, msg, data: dataResult } = data;

    // code !== 0 的都是error
    if (code) {
      return {
        code,
        data: dataResult,
        msg: errorMessage || msg
      };
    }

    if (errorCode) {
      return {
        code: errorCode,
        msg: errorMessage || msg
      };
    }

    return {
      code: 1,
      data: data || {}
    };
  },
  error => Promise.reject(error.response?.data || error)
);

render(<Root />, document.getElementById('main'));
