import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { storeConsumer } from '@/store';
import { Modal, Form, Select, message } from 'antd';
import { options } from 'utils/utils';

const { Item } = Form;

const noop = () => {};

const formItemLayout = {
  labelCol: {
    xs: { span: 24 },
    sm: { span: 8 }
  },
  wrapperCol: {
    xs: { span: 24 },
    sm: { span: 16 }
  }
};

export default
@storeConsumer()
@Form.create()
class CustomModal extends PureComponent {
  static propTypes = {
    form: PropTypes.object.isRequired,
    store: PropTypes.object.isRequired,
    visible: PropTypes.bool,
    onCancel: PropTypes.func,
    onSubmit: PropTypes.func,
    list: PropTypes.arrayOf(PropTypes.object)
  };

  static defaultProps = {
    visible: false,
    onCancel: noop,
    onSubmit: noop,
    list: []
  };

  constructor(props) {
    super(props);

    const {
      store: { global }
    } = props;

    this.state = {
      loading: false,
      data: options(global.extendkey, 'codeCn', 'value')
    };
  }

  onSubmit = () => {
    const { form, onSubmit, list } = this.props;
    const { data } = this.state;

    form.validateFields((error, values) => {
      if (error) {
        return;
      }
      if (list.some(item => item.key === values.custom)) {
        return message.warn('不能重复添加');
      }

      this.setState({
        loading: true
      });

      setTimeout(() => {
        values = data.reduce((prev, next) => {
          if (next.value === values.custom) {
            return {
              name: next.text,
              key: next.value
            };
          }
          return prev;
        }, {});

        this.setState(
          {
            loading: false
          },
          () => {
            onSubmit([...list, values]);
            this.onCancel();
          }
        );
      }, 300);
    });
  };

  onCancel = () => {
    const { onCancel } = this.props;

    onCancel();
  };

  render() {
    const {
      form: { getFieldDecorator },
      visible
    } = this.props;

    const { loading, data } = this.state;

    return (
      <Modal
        title="增加自定义信息"
        visible={visible}
        onOk={this.onSubmit}
        onCancel={this.onCancel}
        confirmLoading={loading}
        okText="增加"
        destroyOnClose
      >
        <Form>
          <Item label="自定义信息" {...formItemLayout}>
            {getFieldDecorator('custom', {
              rules: [
                {
                  required: true,
                  message: '请选择自定义信息'
                }
              ]
            })(
              <Select>
                {data.map(item => (
                  <Select.Option
                    key={`CustomModal-${item.value}`}
                    value={item.value}
                  >
                    {item.text}
                  </Select.Option>
                ))}
              </Select>
            )}
          </Item>
        </Form>
      </Modal>
    );
  }
}
