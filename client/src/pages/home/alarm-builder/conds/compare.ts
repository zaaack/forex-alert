import { Indicator, IndicatorForm, Indicators } from "../../../../utils/indicator";
import {flatten} from 'smoldash'
import { CondForm, BaseCond } from "./types";

const Indicator1 = 'indicator1'
const Indicator2 = 'indicator2'

export interface Compare extends BaseCond {
  name: 'Compare'
  indicator1: Indicator
  compare: '>' | '<'
  indicator2: Indicator
}

export const CompareForm: CondForm = {
  name: 'Compare',
  fields: [
    {
      label: 'Columns',
      columns: [
        {
          components: [
            {
              label: Indicator1,
              key: `${Indicator1}.name`,
              hideLabel: true,

              data: {
                values: Indicators.map(i => ({
                  label: i.name,
                  value: i.name,
                })),
              },
              type: 'select',
              input: true,
              defaultValue: 'Close',
            },
            ...flatten(Indicators.map(i => {
              return i.fields?.map(f => {
                return {
                  ...f,
                  key: `${Indicator1}.${f.key}`,
                  conditional: {
                    "json": {
                      "===": [
                        {
                          "var": `data.${Indicator1}.name`
                        },
                        i.name
                      ]
                    }
                  }
                }
              })
            }))
          ].filter(Boolean),
          width: 5,
          offset: 0,
          push: 0,
          pull: 0,
          size: 'md',
          currentWidth: 5,
        },
        {
          components: [
            {
              label: 'compare',
              key: 'compare',
              type: 'select',
              hideLabel: true,
              data: {
                values: [
                  {
                    label: '&gt;',
                    value: '>',
                  },
                  {
                    label: '&lt;',
                    value: '<',
                  },
                ],
              },
              input: true,
              defaultValue: '>',
            },
          ],
          width: 2,
          offset: 0,
          push: 0,
          pull: 0,
          size: 'md',
          currentWidth: 2,
        },
        {
          components: [
            {
              label: Indicator2,
              key: `${Indicator2}.name`,
              hideLabel: true,
              data: {
                values: Indicators.map(i => ({
                  label: i.name,
                  value: i.name,
                })),
              },
              type: 'select',
              input: true,
              defaultValue: 'Close',
            },
            ...flatten(Indicators.map(i => {
              return i.fields?.map(f => {
                return {
                  ...f,
                  key: `${Indicator2}.${f.key}`,
                  conditional: {
                    "json": {
                      "===": [
                        {
                          "var": `data.${Indicator2}.name`
                        },
                        i.name
                      ]
                    }
                  }
                }
              })
            }))
          ].filter(Boolean),
          size: 'md',
          width: 5,
          offset: 0,
          push: 0,
          pull: 0,
          currentWidth: 5,
        },
      ],
      key: 'columns',
      type: 'columns',
      input: false,
      tableView: false,
    },
  ],
  empty(): Compare {
    return {
      name: 'Compare',
      compare: '>',
      join: 'and',
      indicator1: {
        name: 'Close',
      },
      indicator2: {
        name: 'Close',
      },
    }
  }
}
