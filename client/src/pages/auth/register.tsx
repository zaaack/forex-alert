import React from 'react'
import { Button, Checkbox, Image, Input, Spacer, useToasts } from '@geist-ui/react'
import { useLocation, useHistory } from 'react-router-dom'
import { trpc } from '../../api/trpc'
import Page from '../../comps/Page'
import { AuthFormWidth } from './utils'

function Register(props) {
  const [toasts, setToast] = useToasts()
  const [refreshId, refresh] = React.useState(0)
  const history = useHistory()
  const login = trpc.useMutation('auth.register', {
    onError: (err) => {
      console.error(err)
      setToast({ text: err.json.error.message, type: 'error' })
      if (err.json.error.code === 'INVALID_CAPTCHA') {
        refresh((u) => u + 1)
      }
    },
    onSuccess: () => {
      setToast({ text: 'Register successfully!', type: 'success' })
      history.push('/')
    },
  })
  const [user, setUser] = React.useState({ mail: '', pwd: '', code: '' })
  return (
    <Page>
      <form
        style={{ margin: `100px auto`, width: AuthFormWidth }}
        onSubmit={() => {
          login.mutate(user)
        }}
      >
        <Input
          label="mail"
          placeholder="Your Email"
          type="mail"
          width="100%"
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
          width="100%"
          onChange={(e) => {
            setUser((u) => ({ ...u, pwd: e.target.value }))
          }}
        />
        <Spacer y={0.5} />
        <Image
          src={`/api/captcha?refresh=${refreshId}`}
          onClick={(e) => refresh((r) => r + 1)}
          width={250}
        />
        <Spacer y={0.5} />
        <Input
          label="captcha"
          placeholder="Captcha code"
          type="text"
          value={user.code}
          width="100%"
          onChange={(e) => {
            setUser((u) => ({ ...u, code: e.target.value }))
          }}
          required
        />
        <Spacer y={0.5} />
        <Button
          loading={login.isLoading}
          type="success"
          htmlType="submit"
          style={{ width: '100%' }}
        >
          Register
        </Button>
      </form>
    </Page>
  )
}

export default Register
