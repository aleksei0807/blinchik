import type NodeWS from 'ws'
import type MockServer from '../mock/server'
import type MockClient from '../mock/client'


export type MockInstance = typeof MockServer | typeof MockClient

export type WS = MockInstance
  | string
  | {}
  | typeof NodeWS
  | typeof NodeWS.Server
  | typeof WebSocket

export type Settings = {
  disableReconnect?: boolean;
  reconnectInterval?: number;
  mock?: MockInstance | Array<MockInstance>;
}

export type WSPath = string

export type EmitEventParams = {
  type: string;
  [key: string]: any;
}

export type ProtectedProps = {|
  isNode: boolean;
  settings: Settings;
  createConnection: (ws?: WS | WSPath) => void;
|}
