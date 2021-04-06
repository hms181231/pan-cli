import API from 'constant/api';
import { remote, request } from '@/utils/fetch';

const initService = {
  async getAll() {
    let [phecda, cmsCity, funder, dict, allChargeId] = await Promise.all([
      remote(API.INIT_DATA, null, 'GET'),
      remote(API.GET_CITYS, {}, 'POST', 'classic_cms'),
      remote(API.FUNDER_ALL, null, 'POST', 'ledger'),
      request.get(API.DICT),
      remote(API.ALL_CHARGE_LIST, { statusList: ['USING'] })
    ]);

    if (!phecda || !cmsCity || !funder || !dict || !allChargeId) {
      return null;
    }

    funder = Object.keys(funder.data?.[0] ?? {}).map(code => ({
      code: +code,
      name: funder.data[0][code]
    }));

    // 过滤掉城市维度&资方维度&期限维度 (这三个是支持贝用金做的  计费房产和试算不需要)
    phecda.dimensionnameenum = phecda?.dimensionnameenum?.filter(
      item => !['cityAttr', 'funderAttr', 'termAttr'].includes(item.codeEn)
    );

    // 过滤掉复合利率 (计费房产和试算不需要)
    phecda.ratiomodal = phecda.ratiomodal.filter(
      item => !['COMPOUND_RATIO'].includes(item.codeEn)
    );

    const enumsTrans = data => {
      if (!data) {
        return;
      }

      const initData = {};

      Object.values(data).forEach(item => {
        const { key, ...attrs } = item;
        const kw = `${key}`;
        if (!initData[kw]) {
          initData[kw] = {};
        }
        initData[kw][attrs.value] = attrs.name;
      });

      return initData;
    };

    return {
      ...phecda,
      funder: funder ?? [],
      cmsCity: cmsCity ?? [],
      dict: enumsTrans(dict ?? {}),
      allChargeId:
        allChargeId.map(item => ({
          code: item.chargeId,
          codeCn: item.chargeName,
          codeEn: item.chargeKey
        })) ?? []
    };
  }
};

export default initService;
