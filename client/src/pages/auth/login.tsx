import React from 'react'
import { Input, Spacer } from '@geist-ui/react'

function Login(props) {
  return (
    <div>
      <>
        <Input label="mail" placeholder="Your Email" type="mail" />
        <Spacer y={0.5} />
        <Input.Password label="password" placeholder="Your password" />
        <Spacer y={0.5} />
      </>
    </div>
  )
}

export default Login
