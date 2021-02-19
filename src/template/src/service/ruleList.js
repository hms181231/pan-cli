import API from 'constant/api';
import { remote } from 'utils/fetch';

const RuleListService = {
  getList(params) {
    return remote(`${API.RULES_LIST}`, params);
  },
  setStatus(params) {
    return remote(API.SET_STATUS, params);
  }
};

export default RuleListService;
