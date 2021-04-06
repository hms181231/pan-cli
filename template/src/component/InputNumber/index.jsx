import React, { PureComponent } from 'react';
import { InputNumber as AntInputNumber } from 'antd';
import RangInputNumber from './rang';

export default class InputNumber extends PureComponent {
  static RangInputNumber = RangInputNumber;

  render() {
    return <AntInputNumber {...this.props} min={0} />;
  }
}
