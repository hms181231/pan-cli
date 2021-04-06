import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { InputNumber } from 'antd';

export default class RangInputNumber extends PureComponent {
  static propTypes = {
    value: PropTypes.object,
    style: PropTypes.object,
    onChange: PropTypes.func
  };

  constructor(props) {
    super(props);

    const value = props.value || {};

    this.state = {
      min: value.min,
      max: value.max
    };
  }

  static getDerivedStateFromProps(nextProps) {
    if ('value' in nextProps) {
      return {
        ...(nextProps.value || { min: null, max: null })
      };
    }

    return null;
  }

  onChange = value => {
    const { onChange } = this.props;

    onChange({ ...this.state, ...value });
  };

  render() {
    const { value, style } = this.props;

    return (
      <>
        <InputNumber
          min={0}
          style={style}
          value={value?.min}
          onChange={min => this.onChange({ min })}
        />
        ~
        <InputNumber
          min={0}
          style={style}
          value={value?.max}
          onChange={max => this.onChange({ max })}
        />
      </>
    );
  }
}
