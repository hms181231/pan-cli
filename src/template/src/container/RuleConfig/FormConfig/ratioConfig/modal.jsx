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
class DimensionalityModal extends PureComponent {
  static propTypes = {
    form: PropTypes.object.isRequired,
    store: PropTypes.object.isRequired,
    visible: PropTypes.bool,
    label: PropTypes.string,
    onChangeIndex: PropTypes.func,
    onCancel: PropTypes.func,
    onSubmit: PropTypes.func,
    list: PropTypes.arrayOf(PropTypes.object)
  };

  static defaultProps = {
    visible: false,
    onCancel: noop,
    onChangeIndex: noop,
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
      data: options(global.dimensionnameenum, 'codeCn', 'codeEn')
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
        const { onChangeIndex } = this.props;

        values = data.reduce((prev, next) => {
          if (next.value === values.custom) {
            return {
              name: next.text,
              key: next.value,
              index: onChangeIndex()
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
      visible,
      label
    } = this.props;

    const { loading, data } = this.state;

    return (
      <Modal
        title={`增加${label}维度`}
        visible={visible}
        onOk={this.onSubmit}
        onCancel={this.onCancel}
        confirmLoading={loading}
        okText="增加"
        destroyOnClose
      >
        <Form>
          <Item label={`${label}维度类型`} {...formItemLayout}>
            {getFieldDecorator('custom', {
              rules: [
                {
                  required: true,
                  message: `请选择${label}维度类型`
                }
              ]
            })(
              <Select>
                {data.map(item => (
                  <Select.Option
                    key={`RatioModal-${item.value}`}
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
