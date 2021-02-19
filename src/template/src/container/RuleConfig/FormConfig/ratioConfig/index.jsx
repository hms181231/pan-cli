import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Form, Select } from 'antd';
import { storeConsumer } from '@/store';
import { options } from 'utils/utils';
import uuid from 'utils/uuid';
import { handleRatioConfig } from '../handleData/utils';
import Ratio from './ratio';
import RatioType from './ratioType';

let ratioIndex = 0;
const { Item } = Form;

export default
@storeConsumer()
class RatioConfig extends PureComponent {
  static propTypes = {
    form: PropTypes.object.isRequired,
    store: PropTypes.object.isRequired,
    data: PropTypes.object
  };

  static defaultProps = {
    data: {}
  };

  constructor(props) {
    super(props);

    this.state = {
      ratioList: []
    };
  }

  componentDidMount() {
    const { data } = this.props;

    this.setState(() => {
      let num = data?.skuConfigVos?.length || 1;

      return {
        ratioList: this.handleRatioList(
          num,
          [...(data?.skuConfigVos || [])],
          data?.skuConfigVos?.length
        )
      };
    });
  }

  onAdd = () => {
    this.setState(({ ratioList: prevRatioList }) => {
      return {
        ratioList: this.handleRatioList(1, [...prevRatioList])
      };
    });
  };

  onDelete = index => {
    this.setState(({ ratioList: prevRatioList }) => {
      const nextRatioList = [...prevRatioList];

      nextRatioList.splice(index, 1);

      return {
        ratioList: nextRatioList
      };
    });
  };

  handleRatioList = (num, list, isedit) => {
    list = list.map(item => {
      if (!item.uuid) {
        return {
          ...item,
          uuid: uuid(),
          ratioIndex: ratioIndex++
        };
      }
      return item;
    });

    if (!isedit) {
      do {
        list = [
          ...list,
          {
            uuid: uuid(),
            ratioIndex: ratioIndex++
          }
        ];
        num--;
      } while (num);
    }

    return list;
  };

  render() {
    const { form, data, store, ...rest } = this.props;
    const { global } = store;
    const { ratioList } = this.state;
    const { getFieldDecorator, getFieldValue } = form;
    const ratioModelOptions = options(global.ratiomodal, 'codeCn', 'codeEn');
    const model = getFieldValue('ratioModel');
    const config = handleRatioConfig(model) || [];

    return (
      <>
        <Item {...rest} label="利率模式">
          {getFieldDecorator('ratioModel', {
            initialValue: data.ratioModel,
            rules: [
              {
                required: true,
                message: '请选择利率模式'
              }
            ]
          })(
            <Select style={{ width: 200 }}>
              {ratioModelOptions.map(item => (
                <Select.Option key={item.value} value={item.value}>
                  {item.text}
                </Select.Option>
              ))}
            </Select>
          )}
        </Item>
        {model !== 'WHITE_BAR_RATIO' &&
          ratioList.map((item, index, array) => {
            return (
              <RatioType
                key={`ratioList${item.uuid}`}
                {...rest}
                config={config}
                length={array.length}
                form={form}
                index={item.ratioIndex}
                data={item}
                onAdd={this.onAdd}
                onDelete={() => this.onDelete(index)}
              >
                <Ratio store={store} model={model} />
              </RatioType>
            );
          })}
      </>
    );
  }
}
