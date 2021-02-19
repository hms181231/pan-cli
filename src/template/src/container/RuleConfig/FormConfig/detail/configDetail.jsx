import React, { PureComponent } from 'react';
import { List } from 'antd';
import PropTypes from 'prop-types';
import { storeConsumer } from '@/store';
import { ArraytoObject, whetherenum } from 'utils/utils';
import { defaultText, unearned, capital } from 'constant/enums';
import { handleRatioConfig } from '../handleData/utils';
import { result } from 'lodash';

export default
@storeConsumer()
class ConfigDetail extends PureComponent {
  static propTypes = {
    store: PropTypes.object.isRequired,
    data: PropTypes.object
  };

  static defaultProps = {
    data: {}
  };

  constructor(props) {
    super(props);

    this.state = {};
  }

  handleList = data => {
    const {
      store: { global }
    } = this.props;

    // 自定义信息
    const extend = data.extend
      ? Object.keys(data.extend).map(key => ({
          name: this.handleData(global.extendkey, key, 'value', 'codeCn'),
          content: () => data.extend[key]
        }))
      : [];

    // 利率
    const ratioList = data.skuConfigVos
      ? this.handleDimensionalGroupRatios(
          data.skuConfigVos,
          data.chargeId,
          data.ratioModel
        )
      : [];

    let list = [
      {
        name: '费用项',
        content: item =>
          this.handleData(global.allChargeId, item.chargeId, 'code', 'codeCn')
      },
      {
        name: '是否免费',
        content: item =>
          this.handleData(global.freetypeenum, item.free, 'value', 'codeCn')
      },
      {
        name: '免费金额(元)',
        content: item =>
          item.quotaFreeAmount != null ? item.quotaFreeAmount : defaultText
      },
      {
        name: '是否收付',
        content: item =>
          this.handleData(
            global.amountdirectionenum,
            item.direction,
            'codeEn',
            'codeCn'
          )
      },
      {
        name: '是否随本清',
        content: item =>
          this.handleData(
            global.settlementtype,
            item.settleByPrinciple,
            'codeEn',
            'codeCn'
          )
      },
      {
        name: '还款方式',
        content: item =>
          this.handleData(
            global.repaymethod,
            item.repayMethod,
            'codeEn',
            'codeCn'
          )
      },
      {
        name: '计算公式',
        content: item =>
          this.handleData(
            global.formulatype,
            item.calcFormula,
            'codeEn',
            'codeCn'
          )
      },
      {
        name: '计息规则',
        content: item =>
          this.handleData(global.termrule, item.termRule, 'codeEn', 'codeCn')
      },
      {
        name: '是否预收',
        content: item =>
          this.handleData(
            whetherenum(global.whetherenum, unearned.YES, unearned.NO),
            item.unearned,
            'value',
            'text'
          )
      },
      {
        name: '收费方式',
        content: item =>
          this.handleData(global.paymode, item.chargeMethod, 'codeEn', 'codeCn')
      },
      {
        name: '固定还款日',
        content: item =>
          this.handleData(
            [{ codeEn: 'FIX_DATE', codeCn: '有' }],
            item.repayDayRule?.repayDateType,
            'codeEn',
            'codeCn'
          )
      },
      {
        name: '还款日日期',
        content: item =>
          item.repayDayRule?.repayDateValue
            ? `${item.repayDayRule?.repayDateValue}(单位: 首月日)`
            : defaultText
      },
      {
        name: '兜底规则',
        content: item =>
          this.handleData(
            global.fallbackrule,
            item.fallbackRule,
            'codeEn',
            'codeCn'
          )
      },
      {
        name: '兜底上限',
        content: item =>
          item.fallbackUpperLimitValue
            ? `${item.fallbackUpperLimitValue}${this.handleSuffix(
                item.fallbackRule
              )}`
            : defaultText
      },
      {
        name: '兜底下限',
        content: item =>
          item.fallbackUpperLowerValue
            ? `${item.fallbackUpperLowerValue}${this.handleSuffix(
                item.fallbackRule
              )}`
            : defaultText
      },
      {
        name: '提前还款规则',
        content: item =>
          this.handleData(global.repayrule, item.repayRule, 'codeEn', 'codeCn')
      },
      {
        name: '还款金额上限',
        content: item =>
          item.repayMaxAmount ? `${item.repayMaxAmount}元` : defaultText
      },
      {
        name: '还款金额下限',
        content: item =>
          item.repayMinAmount ? `${item.repayMinAmount}元` : defaultText
      },
      {
        name: '利率模式',
        content: item =>
          this.handleData(
            global.ratiomodal,
            item.ratioModel,
            'codeEn',
            'codeCn'
          )
      },
      ...ratioList,
      {
        name: '收款方主体',
        content: item =>
          this.handleData(global.funder, item.receiverCode, 'code', 'name')
      },
      {
        name: '付款方主体',
        content: item =>
          this.handleData(global.funder, item.payerCode, 'code', 'name')
      },
      {
        name: '代收主体',
        content: item =>
          this.handleData(global.funder, item.receiverAgentCode, 'code', 'name')
      },
      {
        name: '还款计划来源',
        content: item =>
          this.handleData(
            global.ChargeCalcChannelEnum,
            item.chargeCalcChannel,
            'codeEn',
            'codeCn'
          )
      },
      ...extend
    ];

    return list;
  };

