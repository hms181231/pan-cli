import { remote } from 'utils/fetch';
import API from 'constant/api';

const ruleConfigService = {
  SPU(params) {
    return remote(API.SPU, params, 'PUT');
  },
  getSPU(params) {
    return remote(`${API.SPU}/${params.spu}`, null, 'GET');
  },
  setRuleConfig(params) {
    return remote(API.SET_RULE_CONFIG, params, 'PUT');
  },
  getRuleConfig(params) {
    return remote(`${API.GET_RULE_CONFIG}/${params.spu}`, null, 'GET');
  }
};

export default ruleConfigService;
