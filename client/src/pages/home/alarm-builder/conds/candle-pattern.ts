import { CondForm, BaseCond } from "./types";

export interface CandlePattern extends BaseCond {
  name: 'CandlePattern'
  level: number
}

export const CandlePatternForm: CondForm = {
  name: 'CandlePattern',
  fields: [
    {
      label: 'level',
      key: 'level',
      type: 'number',
      labelPosition: 'left',
      labelMargin: 1,
      input: true,
      defaultValue: 1,
      validate: {
        min: 0,
      },
    },
  ],
  empty(): CandlePattern {
    return {
      name: 'CandlePattern',
      level: 1,
      join: 'and',
    }
  }
}
