import Blinchik from 'blinchik'


const mock = new Blinchik()

const b = new Blinchik('ws://127.0.0.1:8080', { mock })

b.onOpen(() => {
  b.send('0')
})

const messagesStream = b.onMsg()

messagesStream
  .map(({ data }) => data)
  .log('count from server:')
  .delay(1000)
  .onValue(data => {
    b.send(`${+data + 1}`)
  })


/* mock */
const mockMessagesStream = mock.onMsg()
const connectionsStream = mock.onConn()

let lastId = 0

connectionsStream
  .onValue(({ conn }) => {
    conn.connId = ++lastId
  })

mockMessagesStream
  .onValue(({ data, conn }) => {
    console.log(`count from client ${conn.connId}:`, data)
    mock.send(`${+data + 1}`, conn)
  })

mock.connect()
