import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { OceanSearchTable } from '@ocean/page';
import moment from 'moment';
import flowServer from 'service/flow';
import { storeConsumer } from '@/store';

export default
@storeConsumer()
class Flow extends PureComponent {
  static propTypes = {
    store: PropTypes.object.isRequired
  };

  flowList = React.createRef();

  constructor(props) {
    super(props);

    const {
      store: { global = {} }
    } = props;
    global.dict = global.dict || {};

    this.state = {
      searchConfig: {
        configs: [
          {
            text: '金融单',
            type: 'text',
            key: 'businessId'
          },
          {
            text: '城市',
            type: 'select',
            key: 'cityCode',
            initialValue: '__ALL__',
            props: {
              showSearch: true,
              filterOption: (input, option) =>
                option.props.children
                  .toLowerCase()
                  .indexOf(input.toLowerCase()) >= 0,
              options: global.cmsCity.map(city => {
                return { value: city.code, text: city.name };
              })
            }
          },
          {
            text: '产品ID',
            type: 'text',
            key: 'productId'
          },
          {
            text: '产品名称',
            type: 'text',
            key: 'productName'
          },
          {
            text: '创建时间',
            type: 'timeRange',
            key: 'date',
            initialValue: [moment(new Date()), moment(new Date())]
          },
          {
            text: '产品大类',
            type: 'select',
            key: 'productCategoryList',
            props: {
              mode: 'multiple',
              noAllOption: true,
              options: Object.keys(global.dict.ProductCategoryEnum || {}).map(
                key => {
                  return {
                    value: key,
                    text: global.dict.ProductCategoryEnum[key]
                  };
                }
              )
            }
          },
          {
            text: '生命周期节点',
            type: 'select',
            key: 'lifeCycles',
            props: {
              mode: 'multiple',
              noAllOption: true,
              options: Object.keys(global.dict.LoanLifeCycleEnum || {}).map(
                key => {
                  return {
                    value: key,
                    text: global.dict.LoanLifeCycleEnum[key]
                  };
                }
              )
            }
          }
        ],
        keepValueAfterSubmit: true,
        horizontal: true,
        submitText: '搜索'
      },
      columns: [
        {
          title: '创建时间',
          dataIndex: 'createTime',
          key: 'createTime'
        },
        {
          title: '城市',
          dataIndex: 'cityName',
          key: 'cityName'
        },
        {
          title: '产品ID',
          dataIndex: 'productId',
          key: 'productId'
        },
        {
          title: '产品名称',
          dataIndex: 'productName',
          key: 'productName'
        },
        {
          title: '产品大类',
          dataIndex: 'productCategoryName',
          key: 'productCategoryName'
        },
        {
          title: '节点',
          dataIndex: 'lifeCycleName',
          key: 'lifeCycleName'
        },
        {
          title: '单号数量',
          dataIndex: 'quantity',
          key: 'quantity'
        }
      ],
      tableProps: {
        needIndex: false,
        rowKey: 'id'
      }
    };
  }

  searchQueryFormatter = params => {
    if (params.date) {
      const [createTimeStart, createTimeEnd] = this.handleFormatTime(
        params.date
      );
      delete params.date;
      return { ...params, createTimeStart, createTimeEnd };
    }

    return params;
  };

  searchFunc = async params => {
    const result = await flowServer.getList({ ...params });
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

  refresh = () => {
    this.flowList.current.trigger();
  };

  render() {
    const { columns, searchConfig, tableProps } = this.state;

    return (
      <OceanSearchTable
        ref={this.flowList}
        searchFunc={this.searchFunc}
        searchQueryFormatter={this.searchQueryFormatter}
        searchConfig={searchConfig}
        columnConfig={columns}
        tableProps={tableProps}
        extra={this.toolbar}
        keyMap={{
          data: 'records',
          total: 'totalRecords'
        }}
      />
    );
  }
}
