import React, { PureComponent } from 'react';
import { Tooltip } from 'antd';
import PropTypes from 'prop-types';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { defaultText } from '@/constant/enums';

export default class Copy extends PureComponent {
  static propTypes = {
    text: PropTypes.string,
    content: PropTypes.string,
    children: PropTypes.node
  };

  static defaultProps = {
    content: '复制'
  };

  state = {
    visible: false
  };

  onVisibleChange = visible => {
    if (!visible) {
      this.setState({
        visible
      });
    }
  };

  render() {
    const { text, content, children } = this.props;
    const { visible } = this.state;

    return (
      <>
        {children ?? text ?? defaultText}
        {text != null && (
          <CopyToClipboard
            text={text}
            onCopy={() => this.setState({ visible: true })}
          >
            <Tooltip
              visible={visible}
              onVisibleChange={this.onVisibleChange}
              title="复制成功"
            >
              <a style={{ marginLeft: 10 }}>{content}</a>
            </Tooltip>
          </CopyToClipboard>
        )}
      </>
    );
  }
}
