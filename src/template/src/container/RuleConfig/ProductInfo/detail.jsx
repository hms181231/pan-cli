import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { List, Card } from 'antd';
import ruleConfigService from 'service/ruleConfig';
import { storeConsumer } from '@/store';
import { ArraytoObject, whetherenum } from 'utils/utils';
import { defaultText, allInclusive } from 'constant/enums';

export default
@storeConsumer()
class ProductInfoDetail extends PureComponent {
  static propTypes = {
    store: PropTypes.object.isRequired,
    productRuleId: PropTypes.string.isRequired
  };

  constructor(props) {
    super(props);

    const {
      store: { global }
    } = props;

    this.state = {
      data: {},
      list: [
        {
          name: '产品线',
          content: item =>
            this.handleData(
              global.productline,
              item.bizLineCode,
              'codeEn',
              'codeCn'
            )
        },
        {
          name: '产品类型',
          content: item => {
            return this.handleData(
              global.producttypeenum,
              item.spuType,
              'codeEn',
              'codeCn'
            );
          }
        },

        {
          name: '是否包干类',
          content: item =>
            this.handleData(
              whetherenum(
                global.whetherenum,
                allInclusive.YES,
                allInclusive.NO
              ),
              item.allInclusive,
              'value',
              'text'
            )
        }
      ],
      loading: false
    };
  }

  async componentDidMount() {
    this.setState({
      loading: true
    });

    const { productRuleId } = this.props;

    const result = await ruleConfigService.getSPU({ spu: productRuleId });

    if (!result) {
      return;
    }

    this.setState({
      data: result,
      loading: false
    });
  }

  handleData = (data, current, key, value) => {
    return ArraytoObject(data, key, value)[current] || defaultText;
  };

  render() {
    const { data, loading, list } = this.state;

    return (
      <Card loading={loading}>
        <List
          itemLayout="vertical"
          split={false}
          dataSource={list}
          renderItem={item => (
            <List.Item>
              {item.name}: {item.content(data)}
            </List.Item>
          )}
        />
      </Card>
    );
  }
}
