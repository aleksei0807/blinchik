import Kefir from 'kefir'
import EventEmitter from 'events'
import NodeWS from 'ws'

import isNode from './helpers/isNode'


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

  ws = {}

  constructor(ws, settings) {
    this.#settings = settings || defaultSettings

    this.#createConnection(ws)
    this.#createStream()
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

      this.saveEmit = (params) => {
        emitPromise.then(() => {
          this.#emitter.emit(params)
        })
      }
    }
  }

  #createConnection = (ws) => {
    if (!ws) {
      throw new Error('ws is not defined!')
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

        this.ws.on('connection', (connection, req) => {
          this.#emitEvent({
            type: 'connection',
            connection,
            req,
          })

          connection.on('message', (message) => {
            this.#emitEvent({
              type: 'message',
              data: {
                message,
                connection,
              }
            })
          })
        })
      } else {
        this.ws.on('message', (data) => {
          this.#emitEvent({
            type: 'message',
            data,
          })
        })

        this.ws.on('open', () => {
          this.#isClosed = false
        })

        this.ws.on('error', (e) => {
          this.#browserReconnect(e.code, true)
        })

        this.ws.on('close', this.#browserReconnect)

        if (this.#isReconnect) {
          Object.keys(this.#callbacks).forEach((key) => {
            this[key](this.#callbacks[key])
          })
        }
      }
    } else {
      this.ws.onmessage = (data) => {
        this.#emitEvent({
          type: 'message',
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
          this[key](this.#callbacks[key])
        })
      }
    }
  }

  #browserReconnect = (code, isError) => {
    const cond = isError ? code === 'ECONNREFUSED' : code !== 1000
    if (!this.#settings.disableReconnect && this.#wsPath && cond) {
      this.#isClosed = true
      this.#isReconnect = true

      if (typeof this.ws.removeAllListeners === 'function') {
        this.ws.removeAllListeners()
      }

      setTimeout(() => {
        this.#createConnection(this.#wsPath)
      }, this.#settings.reconnectInterval)
    }
  }

  #emitEvent = (params) => (
    this.#isNode ? this.#emitter.emit('blinchikEvent', params) : this.saveEmit(params)
  )

  onOpen = (cb) => {
    if (typeof this.ws.on === 'function') {
      this.ws.on('open', (...args) => {
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
  }

  onError = (cb) => {
    if (typeof this.ws.on === 'function') {
      this.ws.on('error', (e) => {
        this.#browserReconnect(e.code, true)
        cb(e)
      })
    } else {
      this.ws.onerror = () => cb
    }

    if (!this.#settings.disableReconnect && this.#wsPath) {
      this.#callbacks.onError = cb
    }
  }

  onPing = (cb) => {
    if (typeof this.ws.on === 'function') {
      this.ws.on('ping', cb)
    }

    if (!this.#settings.disableReconnect && this.#wsPath) {
      this.#callbacks.onPing = cb
    }
  }

  onClose = (cb) => {
    if (typeof this.ws.on === 'function') {
      this.ws.on('close', (e) => {
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

  onMessage = () => (
    this.#stream
      .filter(({ type }) => type === 'message')
      .map(({ data }) => data)
  )

  onConnection = () => (
    this.#stream
      .filter(({ type }) => type === 'connection')
      .map(({ connection, req }) => ({ connection, req }))
  )

  send = (message, ws) => {
    if (!this.#isClosed) {
      if (ws) {
        ws.send(message)
      } else {
        this.ws.send(message)
      }
    }
  }
}
