import React from 'react'
import { Button, Checkbox, Input, Spacer } from '@geist-ui/react'
import { trpc } from '../../api/trpc'

function Login(props) {
  const login = trpc.useMutation('auth.login')
  const [user, setUser] = React.useState({ mail: '', pwd: '', remember: false })
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
        <Checkbox
          checked={!!user.remember}
          onChange={(e) => {
            setUser((u) => ({ ...u, remember: e.target.checked }))
          }}
        >
          Remember me
        </Checkbox>
        <Spacer y={0.5} />
        <Button
          loading={login.isLoading}
          type="success"
          onClick={() => {
            login.mutate(user)
          }}
        >
          Login
        </Button>
      </>
    </div>
  )
}

export default Login
