import React from 'react'
import { Button, Checkbox, Input, Spacer, useToasts } from '@geist-ui/react'
import { trpc } from '../../api/trpc'
import { useHistory } from 'react-router'
import Page from '../../comps/Page'
import { AuthFormWidth } from './utils'
function Login(props) {
  const [toasts, setToast] = useToasts()
  const history = useHistory()

  const login = trpc.useMutation('auth.login', {
    onError: (err) => {
      console.error(err)
      setToast({ text: err.json.error.message, type: 'error' })
    },
    onSuccess: () => {
      setToast({ text: 'Login successfully!', type: 'success' })
      history.push('/')
    },
  })
  const [user, setUser] = React.useState({ mail: '', pwd: '', remember: false })
  return (
    <Page>
      <form
        style={{margin: `100px auto`, width: AuthFormWidth}}
        onSubmit={() => {
          login.mutate(user)
        }}
      >
        <Input
          label="mail"
          placeholder="Your Email"
          type="mail"
          value={user.mail}
          required
          width={`100%`}
          onChange={(e) => {
            setUser((u) => ({ ...u, mail: e.target.value }))
          }}
        />
        <Spacer y={0.5} />
        <Input.Password
          label="password"
          placeholder="Your password"
          value={user.pwd}
          width={`100%`}
          required
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
          htmlType="submit"
          style={{ width: `100%` }}
        >
          Login
        </Button>
      </form>
    </Page>
  )
}

export default Login
