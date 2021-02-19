import { RATIO_TYPE } from 'constant/enums';

const formatter = value => `${value}元`;
const parser = value => value.replace('元', '');

// 利率
export const RatioUnit = model => {
  switch (model) {
    //   差异化 & 期天数
    case 'TERM_DIFFERENCE_RATIO':
    case 'TERM_LADDER_RATIO':
    case 'TERM_DAY_RATIO':
      return '天';
    //   阶梯化 & 复合利率
    case 'AMOUNT_DIFFERENCE_RATIO':
    case 'AMOUNT_LADDER_RATIO':
    case 'BLEND_RATIO':
      return '元';
    default:
      return '';
  }
};

// 利率模式配置
export const handleRatioConfig = model => {
  switch (model) {
    // 固定利率
    case 'FIXED_RATIO': {
      return [
        {
          label: '利率',
          mode: null,
          ratio: 'ratioVos[0].ratio',
          unit: '元'
        }
      ];
    }
    // 借款期限差异化利率 & 借款期限阶梯化利率
    case 'TERM_DIFFERENCE_RATIO':
    case 'TERM_LADDER_RATIO': {
      return [
        {
          label: '利率',
          ratio: 'ratioVos[0].ratio',
          rate: 'ratioVos[0].Day',
          unit: '天'
        }
      ];
    }
    //  借款金额差异化利率 & 借款金额阶梯化利率
    case 'AMOUNT_DIFFERENCE_RATIO':
    case 'AMOUNT_LADDER_RATIO': {
      return [
        {
          label: '利率',
          ratio: 'ratioVos[0].ratio',
          rate: 'ratioVos[0].Amount',
          unit: '元'
        }
      ];
    }
    //  期天数利率
    case 'TERM_DAY_RATIO': {
      return [
        {
          label: '利率',
          mode: 'single',
          ratio: 'ratioVos[0].ratio',
          rate: 'ratioVos[0].Day',
          unit: '天'
        }
      ];
    }
    //  固定金额
    case 'FIXED_AMOUNT': {
      return [
        {
          label: '金额',
          ratio: 'ratioVos[0].amount',
          unit: '元',
          mode: null,
          ratioProps: {
            formatter,
            parser
          }
        }
      ];
    }
    //  混合收费
    case 'BLEND_RATIO': {
      return Object.keys(RATIO_TYPE).map(key => ({
        label: RATIO_TYPE[key],
        ratio: `ratioVos[0].${key}`,
        ratioProps:
          key === 'amount'
            ? {
                formatter,
                parser
              }
            : undefined,
        unit: '元',
        rate: 'ratioVos[0].Amount'
      }));
    }
    // 后置收费
    case 'TERM_LADDER_RANGE_RATIO': {
      return [
        {
          label: '利率',
          ratio: 'ratioVos[0].Ratio',
          rate: 'ratioVos[0].Day',
          rateMode: 'range',
          unit: '天',
          rateUnit: '%'
        }
      ];
    }
    default:
      break;
  }
};
