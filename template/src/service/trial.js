import API from 'constant/api';
import { remote } from 'utils/fetch';

const TrialService = {
  calcRepayPlan(params) {
    return remote(API.CALC_REPAY_PLAN, params);
  }
};

export default TrialService;
