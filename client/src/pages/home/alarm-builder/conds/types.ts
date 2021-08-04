import { ExtendedComponentSchema } from "formiojs";

export interface CondForm<T=any> {
  name: string
  fields: ExtendedComponentSchema[]
  empty: () => T
}

export interface BaseCond {
  join: 'and' | 'or'
}
