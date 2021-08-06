import { CondForm, BaseCond } from "./types";
import { CandlePatternName, CandlePatternNames } from "../../../../utils/candles";

export interface CandlePattern extends BaseCond {
  name: 'CandlePattern'
  pattern: CandlePatternName
  similarity: number
}

export const CandlePatternForm: CondForm = {
  name: 'CandlePattern',
  fields: [
    {
      label: 'Pattern',
      key: `pattern`,
      hideLabel: true,
      data: {
        values: CandlePatternNames,
      },
      type: 'select',
      input: true,
      defaultValue: 'CDLHAMMER',
    },
    {
      label: 'Similarity',
      key: `similarity`,
      type: 'number',
      input: true,
      defaultValue: 70,
    },
  ],
  empty(): CandlePattern {
    return {
      name: 'CandlePattern',
      join: 'and',
      pattern: 'CDLHAMMER',
      similarity: 70,
    }
  }
}
