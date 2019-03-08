import Kefir from 'kefir'
import EventEmitter from 'events'

import isNode from './helpers/isNode'


const defaultSettings = {}


export default class Blinchik {
  #settings = defaultSettings

  #isNode = isNode()

  #emitter = {}

  #stream = {}

  constructor(settings) {
    this.#createSettings(settings)
    this.#createStream()
  }

  #createSettings = (settings) => {
    if (typeof settings === 'string') {
      this.#settings = {
        ...defaultSettings,
        url: settings,
      }
    } else if (settings) {
      this.#settings = settings
    }

    if (!this.#settings.url) {
      throw new Error('url is not defined!')
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

      this.saveEmit = (params) => {
        emitPromise.then(() => {
          this.#emitter.emit(params)
        })
      }
    }
  }

  #emitEvent = (params) => (
    this.#isNode ? this.#emitter.emit('blinchikEvent', params) : this.saveEmit(params)
  )

  onMessage = () => this.#stream

  sendMessage = () => {
    // send message
  }
}
