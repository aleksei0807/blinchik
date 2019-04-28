# Blinchik

A tiny websocket wrapper that made using [Kefir.js](https://kefirjs.github.io/kefir/).
It returns a Kefir stream instance.

[![NPM](https://nodei.co/npm/blinchik.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/blinchik/)

### Etymology

Blinchik — diminutive form of [Blin](https://en.wikipedia.org/wiki/Blini).
Blini frequently made using [Kefir](https://en.wikipedia.org/wiki/Kefir).

### Getting started

0. Installation.

```sh
npm i -S blinchik
```

1. Look into examples.

- [Simple counter example](examples/simple).
- [Sessions usage example](examples/sessions).

You can also scale your code using Blinchik.

That's the client side:

```javascript
import Blinchik from 'blinchik'

const b = new Blinchik('ws://127.0.0.1:8080')

const stream = b.onMsg({ shouldParseJSON: true })

const chatStream = stream
  .filter(({ data }) => data.type === 'CHAT/INCOMING_MESSAGE')

const notificationStream = stream
  .filter(({ data }) => data.type === 'NOTIFICATION/PAYMENT')

chatStream
  .log('chat stream')
  .map(({ data }) => {
    // your logic goes here
  })

notificationStream
  .log('notification stream')
  .map(({ data }) => {
    // your logic goes here.
    // e.g., you can show a popup with the notification
  })
```

And that's the server side:

```javascript
import Blinchik from 'blinchik'

const b = new Blinchik({ port: 8080 })

const connectionsStream = b.onConn()

connectionsStream
  .onValue(({ conn }) => {
    // for demonstration purposes,
    // on each new connection we send
    // two messages to the client.
    // you can implement any custom logic instead.
    b.send({
      type: 'CHAT/INCOMING_MESSAGE',
      text: 'LMAO',
    }, conn)

    b.send({
      type: 'NOTIFICATION/PAYMENT',
      severity: 'error',
      text: 'Could not process scheduled payment. Please, review your billing settings.',
    }, conn)
  })
```

Using Blinchik, you can use all Kefir stream methods. See [Kefir docs](https://kefirjs.github.io/kefir/) for more information.

2. You're ready to go ;)

# API

### Blinchik constructor parameters

`new Blinchik(ws, settings)`

`ws` must be one of:

- undefined (for creating mock instance)
- Blinchik instance (for using mock instance)
- String (node & browser client only): `wss://ws.example.com/connections`.
- Object (server only): [`WebSocket.Server` options](http://npmjs.com/ws) from `ws` library
- WebSocket or WebSocket.Server from ws library
- Standard [WebSocket object](https://developer.mozilla.org/ru/docs/Web/API/WebSocket)

`settings` is an optional object with:

- `disableReconnect` (node & browser client only, Boolean, default: false): disables automatic failover behaviour,
  which will try to reconnect to a broken connection each `reconnectInterval` ms.
- `reconnectInterval` (node & browser client only, Number, default: 2000): failover reconnection interval in milliseconds.

### Blinchik instance properties

`ws` eighter is one of:

- WebSocket or WebSocket.Server from ws library
- Standard [WebSocket object](https://developer.mozilla.org/ru/docs/Web/API/WebSocket)

Blinchik instance will use this connection.

### Blinchik methods for both server and clients

- `onError(callback)`: sets error handler for current instance. Callback should accept an error. Error type depends on mode.
- `onClose(callback)`: sets connection close handler for current instance. Callback should accept an error. Error type depends on mode.
- `onMessage(options)`: returns Kefir stream of connection messages.
  - `options` is an optional object with `shouldParseJSON` boolean flag, that enables automatic data parsing.
- `onMsg`: alias for `onMessage`
- `send(msg, ws)`: sends given message using current instance connection or given `ws` connection, if passed.
  This method handles connection state checks and automatic data stringify if given message is an object (which is not a valid WS message).

### Blinchick client methods

- `onOpen(callback)`: sets a handler which executed on successful connection.
- `onPing(callback)` (only node client): sets a handler for pings.
  For details, see [`ws` library](http://npmjs.com/ws) docs.

### Blinchik server methods

- `onConnection()`: returns Kefir stream of new connections.
- `onConn`: alias for onConnection
- `onHeaders()`: returns Kefir stream which allows set custom headers.
  This is done by mutating `headers` property of the value.

### Blinchik mock methods

- `connect()`: create mock connection
