import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Spin, Modal, message } from 'antd';
import { OceanDynamicForm } from '@ocean/utils';
import { doHandle, estateMark } from 'service/exceptionList';
import { exceptionStatusMap } from 'constant/enums';
import { storeConsumer } from '@/store';

@storeConsumer()
class HandleException extends PureComponent {
  static propTypes = {
    record: PropTypes.object.isRequired,
    refresh: PropTypes.func,
    prefix: PropTypes.string,
    visibleChange: PropTypes.func,
    visible: PropTypes.bool,
    type: PropTypes.string,
    store: PropTypes.object
  };

  static defaultProps = {
    prefix: '处理'
  };

  constructor(props) {
    super(props);

    this.state = {
      loading: false,
      visible: false
    };
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    if (nextProps.visible === prevState.visible) {
      return null;
    }

    return {
      visible: nextProps.visible
    };
  }

  handleSubmit = async params => {
    const { record, refresh, prefix, type } = this.props;
    const { id, dataSource } = record;
    const requset = type === 'old' ? doHandle : estateMark;

    const postParams = {
      ...params,
      id,
      dataSource,
      user: window.INIT_DATA.USER_INFO.name
    };

    this.setState({
      loading: true
    });

    const result = await requset(postParams);

    this.setState({
      loading: false
    });

    if (result) {
      message.success(`${prefix}成功`);
      this.onCancel();
      refresh();
    }
  };

  onCancel = () => {
    const { visibleChange } = this.props;

    visibleChange && visibleChange(false);
  };

  getStatusOptions = () => {
    const { type } = this.props;
    const { store } = this.props;
    const ProcessingStatusEnum = store.global?.dict?.ProcessingStatusEnum || {};
    const statusOptions = Object.keys(
      type === 'old' ? exceptionStatusMap : ProcessingStatusEnum
    )
      .filter(
        k =>
          !(type === 'old' ? ['4', '10', '11'] : ['1', '4', '11']).includes(k)
      )
      .map(k => {
        return {
          key: k,
          value: k,
          text: type === 'old' ? exceptionStatusMap[k] : ProcessingStatusEnum[k]
        };
      });
    return statusOptions;
  };

  getConfigs = () => {
    const { record, prefix } = this.props;
    const { processingStatus, remark } = record || {};

    return [
      {
        text: `${prefix}结果`,
        key: 'processingStatus',
        type: 'radioButtons',
        initialValue: `${processingStatus}`,
        rules: [{ required: true, message: `请选择${prefix}结果` }],
        props: {
          radios: this.getStatusOptions()
        }
      },
      {
        text: `${prefix}备注`,
        key: 'remark',
        type: 'textArea',
        initialValue: remark,
        rules: [{ required: true, message: '请填写备注' }]
      }
    ];
  };

  render() {
    const { prefix } = this.props;
    const { loading, visible } = this.state;
    const configs = this.getConfigs();

    return (
      <Modal
        title={`异常${prefix}`}
        onCancel={this.onCancel}
        visible={visible}
        footer={null}
      >
        <Spin spinning={loading}>
          <OceanDynamicForm.Component
            configs={configs}
            keepValueAfterSubmit
            submitText="提交"
            cancelText="取消"
            onSubmit={this.handleSubmit}
            onCancel={this.onCancel}
          />
        </Spin>
      </Modal>
    );
  }
}

export default HandleException;
