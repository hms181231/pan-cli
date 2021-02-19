import API from '@/constant/api';
import { remote } from 'utils/fetch';

const authService = {
  profile() {
    return remote(API.PROFILE_PLMS);
  }
};

export default authService;
