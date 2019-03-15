import createUUID from 'uuid/v4'

import Blinchik, { setCookie } from '../../../lib'


const b = new Blinchik({ port: 8080 })

const messagesStream = b.onMsg()
const connectionStream = b.onConn()
const setHeadersStream = b.onHeaders()

const counters = {}

setHeadersStream
  .map(setCookie({
    name: 'sessid',
    getValue: createUUID,
    ttl: 12 * 60 * 60, // 12 hours from now in seconds
  }))
  .onValue(({ req, cookie }) => {
    const { value } = cookie

    if (counters[value] === undefined) {
      counters[value] = 0
    }

    req.sessid = value
  })

connectionStream
  .onValue(({ conn, req }) => {
    b.send(`${counters[req.sessid]}`, conn)
  })

messagesStream
  .onValue(({ data, conn, req }) => {
    console.log(`count from client ${req.sessid}:`, data)

    if (counters[req.sessid] < +data) {
      counters[req.sessid] = ++data
    }

    b.send(`${counters[req.sessid]}`, conn)
  })
