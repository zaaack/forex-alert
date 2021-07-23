import React from 'react'
import { Button, Checkbox, Image, Input, Spacer } from '@geist-ui/react'
import { trpc } from '../../api/trpc'

function Register(props) {
  const login = trpc.useMutation('auth.register')
  const [user, setUser] = React.useState({ mail: '', pwd: '', code: '' })
  return (
    <div>
      <>
        <Input
          label="mail"
          placeholder="Your Email"
          type="mail"
          value={user.mail}
          onChange={(e) => {
            setUser((u) => ({ ...u, mail: e.target.value }))
          }}
        />
        <Spacer y={0.5} />
        <Input.Password
          label="password"
          placeholder="Your password"
          value={user.pwd}
          onChange={(e) => {
            setUser((u) => ({ ...u, pwd: e.target.value }))
          }}
        />
        <Spacer y={0.5} />
        <Image src={`/api/captcha`} />
        <Spacer y={0.5} />
        <Input
          label="captcha"
          placeholder="Captcha code"
          type="text"
          value={user.code}
          onChange={(e) => {
            setUser((u) => ({ ...u, code: e.target.value }))
          }}
        />
        <Spacer y={0.5} />
        <Button
          loading={login.isLoading}
          type="success"
          onClick={() => {
            login.mutate(user)
          }}
        >
          Register
        </Button>
      </>
    </div>
  )
}

export default Register
