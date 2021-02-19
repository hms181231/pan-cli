const prefix = path => `web/${path}`;
const apiPrefix = (url, prefix = '/api/ledger/api/1.0/') => `${prefix}${url}`;
const cmsPrefix = path => `api/v1.0/${path}`;

export default {
  INIT_DATA: prefix('enum-config'), // 全局枚举
  RULES_LIST: prefix('spu/page'), // 规则列表
  SET_STATUS: prefix('spu/status'), // 规则启用/停用
  SPU: prefix('spu'), // 添加或者更新、查看SPU
  GET_CITYS: cmsPrefix('citys/name'), // cms城市
  SET_RULE_CONFIG: prefix('rule-config'), // 添加或者更新规则配置
  GET_RULE_CONFIG: prefix('rule-config/select'), // 获取产品下全量的费用规则配置
  CALC_REPAY_PLAN: apiPrefix('billing/calc-repay-plan', 'api/1.0/'), // 计算还款计划
  DICT: apiPrefix('enums/list'),
  FUNDER_ALL: '/company/queryAllList', // 资金方枚举 (只有上线状态的)
  STREAM_MONITOR: '/data-stream-monitor', // 交互异常列表
  STREAM_MONITOR_RETRY: '/data-stream-monitor-retry', // 交互异常重试
  STREAM_MONITOR_MODIFY: '/data-stream-monitor-update', // 交互异常处理
  STREAM_MONITOR_MARK: apiPrefix('data-stream-monitor-mark'), // 数据监控推资金平台列表查询接口
  STREAM_MONITOR_LIST: apiPrefix('data-stream-monitor/page'), // 房产回款推送列表
  STREAM_MONITOR_LIST_RETRY: apiPrefix('data-stream-monitor-retry'), // 房产回款推送重试
  STREAM_MONITOR_FUND_PLANTFORM: apiPrefix(
    'data-stream-monitor/fund-platform-push/page'
  ), // 数据监控推资金平台列表查询接口
  FLOW_LIST: apiPrefix('select/totalBill/monitor/page'), // 老系统流量列表
  CHARGE_LIST: prefix('select/charge-config/page'), // 查询费用配置全量数据-分页
  UPDATE_CHARGE: prefix('update/charge-config'), // 更新费用表
  SET_CHARGE: prefix('add/charge-config'), // 添加费用配置全量数据
  ALL_CHARGE_LIST: prefix('select/charge-config') // 查询费用配置全量数据
};
