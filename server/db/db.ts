import { Connection, createConnection } from 'typeorm';

import ContactModel from './contact_model';
import MessageModel from './message_model';

let connection: Connection|null = null;

const callbacks: ((connection: Connection) => void)[] = [];

export function onConnect(cb: (connection: Connection) => void) {
  if (connection) {
    cb(connection);
  } else {
    callbacks.push(cb);
  }
}

createConnection({
  type: 'sqlite',
  database: 'chat.db',
  entities: [
    ContactModel,
    MessageModel,
  ],
  synchronize: true,
}).then(c => {
  console.log(`Successfully connected to database.`);
  connection = c;
  for (const cb of callbacks) {
    cb(connection);
  }
  callbacks.splice(0, callbacks.length);
}).catch(error => {
  console.log('Error connecting to database:');
  console.log(error);
});
