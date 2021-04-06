import React, { PureComponent, Fragment } from 'react';
import PropTypes from 'prop-types';
import { Form, Select, InputNumber } from 'antd';
import { storeConsumer } from '@/store';
import { options, whetherenum } from 'utils/utils';
import { capital, interest } from 'constant/enums';
import FallbackRule from './fallbackRule';
import CustomConfig from './customConfig';
import Ratio from './ratioConfig';
import RepayAmount from './repayAmount';
import RepayDate from './repayDate';

const formItemLayout = {
  labelCol: {
    xs: { span: 24 },
    sm: { span: 4 }
  },
  wrapperCol: {
    xs: { span: 24 },
    sm: { span: 20 }
  }
};

// 过滤联动字段集合
const keyFilterList = ['chargeId', 'direction', 'free'];

@storeConsumer()
@Form.create()
class Config extends PureComponent {
  static propTypes = {
    form: PropTypes.object.isRequired,
    store: PropTypes.object.isRequired,
    data: PropTypes.object,
    changeChargeId: PropTypes.func,
    spuType: PropTypes.string
  };

  static defaultProps = {
    data: {}
  };

  constructor(props) {
    super(props);

    this.state = {
      filter: [], // 过滤formItem
      chargeId: null
    };
  }

  componentDidMount() {
    const { data } = this.props;

    this.setState({
      filter: this.handleConfigFilter({
        chargeId: data.chargeId,
        direction: data.direction,
        free: data.free
      }),
      chargeId: data.chargeId
    });
  }

