import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Modal, Tabs, Empty } from 'antd';
import './exception.less';

const { TabPane } = Tabs;

class ExceptionDetail extends PureComponent {
  static propTypes = {
    record: PropTypes.object.isRequired,
    visibleChange: PropTypes.func,
    visible: PropTypes.bool
  };

  constructor(props) {
    super(props);

    this.state = {
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

  onCancel = () => {
    const { visibleChange } = this.props;

    if (visibleChange) {
      visibleChange(false);
    }
  };

  render() {
    const { visible } = this.state;
    const { record } = this.props;
    const { exceptionMsg, content } = record || {};

    return (
      <Modal
        title="异常日志"
        wrapClassName="exception-warp"
        onCancel={this.onCancel}
        visible={visible}
        width={800}
        footer={null}
      >
        {record && record.id && (
          <Tabs defaultActiveKey="1" animated={false}>
            <TabPane tab="异常明细" key="1">
              <div className="exception-content">
                {exceptionMsg || <Empty />}
              </div>
            </TabPane>
            <TabPane tab="入参明细" key="2">
              <div className="exception-content">{content || <Empty />}</div>
            </TabPane>
          </Tabs>
        )}
      </Modal>
    );
  }
}

export default ExceptionDetail;
