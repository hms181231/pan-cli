import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Steps, Button, Card, Affix, Input, message } from 'antd';
import styled from 'styled-components';
import GoBack from 'component/GoBack';
import regex from 'utils/regex';
import { external } from 'constant/enums';
import ProductInfo from './ProductInfo';
import ProductInfoDetail from './ProductInfo/detail';
import FormConfig from './FormConfig';
import FormConfigDetail from './FormConfig/detail';

const { Step } = Steps;
const detailList = [ProductInfoDetail, FormConfigDetail];

const WrappedCard = styled(Card)`
  .steps-content {
    > .ant-card {
      border: 0;
    }
  }

  .ant-steps {
    background: #fff;
    padding-top: 20px;
  }

  .ant-affix {
    .ant-steps {
      padding: 20px 0;
      border-bottom: 1px dashed #d9d9d9;
    }
  }

  .steps-action {
    position: fixed;
    top: 368px;
    right: 58px;
    width: 60px;

    button {
      text-align: center;
      height: 58px;
      width: 58px;
      border-radius: 8px;
      padding: 0;
      margin-bottom: 8px;
    }
  }

  .productIdHint {
    color: red;
  }
`;

export default class RuleConfig extends PureComponent {
  static propTypes = {
    match: PropTypes.object.isRequired,
    history: PropTypes.object.isRequired,
    location: PropTypes.object.isRequired
  };

  steps = [
    {
      title: '产品信息',
      content: (ref, rest) => <ProductInfo ref={ref} {...rest} />
    },
    {
      title: '规则配置',
      content: (ref, rest) => <FormConfig ref={ref} {...rest} />
    }
  ];

  constructor(props) {
    super(props);

    this.form = React.createRef();

    const { title, productRuleId, status } = this.onInit();

    this.state = {
      current: 0,
      title,
      status,
      productRuleId,
      productIdHint: '',
      spuType: ''
    };
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (snapshot) {
      this.handleState(snapshot);
    }
  }

  getSnapshotBeforeUpdate(prevProps) {
    const {
      location: { key }
    } = this.props;
    const {
      location: { key: prevKey }
    } = prevProps;

    if (!Object.is(key, prevKey)) {
      return this.onInit();
    }

    return null;
  }

  onInit = () => {
    let {
      match: {
        params: { status, productRuleId }
      }
    } = this.props;

    let title = '财务规则';

    if (status === 'edit') {
      title = `编辑${title}`;
    } else if (status === 'add') {
      title = `新建${title}`;
    } else if (status === 'detail') {
      title = `查看${title}`;

      detailList.forEach((Component, index) => {
        this.steps[index].content = () => (
          <Component productRuleId={productRuleId} />
        );
      });
    }

    return {
      title,
      productRuleId,
      status
    };
  };

  onSubmit = async () => {
    const { status, productIdHint } = this.state;

    if (productIdHint) {
      return;
    }

    if (status !== 'detail') {
      const data = await this.form.onSubmit();

      if (data) {
        this.setState({
          productIdHint: ''
        });

        this.next();
      }
      return;
    }

    this.next();
  };

  getRef = ref => {
    this.form = ref;
  };

  setSpuType = spuType => {
    this.setState({ spuType });
  };

  next = () => {
    const { current, status } = this.state;
    const {
      history,
      match: {
        params: { isExternal }
      }
    } = this.props;

    // 到最后一页了 返回列表
    if (current === this.steps.length - 1) {
      if (status !== 'detail') {
        message.success('计费配置完成');
      }

      if ([external].includes(isExternal)) {
        // iframe 通信
        window.parent.postMessage('SUBMIT_FINANCE_SUCCESS', '*');
        return;
      }

      history.push({
        pathname: '/rulelist'
      });
      return;
    }

    this.setState(({ current: prevCurrent }) => ({
      current: ++prevCurrent
    }));
  };

  prev = () => {
    this.setState(({ current: prevCurrent }) => ({
      current: --prevCurrent
    }));
  };

  handleExtra = () => {
    return <GoBack />;
  };

  handleGoBack = () => {
    const { history } = this.props;

    history.goBack();
  };

  handleProductRuleId = () => {
    const {
      match: {
        params: { productRuleId }
      }
    } = this.props;

    const {
      status,
      productRuleId: productId,
      current,
      productIdHint
    } = this.state;

    if (status !== 'add') {
      return `产品规则ID:${productRuleId}`;
    }

    if (!current) {
      return (
        <>
          产品规则ID:
          <Input
            value={productId}
            onChange={this.handleChangeProductRuleId}
            maxLength={40}
            style={{ width: '200px' }}
          />
          <span className="productIdHint">{productIdHint}</span>
        </>
      );
    }

    return `产品规则ID:${productId}`;
  };

  handleChangeProductRuleId = e => {
    const { value: productRuleId } = e.target;
    let productIdHint = '';

    if (regex.zh_ch.pattern.test(productRuleId)) {
      productIdHint = '不能输入中文';
    }

    this.setState(() => ({
      productRuleId,
      productIdHint
    }));
  };

  handleState = data => {
    this.setState(data);
  };

  render() {
    const { current, title, status, productRuleId, spuType } = this.state;
    const {
      history,
      match: {
        params: { isExternal }
      }
    } = this.props;

    return (
      <WrappedCard
        title={title}
        extra={this.handleExtra()}
        className="ruleConfig"
      >
        {this.handleProductRuleId()}
        <Affix offsetTop={0}>
          <Steps current={current}>
            {this.steps.map(item => (
              <Step key={item.title} title={item.title} />
            ))}
          </Steps>
        </Affix>
        <section className="steps-content">
          {this.steps[current].content(this.getRef, {
            status,
            productRuleId,
            isExternal,
            history,
            spuType,
            setSpuType: this.setSpuType
          })}
        </section>
        <footer className="steps-action">
          {isExternal !== external && current === 0 && (
            <Button onClick={this.handleGoBack}>取消</Button>
          )}
          {current < this.steps.length - 1 && (
            <Button type="primary" onClick={this.onSubmit}>
              下一步
            </Button>
          )}
          {current > 0 && <Button onClick={() => this.prev()}>上一步</Button>}
          {current === this.steps.length - 1 && (
            <Button type="primary" onClick={this.onSubmit}>
              完成
            </Button>
          )}
        </footer>
      </WrappedCard>
    );
  }
}
