import React from 'react'
import ReactDOM from 'react-dom'
import './index.css'
import App from './App'
import { client, trpc, queryClient } from './api/trpc'
import { QueryClientProvider } from 'react-query'
import { Switch, Route, HashRouter as Router, useLocation } from 'react-router-dom'

ReactDOM.render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <trpc.Provider client={client} queryClient={queryClient}>
        <Router>
        <App />
        </Router>
      </trpc.Provider>
    </QueryClientProvider>
  </React.StrictMode>,
  document.getElementById('root')
)
