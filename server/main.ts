import https from 'https';
import fs from 'fs';
import { spawn, spawnSync } from 'child_process';
import Koa from 'koa';
import auth from 'koa-basic-auth';
import serve from 'koa-static';
import * as WebSocket from 'ws';

import { onConnect } from './db/db';
import ContactModel from './db/contact_model';
import MessageModel from './db/message_model';

const certChainLocation = process.argv[2];
const certKeyLocation = process.argv[3];
const port = Number.parseInt(process.argv[4]);
const username = process.argv[5];
const password = process.argv[6];

// Configure interface server
const app = new Koa();
app.use(auth({
  name: username,
  pass: password,
}));
app.use(serve('public'));

const server = https.createServer({
  key: fs.readFileSync(certKeyLocation),
  cert: fs.readFileSync(certChainLocation),
}, app.callback())

// Configure WebSocket server
const webSocketServer = new WebSocket.Server({ server: server });

webSocketServer.on('connection', (ws: WebSocket) => {
  ws.on('message', async (message) => {
    const messageObject = JSON.parse(message.toString());
    switch(messageObject.type) {
      case 'refresh':
        refresh(ws);
        break;
      case 'send':
        const error = sendMessage(messageObject.fqdn, messageObject.message);
        if (!error) {
          const newMessage = new MessageModel();
          newMessage.contact = await ContactModel.getOrCreate(messageObject.fqdn);
          newMessage.message = messageObject.message;
          newMessage.isSender = true;
          await newMessage.save();
        }
        ws.send(JSON.stringify({
          type: 'confirmation',
          message: messageObject,
          sent: !error,
          error: error,
        }));
        break;
    }
  });
  refresh(ws);
});

async function refresh(ws: WebSocket) {
  ws.send(JSON.stringify({
    type: 'refresh',
    messages: await getAllMessages(),
  }));
}

type MessageCollection = {contact: ContactModel, messages: MessageModel[]};

async function getAllMessages(): Promise<MessageCollection[]> {
  const messagesMap: Map<number, MessageModel[]> = new Map();
  const contactsMap: Map<number, ContactModel> = new Map();
  const resultsArray: MessageCollection[] = [];
  const messages = await MessageModel.find({});
  for (const message of messages) {
    if (!messagesMap.has(message.contact.id)) {
      messagesMap.set(message.contact.id, []);
      contactsMap.set(message.contact.id, message.contact);
    }
    messagesMap.get(message.contact.id)!.push(message);
    delete message.contact;
  }
  for (const contactId of contactsMap.keys()) {
    resultsArray.push({
      contact: contactsMap.get(contactId)!,
      messages: messagesMap.get(contactId)!,
    });
  }
  return resultsArray;
}

// Start simplest chat server
const chatServer = spawn('node', [
  'node_modules/simplest_chat/chat_server.js',
  certChainLocation,
  certKeyLocation,
  "" + (port - 1),
]);

chatServer.stdout.on('data', async (data) => {
  const output = data.toString();
  if (output.indexOf(': ') === -1) {
    return;
  }
  const parts = output.split(': ');
  const newMessage = new MessageModel();
  newMessage.contact = await ContactModel.getOrCreate(parts[0]);
  newMessage.message = parts[1];
  newMessage.isSender = false;
  newMessage.save();
  for (const ws of webSocketServer.clients) {
    refresh(<WebSocket> ws);
  }
});

chatServer.stderr.on('data', data => {
  console.error('Chat Server Error: ' + data.toString());
});

function sendMessage(destinationFQDN: string, message: string): string|null {
  const result = spawnSync('node', [
    'node_modules/simplest_chat/send_message.js',
    certChainLocation,
    certKeyLocation,
    destinationFQDN,
    '443',
    message,
  ]);
  const errorMessage = result.stderr.toString();
  const output = result.stdout.toString();
  if (errorMessage.length > 0) {
    console.log(errorMessage);
    return errorMessage;
  } else if (output !== 'message sent!'){
    console.log(output);
    return output;
  } else {
    return null;
  }
}

// Start interface server once connected to the database
onConnect(async () => {
  server.listen(port);
  console.log(`Started simplest chat interface on port ${ port }.`);
});
