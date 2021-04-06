import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { result } from 'lodash';
import InputNumber from 'component/InputNumber';
import { Form, Select, Button } from 'antd';
import { ArraytoObject } from 'utils/utils';
import Modal from './modal';

let index = 0;
const DimensionGroup = styled.div`
  margin: 0 10px;

  &:last-of-type {
    margin-right: 0;
  }

  .dimensions {
    display: flex;
  }
`;

const { Item } = Form;

export default class Ratio extends PureComponent {
  static propTypes = {
    store: PropTypes.object.isRequired,
    form: PropTypes.object,
    data: PropTypes.object,
    model: PropTypes.string,
    prefix: PropTypes.string,
    index: PropTypes.number,
    rateMode: PropTypes.string,
    rateModeText: PropTypes.string,
    rateUnit: PropTypes.string,
    mode: PropTypes.string,
    dimension: PropTypes.bool,
    label: PropTypes.string,
    unit: PropTypes.string,
    ratio: PropTypes.string,
    ratioProps: PropTypes.object,
    rate: PropTypes.string
  };

  static defaultProps = {
    data: {},
    ratioProps: {
      max: 100,
      formatter: value => `${value}%`,
      parser: value => value.replace('%', '')
    },
    mode: 'interval',
    dimension: true,
    label: '利率',
    unit: '',
    ratio: '',
    rateMode: 'single',
    rateModeText: '',
    rateUnit: '',
    rate: ''
  };

  constructor(props) {
    super(props);

    this.state = {
      visible: false,
      dimensionalitiesList: this.handleDimensionalitiesList()
    };
  }

  // 增加维度
  onSubmit = dimensionalitiesList => {
    this.setState({
      dimensionalitiesList
    });
  };

  onCancel = () => {
    this.setState({
      visible: false
    });
  };

  onDelete = index => {
    this.setState(({ dimensionalitiesList: prevDimensionalitiesList }) => {
      const nextDimensionalitiesList = [...prevDimensionalitiesList];

      nextDimensionalitiesList.splice(index, 1);

      return {
        dimensionalitiesList: nextDimensionalitiesList
      };
    });
  };

  onChangeIndex = () => {
    return index++;
  };

  handleDimensionalitiesList = () => {
    const {
      data,
      store: { global }
    } = this.props;
    return (
      data.dimensions?.map(item => {
        item = {
          ...item,
          dimensionValue: item.dimensionValue,
          key: item.dimensionName,
          index: this.onChangeIndex(),
          name: ArraytoObject(global.dimensionnameenum, 'codeEn', 'codeCn')[
            item.dimensionName
          ]
        };

        return item;
      }) || []
    );
  };

  handleAddDimensionality = () => {
    this.setState({
      visible: true
    });
  };

  handleInputNumberRule = (message, rule, value, callback) => {
    if (!value) {
      return callback(message.empty);
    }

    const { min, max } = value;

    if (min == null || max == null) {
      return callback(message.empty);
    }
    if (min > max) {
      return callback(message.min);
    }
    if (max < min) {
      return callback(message.max);
    }
    callback();
  };

  handleLabel = (name, index) => {
    return (
      <>
        <Button
          ghost
          type="primary"
          shape="circle"
          icon="minus"
          size="small"
          onClick={() => this.onDelete(index)}
        />
        <span style={{ paddingLeft: 10 }}>{name}</span>
      </>
    );
  };

