/* @flow */
// Copyright 2019-present Aleksei Shchurak
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//


import Kefir from 'kefir'
import EventEmitter from 'events'
import NodeWS from 'ws'

import isNode from './helpers/isNode'
import isArrayLike from './helpers/isArrayLike'

import setCookie from './helpers/setCookie'


export {
  setCookie,
}


/* eslint-disable no-use-before-define */
type WS = typeof Blinchik | string | {} | typeof NodeWS | typeof NodeWS.Server | typeof WebSocket

type Settings = {
  disableReconnect?: boolean;
  reconnectInterval?: number;
  mock?: typeof Blinchik | Array<typeof Blinchik>
}
/* eslint-enable no-use-before-define */

type WSPath = string

type EmitEventParams = {
  type: string;
  [key: string]: any;
}


const defaultSettings = {
  disableReconnect: false,
  reconnectInterval: 2000,
}

export default class Blinchik {
  #isNode = isNode()
  #emitter = {}
  #stream = {}
  #settings
  #wsPath
  #callbacks = {}
  #isReconnect = false
  #isClosed = true
  #isMock = false
  #mockCallbacks = {}

  ws = {}

  createConnection: (ws?: WS | WSPath) => void
  createStream: () => void
  safeEmit: (params: any) => void
  emitEvent: (params: EmitEventParams) => void
  browserReconnect: (code: string | number, isError?: boolean) => void
  wsOn: (event: string, listener: (...params: any) => void) => void
  createMock: (ws: WS, isInner?: boolean) => void

  constructor(ws?: WS, settings: Settings = defaultSettings) {
    this.#settings = settings

    this.#createConnection(ws)
    this.#createStream()
  }

