import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Divider, Form, Button, Select, Row, Col, Input } from 'antd';
import { options } from 'utils/utils';

const { Item } = Form;
let uuid = 0;

export default class RepaymentLists extends PureComponent {
  static propTypes = {
    form: PropTypes.object.isRequired,
    global: PropTypes.object.isRequired,
    formItemLayout: PropTypes.object.isRequired,
    span: PropTypes.number
  };

  constructor(props) {
    super(props);

    this.state = {
      configs: [],
      visible: false
    };
  }

  componentDidMount() {
    this.handleConfig();
  }

  onAdd = () => {
    this.handleConfig();
  };

  onDelete = index => {
    this.setState(({ configs: prevConfigs }) => {
      const nextConfigs = [...prevConfigs];
      nextConfigs.splice(index, 1);

      return {
        configs: nextConfigs
      };
    });
  };

  handleConfig = () => {
    const key = uuid++;
    const prefix = `repaymentLists[${key}]`;
    const { global } = this.props;

    this.setState(({ configs: prevConfigs }) => ({
      configs: [
        ...prevConfigs,
        {
          uuid: key,
          chargeId: {
            label: '费用类别',
            name: `${prefix}.chargeId`,
            component: () => {
              return (
                <Select style={{ width: '200px' }}>
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
              rules: [
                {
                  required: true,
                  message: '请选择费用类别'
                }
              ]
            }
          },
          terms: {
            label: '自定义还款计划',
            name: `${prefix}.terms`,
            component: () => {
              return <Input style={{ width: '200px' }} />;
            }
          }
        }
      ]
    }));
  };

  render() {
    const { configs, visible } = this.state;
    const {
      form: { getFieldDecorator },
      formItemLayout,
      span
    } = this.props;

    return (
      <>
        {!visible && (
          <a onClick={() => this.setState({ visible: true })}>
            是否填写还款计划
          </a>
        )}
        {visible && (
          <>
            <Divider orientation="left">还款计划</Divider>
            <Row>
              {configs.map((item, index) => {
                return (
                  <Col key={item.uuid} span={span}>
                    <Button
                      ghost
                      type="primary"
                      shape="circle"
                      icon="plus"
                      size="small"
                      onClick={this.onAdd}
                      style={{ marginRight: '5px' }}
                    />
                    {configs.length > 1 && (
                      <Button
                        ghost
                        type="primary"
                        shape="circle"
                        icon="minus"
                        size="small"
                        onClick={() => this.onDelete(index)}
                      />
                    )}
                    <Item label={item.chargeId.label} {...formItemLayout}>
                      {getFieldDecorator(
                        item.chargeId.name,
                        item.chargeId.options
                      )(item.chargeId.component())}
                    </Item>
                    <Item
                      label={item.terms.label}
                      {...formItemLayout}
                      extra="以英文逗号隔开"
                    >
                      {getFieldDecorator(item.terms.name)(
                        item.terms.component()
                      )}
                    </Item>
                  </Col>
                );
              })}
            </Row>
          </>
        )}
      </>
    );
  }
}
