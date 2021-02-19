import { remote, request } from '@/utils/fetch';
import API from '@/constant/api';

const servers = {
  1: 'ledger',
  2: 'phecda_job',
  3: 'phecda_core'
};

export const list = params =>
  remote(API.STREAM_MONITOR, params, 'POST', 'ledger', { cancel: true });

export const estateList = params =>
  request.post(API.STREAM_MONITOR_FUND_PLANTFORM, params, { cancel: true });

export const streamList = params =>
  request.post(API.STREAM_MONITOR_LIST, params, { cancel: true });

export const doHandle = params => {
  const { dataSource, ...body } = params;

  return remote(API.STREAM_MONITOR_MODIFY, body, 'POST', servers[dataSource]);
};

export const retry = params => {
  const { dataSource, ...body } = params;
  return remote(API.STREAM_MONITOR_RETRY, body, 'POST', servers[dataSource]);
};

export const estateRetry = params => {
  return request.post(API.STREAM_MONITOR_LIST_RETRY, params, { cancel: true });
};

export const estateMark = params => {
  return request.post(API.STREAM_MONITOR_MARK, params);
};