  #wsOn = (...params) => {
    if (this.#isNode && this.ws instanceof NodeWS || this.ws instanceof NodeWS.Server) {
      this.ws.on(...params)
    }
  }

  #createStream = () => {
    if (this.#isNode) {
      this.#emitter = new EventEmitter()

      this.#stream = Kefir.fromEvents(this.#emitter, 'blinchikEvent')
    } else {
      const emitPromise = new Promise(resolve => {
        this.#stream = Kefir.stream(emitter => {
          this.#emitter = emitter
          resolve()
        })
      })

      this.safeEmit = (params) => {
        emitPromise.then(() => {
          this.#emitter.emit(params)
        })
      }
    }
  }

  #createMock = (ws, isInner) => {
    const originalConnect = isInner
      ? (...args) => { } // eslint-disable-line no-unused-vars
      : ws.connect

    let defaultReq
    if (this.#isNode) {
      const MockReq = require('readable-mock-req')
      defaultReq = new MockReq()
    }

    ws.connect = (conn = ws, req = defaultReq, headers = []) => {
      const originalSend = ws.send
      ws.send = (...args) => {
        if (!args[1] || args[1] === conn) {
          this.#emitEvent({
            type: 'msg',
            data: {
              data: args[0],
              conn: args[1] || conn,
              req: args[2] || req,
            }
          })
        }
        originalSend(...args)
      }

      this.#emitEvent({
        type: 'headers',
        headers,
        req,
      })

      this.#emitEvent({
        type: 'conn',
        conn,
        req,
      })

      originalConnect(this, conn, req, headers)

      if (typeof this.#mockCallbacks.onOpen === 'function') {
        this.#mockCallbacks.onOpen(conn)
      }
    }
  }

  #createConnection = (ws) => {
    if (!ws) {
      this.#isMock = true
      return
    }

    if (typeof ws === 'string') {
      this.#wsPath = ws
      if (this.#isNode) {
        this.ws = new NodeWS(ws)
      } else {
        this.ws = new WebSocket(ws)
      }
    } else if (this.#isNode && typeof ws === 'object' && ws.constructor.name === 'Object') {
      this.ws = new NodeWS.Server(ws)
    } else {
      this.ws = ws
    }

    if (typeof this.ws.on === 'function') {
      if (this.ws.constructor.name === 'WebSocketServer') {
        this.#isClosed = false

        this.#wsOn('headers', (headers, req) => {
          this.#emitEvent({
            type: 'headers',
            headers,
            req,
          })
        })

        this.#wsOn('connection', (conn, req) => {
          this.#emitEvent({
            type: 'conn',
            conn,
            req,
          })

          conn.on('message', (msg) => {
            this.#emitEvent({
              type: 'msg',
              data: {
                data: msg,
                conn,
                req,
              }
            })
          })
        })
      } else {
        this.#wsOn('message', (msg) => {
          this.#emitEvent({
            type: 'msg',
            data: {
              data: msg,
            },
          })
        })

        this.#wsOn('open', () => {
          this.#isClosed = false
        })

        this.#wsOn('error', (e) => {
          this.#browserReconnect(e.code, true)
        })

        this.#wsOn('close', this.#browserReconnect)

        if (this.#isReconnect) {
          Object.keys(this.#callbacks).forEach((key: string) => {
            // $FlowIgnore
            this[key](this.#callbacks[key])
          })
        }
      }
    } else {
      this.ws.onmessage = (data) => {
        this.#emitEvent({
          type: 'msg',
          data,
        })
      }

      this.ws.onopen = () => {
        this.#isClosed = false
      }

      this.ws.onclose = (e) => {
        this.#browserReconnect(e.code)
      }

      if (this.#isReconnect) {
        Object.keys(this.#callbacks).forEach((key) => {
          // $FlowIgnore
          this[key](this.#callbacks[key])
        })
      }
    }

    // mock
    if (ws instanceof Blinchik) {
      this.#createMock(ws)
    }

    if (this.#settings.mock instanceof Blinchik) {
      this.#createMock(this.#settings.mock)
    }

    if (this.#settings.mock instanceof Array) {
      this.#settings.mock.forEach((mock) => {
        if (mock instanceof Blinchik) {
          this.#createMock(mock)
        }
      })
    }
  }

  #browserReconnect = (code, isError) => {
    const cond = isError ? code === 'ECONNREFUSED' : code !== 1000 && code !== 1015
    if (!this.#settings.disableReconnect && this.#wsPath && cond) {
      this.#isClosed = true
      this.#isReconnect = true

      if (this.#isNode && this.ws instanceof NodeWS || this.ws instanceof NodeWS.Server) {
        this.ws.removeAllListeners()
      }

      setTimeout(() => {
        this.#createConnection(this.#wsPath)
      }, this.#settings.reconnectInterval)
    }
  }

  #emitEvent = (params) => (
    this.#isNode && this.#emitter instanceof EventEmitter ? this.#emitter.emit('blinchikEvent', params) : this.safeEmit(params)
  )

  onOpen = (cb) => {
    if (typeof this.ws.on === 'function') {
      this.#wsOn('open', (...args) => {
        this.#isClosed = false

        cb(...args)
      })
    } else {
      this.ws.onopen = (...args) => {
        this.#isClosed = false
        cb(...args)
      }
    }

    if (!this.#settings.disableReconnect && this.#wsPath) {
      this.#callbacks.onOpen = cb
    }

    if (this.#isMock || this.ws instanceof Blinchik || this.#settings.mock) {
      this.#mockCallbacks.onOpen = cb
    }
  }

  onError = (cb) => {
    if (typeof this.ws.on === 'function') {
      this.#wsOn('error', (e) => {
        this.#browserReconnect(e.code, true)
        cb(e)
      })
    } else {
      this.ws.onerror = cb
    }

    if (!this.#settings.disableReconnect && this.#wsPath) {
      this.#callbacks.onError = cb
    }
  }

  onPing = (cb) => {
    if (typeof this.ws.on === 'function') {
      this.#wsOn('ping', cb)
    }

    if (!this.#settings.disableReconnect && this.#wsPath) {
      this.#callbacks.onPing = cb
    }
  }

  onClose = (cb) => {
    if (typeof this.ws.on === 'function') {
      this.#wsOn('close', (e) => {
        this.#browserReconnect(e)
        cb(e)
      })
    } else {
      this.ws.onclose = (e) => {
        this.#browserReconnect(e.code)
        cb(e)
      }
    }

    if (!this.#settings.disableReconnect && this.#wsPath) {
      this.#callbacks.onClose = cb
    }
  }

  onMessage = ({ shouldParseJSON } = {}) => (
    this.#stream
      .filter(({ type }) => type === 'msg')
      .map(({ data }) => {
        if (shouldParseJSON && typeof data.data === 'string') {
          data = {
            ...data,
            data: JSON.parse(data.data),
          }
        }

        return data
      })
  )

  onConnection = () => (
    this.#stream
      .filter(({ type }) => type === 'conn')
      .map(({ conn, req }) => ({ conn, req }))
  )

  onHeaders = () => (
    this.#stream
      .filter(({ type }) => type === 'headers')
      .map(({ headers, req }) => ({ headers, req }))
  )

  onMsg = this.onMessage
  onConn = this.onConnection

  send = (msg, ws) => {
    const conn = ws || this.ws
    if ((!this.#isClosed || ws) && conn.readyState === 1) {
      if (!(typeof msg === 'string'
        || msg instanceof Buffer
        || msg instanceof ArrayBuffer
        || msg instanceof Array
        || isArrayLike(msg)
      )) {
        msg = JSON.stringify(msg)
      }

      conn.send(msg)
    }
  }

  // for mock
  connect = (ws, conn = {}, req = {}, headers = []) => {
    if (ws instanceof Blinchik) {
      this.#createMock(ws, true)
      ws.connect(conn, req, headers)
    } else {
      console.error('Mock instance must be provided to other Blinchik instance!')
    }
  }
}
