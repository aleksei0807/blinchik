import createUUID from 'uuid/v4'

import Blinchik, { setCookie } from 'blinchik'


const mock = Array.from({ length: 3 }).map(() => new Blinchik())

const b = new Blinchik({ port: 8080 }, { mock })

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


/* mock */
mock.forEach((m, idx) => {
  m.onOpen(() => {
    m.send('0')
  })

  const mockMessagesStream = m.onMsg()

  mockMessagesStream
    .map(({ data }) => data)
    .log(`client ${idx + 1}: count from server:`)
    .delay(1000)
    .onValue(data => {
      m.send(`${+data + 1}`)
    })

  m.connect()
})
