import { Alarm, Prisma } from ".prisma/client";
import { Period, Symbol } from "../../../../../server/consts";
import { Condition } from "./conds";

export interface ClientAlarm {
  id?: number
  name: string
  conds: Condition[]
  periods: Period[]
  symbols: string[]
  enable: boolean
}
