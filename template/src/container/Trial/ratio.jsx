import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Form, Select, Col } from 'antd';

const { Item } = Form;

export default class Ratio extends Component {
  static propTypes = {
    form: PropTypes.object.isRequired,
    global: PropTypes.object.isRequired,
    formItemLayout: PropTypes.object.isRequired,
    span: PropTypes.number
  };

  constructor(props) {
    super(props);

    this.state = {};
  }

  render() {
    const {
      global: { dimensionnameenum },
      form: { getFieldDecorator },
      span,
      formItemLayout
    } = this.props;

    return (
      <>
        {dimensionnameenum.map((item, index) => (
          <Col span={span} key={item.codeEn}>
            <Item label={item.codeCn} {...formItemLayout}>
              {getFieldDecorator(`dimensions[${index}].dimensionValue`)(
                <Select style={{ width: '100px' }}>
                  {item.values?.map(item => (
                    <Select.Option vlaue={item.codeEn} key={item.codeEn}>
                      {item.codeCn}
                    </Select.Option>
                  ))}
                </Select>
              )}
            </Item>
            {getFieldDecorator(`dimensions[${index}].dimensionName`, {
              initialValue: item.codeEn
            })(<input type="hidden" />)}
          </Col>
        ))}
      </>
    );
  }
}
