import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Form, Input, Button } from 'antd';
import styled from 'styled-components';
import { ArraytoObject } from 'utils/utils';
import Modal from './modal';

const WrappedFragment = styled.div`
  .phecda-custom-item {
    button {
      margin-left: 15px;
    }
  }
`;

const { Item } = Form;

export default class CustomConfig extends PureComponent {
  static propTypes = {
    form: PropTypes.object.isRequired,
    store: PropTypes.object.isRequired,
    data: PropTypes.object
  };

  constructor(props) {
    super(props);

    let data = props.data ? Object.keys(props.data) : [];

    data = data.map(key => ({
      key,
      name: ArraytoObject(props.store.global.extendkey, 'value', 'codeCn')[key]
    }));

    this.state = {
      addList: data,
      visible: false
    };
  }

  onSubmit = addList => {
    this.setState({
      addList
    });
  };

  onCancel = () => {
    this.setState({
      visible: false
    });
  };

  onDelete = index => {
    this.setState(({ addList: prevAddList }) => {
      const nextAddList = [...prevAddList];

      nextAddList.splice(index, 1);

      return {
        addList: nextAddList
      };
    });
  };

  render() {
    const {
      form: { getFieldDecorator },
      data,
      ...rest
    } = this.props;
    const { addList, visible } = this.state;

    return (
      <WrappedFragment>
        <Item label="自定义信息" {...rest}>
          <a onClick={() => this.setState({ visible: true })}>增加字段信息</a>
        </Item>
        {addList.map((item, index) => (
          <div key={`CustomConfig-$${item.name}`}>
            <Item
              label={`${item.name}`}
              className="phecda-custom-item"
              {...rest}
            >
              {getFieldDecorator(`extend.${item.key}`, {
                initialValue: data?.[item.key] || ''
              })(<Input style={{ width: '200px' }} />)}
              <Button
                ghost
                type="primary"
                shape="circle"
                icon="minus"
                size="small"
                onClick={() => this.onDelete(index)}
              />
            </Item>
          </div>
        ))}
        <Modal
          list={addList}
          visible={visible}
          onCancel={this.onCancel}
          onSubmit={this.onSubmit}
        />
      </WrappedFragment>
    );
  }
}