  handleData = (data, current, key, value) => {
    return ArraytoObject(data, key, value)[current] || defaultText;
  };

  handleDimensionalGroupRatios = (group, chargeId, ratioModel) => {
    // 本金没有利率
    if (chargeId === capital) {
      return [];
    }

    const currentRatioConfigList = handleRatioConfig(ratioModel);

    const config = group.map(item => {
      const {
        store: { global }
      } = this.props;

      const currentRatioConfig = currentRatioConfigList?.find(
        config => result(item, config.ratio) != null
      );

      return {
        name: currentRatioConfig?.label,
        content: () => {
          if (!currentRatioConfig) {
            return;
          }

          const rateConfig = result(item, currentRatioConfig.rate);
          const max = rateConfig?.max;
          const min = rateConfig?.min;
          let ratio = result(item, currentRatioConfig.ratio);
          let ratioUnit;
          let section = [];

          Object.entries({ ratio: '%', amount: '元' }).forEach(
            ([key, value]) => {
              if (currentRatioConfig.ratio.toLowerCase().endsWith(key)) {
                ratioUnit = value;
              }
            }
          );

          if (Number.isNaN(+ratio)) {
            ratio = `${ratio.min}${ratioUnit}~${ratio.max}${ratioUnit}`;
          } else {
            ratio = `${ratio}${ratioUnit}`;
          }

          const dimensions = item?.dimensions?.reduce(
            (prevDimension, nextDimension) => {
              prevDimension += `${this.handleData(
                global.dimensionnameenum,
                nextDimension.dimensionName,
                'codeEn',
                'codeCn'
              )}: ${this.handleData(
                global.dimensionnameenum.find(
                  item => item.codeEn === nextDimension.dimensionName
                ).values,
                nextDimension.dimensionValue,
                'codeEn',
                'codeCn'
              )}`;

              return prevDimension;
            },
            ''
          );

          if (min) {
            section.push(`${min}${currentRatioConfig.unit}`);
          }

          if (max) {
            section.push(`${max}${currentRatioConfig.unit}`);
          }

          return `${ratio} ${section.join('~')} ${dimensions || ''}`;
        }
      };
    });

    return config;
  };

  // 兜底
  handleSuffix = suffix => {
    switch (suffix) {
      case 'PERIODS':
        return '期';
      case 'AMT':
        return '元';
      case 'DAYS':
        return '天';
      default:
        return '';
    }
  };

  render() {
    const { data } = this.props;

    return (
      <List
        itemLayout="vertical"
        split={false}
        dataSource={this.handleList(data)}
        renderItem={item => {
          const content = item.content(data);

          return (
            <List.Item
              style={{
                display: !content || content === defaultText ? 'none' : 'block'
              }}
            >
              {item.name}: {content}
            </List.Item>
          );
        }}
      />
    );
  }
}
