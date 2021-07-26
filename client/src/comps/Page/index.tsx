import css from './index.module.scss'
import React from 'react'
import { Button, ButtonDropdown, Spacer, useTheme } from '@geist-ui/react'
import { useHistory } from 'react-router'
import { trpc } from '../../api/trpc'

function Page(props) {
  const theme = useTheme()
  const history = useHistory()
  const location = history.location
  const fetchMe = trpc.useQuery(['auth.me'], { staleTime: Infinity })
  const logout = trpc.useMutation('auth.logout')
  const me = fetchMe.data
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
            {me ? (
              <ButtonDropdown>
                <ButtonDropdown.Item main className={css.autoWidth}>{me.nickname}</ButtonDropdown.Item>
                <ButtonDropdown.Item
                 className={css.autoWidth}
                  onClick={() => {
                    history.push('/auth/plan')
                  }}
                >
                  Plan: {me.plan}
                </ButtonDropdown.Item>
                <ButtonDropdown.Item
                 className={css.autoWidth}
                  onClick={() => {
                    logout.mutateAsync(null).then(() => {
                      fetchMe.refetch()
                    })
                  }}
                >
                  Logout
                </ButtonDropdown.Item>
              </ButtonDropdown>
            ) : (
              <>
                <Button
                  auto
                  type="abort"
                  size="small"
                  onClick={(e) => {
                    history.push(`/auth/login?redir=${history.createHref(location)}`)
                  }}
                >
                  Login
                </Button>
                <Spacer x={0.25} />
                <Button
                  auto
                  size="small"
                  onClick={(e) => {
                    history.push(`/auth/register?redir=${history.createHref(location)}`)
                  }}
                >
                  Register
                </Button>
              </>
            )}
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
