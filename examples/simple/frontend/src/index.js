import Blinchik from 'blinchik'


const b = new Blinchik('ws://127.0.0.1:8080')

b.onOpen(() => {
  b.send('0')
})

const messagesStream = b.onMsg()

messagesStream
  .map(({ data }) => {
    document.getElementById('count').innerHTML = data

    return data
  })
  .delay(1000)
  .onValue(data => {
    b.send(`${+data + 1}`)
  })
