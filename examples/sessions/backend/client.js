import Blinchik from 'blinchik'


const b = new Blinchik('ws://127.0.0.1:8080')

const messagesStream = b.onMsg()

messagesStream
  .map(({ data }) => data)
  .log('count from server:')
  .delay(1000)
  .onValue(msg => {
    b.send(`${+msg + 1}`)
  })
