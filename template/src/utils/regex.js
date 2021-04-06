// 电话 固话+手机
const phone = {
  pattern: /^(?:(\+86)?1[3-9]\d{9}|0\d{2,3}-?\d{7,8}(-?\d{1,5})?)$/,
  message: '请输入正确的电话格式'
};
// 手机号
const cellPhone = {
  pattern: /^(\+86)?1[3-9]\d{9}$/,
  message: '请输入正确的手机号'
};
// 固话
const fixedPhone = {
  pattern: /^0\d{2,3}-?\d{7,8}(-?\d{1,5})?$/,
  message: '请输入正确的固话格式'
};
// 金额
const amount = {
  pattern: /^\d{1,13}(\.\d{1,2})?$/,
  message: '最多13位，允许两位小数'
};
// 面积
const area = {
  pattern: /^\d{1,6}(\.\d{1,2})?$/,
  message: '最多6位，允许两位小数'
};
// 单号
const orderNo = {
  pattern: /^[\dA-Z]{1,50}$/,
  message: '支持数字、大写字母，最多50位'
};
// 中文
// eslint-disable-next-line camelcase
const zh_ch = {
  pattern: /\p{Unified_Ideograph}+/u,
  message: '请输入中文'
};
// 案号
const caseNo = {
  pattern: /^[\da-z]{1,20}$/i,
  message: '支持数字、大小写字母，最多20位'
};
// 两位正整数
const positiveInteger2d = {
  pattern: /^(?!0)\d{1,2}$/,
  message: '请输入0-99的正整数'
};

// 身份证
const ssn = {
  pattern: /(^[1-9]\d{5}(18|19|([23]\d))\d{2}((0[1-9])|(10|11|12))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$)|(^[1-9]\d{5}\d{2}((0[1-9])|(10|11|12))(([0-2][1-9])|10|20|30|31)\d{3}$)/,
  message: '身份证格式错误'
};
// 不允许空格
const noSpace = {
  pattern: /^[^ ]+$/,
  message: '不允许输入空格'
};
export default {
  phone,
  cellPhone,
  fixedPhone,
  amount,
  area,
  orderNo,
  zh_ch,
  caseNo,
  positiveInteger2d,
  ssn,
  noSpace
};
