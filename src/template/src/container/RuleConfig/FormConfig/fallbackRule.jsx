import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { storeConsumer } from '@/store';
import { Form, Select } from 'antd';
import InputNumber from 'component/InputNumber';
import { options } from 'utils/utils';

const { Item } = Form;

export default
@storeConsumer()
class Fallback extends PureComponent {
  static propTypes = {
    form: PropTypes.object.isRequired,
    store: PropTypes.object.isRequired,
    data: PropTypes.object
  };

  constructor(props) {
    super(props);

    const fallbackRule = props.data?.fallbackRule;

    this.state = {
      rule: fallbackRule || null,
      suffix: this.handleSuffix(fallbackRule) || null
    };
  }

  onChange = value => {
    const suffix = this.handleSuffix(value);

    this.setState({
      rule: value,
      suffix
    });
  };

  handleSuffix = suffix => {
    switch (suffix) {
      case 'PERIODS':
        return '期';
      case 'AMT':
        return '元';
      case 'DAYS':
        return '天';
      default:
        break;
    }
  };

  // 兜底上限
  handleFallbackUpperLimitValue = (rule, value, callback) => {
    const { form } = this.props;
    const fallbackUpperLowerValue = form.getFieldValue(
      'fallbackUpperLowerValue'
    );

    if (value === 0 || (!value && !fallbackUpperLowerValue)) {
      callback('请输入兜底上限');
      return;
    }

    if (value && fallbackUpperLowerValue && value < fallbackUpperLowerValue) {
      callback('兜底上限不能小于兜底下限');
      return;
    }

    callback();
  };

  // 兜底下限
  handleFallbackUpperLowerValue = (rule, value, callback) => {
    const { form } = this.props;
    const fallbackUpperLimitValue = form.getFieldValue(
      'fallbackUpperLimitValue'
    );

    if (value === 0 || (!value && !fallbackUpperLimitValue)) {
      callback('请输入兜底下限');
      return;
    }

    if (value && fallbackUpperLimitValue && value > fallbackUpperLimitValue) {
      callback('兜底下限不能大于兜底上限');
      return;
    }

    callback();
  };

  render() {
    const {
      form: { getFieldDecorator },
      data,
      store: { global },
      ...rest
    } = this.props;

    const { rule, suffix } = this.state;
    const notRule = !['ALL_INTEREST', 'WHOLE_PERIOD'].includes(rule);

    return (
      <>
        <Item label="兜底规则" {...rest}>
          {getFieldDecorator('fallbackRule', {
            initialValue: data?.fallbackRule,
            rules: [
              {
                required: true,
                message: '请选择兜底规则'
              }
            ]
          })(
            <Select
              onChange={this.onChange}
              style={{ width: '200px' }}
              dropdownMatchSelectWidth={false}
            >
              {options(global.fallbackrule, 'codeCn', 'codeEn').map(item => (
                <Select.Option value={item.value} key={item.value}>
                  {item.text}
                </Select.Option>
              ))}
            </Select>
          )}
        </Item>
        {rule && notRule && (
          <>
            <Item label="兜底上限" {...rest}>
              {getFieldDecorator('fallbackUpperLimitValue', {
                initialValue: data?.fallbackUpperLimitValue,
                rules: [
                  {
                    validator: this.handleFallbackUpperLimitValue,
                    type: 'number'
                  }
                ]
              })(<InputNumber style={{ width: 200 }} />)}
              {suffix}
            </Item>
            <Item label="兜底下限" {...rest}>
              {getFieldDecorator('fallbackUpperLowerValue', {
                initialValue: data?.fallbackUpperLowerValue,
                rules: [
                  {
                    validator: this.handleFallbackUpperLowerValue,
                    type: 'number'
                  }
                ]
              })(<InputNumber style={{ width: 200 }} />)}
              {suffix}
            </Item>
          </>
        )}
      </>
    );
  }
}
