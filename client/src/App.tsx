// https://couds.github.io/react-bulma-components/?path=/story/components-navbar--default

import React, { useEffect, useRef, useState } from 'react'
import { queryClient, trpc } from './api/trpc'
import './App.scss'
import { Switch, Route, HashRouter as Router, useLocation } from 'react-router-dom'
import { useHistory } from 'react-router-dom'
import Register from './pages/auth/register'
import Login from './pages/auth/login'
import Home from './pages/home'

function App() {
  return (
      <Switch>
        <Route path="/auth/register">
          <Register />
        </Route>
        <Route path="/auth/login">
          <Login />
        </Route>
        <Route path="/">
          <Home />
        </Route>
      </Switch>
  )
}

export default App
