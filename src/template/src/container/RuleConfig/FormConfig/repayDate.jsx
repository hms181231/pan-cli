import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Form, Select } from 'antd';
import InputNumber from 'component/InputNumber';

const { Item } = Form;
export default class repayDate extends PureComponent {
  static propTypes = {
    form: PropTypes.object.isRequired,
    data: PropTypes.object
  };

  constructor(props) {
    super(props);

    this.state = {
      visible: !!props.data.repayDateType || false
    };
  }

  handleRepayDateType = value => {
    this.setState({
      visible: !!value
    });
  };

  render() {
    const { visible } = this.state;
    const {
      form: { getFieldDecorator },
      data,
      ...rest
    } = this.props;

    return (
      <>
        <Item label="固定还款日" {...rest}>
          {getFieldDecorator('repayDayRule.repayDateType', {
            initialValue: data.repayDateType
          })(
            <Select
              style={{ width: 200 }}
              allowClear
              onChange={this.handleRepayDateType}
            >
              <Select.Option value="FIX_DATE">有</Select.Option>
            </Select>
          )}
        </Item>
        {visible && (
          <>
            <Item label="还款日日期" {...rest}>
              {getFieldDecorator('repayDayRule.repayDateValue', {
                initialValue: data.repayDateValue,
                rules: [
                  {
                    required: true,
                    validator(rule, value, callback) {
                      if (!value) {
                        return callback('请输入还款日日期');
                      }

                      if (value < 1 || value > 28) {
                        return callback('请输入1~28内的还款日日期');
                      }

                      callback();
                    },
                    type: 'number'
                  }
                ]
              })(<InputNumber style={{ width: 200 }} min={1} max={28} />)}
              (单位: 首月日)
            </Item>
            {// 固定参数
            getFieldDecorator('repayDayRule.specialRepayDateType', {
              initialValue: 'SCHEDULED_DATE'
            })(<input type="hidden" />)}
          </>
        )}
      </>
    );
  }
}
