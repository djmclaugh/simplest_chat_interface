type Callback = (message: any) => void;

const callbacks = new Map<string, Callback[]>();

const httpsUrl: string = window.location.href;
const url = httpsUrl.replace('https', 'wss');
let ws: WebSocket;

function connect() {
  if (ws) {
    ws.close();
  }
  ws = new WebSocket(url);
  ws.onmessage = (event) => {
    //console.log('Received: ' + event.data);
    const message = JSON.parse(event.data);
    for (const cb of getOrCreateList(message.type)) {
      cb(message);
    }
  };
}

connect();

function getOrCreateList(type: string) {
  let list = callbacks.get(type);
  if (!list) {
    list = [];
    callbacks.set(type, list);
  }
  return list;
}

export function onMessage(type: string, cb: Callback) {
  getOrCreateList(type).push(cb);
}

export function stopListening(type: string, cb: Callback) {
  const list = getOrCreateList(type);
  const index = list.indexOf(cb);
  if (index !== -1) {
    list.splice(index, 1);
  }
}

export function send(type: string, message: any): string|null {
  if (ws.readyState !== WebSocket.OPEN) {
    if (ws.readyState !== WebSocket.CONNECTING) {
      connect();
    }
    return "Lost connection to server. Attempting to reconnect. Please try again.";
  }
  message.type = type;
  try {
    ws.send(JSON.stringify(message));
  } catch(e) {
    console.log(e);
    connect();
    return "Error sending message. Try again."
  }
  return null;
}
