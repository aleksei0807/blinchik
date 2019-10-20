/* @flow */
// Copyright 2019-present Aleksei Shchurak
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
import Core from '../core'

import type { WS, Settings } from '../types'


export default class NodeServer extends Core {
  #pp

  constructor(ws?: WS, settings: Settings) {
    let pp = {}
    const cb = (protectedProps) => {
      pp = protectedProps
    }
    super(ws, settings, cb)
    this.#pp = pp
    // this.#createConnection(ws)
  }

  #createConnection = (ws?: WS) => {
    this.#pp.createConnection(ws)
  }
}
