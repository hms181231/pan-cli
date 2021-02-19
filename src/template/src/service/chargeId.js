import API from '@/constant/api';
import { remote } from 'utils/fetch';

const chargeService = {
  chargeList(params) {
    return remote(API.CHARGE_LIST, params);
  },
  updateCharge(params) {
    return remote(API.UPDATE_CHARGE, params, 'PUT');
  },
  setCharge(params) {
    return remote(API.SET_CHARGE, params, 'PUT');
  }
};

export default chargeService;
