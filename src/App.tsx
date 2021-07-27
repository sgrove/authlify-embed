import React from 'react'
import Embed from './pages/Embed'
import { BrowserRouter, Switch, Route } from 'react-router-dom'

const urlSearchParams = new URLSearchParams(window.location.search)

const App = () => {
  const siteId = urlSearchParams.get('siteId')

  if (!siteId) {
    return <>Unable to find your Netlify site id</>
  }

  return (
    <BrowserRouter>
      <Switch>
        <Route exact path="/">
          <Embed siteId={siteId} />
        </Route>
      </Switch>
    </BrowserRouter>
  )
}

export default App