  render() {
    const { visible, dimensionalitiesList } = this.state;
    const {
      data,
      store: { global },
      form: { getFieldDecorator },
      label,
      model,
      dimension,
      mode,
      rate,
      rateMode,
      rateModeText,
      rateUnit,
      prefix,
      ratio,
      ratioProps,
      unit
    } = this.props;
    const modelText = ArraytoObject(global.ratiomodal, 'codeEn', 'codeCn')[
      model
    ];
    let ratioInitValue;
    const resultValue = result(data, ratio);

    if (rateMode === 'single') {
      ratioInitValue =
        resultValue != null && !Number.isNaN(+resultValue)
          ? (+resultValue).toFixed(2)
          : null;
    } else {
      ratioInitValue = resultValue;
    }

    return (
      <>
        {rateMode === 'single' && (
          <Item>
            {getFieldDecorator(`${prefix}.${ratio}`, {
              initialValue: ratioInitValue,
              rules: [
                {
                  validator: (rule, value, callback) => {
                    if (value == null) {
                      callback(`请输入${label}`);
                      return;
                    }
                    if (!/^\d+(\.\d{1,2})?$/.test(value)) {
                      callback(`请输入正确的${label}`);
                      return;
                    }

                    callback();
                  },

                  type: 'number'
                }
              ]
            })(<InputNumber {...ratioProps} style={{ width: '100%' }} />)}
            {rateUnit}
          </Item>
        )}
        {rateMode === 'range' && (
          <Item>
            {getFieldDecorator(`${prefix}.${ratio}`, {
              initialValue: {
                min: ratioInitValue?.min,
                max: ratioInitValue?.max
              },
              rules: [
                {
                  validator: (...rest) => {
                    const message = {
                      empty: `请输入${rateModeText}`,
                      min: `最小${rateModeText}不能大于最大${rateModeText}`,
                      max: `最大${rateModeText}不能小于最小${rateModeText}`
                    };

                    this.handleInputNumberRule(message, ...rest);
                  }
                }
              ]
            })(
              <InputNumber.RangInputNumber
                {...ratioProps}
                style={{ width: '45%' }}
              />
            )}
            {rateUnit}
          </Item>
        )}
        {dimension && (
          <a onClick={this.handleAddDimensionality} className="spaced">
            {`增加${label}维度`}
          </a>
        )}
        {mode === 'single' && (
          <Item>
            {getFieldDecorator(`${prefix}.${rate}.max`, {
              initialValue: result(data, rate)?.max,
              rules: [
                {
                  validator: (rule, value, callback) => {
                    if (!value) {
                      callback(`请输入${modelText}`);
                      return;
                    }

                    callback();
                  },

                  type: 'number'
                }
              ]
            })(<InputNumber />)}
            {unit}
          </Item>
        )}
        {mode === 'interval' && (
          <Item>
            {getFieldDecorator(`${prefix}.${rate}`, {
              initialValue: {
                min: result(data, rate)?.min,
                max: result(data, rate)?.max
              },
              rules: [
                {
                  validator: (...rest) => {
                    const message = {
                      empty: `请输入${modelText}`,
                      min: `最小${modelText}不能大于最大${modelText}`,
                      max: `最大${modelText}不能小于最小${modelText}`
                    };

                    this.handleInputNumberRule(message, ...rest);
                  }
                }
              ]
            })(<InputNumber.RangInputNumber style={{ width: '45%' }} />)}
            {unit}
          </Item>
        )}
        {dimensionalitiesList.map((dimensionality, index) => {
          return (
            <DimensionGroup key={`dimensionality-${dimensionality.key}`}>
              <Item
                label={this.handleLabel(dimensionality.name, index)}
                className="dimensions"
              >
                {getFieldDecorator(
                  `${prefix}.dimensions[${dimensionality.index}].dimensionValue`,
                  {
                    initialValue: dimensionality.dimensionValue,
                    rules: [
                      {
                        message: `请选择${dimensionality.name}`
                      }
                    ]
                  }
                )(
                  <Select style={{ width: 120 }}>
                    {global.dimensionnameenum
                      .find(item => item.codeEn === dimensionality.key)
                      .values.map(item => (
                        <Select.Option vlaue={item.codeEn} key={item.codeEn}>
                          {item.codeCn}
                        </Select.Option>
                      ))}
                  </Select>
                )}
              </Item>
              {getFieldDecorator(
                `${prefix}.dimensions[${dimensionality.index}].dimensionName`,
                {
                  initialValue: dimensionality.key
                }
              )(<span style={{ display: 'none' }} />)}
            </DimensionGroup>
          );
        })}
        <Modal
          onChangeIndex={this.onChangeIndex}
          list={dimensionalitiesList}
          visible={visible}
          label={label}
          onCancel={this.onCancel}
          onSubmit={this.onSubmit}
        />
      </>
    );
  }
}
