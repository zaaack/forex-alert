import { CandlePatternForm, CandlePattern } from "./candle-pattern";
import { Compare, CompareForm } from "./compare";
import { CondForm } from "./types";

export type Condition = CandlePattern | Compare

export const AlarmFormMap = [CompareForm, CandlePatternForm].reduce((map, AlarmForm) => {
  map[AlarmForm.name] = AlarmForm;
  return map
}, {} as {[k: string]: CondForm})
