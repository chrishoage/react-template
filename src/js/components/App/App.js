import React, { Component, propTypes } from 'react'
import Counter from 'components/Counter'
import * as colors from './colors'

import './App.scss'

export default class App {
  render() {
    return (
      <div>
        <Counter increment={1} color={colors.COUNTER_COLOR} />
        <Counter increment={10} color={colors.COUNTER_COLOR_ALT} />
      </div>
    )
  }
}
