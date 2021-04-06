import React, { PureComponent, Fragment } from 'react';
import PropTypes from 'prop-types';
import {
  Form,
  Button,
  Input,
  DatePicker,
  Select,
  Card,
  Row,
  Col,
  Table
} from 'antd';
import InputNumber from 'component/InputNumber';
import GoBack from 'component/GoBack';
import { storeConsumer } from '@/store';
import { ArraytoObject, options } from 'utils/utils';
import { defaultText, unearned } from 'constant/enums';
import styled from 'styled-components';
import moment from 'moment';
import TrialService from 'service/trial';
import Ratio from './ratio';
import RepaymentLists from './repaymentLists';

const CardWarpped = styled(Card)`
  form {
    overflow: hidden;
  }

  header {
    display: flex;
    justify-content: space-between;
    margin-bottom: 10px;
  }

  footer {
    float: right;
    button {
      margin-right: 5px;
    }
  }

  .table {
    margin-top: 20px;

    > span {
      padding-right: 10px;
    }

    table {
      margin-top: 20px;
    }
  }
`;

const { Item } = Form;

const formItemLayout = {
  labelCol: {
    xs: { span: 24 },
    sm: { span: 8 }
  },
  wrapperCol: {
    xs: { span: 24 },
    sm: { span: 16 }
  }
};

export default
@storeConsumer()
@Form.create()
class Trial extends PureComponent {
  static propTypes = {
    location: PropTypes.object.isRequired,
    match: PropTypes.object.isRequired,
    store: PropTypes.object.isRequired,
    form: PropTypes.object.isRequired
  };

  columns = [
    {
      title: '费用项',
      dataIndex: 'chargeId',
      key: 'chargeId',
      render: text => {
        const {
          store: { global }
        } = this.props;
        return ArraytoObject(global.allChargeId, 'code', 'codeCn')[text];
      }
    },
    {
      title: '是否预收',
      dataIndex: 'unearned',
      key: 'unearned',
      render: text => {
        return unearned[text];
      }
    }
  ];

  constructor(props) {
    super(props);

    const {
      location,
      match: {
        params: { productRuleId: spu }
      },
      store: { global },
      form
    } = props;

    const { state = {} } = location;
    const { bizLineCode, spuType } = state;
    const span = 10;

    this.state = {
      loading: false,
      dataSource: {},
      spu,
      span,
      bizLineCode,
      spuType,
      configs: [
        {
          text: '金融单号',
          key: 'finOrderNo',
          component: () => <Input style={{ width: '200px' }} />
        },
        {
          text: '还款方式',
          key: 'repayMethod',
          component: () => (
            <Select style={{ width: '200px' }}>
              {options(global.repaymethod, 'codeCn', 'codeEn').map(item => (
                <Select.Option
                  value={item.value}
                  key={`repayMethod-${item.value}`}
                >
                  {item.text}
                </Select.Option>
              ))}
            </Select>
          )
        },
        {
          text: '放款时间',
          key: 'loanDate',
          component: () => <DatePicker />,
          options: {
            rules: [
              {
                required: true,
                message: '请选择放款时间'
              }
            ]
          }
        },
        {
          text: '利率',
          key: 'realRatio',
          component: () => (
            <InputNumber
              max={100}
              formatter={value => `${value}%`}
              parser={value => value.replace('%', '')}
            />
          )
        },
        {
          text: '借款金额',
          key: 'loanAmount',
          component: () => (
            <InputNumber
              formatter={value => `${value}元`}
              parser={value => value.replace('元', '')}
            />
          ),
          options: {
            rules: [
              {
                required: true,
                validator: (rule, value, callback) => {
                  if (!value) {
                    callback('请输入借款金额');
                    return;
                  }

                  callback();
                },

                type: 'number'
              }
            ]
          }
        },
        {
          text: '借款期限',
          key: 'loanTerm',
          component: () => (
            <InputNumber
              formatter={value => `${value}期`}
              parser={value => value.replace('期', '')}
            />
          )
        },
        {
          text: '借款天数',
          key: 'loanDay',
          component: () => (
            <InputNumber
              formatter={value => `${value}天`}
              parser={value => value.replace('天', '')}
            />
          )
        },
        {
          custom: true,
          key: 'ratio',
          component: () => (
            <Ratio
              form={form}
              global={global}
              span={span}
              formItemLayout={formItemLayout}
            />
          )
        }
      ]
    };
  }

