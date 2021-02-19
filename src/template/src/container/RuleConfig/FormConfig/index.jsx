import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import {
  Icon,
  Collapse,
  Card,
  Spin,
  Tooltip,
  message,
  Popconfirm,
  Button
} from 'antd';
import styled from 'styled-components';
import { storeConsumer } from '@/store';
import ruleConfigService from 'service/ruleConfig';
import uuid from 'utils/uuid';
import { ArraytoObject } from 'utils/utils';
import { formatFormConfig, formatReverseFormConfig } from './handleData';
import guaranteeConfig from './handleData/guarantee';
import capitalConfig from './handleData/capital';
import Config from './config';
import { RatioUnit } from './handleData/utils';

const WrappedCard = styled(Card)`
  .ant-collapse
    > .ant-collapse-item
    > .ant-collapse-header
    .ant-collapse-extra {
    margin-right: 25px;
  }

  .anticon-plus-circle {
    font-size: 38px;
    color: #418cfe;
    cursor: pointer;
    position: fixed;
    top: 295px;
    right: 70px;

    &:hover {
      color: #66a6ff;
    }
  }
`;

export default
@storeConsumer()
class FormConfig extends PureComponent {
  static propTypes = {
    status: PropTypes.string,
    store: PropTypes.object.isRequired,
    productRuleId: PropTypes.string,
    spuType: PropTypes.string
  };

  configMap = [];

  constructor(props) {
    super(props);

    this.state = {
      loading: null,
      renderConfig: [],
      isEdit: props.status === 'edit'
    };
  }

  async componentDidMount() {
    const { productRuleId } = this.props;
    const { isEdit } = this.state;
    let data = [];

    this.setState({
      loading: 'init'
    });

    // 编辑获取回显数据
    if (isEdit) {
      data = await ruleConfigService.getRuleConfig({ spu: productRuleId });

      if (data) {
        data = formatReverseFormConfig(data).map(item => ({
          ...item,
          isEdit
        }));
      }
    }

    if (!data?.length) {
      data = this.handleSpuType(isEdit);
    }

    this.setState(({ renderConfig }) => {
      const num = data.length || 1;
      renderConfig = this.handleConfig(num, data, [...renderConfig]);

      return {
        data,
        renderConfig,
        loading: null
      };
    });
  }

  componentWillUnmount() {
    this.configMap.length = 0;
  }

  onDelete = index => {
    this.setState(({ renderConfig: prevRenderConfig }) => {
      const nextRenderConfig = [...prevRenderConfig];
      nextRenderConfig.splice(index, 1);
      this.configMap.splice(index, 1);

      return {
        renderConfig: nextRenderConfig
      };
    });
  };

  onSubmit = async () => {
    let ruleConfigs = [];
    const {
      productRuleId: spu,
      store: { global },
      spuType
    } = this.props;

    for (const configRef of this.configMap.filter(item => item)) {
      const currentIndex = this.configMap.findIndex(item =>
        Object.is(item, configRef)
      );

      // eslint-disable-next-line no-loop-func
      configRef.props.form.validateFieldsAndScroll((error, fieldsValue) => {
        if (error) {
          message.warn(`第${currentIndex + 1}条费用配置有信息为空, 请输入信息`);
          ruleConfigs.push(false);
          return;
        }

        ruleConfigs.push({
          ...fieldsValue,
          receiverName: ArraytoObject(global.funder, 'code', 'name')[
            fieldsValue.receiverCode
          ],
          payerName: ArraytoObject(global.funder, 'code', 'name')[
            fieldsValue.payerCode
          ],
          receiverAgentName: fieldsValue.receiverAgentCode
            ? ArraytoObject(global.funder, 'code', 'name')[
                fieldsValue.receiverAgentCode
              ]
            : null
        });
      });
    }

    // 没有验证通过
    if (!ruleConfigs.every(item => item)) {
      return;
    }

    const currentCapitalMainChargeId = ruleConfigs.filter(item =>
      [1000, 1023, 1006].includes(+item.chargeId)
    );

    // 暂定只有资金类判断 本金、利息、宽限期逾期罚息 收款主体需要保持一致
    if (
      spuType === 'CAPITAL' &&
      currentCapitalMainChargeId.reduce((prev, next) => {
        prev.add(next.receiverCode);

        return prev;
      }, new Set()).size > 1
    ) {
      message.warn(
        `${currentCapitalMainChargeId
          .map(
            item =>
              ArraytoObject(global.allChargeId, 'code', 'codeCn')[item.chargeId]
          )
          .join('、')}收款主体需要保持一致`
      );

      return;
    }

    // 格式化ruleConfigs 后端接受格式
    ruleConfigs = ruleConfigs.map(ruleConfig => {
      const { skuConfigVos = [] } = ruleConfig;

      ruleConfig.repayDayRule = JSON.stringify(ruleConfig.repayDayRule);

      ruleConfig.skuConfigVos = formatFormConfig(skuConfigVos);

      return ruleConfig;
    });

    // 固定模式在相同维度下必须是相同的数据
    const currentSameFixedItem = ruleConfigs.find(item =>
      item.skuConfigVos.some(item => item.isFixed)
    );

    // 固定金额、固定利率
    if (
      currentSameFixedItem &&
      ['FIXED_RATIO', 'FIXED_AMOUNT'].includes(currentSameFixedItem.ratioModel)
    ) {
      const ratioModel = ArraytoObject(global.ratiomodal, 'codeEn', 'codeCn')[
        currentSameFixedItem.ratioModel
      ];

      message.warn(`${ratioModel}相同维度, 利率模式只能输入相同的信息`);
      return;
    }

    const currentSameRatioItem = ruleConfigs.find(item =>
      item.skuConfigVos.some(item => item.sameRatio)
    );

    if (currentSameRatioItem) {
      let { ratioModel } = currentSameRatioItem;
      let unit = RatioUnit(ratioModel);
      ratioModel = ArraytoObject(global.ratiomodal, 'codeEn', 'codeCn')[
        ratioModel
      ];

      switch (unit) {
        case '天':
          unit = '天数';
          break;
        case '元':
          unit = '金额';
          break;
        default:
          break;
      }

      message.warn(`${ratioModel}的${unit}不能输入相同的`);
      return;
    }

    // 不能添加相同费用项
    const isRepeatChargeId = ruleConfigs.some(
      (item, index, array) =>
        array.findIndex(child => Object.is(item.chargeId, child.chargeId)) !==
        index
    );

    if (isRepeatChargeId) {
      message.warn('不能添加相同费用项');
      return;
    }

    this.setState({
      loading: 'submit'
    });

    ruleConfigs = await ruleConfigService.setRuleConfig({
      ruleConfigs,
      spu
    });

    this.setState({
      loading: null
    });

    return ruleConfigs;
  };

