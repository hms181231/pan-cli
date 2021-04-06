import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { Row, Col, Modal } from 'antd';
import Copy from '@/component/Copy';
import { defaultText } from 'constant/enums';
import { statusColor } from 'utils/utils';

const Detail = props => {
  const { data, visible, onCancel } = props;

  const configs = useMemo(() => {
    const handleStatusColor = statusColor({
      failure: ['STOP'],
      succeed: ['USING']
    });

    const className = handleStatusColor(data.status);

    return [
      {
        label: '费用项',
        type: 'text',
        value: data.chargeName ?? defaultText
      },
      {
        label: '启用状态',
        type: 'text',
        value: (
          <span className={className}>{data.statusName ?? defaultText}</span>
        )
      },
      {
        label: '创建时间',
        type: 'text',
        value: data.createTime ?? defaultText
      },
      {
        label: '创建人',
        type: 'text',
        value: data.createBy ?? defaultText
      },
      {
        label: '费用项KEY',
        type: 'component',
        span: 24,
        value: (
          <>
            {data.chargeKey != null ? (
              <Copy text={data.chargeKey} />
            ) : (
              defaultText
            )}
          </>
        )
      },
      {
        label: '触发类型',
        type: 'text',
        span: 24,
        value: data.triggerTypeName ?? defaultText
      },
      {
        label: '描述',
        type: 'text',
        value: data.remark ?? defaultText
      }
    ];
  }, [
    data.chargeKey,
    data.chargeName,
    data.createBy,
    data.createTime,
    data.remark,
    data.status,
    data.statusName,
    data.triggerTypeName
  ]);

  return (
    <Modal
      width={640}
      visible={visible}
      onCancel={onCancel}
      title={`详情-${data?.chargeId}`}
      cancelText="关闭"
      okButtonProps={{ style: { display: 'none' } }}
    >
      <Row>
        {configs.map((item, index) => (
          <Col
            key={`Detail-${+index}`}
            span={item.span ?? 12}
            style={{ marginBottom: 20, display: 'flex' }}
          >
            <label style={{ paddingRight: 5 }}>{item.label}:</label>
            <span style={{ wordBreak: 'break-all', flex: 1 }}>
              {item.value}
            </span>
          </Col>
        ))}
      </Row>
    </Modal>
  );
};

Detail.propTypes = {
  data: PropTypes.object,
  onCancel: PropTypes.func,
  visible: PropTypes.bool
};

export default Detail;
