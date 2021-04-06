import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Divider, Icon, Spin, message, Badge } from 'antd';
import queryString from 'query-string';
import { OceanTabSearchTable } from '@ocean/page';
import { optionArray, handleFormatTime } from 'utils/utils';
import moment from 'moment';
import { list, retry, estateRetry, streamList } from 'service/exceptionList';
import {
  exceptionCateMap,
  exceptionStatusMap,
  retryStatusMap,
  defaultText
} from 'constant/enums';
import HandleException from './handle';
import ExceptionDetail from './exception';
import { storeConsumer } from '@/store';

const disableMsg = '未知数据来源，不能执行操作';
export default
@storeConsumer()
class TransactionException extends PureComponent {
  static propTypes = {
    store: PropTypes.object
  };

  searchTable = React.createRef();

  constructor(props) {
    super(props);

    this.query = queryString.parse(window.location.search);

    const { startCreateTime, endCreateTime, system } = this.query;

    this.state = {
      loading: false,
      activeKey: system || 'old',
      handleModalVisible: false,
      activeRecord: {},
      searchConfig: {
        configs: [
          {
            text: '入参关键词',
            key: 'content',
            type: 'text',
            props: {
              mountValue: this.query.content
            }
          },
          {
            text: '金融单号',
            key: 'businessId',
            type: 'text',
            props: {
              mountValue: this.query.businessId
            }
          },
          {
            text: '时间',
            key: 'createDate',
            type: 'timeRange',
            props: {
              mountValue: [
                startCreateTime && moment(startCreateTime),
                endCreateTime && moment(endCreateTime)
              ].filter(item => item)
            }
          },
          {
            text: '异常类型',
            key: 'exceptionType',
            type: 'select',
            initialValue: '__ALL__',
            props: {
              mountValue: this.query.exceptionType,
              options: optionArray(exceptionCateMap)
            }
          },
          {
            text: '状态',
            key: 'processingStatus',
            type: 'select',
            initialValue: '__ALL__',
            props: {
              mountValue: this.query.processingStatus,
              options: optionArray(exceptionStatusMap)
            }
          }
        ],
        keepValueAfterSubmit: true,
        horizontal: true,
        submitText: '搜索',
        cancelText: '清空'
      }
    };
  }

  getColumns = () => {
    const { store } = this.props;
    const ProcessingStatusEnum = store.global?.dict?.ProcessingStatusEnum || {};
    const MonitorTypeEnum = store.global?.dict?.MonitorTypeEnum || {};

    const { activeKey } = this.state;

    return [
      {
        title: '金融单号',
        dataIndex: 'businessId'
      },
      {
        title: '异常时间',
        dataIndex: 'exceptionTime'
      },
      {
        title: '异常类型',
        dataIndex: 'exceptionType',
        render: (text, record) => {
          return (
            <>
              {activeKey === 'old'
                ? exceptionCateMap[text]
                : MonitorTypeEnum[text]}
              <a
                onClick={() => this.visibleChange('ExceptionDetail', record)}
                style={{ marginLeft: 16, float: 'right' }}
              >
                <Icon
                  style={{ fontSize: 20, display: 'block' }}
                  type="exclamation-circle"
                />
              </a>
            </>
          );
        }
      },
      {
        title: '重试状态',
        dataIndex: 'retryStatus',
        render: (_, record) => {
          /**
           * 显示逻辑
           * 1.'重试成功'显示绿色
           * 2.'重试中'的数据,当自动重试次数小于3次时,显示蓝色,已重试过三次且未成功,显示红色
           */
          const { retryCount = 1, retryStatus } = record;
          const content = retryStatusMap[retryStatus];
          let color = '';
          let type = '';
          if (retryStatus === 2) {
            color = '#52c41a';
            type = 'success';
          } else if (retryStatus === 1) {
            if (retryCount < 3) {
              color = '#1890ff';
              type = 'processing';
            } else {
              color = '#f5222d';
              type = 'error';
            }
          }

          return (
            <Badge
              status={type}
              text={<span style={{ color }}>{content}</span>}
            />
          );
        }
      },
      {
        title: '处理状态',
        dataIndex: 'processingStatus',
        render: text => {
          let style = {};

          if ([3, 11].includes(+text)) {
            style = { color: '#f5222d' };
          }
          return (
            <span style={style}>
              {(activeKey === 'old'
                ? exceptionStatusMap[text]
                : ProcessingStatusEnum[text]) || defaultText}
            </span>
          );
        }
      },
      {
        title: '最后处理人',
        dataIndex: 'operator'
      },
      {
        title: '最后处理时间',
        dataIndex: 'biTimestamp'
      },
      {
        title: '备注',
        dataIndex: 'remark'
      },
      {
        title: '操作',
        dataIndex: 'operation',
        fixed: 'right',
        width: 120,
        render: (_, record) => {
          return (
            <>
              {record.retryStatus !== 2 && (
                <>
                  <a onClick={() => this.handleRetry(record)}>重试</a>
                  <Divider type="vertical" />
                </>
              )}

              <a onClick={() => this.handleEdit(record)}>处理</a>
            </>
          );
        }
      }
    ];
  };

