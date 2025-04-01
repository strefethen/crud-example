import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import { Item} from './models/item.js';
import { User } from './models/user.js';

interface JSONData {
  items: Item[];
  sessions: User[];
}

const defaultData = { 
  items: [],
  sessions: []
}

// Configure lowdb, extremely light-weight DB for persistence.
const jsonDB = './db.json';
const adapter = new JSONFile<JSONData>(jsonDB);
export const db = new Low(adapter, defaultData);
