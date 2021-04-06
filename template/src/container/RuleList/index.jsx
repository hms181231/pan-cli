import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { Divider, Button, Popconfirm, message } from 'antd';
import { OceanSearchTable } from '@ocean/page';
import { defaultText } from 'constant/enums';
import { options, ArraytoObject } from 'utils/utils';
import moment from 'moment';
import ListService from 'service/ruleList';
import { storeConsumer } from '@/store';

export default
@storeConsumer()
class RuleList extends PureComponent {
  static propTypes = {
    store: PropTypes.object.isRequired,
    history: PropTypes.object.isRequired
  };

  ruleList = React.createRef();

  constructor(props) {
    super(props);

    const {
      store: { global = {} }
    } = props;

    this.statusMap = ArraytoObject(global.presencestatus, 'codeEn', 'codeCn');
    this.spuTypeMap = ArraytoObject(global.producttypeenum, 'codeEn', 'codeCn');

    this.state = {
      searchConfig: {
        configs: [
          {
            text: '产品规则ID',
            type: 'text',
            key: 'spu'
          },
          {
            text: '产品类型',
            type: 'select',
            key: 'spuType',
            initialValue: '__ALL__',
            props: {
              options: options(global.producttypeenum, 'codeCn', 'codeEn')
            }
          },
          {
            text: '状态',
            type: 'select',
            key: 'status',
            initialValue: '__ALL__',
            props: {
              options: options(global.presencestatus, 'codeCn', 'codeEn')
            }
          },
          {
            text: '添加时间',
            type: 'timeRange',
            key: 'time'
          }
        ],
        keepValueAfterSubmit: true,
        horizontal: true,
        submitText: '搜索'
      },
      columns: [
        {
          title: '计费规则ID',
          dataIndex: 'id',
          key: 'id'
        },
        {
          title: '产品规则ID',
          dataIndex: 'spu',
          key: 'spu'
        },
        {
          title: '产品类型',
          dataIndex: 'spuType',
          key: 'spuType',
          render: text => this.spuTypeMap[text] || defaultText
        },
        {
          title: '状态',
          dataIndex: 'status',
          key: 'status',
          render: text => this.statusMap[text] || defaultText,
          width: 90
        },
        {
          title: '添加人',
          dataIndex: 'createBy',
          key: 'createBy',
          width: 90
        },
        {
          title: '添加时间',
          dataIndex: 'createdTime',
          key: 'createdTime'
        },
        {
          title: '操作',
          dataIndex: 'operation',
          key: 'operation',
          width: 220,
          render: (text, record) => {
            const currentStatus = this.handleOppositeStatus(record.status);
            const statusText = this.statusMap[currentStatus];
            const [editPathname, detailPathname] = [
              `/ruleconfig/edit/${record.spu}`,
              `/ruleconfig/detail/${record.spu}`
            ];

            return (
              <>
                {record.status !== 'ONLINE' && (
                  <>
                    <Link
                      to={{
                        pathname: editPathname
                      }}
                    >
                      编辑
                    </Link>
                    <Divider type="vertical" />
                  </>
                )}
                <Popconfirm
                  title={`确定要${statusText}该配置?`}
                  onConfirm={() =>
                    this.confirmStatus(record.spu, currentStatus)
                  }
                >
                  <a>{statusText}</a>
                </Popconfirm>
                <Divider type="vertical" />
                <Link
                  to={{
                    pathname: detailPathname
                  }}
                >
                  查看
                </Link>
                <Divider type="vertical" />
                <Link
                  to={{
                    pathname: `/trial/${record.spu}`,
                    state: {
                      bizLineCode: record.bizLineCode,
                      spuType: record.spuType
                    }
                  }}
                >
                  试算
                </Link>
              </>
            );
          }
        }
      ],
      tableProps: {
        needIndex: false,
        rowKey: 'id'
      }
    };
  }

  searchQueryFormatter = params => {
    if (params.time) {
      const [createdTimeStart, createdTimeEnd] = this.handleFormatTime(
        params.time
      );

      delete params.time;
      return { ...params, createdTimeStart, createdTimeEnd };
    }

    return params;
  };

  searchFunc = async params => {
    const result = await ListService.getList({ ...params });

    return result || [];
  };

  handleFormatTime = time => {
    if (Array.isArray(time) && time.length) {
      const [startTime, endTime] = time;

      return [
        moment(startTime)
          .startOf('date')
          .format('YYYY-MM-DD HH:mm:ss'),
        moment(endTime)
          .endOf('date')
          .format('YYYY-MM-DD HH:mm:ss')
      ];
    }

    return [];
  };

  handleOppositeStatus = currentStatus => {
    switch (currentStatus) {
      case 'ONLINE':
        return 'OFFLINE';
      case 'OFFLINE':
        return 'ONLINE';
      default:
        return currentStatus;
    }
  };

  confirmStatus = async (spu, status) => {
    const result = await ListService.setStatus({ spu, status });

    if (!result) {
      return;
    }

    message.success('更新状态成功');

    this.refresh();
  };

  refresh = () => {
    this.ruleList.current.trigger();
  };

  toolbar = () => {
    const { history } = this.props;

    return (
      <Button
        type="primary"
        onClick={() => {
          history.push({
            pathname: '/ruleconfig/add'
          });
        }}
      >
        新增
      </Button>
    );
  };

  render() {
    const { columns, searchConfig, tableProps } = this.state;

    return (
      <OceanSearchTable
        ref={this.ruleList}
        searchFunc={this.searchFunc}
        searchQueryFormatter={this.searchQueryFormatter}
        searchConfig={searchConfig}
        columnConfig={columns}
        tableProps={tableProps}
        extra={this.toolbar}
        keyMap={{
          pageNum: 'pageNo',
          data: 'records',
          total: 'totalRecords'
        }}
      />
    );
  }
}
