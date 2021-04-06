import React, { useMemo, useRef, useCallback, Fragment, useState } from 'react';
import { OceanSearchTable } from '@ocean/page';
import { Button, Divider, Card, Popconfirm, message } from 'antd';
import { defaultText } from 'constant/enums';
import {
  options,
  handleFormatTime,
  statusColor,
  ArraytoObject
} from 'utils/utils';
import chargeService from 'service/chargeId';
import { useStore } from '@/store';
import Detail from './Detail';
import Form from './Form';

const ChargeIdList = () => {
  const { global } = useStore();

  const handleStatusColor = statusColor({
    failure: ['STOP'],
    succeed: ['USING']
  });

  const tableRef = useRef(null);

  const [visible, setVisible] = useState('');

  const [status, setStatus] = useState('');

  const [dataSource, setDataSource] = useState({});

  const [currentData, setCurrentData] = useState({});

  const handleCurrentItem = useCallback(
    ({ visible = '', data = {}, status = '' }) => {
      setVisible(visible);
      setCurrentData(data);
      setStatus(status);
    },
    []
  );

  const onCancel = useCallback(() => {
    handleCurrentItem({});
  }, [handleCurrentItem]);

  const refresh = useCallback((params, override = false, page) => {
    tableRef.current.trigger(params, override, page);
  }, []);

  const searchConfig = useMemo(
    () => ({
      configs: [
        {
          text: '费用项名称',
          type: 'text',
          key: 'chargeName',
          props: {
            placeholder: '请输入费用项名称'
          }
        },
        {
          text: '费用项类型',
          type: 'select',
          key: 'chargeTypeList',
          initialValue: '__ALL__',
          props: {
            options: options(global.chargetypeenum, 'codeCn', 'codeEn')
          }
        },
        {
          text: '启用状态',
          type: 'select',
          key: 'statusList',
          initialValue: '__ALL__',
          props: {
            options: options(global.chargestatusenum, 'codeCn', 'codeEn')
          }
        },
        {
          text: '创建时间',
          type: 'timeRange',
          key: 'time'
        }
      ],
      keepValueAfterSubmit: true,
      horizontal: true,
      submitText: '搜索',
      cancelText: '清空'
    }),
    [global.chargestatusenum, global.chargetypeenum]
  );

  const handleSwitchStatus = useCallback(status => {
    switch (status) {
      case 'USING': {
        return 'STOP';
      }

      case 'STOP': {
        return 'USING';
      }
      default:
        break;
    }
  }, []);

  const columns = useMemo(
    () => [
      {
        title: 'CHARGEID',
        dataIndex: 'chargeId',
        fixed: 'left',
        width: 100,
        render: (text, record) =>
          text != null ? (
            <a
              onClick={() =>
                handleCurrentItem({ visible: 'Detail', data: record })
              }
            >
              {text}
            </a>
          ) : (
            defaultText
          )
      },
      {
        title: '创建时间',
        dataIndex: 'createTime',
        width: 120,
        render: text => text ?? defaultText
      },
      {
        title: '费用项',
        dataIndex: 'chargeName',
        render: text => text ?? defaultText
      },
      {
        title: '费用项KEY',
        dataIndex: 'chargeKey',
        render: text => text ?? defaultText
      },
      {
        title: '费用项类型',
        dataIndex: 'chargeTypeName',
        render: text => text ?? defaultText
      },
      {
        title: '触发类型',
        dataIndex: 'triggerTypeName',
        render: text => text ?? defaultText
      },
      {
        title: '描述',
        dataIndex: 'remark',
        render: text => text ?? defaultText
      },
      {
        title: '启用状态',
        dataIndex: 'statusName',
        render: (text, record) => {
          const { status } = record;
          const className = handleStatusColor(status);

          return <span className={className}>{text ?? defaultText}</span>;
        }
      },
      {
        title: '操作',
        fixed: 'right',
        width: 120,
        key: 'operation',
        render: (text, record) => {
          const { status } = record;

          const currentStatus = handleSwitchStatus(status);

          const currentStatusName = ArraytoObject(
            global.chargestatusenum,
            'codeEn',
            'codeCn'
          )?.[currentStatus];

          const operationBtn = [
            <Popconfirm
              title={`确定更改状态为${currentStatusName}?`}
              onConfirm={async () => {
                const result = await chargeService.updateCharge({
                  id: record.id,
                  status: currentStatus
                });

                if (result == null) {
                  return;
                }

                message.success(`${currentStatusName}成功`);

                // 如果是列表最后一条数据需要更改page数据
                if (dataSource.records.every(item => item.id === record.id)) {
                  refresh({}, false, {
                    pageNum: dataSource.totalPages - 1
                  });
                  return;
                }
                refresh();
              }}
            >
              <a>{currentStatusName}</a>
            </Popconfirm>
          ];

          if (status === 'STOP') {
            operationBtn.push(
              <a
                onClick={() =>
                  handleCurrentItem({
                    visible: 'Form',
                    data: record,
                    status: 'EDIT'
                  })
                }
              >
                编辑
              </a>
            );
          }

          return (
            <>
              {operationBtn.map((item, index, array) => {
                return (
                  <Fragment key={`operation-${+index}`}>
                    {item}
                    {array.length - 1 !== index && <Divider type="vertical" />}
                  </Fragment>
                );
              })}
            </>
          );
        }
      }
    ],
    [
      dataSource.records,
      dataSource.totalPages,
      global.chargestatusenum,
      handleCurrentItem,
      handleStatusColor,
      handleSwitchStatus,
      refresh
    ]
  );

  const toolbar = useMemo(() => {
    return (
      <Card style={{ marginTop: 20, textAlign: 'right' }}>
        <Button
          type="primary"
          onClick={() => handleCurrentItem({ visible: 'Form', status: 'ADD' })}
        >
          新增
        </Button>
      </Card>
    );
  }, [handleCurrentItem]);

  const searchQueryFormatter = useCallback(params => {
    const [createTimeStart, createTimeEnd] = handleFormatTime(params.time);

    delete params.time;

    return {
      ...params,
      chargeName: params.chargeName?.trim(),
      createTimeStart: createTimeStart ?? params.createTimeStart,
      createTimeEnd: createTimeEnd ?? params.createTimeEnd,
      statusList: params.statusList ? [params.statusList].flat(Infinity) : [],
      chargeTypeList: params.chargeTypeList
        ? [params.chargeTypeList].flat(Infinity)
        : []
    };
  }, []);

  const searchFunc = useCallback(async params => {
    const result = await chargeService.chargeList({ ...params });

    setDataSource(result ?? {});

    return result ?? {};
  }, []);

  return (
    <>
      <OceanSearchTable
        ref={tableRef}
        searchFunc={searchFunc}
        searchQueryFormatter={searchQueryFormatter}
        searchConfig={searchConfig}
        middleLayout={toolbar}
        columnConfig={columns}
        tableProps={{
          needIndex: false,
          rowKey: 'chargeId',
          scroll: { x: 'max-content' }
        }}
        keyMap={{
          pageNum: 'pageNo',
          data: 'records',
          total: 'totalRecords'
        }}
      />
      <Detail
        visible={visible === 'Detail'}
        data={currentData}
        onCancel={onCancel}
      />
      <Form
        visible={visible === 'Form'}
        status={status}
        data={currentData}
        onCancel={onCancel}
        refresh={refresh}
      />
    </>
  );
};

export default ChargeIdList;