  handleEdit = record => {
    if (!record.dataSource) {
      message.error(disableMsg);
      return;
    }
    this.visibleChange(true, record);
  };

  searchQueryFormatter = values => {
    const { createDate, startCreateTime, endCreateTime, ...params } = values;
    const [startCreateTimeFmt, endCreateTimeFmt] = handleFormatTime(createDate);
    return {
      ...params,
      startCreateTime: startCreateTime || startCreateTimeFmt,
      endCreateTime: endCreateTime || endCreateTimeFmt
    };
  };

  searchFunc = async params => {
    const { activeKey } = this.state;

    let fetch = streamList;

    if (activeKey === 'old') {
      fetch = list;
    }

    const res = await fetch(params);

    if (!res) {
      return false;
    }
    const data = {
      ...res,
      pageSize: 10
    };
    return data;
  };

  refreshList = () => {
    this.searchTable.current.trigger();
  };

  handleRetry = async ({ id, dataSource }) => {
    const { activeKey } = this.state;

    if (!dataSource) {
      message.error(disableMsg);
      return;
    }

    let fetch = estateRetry;

    if (activeKey === 'old') {
      fetch = retry;
    }

    this.setState({
      loading: true
    });
    const result = await fetch({
      id,
      dataSource,
      user: window.INIT_DATA.USER_INFO.name
    });

    this.setState({
      loading: false
    });

    if (result == null) {
      return;
    }

    message.success('重试成功');
    this.refreshList();
  };

  visibleChange = (visible, record) => {
    this.setState({
      handleModalVisible: visible,
      activeRecord: visible ? record : {}
    });
  };

  handleDetail = (visible, record) => {
    this.setState({
      detailVisible: visible,
      activeRecord: visible ? record : {}
    });
  };

  renderTableTool = () => {
    return (
      <div>
        <Badge status="success" text="重试成功" />
        <Divider type="vertical" />
        <Badge status="processing" text="正在重试中" />
        <Divider type="vertical" />
        <Badge status="error" text="已重试3次" />
      </div>
    );
  };

  render() {
    const {
      searchConfig,
      loading,
      activeRecord,
      handleModalVisible,
      detailVisible,
      activeKey
    } = this.state;
    const columns = this.getColumns();

    return (
      <Spin spinning={loading}>
        <OceanTabSearchTable
          activeKey={activeKey}
          onChange={activeKey => this.setState({ activeKey })}
          ref={this.searchTable}
          searchFunc={this.searchFunc}
          extra={this.renderTableTool}
          searchQueryFormatter={this.searchQueryFormatter}
          searchConfig={searchConfig}
          staticCondition={{ system: activeKey }}
          keyMap={{
            data: 'records',
            total: 'totalRecords',
            pageNum: 'pageNo'
          }}
          tabsConfigs={[
            {
              tab: '老系统',
              key: 'old',
              table: {
                columnConfig: columns,
                needIndex: false,
                rowKey: 'id',
                scroll: { x: 'max-content' }
              }
            },
            {
              tab: '新系统',
              key: 'new',
              table: {
                columnConfig: columns,
                needIndex: false,
                rowKey: 'id',
                scroll: { x: 'max-content' }
              }
            }
          ]}
        />

        <HandleException
          record={activeRecord}
          visible={handleModalVisible}
          refresh={this.refreshList}
          visibleChange={this.visibleChange}
        />

        <ExceptionDetail
          record={activeRecord}
          visible={detailVisible}
          visibleChange={this.handleDetail}
        />
      </Spin>
    );
  }
}