  config = ({ data = {}, filter = [] }) => {
    const { form, store, changeChargeId } = this.props;
    const { chargeId } = this.state;
    const { global } = store;
    const config = [
      {
        label: '费用项',
        name: 'chargeId',
        component: () => {
          return (
            <Select
              onChange={value => {
                changeChargeId(value);
                this.setState({
                  chargeId: value
                });

                // 利息、担保服务费、管理服务费  默认随本清算
                if ([1023, 1001, 1002].includes(+value)) {
                  form.setFieldsValue({
                    settleByPrinciple: 'SETTLE_BY_PRINCIPLE'
                  });
                }

                this.handleFilter(['chargeId', value]);
              }}
              style={{ width: '200px' }}
              disabled={data.isEdit}
              dropdownMatchSelectWidth={false}
              showSearch
              filterOption={(input, option) =>
                option.props.children
                  .toLowerCase()
                  .indexOf(input.toLowerCase()) >= 0
              }
              optionFilterProp="children"
            >
              {options(global.allChargeId, 'codeCn', 'code').map(item => (
                <Select.Option
                  value={item.value}
                  key={`chargeId-${item.value}`}
                >
                  {item.text}
                </Select.Option>
              ))}
            </Select>
          );
        },
        options: {
          initialValue: data.chargeId,
          rules: [
            {
              required: true,
              message: '请选择费用项'
            }
          ]
        }
      },
      {
        label: '是否免费',
        name: 'free',
        component: () => {
          return (
            <Select
              style={{ width: '200px' }}
              onChange={value => this.handleFilter(['free', value])}
              dropdownMatchSelectWidth={false}
            >
              {options(global.freetypeenum, 'codeCn', 'value').map(item => (
                <Select.Option value={item.value} key={`free-${item.value}`}>
                  {item.text}
                </Select.Option>
              ))}
            </Select>
          );
        },
        options: {
          initialValue: data.free,
          rules: [
            {
              required: true,
              message: '请选择是否免费'
            }
          ]
        }
      },
      {
        label: '免费金额(元)',
        name: 'quotaFreeAmount',
        component: () => {
          return <InputNumber style={{ width: 200 }} min={0} />;
        },
        options: {
          initialValue: data.quotaFreeAmount,
          rules: [
            {
              required: true,
              message: '请输入免费金额'
            },
            {
              pattern: /^\d+(\.\d{1,2})?$/,
              message: '请输入正确金额'
            }
          ]
        }
      },
      {
        label: '是否收付',
        name: 'direction',
        component: () => {
          return (
            <Select
              style={{ width: '200px' }}
              onChange={value => this.handleFilter(['direction', value])}
              dropdownMatchSelectWidth={false}
            >
              {options(global.amountdirectionenum, 'codeCn', 'codeEn').map(
                item => (
                  <Select.Option
                    value={item.value}
                    key={`direction-${item.value}`}
                  >
                    {item.text}
                  </Select.Option>
                )
              )}
            </Select>
          );
        },
        options: {
          // 默认初始值是‘收’
          initialValue: data.direction ?? 'RECEIVE',
          rules: [
            {
              required: true,
              message: '请选择是否收付'
            }
          ]
        }
      },
      {
        label: '是否随本清',
        name: 'settleByPrinciple',
        component: () => {
          return (
            <Select
              style={{ width: '200px' }}
              allowClear
              dropdownMatchSelectWidth={false}
            >
              {options(global.settlementtype, 'codeCn', 'codeEn').map(item => (
                <Select.Option
                  value={item.value}
                  key={`settleByPrinciple-${item.value}`}
                >
                  {item.text}
                </Select.Option>
              ))}
            </Select>
          );
        },
        options: {
          initialValue: data.settleByPrinciple,
          // 只有利息有必须规则
          rules: [
            {
              required: +chargeId === interest,
              message: '请选择是否随本清'
            }
          ]
        }
      },
      {
        label: '还款方式',
        name: 'repayMethod',
        component: () => {
          return (
            <Select style={{ width: '200px' }} dropdownMatchSelectWidth={false}>
              {options(global.repaymethod, 'codeCn', 'codeEn').map(item => (
                <Select.Option
                  value={item.value}
                  key={`repayMethod-${item.value}`}
                >
                  {item.text}
                </Select.Option>
              ))}
            </Select>
          );
        },
        options: {
          initialValue: data.repayMethod,
          rules: [
            {
              required: true,
              message: '请选择还款方式'
            }
          ]
        }
      },
      {
        label: '计算公式',
        name: 'calcFormula',
        component: () => {
          return (
            <Select style={{ width: '260px' }} dropdownMatchSelectWidth={false}>
              {options(global.formulatype, 'codeCn', 'codeEn').map(item => (
                <Select.Option
                  value={item.value}
                  key={`calcFormula-${item.value}`}
                >
                  {item.text}
                </Select.Option>
              ))}
            </Select>
          );
        },
        options: {
          initialValue: data.calcFormula,
          rules: [
            {
              required: true,
              message: '请选择计算公式'
            }
          ]
        }
      },
      {
        label: '计息规则',
        name: 'termRule',
        component: () => {
          return (
            <Select style={{ width: '260px' }} dropdownMatchSelectWidth={false}>
              {options(global.termrule, 'codeCn', 'codeEn').map(item => (
                <Select.Option
                  value={item.value}
                  key={`termRule-${item.value}`}
                >
                  {item.text}
                </Select.Option>
              ))}
            </Select>
          );
        },
        options: {
          // 默认初始值是‘放款当日计息，还款当日不计息’
          initialValue: data.termRule ?? 'HEAD_NO_TAIL',
          rules: [
            {
              required: true,
              message: '请选择计息规则'
            }
          ]
        }
      },
      {
        label: '是否预收',
        name: 'unearned',
        component: () => {
          return (
            <Select style={{ width: '200px' }} dropdownMatchSelectWidth={false}>
              {whetherenum(global.whetherenum, '预收', '不预收').map(item => (
                <Select.Option
                  value={item.value}
                  key={`unearned-${item.value}`}
                >
                  {item.text}
                </Select.Option>
              ))}
            </Select>
          );
        },
        options: {
          initialValue: data.unearned,
          rules: [
            {
              required: true,
              message: '请选择是否预收'
            }
          ]
        }
      },
      {
        label: '收费方式',
        name: 'chargeMethod',
        component: () => {
          return (
            <Select style={{ width: '200px' }} dropdownMatchSelectWidth={false}>
              {options(global.paymode, 'codeCn', 'codeEn').map(item => (
                <Select.Option
                  value={item.value}
                  key={`chargeMethod-${item.value}`}
                >
                  {item.text}
                </Select.Option>
              ))}
            </Select>
          );
        },
        options: {
          initialValue: data.chargeMethod,
          rules: [
            {
              required: true,
              message: '请选择收费方式'
            }
          ]
        }
      },
      {
        custom: true,
        name: 'repayDate',
        component: () => {
          return (
            <RepayDate
              {...formItemLayout}
              data={{
                repayDateType: data.repayDayRule?.repayDateType,
                repayDateValue: data.repayDayRule?.repayDateValue
              }}
              form={form}
            />
          );
        }
      },
      {
        custom: true,
        name: 'fallbackRule',
        component: () => (
          <FallbackRule
            {...formItemLayout}
            data={{
              fallbackRule: data.fallbackRule,
              fallbackUpperLimitValue: data.fallbackUpperLimitValue,
              fallbackUpperLowerValue: data.fallbackUpperLowerValue
            }}
            form={form}
          />
        )
      },
      {
        label: '提前还款规则',
        name: 'repayRule',
        component: () => {
          return (
            <Select style={{ width: '200px' }} dropdownMatchSelectWidth={false}>
              {options(global.repayrule, 'codeCn', 'codeEn').map(item => (
                <Select.Option
                  value={item.value}
                  key={`repayRule-${item.value}`}
                >
                  {item.text}
                </Select.Option>
              ))}
            </Select>
          );
        },
        options: {
          // 默认初始值是‘都支持’
          initialValue: data.repayRule ?? 'REPAY_BOTH',
          rules: [
            {
              required: true,
              message: '请选择提前还款规则'
            }
          ]
        }
      },
      {
        custom: true,
        name: 'RepayAmount',
        component: () => (
          <RepayAmount
            {...formItemLayout}
            data={{
              repayMinAmount: data.repayMinAmount,
              repayMaxAmount: data.repayMaxAmount
            }}
            form={form}
          />
        )
      },
      {
        custom: true,
        name: 'ratio',
        component: () => (
          <Ratio
            {...formItemLayout}
            data={{
              skuConfigVos: data.skuConfigVos,
              ratioModel: data.ratioModel
            }}
            form={form}
          />
        )
      },
      {
        label: '收款方主体',
        name: 'receiverCode',
        component: () => {
          return (
            <Select
              dropdownMatchSelectWidth={false}
              showSearch
              filterOption={(input, option) =>
                option.props.children
                  .toLowerCase()
                  .indexOf(input.toLowerCase()) >= 0
              }
              optionFilterProp="children"
              style={{ width: '360px' }}
              onChange={value => {
                // 中航信托股份有限公司天蔚7号, 中航信托股份有限公司天顺592, 光大兴隆信托有限责任公司乾涵1号, 光大兴隆信托有限责任公司乾涵2号, 光大兴隆信托有限责任公司乾涵3号
                if ([92, 93, 291, 324, 997].includes(value)) {
                  // 计划来源：中航信托
                  form.setFieldsValue({
                    chargeCalcChannel: 'FUND_PLATFORM_AVICTRUST'
                  });
                  return;
                }

                // 计划来源：计费系统
                form.setFieldsValue({
                  chargeCalcChannel: 'BILLING_SYSTEM'
                });
              }}
            >
              {options(global.funder, 'name', 'code').map(item => (
                <Select.Option
                  value={item.value}
                  key={`receiverCode-${item.value}`}
                >
                  {item.text}
                </Select.Option>
              ))}
            </Select>
          );
        },
        options: {
          initialValue: data.receiverCode,
          rules: [
            {
              required: true,
              message: '请选择收款方主体'
            }
          ]
        }
      },
      {
        label: '付款方主体',
        name: 'payerCode',
        component: () => {
          return (
            <Select
              dropdownMatchSelectWidth={false}
              showSearch
              filterOption={(input, option) =>
                option.props.children
                  .toLowerCase()
                  .indexOf(input.toLowerCase()) >= 0
              }
              optionFilterProp="children"
              style={{ width: '360px' }}
            >
              {options(global.funder, 'name', 'code').map(item => (
                <Select.Option
                  value={item.value}
                  key={`payerCode-${item.value}`}
                >
                  {item.text}
                </Select.Option>
              ))}
            </Select>
          );
        },
        options: {
          initialValue: data.payerCode,
          rules: [
            {
              required: true,
              message: '请选择付款方主体'
            }
          ]
        }
      },
      {
        label: '代收主体',
        name: 'receiverAgentCode',
        component: () => {
          return (
            <Select
              dropdownMatchSelectWidth={false}
              showSearch
              filterOption={(input, option) =>
                option.props.children
                  .toLowerCase()
                  .indexOf(input.toLowerCase()) >= 0
              }
              optionFilterProp="children"
              style={{ width: '360px' }}
              allowClear
            >
              {options(global.funder, 'name', 'code').map(item => (
                <Select.Option
                  value={item.value}
                  key={`receiverAgentCode-${item.value}`}
                >
                  {item.text}
                </Select.Option>
              ))}
            </Select>
          );
        },
        options: {
          initialValue: data.receiverAgentCode
        }
      },
      {
        label: '还款计划来源',
        name: 'chargeCalcChannel',
        component: () => {
          return (
            <Select style={{ width: '200px' }} dropdownMatchSelectWidth={false}>
              {options(global.ChargeCalcChannelEnum, 'codeCn', 'codeEn').map(
                item => (
                  <Select.Option
                    value={item.value}
                    key={`chargeCalcChannel-${item.value}`}
                  >
                    {item.text}
                  </Select.Option>
                )
              )}
            </Select>
          );
        },
        options: {
          initialValue: data.chargeCalcChannel,
          rules: [
            {
              required: true,
              message: '请选择还款计划来源'
            }
          ]
        }
      },
      {
        custom: true,
        name: 'customConfig',
        component: () => (
          <CustomConfig
            {...formItemLayout}
            store={store}
            data={data.extend}
            form={form}
          />
        )
      }
    ];

    return config.filter(item => !filter.includes(item.name));
  };