  handleAdd = () => {
    this.setState(({ renderConfig }) => {
      renderConfig = this.handleConfig(1, [], [...renderConfig]);

      return {
        renderConfig
      };
    });
  };

  handleConfig = (num, data, render = []) => {
    let dataIndex = 0;

    do {
      render.push({
        data: data[dataIndex++] || {},
        uuid: `Config-${uuid()}`
      });

      num--;
    } while (num);

    return render;
  };

  handleSpuType = isEdit => {
    const { spuType } = this.props;

    switch (spuType) {
      // 资金类
      case 'CAPITAL': {
        const ruleConfigs = capitalConfig();

        return formatReverseFormConfig(ruleConfigs).map(item => ({
          ...item,
          isEdit
        }));
      }
      // 担保类
      case 'GUARANTEE': {
        const ruleConfigs = guaranteeConfig();

        return formatReverseFormConfig(ruleConfigs).map(item => ({
          ...item,
          isEdit
        }));
      }
      default:
        return [];
    }
  };

  handleExtra = index => {
    return (
      <Popconfirm
        title="是否确认删除该费用配置?"
        onConfirm={e => {
          e.preventDefault();

          this.onDelete(index);
        }}
        onCancel={e => {
          e.preventDefault();
          e.stopPropagation();
        }}
      >
        <Button
          type="link"
          onClick={e => {
            e.preventDefault();
            e.stopPropagation();
          }}
        >
          <Icon type="delete" />
          删除
        </Button>
      </Popconfirm>
    );
  };

  handlePanelHeaderContent = (chargeId, index) => {
    this.setState(({ renderConfig: prevRenderConfig }) => {
      const nextRenderConfig = [...prevRenderConfig];

      nextRenderConfig[index].currentChargeId = chargeId;

      return {
        renderConfig: nextRenderConfig
      };
    });
  };

  render() {
    const { loading, renderConfig } = this.state;
    const {
      spuType,
      store: { global }
    } = this.props;

    return (
      <WrappedCard>
        <Spin spinning={loading === 'submit'}>
          <Collapse>
            {renderConfig.map((item, index) => {
              return (
                <Collapse.Panel
                  forceRender
                  key={item.uuid}
                  header={`${index + 1}. ${ArraytoObject(
                    global.allChargeId,
                    'code',
                    'codeCn'
                  )[item.data?.chargeId ?? item.currentChargeId] ??
                    '新费用'}配置`}
                  extra={renderConfig.length > 1 && this.handleExtra(index)}
                >
                  <Config
                    data={item.data}
                    changeChargeId={chargeId =>
                      this.handlePanelHeaderContent(chargeId, index)
                    }
                    spuType={spuType}
                    ref={ref => {
                      this.configMap[index] = ref;
                    }}
                  />
                </Collapse.Panel>
              );
            })}
          </Collapse>
          <Tooltip title="添加费用项">
            <Icon type="plus-circle" onClick={this.handleAdd} />
          </Tooltip>
        </Spin>
      </WrappedCard>
    );
  }
}
