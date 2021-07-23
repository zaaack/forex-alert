import css from './index.module.scss'
import React from 'react'
import { Button, Spacer, useTheme } from '@geist-ui/react'
import { useHistory } from 'react-router'

function Page(props) {
  const theme = useTheme()
  const history = useHistory()
  const location = history.location
  return (
    <div className={css.page}>
      <nav
        className={css.nav}
        style={{
          borderBottom: `1px solid ${theme.palette.border}`,
        }}
      >
        <div
          className={css.inner}
          style={{
            padding: `0 ${theme.layout.gap}`,
            width: theme.layout.pageWidth,
            margin: '0 auto',
          }}
        >
          <div className={css.logo}>Logo</div>
          <Spacer x={0.25} />
          <div className={css.links}>
            <Button auto type="abort" size="small" onClick={(e) => {
              history.push(`/auth/login?redir=${history.createHref(location)}`)
            }}>
              Login
            </Button>
            <Spacer x={0.25} />
            <Button auto size="small" onClick={(e) => {

history.push(`/auth/register?redir=${history.createHref(location)}`)
            }}>
              Register
            </Button>
          </div>
        </div>
      </nav>
      <main
        style={{
          padding: `20px ${theme.layout.gap}`,
          maxWidth: theme.layout.pageWidth,
          margin: '0 auto',
        }}
      >
        {props.children}
      </main>
    </div>
  )
}

export default Page
