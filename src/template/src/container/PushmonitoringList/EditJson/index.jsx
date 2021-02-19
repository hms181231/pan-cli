import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Modal, message } from 'antd';
import { retry, estateRetry } from 'service/exceptionList';
import Edit from './editJson';

export default class EditJson extends PureComponent {
  Edit = React.createRef();

  static propTypes = {
    visible: PropTypes.bool,
    onCancel: PropTypes.func,
    refresh: PropTypes.func,
    record: PropTypes.object
  };

  static defaultProps = {
    record: {},
    visible: false
  };

  state = {
    loading: false
  };

  onCancel = () => {
    const { onCancel } = this.props;

    onCancel?.();
  };

  onSubmit = async () => {
    const {
      refresh,
      record: { id, dataSource, activeKey }
    } = this.props;
    let fetch = estateRetry;

    this.setState({
      loading: true
    });

    if (activeKey === 'old') {
      fetch = retry;
    }

    const result = await fetch({
      id,
      dataSource,
      user: window.INIT_DATA.USER_INFO.name,
      content: JSON.stringify(this.Edit.current.getJSON())
    });

    this.setState({
      loading: false
    });

    refresh();

    if (result == null) {
      return;
    }

    message.success('处理成功');
    this.onCancel();
  };

  render() {
    const {
      visible,
      record: { content }
    } = this.props;
    const { loading } = this.state;

    return (
      <Modal
        title="处理"
        onCancel={this.onCancel}
        visible={visible}
        destroyOnClose
        onOk={this.onSubmit}
        confirmLoading={loading}
      >
        <Edit ref={this.Edit} json={content ? JSON.parse(content) : {}} />
      </Modal>
    );
  }
}
