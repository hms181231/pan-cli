import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Button, Form, Select } from 'antd';
import styled from 'styled-components';
import { result, isEqual } from 'lodash';

const { Item } = Form;

const ItemContent = styled.div`
  display: flex;
  flex-wrap: wrap;

  .spaced {
    margin: 0 10px;
    align-self: flex-start;
  }
`;

export default class RatioType extends PureComponent {
  static propTypes = {
    length: PropTypes.number,
    form: PropTypes.object.isRequired,
    data: PropTypes.object,
    index: PropTypes.number,
    onAdd: PropTypes.func,
    onDelete: PropTypes.func,
    config: PropTypes.array,
    children: PropTypes.node
  };

  static defaultProps = {
    data: {},
    config: []
  };

  state = {
    currentConfig: {}
  };

  componentDidMount() {
    const { data } = this.props;
    const currentConfig = this.handleConfig(data);

    this.setState({
      currentConfig
    });
  }

  componentDidUpdate(prevProps) {
    const { config } = this.props;

    if (!isEqual(prevProps.config, config)) {
      const currentConfig = this.handleConfig();

      // eslint-disable-next-line react/no-did-update-set-state
      this.setState({
        currentConfig
      });
    }
  }

  handleRatioLabel = config => {
    const { length, onAdd, onDelete } = this.props;
    const label = config?.label || '利率';

    return (
      <>
        <Button
          ghost
          type="primary"
          shape="circle"
          icon="plus"
          size="small"
          onClick={() => {
            onAdd();
          }}
        />
        {length > 1 && (
          <Button
            ghost
            type="primary"
            shape="circle"
            icon="minus"
            size="small"
            onClick={() => {
              onDelete();
            }}
            style={{ marginLeft: 10 }}
          />
        )}
        <span style={{ paddingLeft: 10 }}>{label}</span>
      </>
    );
  };

  handleConfig = data => {
    const { config } = this.props;
    let resultObject;

    if (data) {
      resultObject = config.find(item => result(data, item.ratio) != null);
    }

    return resultObject ?? config[0];
  };

  render() {
    const {
      data,
      index,
      form,
      config,
      children,
      onAdd,
      onDelete,
      ...rest
    } = this.props;
    const { currentConfig } = this.state;
    const { getFieldDecorator } = form;
    const current = `skuConfigVos[${index}]`;

    return (
      <Item
        {...rest}
        style={{ marginBottom: 0 }}
        label={this.handleRatioLabel(currentConfig)}
      >
        <ItemContent>
          {config.length > 1 && (
            <Item>
              {getFieldDecorator(`${current}.type`, {
                initialValue: currentConfig.ratio,
                rules: [
                  {
                    message: '请选择类型',
                    required: true
                  }
                ]
              })(
                <Select
                  style={{ width: 100, marginRight: 10 }}
                  onChange={value => {
                    setTimeout(() => {
                      this.setState({
                        currentConfig:
                          config.find(item => isEqual(value, item.ratio)) ?? {}
                      });
                    }, 10);
                  }}
                >
                  {config.map(item => (
                    <Select.Option
                      value={item.ratio}
                      key={`typeOptions-${+index}`}
                    >
                      {item.label}
                    </Select.Option>
                  ))}
                </Select>
              )}
            </Item>
          )}
          {React.Children.map(children, child => {
            if (React.isValidElement(child)) {
              return React.cloneElement(child, {
                ...rest,
                ...currentConfig,
                prefix: current,
                form,
                data
              });
            }

            return child;
          })}
        </ItemContent>
      </Item>
    );
  }
}
