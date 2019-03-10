import Blinchik from '../../../lib'


const b = new Blinchik({ port: 8080 })

const messagesStream = b.onMsg()
const connectionsStream = b.onConn()

let lastId = 0

connectionsStream
  .onValue(({ conn }) => {
    conn.connId = ++lastId
  })

messagesStream
  .onValue(({ data, conn }) => {
    console.log(`count from client ${conn.connId}:`, data)
    b.send(`${+data + 1}`, conn)
  })
