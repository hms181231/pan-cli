export default function guarantee() {
  return [
    {
      chargeId: 1001,
      chargeName: '担保服务费',
      direction: 'RECEIVE',
      chargeCalcChannel: 'BILLING_SYSTEM',
      calcFormula: 'PRINCIPAL_YEAR_RATE',
      receiverName: null,
      receiverCode: null,
      receiverAgentCode: null,
      receiverAgentName: null,
      repayMethod: 'ONETIME_PRINCIPAL_INTEREST',
      termRule: 'HEAD_AND_TAIL',
      free: 'NO',
      unearned: 'YES',
      chargeMethod: 'ONE_TIME_CHARGE_BEFORE',
      fallbackRule: 'ALL_INTEREST',
      fallbackUpperLimitValue: null,
      fallbackUpperLowerValue: null,
      repayRule: 'REPAY_BOTH',
      settleByPrinciple: 'SETTLE_BY_PRINCIPLE',
      ratioModel: 'FIXED_RATIO',
      skuConfigVos: []
    }
  ];
}
