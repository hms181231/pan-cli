import API from 'constant/api';
import { request } from 'utils/fetch';

const FlowService = {
  getList(params) {
    return request.post(API.FLOW_LIST, params);
  }
};

export default FlowService;
