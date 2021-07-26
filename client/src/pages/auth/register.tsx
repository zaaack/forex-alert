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
  const trpcCtx = trpc.useContext()
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
      trpcCtx.invalidateQuery(['auth.me'])
      history.push('/')
    },
  })
  const [user, setUser] = React.useState({ mail: '', pwd: '', code: '', nickname: '' })
  return (
    <Page>
      <form
        style={{ margin: `100px auto`, width: AuthFormWidth }}
        onSubmit={(e) => {
          login.mutate(user)
          e.preventDefault()
        }}
      >
        <Input
          label="mail"
          name="mail"
          placeholder="Your Email"
          type="mail"
          width="100%"
          value={user.mail}
          required
          onChange={(e) => {
            setUser((u) => ({ ...u, mail: e.target.value }))
          }}
        />
        <Spacer y={0.5} />
        <Input
          label="nickname"
          name="nickname"
          placeholder={user.mail ? user.mail.split('@')[0] : 'Your Nickname'}
          width="100%"
          value={user.nickname}
          onChange={(e) => {
            setUser((u) => ({ ...u, nickname: e.target.value }))
          }}
        />
        <Spacer y={0.5} />
        <Input.Password
          label="password"
          name="pwd"
          placeholder="Your password"
          value={user.pwd}
          width="100%"
          required
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
          name="code"
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
