import React from 'react'
import Embed from './pages/Embed'
import { BrowserRouter, Switch, Route } from 'react-router-dom'

const urlSearchParams = new URLSearchParams(window.location.search)

const App = () => {
  return (
    <BrowserRouter>
      <Switch>
        <Route exact path="/">
          <Embed />
        </Route>
      </Switch>
    </BrowserRouter>
  )
}

export default App
