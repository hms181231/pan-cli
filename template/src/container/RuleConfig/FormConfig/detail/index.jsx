import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import ruleConfigService from 'service/ruleConfig';
import { Collapse, Card } from 'antd';
import { storeConsumer } from '@/store';
import { ArraytoObject } from 'utils/utils';
import ConfigDetail from './configDetail';
import { formatReverseFormConfig } from '../handleData';

const { Panel } = Collapse;

export default
@storeConsumer()
class FormConfigDetail extends PureComponent {
  static propTypes = {
    store: PropTypes.object.isRequired,
    productRuleId: PropTypes.string.isRequired
  };

  constructor(props) {
    super(props);

    this.state = {
      loading: false,
      data: []
    };
  }

  async componentDidMount() {
    this.setState({
      loading: true
    });

    const { productRuleId } = this.props;

    const result = await ruleConfigService.getRuleConfig({
      spu: productRuleId
    });

    if (!result) {
      return;
    }

    this.setState({
      data: formatReverseFormConfig(result),
      loading: false
    });
  }

  render() {
    const {
      store: { global }
    } = this.props;
    const { data, loading } = this.state;

    return (
      <Card loading={loading}>
        <Collapse>
          {data.map((item, index) => (
            <Panel
              key={`ConfigDetail-${+index}`}
              header={`${index + 1}. ${
                ArraytoObject(global.allChargeId, 'code', 'codeCn')[
                  item.chargeId
                ]
              }配置`}
            >
              <ConfigDetail data={item} />
            </Panel>
          ))}
        </Collapse>
      </Card>
    );
  }
}