  handleFormItem = filter => {
    const {
      form: { getFieldDecorator },
      data
    } = this.props;

    return this.config({ data, filter }).map((item, index) => {
      if (item.custom) {
        return (
          <Fragment key={`${item.name}-${+index}`}>{item.component()}</Fragment>
        );
      }

      return (
        <Form.Item
          {...formItemLayout}
          label={item.label}
          key={`${item.label}-${item.name}-${+index}`}
        >
          {getFieldDecorator(item.name, item.options)(item.component())}
          {item.suffix}
        </Form.Item>
      );
    });
  };

  handleFilter = ([key, value]) => {
    const {
      form: { getFieldsValue }
    } = this.props;

    const values = getFieldsValue(keyFilterList.filter(item => item !== key));

    this.setState(() => {
      return {
        filter: this.handleConfigFilter({ [key]: value, ...values })
      };
    });
  };

  handleConfigFilter = ({ chargeId, direction, free }) => {
    const { spuType } = this.props;
    let filter = [];

    // 本金
    if (chargeId === capital) {
      filter = [...filter, 'ratio', 'calcFormula'];
    }

    // 非利息
    if (![interest].includes(chargeId)) {
      filter = [...filter, 'repayDate'];
    }

    // 本金 还款保证金 保证金2 逾期本金 代偿本金
    if ([capital, 1004, 1005, 1013, 1016].includes(chargeId)) {
      filter = [...filter, 'settleByPrinciple'];
    }

    if (direction !== 'PAY') {
      filter = [...filter, 'payerCode'];
    }

    // 不是定额免费都过滤免费金额字段
    if (free !== 'QUOTA_FREE') {
      filter = [...filter, 'quotaFreeAmount'];
    }

    if (spuType !== 'GUARANTEE') {
      // 暂时担保类使用   担保类保留金额还款  其他过滤
      filter = [...filter, 'RepayAmount'];
    }

    return filter;
  };

  getChargeId = () => {
    const { form } = this.props;

    return form.getFieldValue('chargeId');
  };

  render() {
    const { filter } = this.state;

    return <Form>{this.handleFormItem(filter)}</Form>;
  }
}

export default React.forwardRef((props, ref) => (
  <Config {...props} wrappedComponentRef={ref} />
));
