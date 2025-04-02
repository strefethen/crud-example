import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import { Item } from './models/item.js';
import { User } from './models/user.js';

interface JSONData {
  items: Item[];
  sessions: User[];
  tasks: []
}

const defaultData = { 
  items: [],
  sessions: [],
  tasks: []
}

// Configure lowdb
const file = './db.json'; // Path to the "database" file
const adapter = new JSONFile<JSONData>(file);
export const db = new Low(adapter, defaultData);

// Initialize the database
await db.read();
db.data ||= defaultData; // Initialize with an empty array if no data exists
await db.write();
