import { BrowserClient } from '../../../../lib'


const b = new BrowserClient('ws://localhost:8080')

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
