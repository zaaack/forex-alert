import React from 'react'
import yup from 'yup'
import { Indicator } from '../../../utils/indicator'



export interface CrossAlarm {
  type: 'cross'
  params: {
    val1: Indicator
    cond: '>' | '<'
    val2: Indicator
  }
}

export interface Break {
  type: 'break'
  params: {
    level: number
  }
}

export interface PinbarWithLevel {
  type: 'pinbar'
  params: {
    level: number
  }
}

export interface PinbarWithMA {
  type: 'pinbar'
  params: {
    ma: Indicator
  }
}


function AlarmBuilder(props) {
  return <div></div>
}

export default AlarmBuilder
