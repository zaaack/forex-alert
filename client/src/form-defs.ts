import { ExtendedComponentSchema } from 'formiojs'
import { Symbols } from '../../server-source/consts'

// 方向: 'Both' | 'OnlyLong' | 'OnlyShort'
// remainCrossTimes: number
// ProfitLossRatioForMoveSL: number
// Ma1: number
// Ma2: number
// Ma3: number
// 移动止损模式: 'SLMode_MA' | 'SLMode_PEAK'
// SLPeakPeriod: number
// GtPrice: number
// LtPrice: number
// Lots: number
// https://github.com/formio/formio.js/wiki
const DirectionComp = {
  type: 'select',
  placeholder: '',
  input: true,
  dataSrc: 'values',
  data: {
    values: [
      { label: 'Both', value: 'Both' },
      { label: 'OnlyLong', value: 'OnlyLong' },
      { label: 'OnlyShort', value: 'OnlyShort' },
    ],
  },
}
export const formDefs: {
  components: ExtendedComponentSchema[]
} = {
  components: [
    {
      type: 'datagrid',
      dataGridLabel: false,
      customClass: 'buyAndSell',
      components: [
        {
          type: 'button',
          action: 'event',
          label: 'Buy',
          key: 'buy',
          theme: 'success',
        },
        {
          type: 'button',
          action: 'event',
          label: 'Sell',
          key: 'sell',
          theme: 'danger',
        },
        {
          type: 'button',
          action: 'event',
          label: 'Cancel',
          key: 'cancel',
          theme: 'warning',
        },
        {
          type: 'button',
          action: 'event',
          label: 'Close',
          key: 'close',
          theme: 'info',
        },
      ],
    },
    {
      type: 'select',
      key: 'symbol',
      label: 'Symbol',
      placeholder: '',
      input: true,
      dataSrc: 'values',
      data: {
        values: Symbols.map((s) => ({ label: s, value: s })),
      },
    },
    {
      key: 'Dir',
      label: 'Dir',
      ...DirectionComp,
    },
    {
      type: 'number',
      key: 'remainCrossTimes',
      label: '剩下的交叉开仓次数(remainCrossTimes)',
      placeholder: '',
      input: true,
      validate: {
        min: 0,
        integer: true,
      } as any,
    },
    {
      type: 'number',
      key: 'PeriodTimes',
      label: '周期乘数(PeriodTimes)',
      placeholder: '',
      input: true,
      validate: {
        min: 1,
        integer: true,
      } as any,
    },
    {
      type: 'number',
      key: 'crossPushPeriod',
      label: '交叉推送周期(crossPushPeriod)',
      placeholder: '',
      input: true,
      validate: {
        min: 1,
        integer: true,
      } as any,
    },
    {
      type: 'number',
      key: 'SeparatePos',
      label: '分仓数量(SeparatePos)',
      placeholder: '',
      input: true,
      validate: {
        min: 1,
        integer: true,
      } as any,
    },
    {
      type: 'number',
      key: 'SLPeakPeriod',
      label: '顶底止损周期(SLPeakPeriod)',
      placeholder: '',
      input: true,
      validate: {
        min: 0,
        integer: true,
      },
    },
    {
      type: 'select',
      key: 'StopLossMode',
      label: '移动止损模式',
      placeholder: '',
      input: true,
      dataSrc: 'values',
      data: {
        values: ['SLMode_PEAK', 'SLMode_MA', 'SLMode_DC', 'SLMode_HALF', 'SLMode_NONE'].map(
          (v) => ({ label: v, value: v }),
        ),
      },
    },
    {
      type: 'number',
      key: 'Ma1',
      label: '快线周期(Ma1)',
      placeholder: '',
      input: true,
      validate: {
        min: 0,
        integer: true,
      } as any,
    },
    {
      type: 'number',
      key: 'Ma2',
      label: '慢线周期(Ma2)',
      placeholder: '',
      input: true,
      validate: {
        min: 0,
        integer: true,
      } as any,
    },
    {
      type: 'number',
      key: 'ProfitLossRatioForMoveSL',
      label: '几倍盈亏比才开始移动止损',
      placeholder: '',
      input: true,
      validate: {
        min: 0,
        integer: true,
      } as any,
    },
    {
      type: 'number',
      key: 'Ma3',
      label: '止盈线周期(Ma3)',
      placeholder: '',
      input: true,
      validate: {
        min: 0,
        integer: true,
      } as any,
      logic: [
        {
          trigger: {
            type: 'simple',
            simple: {
              when: 'StopLossMode',
              eq: 'SLMode_MA',
              show: true, // To trigger or not when the value is equal
            },
          },
        },
      ],
    },
    {
      type: 'number',
      key: 'GtPrice',
      label: '大于价位(GtPrice)',
      placeholder: '',
      input: true,
      validate: {
        min: -1,
      },
    },
    {
      type: 'number',
      key: 'LtPrice',
      label: '小于价位(LtPrice)',
      placeholder: '',
      input: true,
      validate: {
        min: -1,
      },
    },
    {
      type: 'number',
      key: 'StopLossDollars',
      label: '单笔止损金额($)(StopLossDollars)',
      placeholder: '',
      input: true,
    },
    {
      type: 'button',
      action: 'submit',
      label: 'Submit',
      theme: 'primary',
    },
  ],
}
