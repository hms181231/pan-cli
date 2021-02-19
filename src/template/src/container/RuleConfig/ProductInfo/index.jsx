import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Form, Card, Spin, Select, message } from 'antd';
import { storeConsumer } from '@/store';
import { external } from 'constant/enums';
import { whetherenum } from 'utils/utils';
import ruleConfigService from 'service/ruleConfig';

const { Item } = Form;
const { Option } = Select;

const formItemLayout = {
  labelCol: {
    xs: { span: 24 },
    sm: { span: 4 }
  },
  wrapperCol: {
    xs: { span: 24 },
    sm: { span: 20 }
  }
};

@storeConsumer()
@Form.create()
class ProductInfo extends PureComponent {
  static propTypes = {
    form: PropTypes.object.isRequired,
    store: PropTypes.object.isRequired,
    status: PropTypes.string.isRequired,
    history: PropTypes.object.isRequired,
    productRuleId: PropTypes.string,
    isExternal: PropTypes.oneOf([external]),
    dispatch: PropTypes.func.isRequired,
    setSpuType: PropTypes.func.isRequired
  };

  constructor(props) {
    super(props);

    this.state = {
      loading: false,
      filter: [],
      data: {}
    };
  }

  // 编辑&点击上一步返回产品配置回显数据
  async componentDidMount() {
    const { productRuleId, isExternal, history } = this.props;

    if (productRuleId) {
      this.setState({
        loading: true
      });
      const result = await ruleConfigService.getSPU({ spu: productRuleId });

      if (!result) {
        return;
      }

      if (!result.id && isExternal === external) {
        message.warn('没有该财务规则, 请先配置财务规则');
        // 用于外部系统接入
        history.replace(
          `/ruleconfig/add/${productRuleId}/YES?layoutStyle=none`
        );
      }

      this.setState(() => ({
        data: result,
        filter: this.handleConfigFilter({ spuType: result.spuType }),
        loading: false
      }));
    }
  }

  config = ({ data = {}, filter = [] }) => {
    const {
      status,
      isExternal,
      store: { global }
    } = this.props;
    const disabled = status === 'edit';
    const allInclusive =
      data.allInclusive || (isExternal === external ? 'NO' : null);
    const config = [
      {
        label: '产品线',
        name: 'bizLineCode',
        component: () => {
          return (
            <Select style={{ width: '200px' }} disabled={disabled}>
              {global.productline.map(item => (
                <Option value={item.codeEn} key={`bizLineCode-${item.codeEn}`}>
                  {item.codeCn}
                </Option>
              ))}
            </Select>
          );
        },
        options: {
          initialValue: data.bizLineCode,
          rules: [
            {
              required: true,
              message: '请选择产品线'
            }
          ]
        }
      },
      {
        label: '产品类型',
        name: 'spuType',
        component: () => {
          return (
            <Select
              style={{ width: '200px' }}
              disabled={disabled}
              onChange={this.handleSpuType}
            >
              {global.producttypeenum.map(item => (
                <Option value={item.codeEn} key={`spuType-${item.codeEn}`}>
                  {item.codeCn}
                </Option>
              ))}
            </Select>
          );
        },
        options: {
          initialValue: data.spuType,
          rules: [
            {
              required: true,
              message: '请选择产品类型'
            }
          ]
        }
      },
      {
        label: '是否包干类',
        name: 'allInclusive',
        component: () => {
          return (
            <Select style={{ width: '200px' }}>
              {whetherenum(global.whetherenum, '包干类', '普通类').map(item => (
                <Select.Option
                  value={item.value}
                  key={`allInclusive-${item.value}`}
                >
                  {item.text}
                </Select.Option>
              ))}
            </Select>
          );
        },
        options: {
          initialValue: allInclusive,
          rules: [
            {
              required: true,
              message: '请选择是否包干类'
            }
          ]
        }
      }
    ];

    return config.filter(item => !filter.includes(item.name));
  };

  onSubmit = async () => {
    const { form, productRuleId, setSpuType } = this.props;
    const {
      data: { id }
    } = this.state;
    let data = null;

    if (!productRuleId) {
      message.warn('请输入产品规则ID');
      return;
    }

    form.validateFields((error, values) => {
      if (error) {
        return;
      }

      data = {
        ...values,
        id,
        spu: productRuleId
      };

      setSpuType(values.spuType);
    });

    if (!data) {
      return;
    }

    this.setState({
      loading: true
    });

    data = await ruleConfigService.SPU(data);

    this.setState({
      loading: false
    });

    return data;
  };

  handleFormItem = () => {
    const {
      form: { getFieldDecorator }
    } = this.props;
    const { data, filter } = this.state;

    return this.config({ data, filter }).map((item, index) => {
      return (
        <Item
          {...formItemLayout}
          label={item.label}
          key={`${item.label}-${item.name}-${+index}`}
        >
          {getFieldDecorator(item.name, item.options)(item.component())}
          {item.suffix}
        </Item>
      );
    });
  };

  // 处理过滤Item
  handleConfigFilter = ({ spuType }) => {
    let filter = [];

    // 产品类型 不是资金类
    if (spuType !== 'CAPITAL') {
      filter = [...filter, 'allInclusive'];
    }

    return filter;
  };

  handleSpuType = value => {
    this.setState({
      filter: this.handleConfigFilter({ spuType: value })
    });
  };

  render() {
    const { loading } = this.state;

    return (
      <Card>
        <Spin spinning={loading}>
          <Form>{this.handleFormItem()}</Form>
        </Spin>
      </Card>
    );
  }
}

export default React.forwardRef((props, ref) => {
  return <ProductInfo {...props} wrappedComponentRef={ref} />;
});
