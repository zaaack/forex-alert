import React from 'react'
import ReactDOM from 'react-dom'
import './index.css'
import App from './App'
import { client, trpc, queryClient } from './api/trpc'
import { QueryClientProvider } from 'react-query'

ReactDOM.render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <trpc.Provider client={client} queryClient={queryClient}>
        <App />
      </trpc.Provider>
    </QueryClientProvider>
  </React.StrictMode>,
  document.getElementById('root')
)