  onSubmit = event => {
    event.preventDefault();
    const { form } = this.props;
    const { spu, bizLineCode, spuType } = this.state;

    form.validateFields(async (error, values) => {
      if (error) {
        return;
      }

      let repaymentLists = values?.repaymentLists || [];

      repaymentLists = repaymentLists
        .filter(item => item)
        .map(item => {
          item = {
            ...item,
            terms: item.terms?.split(',') || []
          };

          return item;
        });

      values = {
        ...values,
        realRatio: values.realRatio / 100,
        loanDate: values.loanDate
          ? moment(values.loanDate).format('YYYY-MM-DD HH:mm:ss')
          : null,
        spu,
        productLine: bizLineCode,
        productType: spuType,
        dimensions: values.dimensions.filter(item => item.dimensionValue),
        trial: 'YES',
        repaymentLists
      };

      this.setState({
        loading: true
      });

      const dataSource = await TrialService.calcRepayPlan(values);

      this.setState({
        loading: false,
        dataSource: dataSource || {}
      });
    });
  };

  handleConfigItem = () => {
    const { configs, span } = this.state;
    const {
      form: { getFieldDecorator }
    } = this.props;

    return configs.map((item, index) => {
      if (item.custom) {
        return (
          <Fragment key={`${item.key}-${+index}`}>{item.component()}</Fragment>
        );
      }
      return (
        <Col span={span} key={`${item.key}-${+index}`}>
          <Item {...formItemLayout} label={item.text}>
            {getFieldDecorator(item.key, item.options)(item.component())}
          </Item>
        </Col>
      );
    });
  };

  handleExtra = () => {
    return <GoBack />;
  };

  expandedRowRender = record => {
    const { repayPlanDetails = [] } = record;
    const columns = [
      {
        title: '资方账单ID',
        dataIndex: 'fundAccountId',
        key: 'fundAccountId'
      },
      {
        title: '期数',
        dataIndex: 'period',
        key: 'period'
      },
      {
        title: '实际利率',
        dataIndex: 'realRatio',
        key: 'realRatio',
        render: text =>
          text ? `${Number(text * 100).toFixed(2)}%` : defaultText
      },
      {
        title: '收款方名称',
        dataIndex: 'receiverName',
        key: 'receiverName'
      },
      {
        title: '实际应收金额',
        dataIndex: 'repayAmount',
        key: 'repayAmount'
      },
      {
        title: '应收时间',
        dataIndex: 'repayTime',
        key: 'repayTime'
      }
    ];

    return (
      <Table
        dataSource={repayPlanDetails}
        columns={columns}
        pagination={false}
      />
    );
  };

  render() {
    const { spu, spuType, bizLineCode, span, loading, dataSource } = this.state;
    const {
      store: { global },
      form
    } = this.props;

    const repayPlans = dataSource?.repayPlans || [];

    return (
      <CardWarpped title="试算" extra={this.handleExtra()}>
        <Form onSubmit={this.onSubmit}>
          <header>
            <span>
              产品线:
              {
                ArraytoObject(global.productline, 'codeEn', 'codeCn')[
                  bizLineCode
                ]
              }
            </span>
            <span>
              产品类型:
              {
                ArraytoObject(global.producttypeenum, 'codeEn', 'codeCn')[
                  spuType
                ]
              }
            </span>
            <span>产品规则ID:{spu}</span>
          </header>
          <Row>{this.handleConfigItem()}</Row>
          <RepaymentLists
            form={form}
            global={global}
            formItemLayout={formItemLayout}
            span={span}
          />
          <footer>
            <Button htmlType="submit" type="primary">
              计算
            </Button>
            <Button
              htmlType="reset"
              onClick={() => {
                form.resetFields();
                this.setState({
                  dataSource: {}
                });
              }}
            >
              重置
            </Button>
          </footer>
        </Form>
        <div className="table">
          <span>金融单号: {dataSource.finOrderNo || defaultText}</span>
          <span>开始日: {dataSource.startTime || defaultText}</span>
          <span>到期日: {dataSource.endTime || defaultText}</span>
          <span>借款金额: {dataSource.loanAmount || defaultText}</span>

          <Table
            dataSource={repayPlans}
            expandedRowRender={this.expandedRowRender}
            columns={this.columns}
            loading={loading}
            pagination={false}
          />
        </div>
      </CardWarpped>
    );
  }
}
