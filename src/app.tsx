import React, { Component } from 'react'
import { AppProvider } from './store'
import './app.scss'

class App extends Component<React.PropsWithChildren> {
  render() {
    return <AppProvider>{this.props.children}</AppProvider>
  }
}

export default App
