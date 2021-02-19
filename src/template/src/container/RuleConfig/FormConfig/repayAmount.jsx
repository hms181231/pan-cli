import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Form } from 'antd';
import InputNumber from 'component/InputNumber';

const { Item } = Form;

export default class RepayAmount extends PureComponent {
  static propTypes = {
    form: PropTypes.object.isRequired,
    data: PropTypes.object
  };

  // 还款金额上限
  handleRepayMaxAmount = (rule, value, callback) => {
    const { form } = this.props;
    const repayMinAmount = form.getFieldValue('repayMinAmount');

    if (repayMinAmount && value && value < repayMinAmount) {
      callback('还款金额上限不能小于还款金额下限');
      return;
    }

    callback();
  };

  // 还款金额下限
  handleRepayMinAmount = (rule, value, callback) => {
    const { form } = this.props;
    const repayMaxAmount = form.getFieldValue('repayMaxAmount');

    if (repayMaxAmount && value && value > repayMaxAmount) {
      callback('还款金额下限不能大于还款金额上限');
      return;
    }

    callback();
  };

  render() {
    const {
      form: { getFieldDecorator },
      data,
      ...rest
    } = this.props;

    return (
      <>
        <Item label="还款金额上限" {...rest}>
          {getFieldDecorator('repayMaxAmount', {
            initialValue: data?.repayMaxAmount,
            rules: [
              {
                validator: this.handleRepayMaxAmount,
                type: 'number'
              }
            ]
          })(
            <InputNumber
              min={0}
              style={{ width: 200 }}
              step={0.01}
              max={99999999.99}
            />
          )}
          元
        </Item>
        <Item label="还款金额下限" {...rest}>
          {getFieldDecorator('repayMinAmount', {
            initialValue: data?.repayMinAmount,
            rules: [
              {
                validator: this.handleRepayMinAmount,
                type: 'number'
              }
            ]
          })(
            <InputNumber
              min={0}
              style={{ width: 200 }}
              step={0.01}
              max={99999999.99}
            />
          )}
          元
        </Item>
      </>
    );
  }
}
