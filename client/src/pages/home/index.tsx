import React, { useState } from 'react'
import Page from '../../comps/Page'
import AlarmBuilder from './alarm-builder'

function Home(props) {
  const alarms = useState([])
  return (
    <Page>
      <AlarmBuilder onCreate={(alarm) => {}} />
    </Page>
  )
}

export default Home
