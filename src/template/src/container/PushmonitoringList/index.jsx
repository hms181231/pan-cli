import React, { PureComponent, Fragment } from 'react';
import PropTypes from 'prop-types';
import { Divider, Icon, message, Badge, Tooltip } from 'antd';
import queryString from 'query-string';
import { OceanTabSearchTable } from '@ocean/page';
import axios from '@ocean/fetch';
import { optionArray, handleFormatTime } from 'utils/utils';
import moment from 'moment';
import { list, estateList } from 'service/exceptionList';
import {
  exceptionCateMap,
  exceptionStatusMap,
  retryStatusMap,
  defaultText
} from 'constant/enums';
import ExceptionDetail from './exception';
import EditJson from './EditJson';
import HandleException from '../ExceptionList/handle';

import { storeConsumer } from '@/store';

const disableMsg = '未知数据来源，不能执行操作';
@storeConsumer()
class PushmonitoringList extends PureComponent {
  searchTable = React.createRef();

  static propTypes = {
    location: PropTypes.object.isRequired,
    store: PropTypes.object
  };

  constructor(props) {
    super(props);

    const {
      startCreateTime,
      endCreateTime,
      content,
      businessId,
      processingStatus,
      system
    } = queryString.parse(props.location.search);

    this.state = {
      activeKey: system || 'old',
      visible: false,
      activeRecord: {},
      searchConfig: {
        configs: [
          {
            text: '入参关键词',
            key: 'content',
            type: 'text',
            props: {
              mountValue: content
            }
          },
          {
            text: '金融单号',
            key: 'businessId',
            type: 'text',
            props: {
              mountValue: businessId
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
              ].filter(time => time)
            }
          },
          {
            text: '状态',
            key: 'processingStatus',
            type: 'select',
            initialValue: '__ALL__',
            props: {
              mountValue: processingStatus,
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
        title: '还款流水号',
        dataIndex: 'businessKeyValue'
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
        dataIndex: 'remark',
        render: text => {
          return text ? (
            <Tooltip title={text}>
              <div className="loand-text-ellipsis" style={{ width: 200 }}>
                <span className="loand-text-ellipsis-content">{text}</span>
              </div>
            </Tooltip>
          ) : (
            defaultText
          );
        }
      },
      {
        title: '操作',
        key: 'operation',
        fixed: 'right',
        width: 120,
        render: (_, record) => {
          const { processingStatus } = record;
          const operationList = [];
          if (
            activeKey === 'old'
              ? +processingStatus !== 2
              : [3, 5, 11].includes(+processingStatus)
          ) {
            operationList.push(
              <a
                onClick={() =>
                  this.handleEdit({ ...record, activeKey }, activeKey === 'old')
                }
              >
                处理
              </a>
            );
          }
          operationList.push(
            <a onClick={() => this.handleTag({ ...record, activeKey })}>标记</a>
          );

          return (
            <>
              {operationList.reduce((prev, next, index, array) => {
                next = (
                  <Fragment key={`operation-${+index}`}>
                    {next}
                    {index !== array.length - 1 && <Divider type="vertical" />}
                  </Fragment>
                );

                prev = [...prev, next];

                return prev;
              }, [])}
            </>
          );
        }
      }
    ];
  };

  handleEdit = (record, isSource) => {
    if (isSource && !record.dataSource) {
      message.error(disableMsg);
      return;
    }

    this.visibleChange('EditJson', record);
  };

  handleTag = record => {
    if (!record.dataSource) {
      message.error(disableMsg);
      return;
    }
    this.visibleChange('Tag', record);
  };

  visibleChange = (visible, record = {}) => {
    this.setState({
      visible,
      activeRecord: record
    });
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
    axios.cancelRequestsInProcess();
    const { activeKey } = this.state;
    let fetch = estateList;

    if (activeKey === 'old') {
      fetch = list;
    }

    const res = await fetch(params);
    if (!res) {
      return;
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
    const { searchConfig, visible, activeRecord, activeKey } = this.state;
    const columns = this.getColumns();

    return (
      <>
        <OceanTabSearchTable
          activeKey={activeKey}
          onChange={activeKey => this.setState({ activeKey })}
          ref={this.searchTable}
          searchFunc={this.searchFunc}
          extra={this.renderTableTool}
          staticCondition={{ exceptionType: 32, system: activeKey }}
          searchQueryFormatter={this.searchQueryFormatter}
          searchConfig={searchConfig}
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

        <ExceptionDetail
          record={activeRecord}
          visible={visible === 'ExceptionDetail'}
          visibleChange={this.visibleChange}
        />

        <HandleException
          record={activeRecord}
          visible={visible === 'Tag'}
          type={activeKey}
          refresh={this.refreshList}
          prefix="标记"
          visibleChange={this.visibleChange}
        />

        <EditJson
          visible={visible === 'EditJson'}
          record={activeRecord}
          refresh={this.refreshList}
          onCancel={this.visibleChange}
        />
      </>
    );
  }
}

export default PushmonitoringList;
