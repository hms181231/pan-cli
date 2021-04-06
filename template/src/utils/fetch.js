import fetch from '@ocean/fetch';
import { message, Modal } from 'antd';

let hasconfirm = false;
const { confirm } = Modal;

let defaultHeader = {};

export const setDefaultHeader = (header = {}) => {
  defaultHeader = { ...defaultHeader, ...header };
};

const handleResponse = response => {
  if (response.code !== 1) {
    return Promise.reject(response);
  }
  return Promise.resolve(response.data);
};

const handleError = response => {
  const { code, data, msg, errorMessage } = response;

  switch (code) {
    case 601:
      if (hasconfirm) {
        return;
      }

      hasconfirm = true;

      confirm({
        title: '提示',
        content: '登录信息已失效，请重新登录.',
        okText: '去登录',
        cancelText: '取消',
        onOk() {
          window.location.href = data;
        },
        onCancel() {
          hasconfirm = false;
        }
      });
      break;
    default:
      message.error(errorMessage || msg || '未知错误');
      break;
  }
};

const remote = (
  url,
  data = {},
  method = 'POST',
  module = 'phecda',
  options = {}
) => {
  const { silent = false, cancel = false } = options;
  let header = {};
  let requestFetch = fetch.axios;

  if (cancel) {
    requestFetch = fetch.request;
  }

  if (typeof url === 'object') {
    header = url.header;
    url = url.url;
  }

  return requestFetch({
    url: '/query',
    data: {
      path: url,
      filter: data,
      module,
      methodName: method
    },
    headers: { ...defaultHeader, ...header },
    method: 'POST'
  })
    .then(result => {
      return handleResponse(result);
    })
    .catch(err => {
      if (err.message === 'Cancel') {
        return;
      }

      if (!silent) {
        handleError(err);
      }
    });
};

const request = {};
const methods = ['get', 'post', 'put', 'delete'];
methods.forEach(method => {
  request[method] = (url, data = {}, options = {}) => {
    const { cancel = false } = options;
    let requestFetch = fetch.axios;

    if (cancel) {
      requestFetch = fetch.request;
    }

    return requestFetch({
      url,
      data,
      method
    })
      .then(result => {
        return handleResponse(result);
      })
      .catch(err => {
        if (err.message === 'Cancel') {
          return;
        }
        handleError(err);
      });
  };
});

export { remote, request };
