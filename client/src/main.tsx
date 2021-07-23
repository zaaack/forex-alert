import React from 'react'
import ReactDOM from 'react-dom'
import './index.css'
import App from './App'
import { client, trpc, queryClient } from './api/trpc'
import { QueryClientProvider } from 'react-query'
import { Switch, Route, HashRouter as Router, useLocation } from 'react-router-dom'
import { GeistProvider, CssBaseline, useTheme } from '@geist-ui/react'


function Main() {
  const theme = useTheme()
  theme.layout.pageWidth='1000px'
  return (
    <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <trpc.Provider client={client} queryClient={queryClient}>
        <Router>
          <GeistProvider themes={[theme]}>
            <CssBaseline />
            <App />
          </GeistProvider>
        </Router>
      </trpc.Provider>
    </QueryClientProvider>
  </React.StrictMode>
  )
}
ReactDOM.render(
  <Main/>,
  document.getElementById('root')
)
