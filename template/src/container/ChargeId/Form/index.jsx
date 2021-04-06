import React, { useMemo, useCallback, useState } from 'react';
import PropTypes from 'prop-types';
import { Form as AntForm, Modal, Input, Select, message } from 'antd';
import { options } from 'utils/utils';
import { useStore } from '@/store';
import chargeService from 'service/chargeId';

const { Item } = AntForm;

const formItemLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 14 }
};

const Form = props => {
  const { form, status, onCancel, refresh, visible, data } = props;

  const { global } = useStore();

  const [loading, setLoading] = useState(false);

  const prefix = useMemo(() => {
    switch (status) {
      case 'ADD': {
        return '新增';
      }
      case 'EDIT': {
        return '编辑';
      }
      default: {
        break;
      }
    }
  }, [status]);

  const onSubmit = useCallback(() => {
    form.validateFields(async (error, value) => {
      if (error) {
        return;
      }

      let { setCharge } = chargeService;

      if (data?.id) {
        setCharge = chargeService.updateCharge;
      }

      setLoading(true);

      const result = await setCharge({
        ...value,
        id: data?.id
      });

      setLoading(false);

      if (result == null) {
        return;
      }

      message.success(`${prefix}费用项成功`);
      onCancel?.();
      refresh?.();
    });
  }, [data, prefix]);

  return (
    <Modal
      visible={visible}
      title={`${prefix}费用项`}
      destroyOnClose
      onCancel={onCancel}
      okButtonProps={{ loading }}
      onOk={onSubmit}
    >
      <AntForm>
        <Item label="费用项名称" {...formItemLayout}>
          {form.getFieldDecorator('chargeName', {
            initialValue: data?.chargeName,
            rules: [
              {
                required: true,
                message: '请输入费用项名称'
              },
              {
                pattern: /^[^\s]+$/,
                message: '不能输入空格'
              }
            ]
          })(<Input disabled={status === 'EDIT'} maxLength={20} />)}
        </Item>
        <Item label="费用项KEY" {...formItemLayout}>
          {form.getFieldDecorator('chargeKey', {
            initialValue: data?.chargeKey,
            rules: [
              {
                required: true,
                message: '请输入费用项KEY'
              },
              {
                pattern: /^\w+$/i,
                message: '请输入正确的费用项KEY'
              }
            ]
          })(<Input disabled={status === 'EDIT'} maxLength={100} />)}
        </Item>
        <Item label="费用项类型" {...formItemLayout}>
          {form.getFieldDecorator('chargeType', {
            initialValue: data?.chargeType,
            rules: [
              {
                required: true,
                message: '请选择费用项类型'
              }
            ]
          })(
            <Select disabled={status === 'EDIT'}>
              {options(global.chargetypeenum, 'codeCn', 'codeEn').map(item => (
                <Select.Option
                  value={item.value}
                  key={`chargeType-${item.value}`}
                >
                  {item.text}
                </Select.Option>
              ))}
            </Select>
          )}
        </Item>
        <Item label="触发类型" {...formItemLayout}>
          {form.getFieldDecorator('triggerType', {
            initialValue: data?.triggerType,
            rules: [
              {
                required: true,
                message: '请选择触发类型'
              }
            ]
          })(
            <Select disabled={status === 'EDIT'}>
              {options(global.triggertypeenum, 'codeCn', 'codeEn').map(item => (
                <Select.Option
                  value={item.value}
                  key={`triggerType-${item.value}`}
                >
                  {item.text}
                </Select.Option>
              ))}
            </Select>
          )}
        </Item>
        <Item label="描述" {...formItemLayout}>
          {form.getFieldDecorator('remark', {
            initialValue: data?.remark
          })(<Input.TextArea maxLength={50} rows={3} />)}
        </Item>
      </AntForm>
    </Modal>
  );
};

Form.propTypes = {
  form: PropTypes.any,
  status: PropTypes.oneOf(['ADD', 'EDIT']),
  onCancel: PropTypes.func,
  refresh: PropTypes.func,
  data: PropTypes.object,
  visible: PropTypes.bool
};

export default AntForm.create()(Form);
