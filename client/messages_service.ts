import { onMessage, send } from './web_socket_service';

export type Contact = {id: number, fqdn: string};
export type Message = {message: string, isSender: boolean, timestamp: string};
export type MessageCollection = {contact: Contact, messages: Message[]};

const customContacts: Set<string> = new Set();
let allMessages: Map<string, MessageCollection> = new Map();
let pendingMessages: Map<string, MessageCollection> = new Map();

type Callback = (messages: Map<string, MessageCollection>) => void;
const callbacks: Callback[] = [];
const errorCallbacks: ((error: string) => void)[] = [];
const error: string = '';

export function getAllMessages(): Map<string, MessageCollection> {
  return allMessages;
}

onMessage('refresh', (data) => {
  allMessages = new Map();
  for (const messageCollection of data.messages) {
    allMessages.set(messageCollection.contact.fqdn, messageCollection);
  }
  applyMissingContacts();
  for (const cb of callbacks) {
    cb(allMessages);
  }
});

onMessage('confirmation', (data) => {
  send('refresh', {});
  if (data.error) {
    for (const cb of errorCallbacks) {
      cb('Failed to send message to ' + data.message.fqdn + ': ' + data.message.message + '\n\nError: ' + data.error);
    }
  }
});

export function onUpdate(cb: Callback) {
  callbacks.push(cb);
}

export function onError(cb: (error: string) => void) {
  errorCallbacks.push(cb);
}

export function sendMessage(fqdn: string, message: string) {
  send('send', {
    fqdn: fqdn,
    message: message,
  })
}

export function addContact(fqdn: string) {
  customContacts.add(fqdn);
  applyMissingContacts();
  for (const cb of callbacks) {
    cb(allMessages);
  }
}

function applyMissingContacts() {
  customContacts.forEach(fqdn => {
    if (!allMessages.has(fqdn)) {
      allMessages.set(fqdn, {
        contact: {id: -1, fqdn: fqdn},
        messages: [],
      });
    }
  })
}
