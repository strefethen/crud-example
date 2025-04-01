import { Router, Request, Response, NextFunction } from 'express';
import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import { Item, ErrorResponse, Task, TaskStatus } from '../models/item.js';

const router = Router();

class HttpError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message); // Call the base class constructor with the message
    this.status = status; // Set the status code
    this.name = this.constructor.name; // Set the error name to the class name
    Object.setPrototypeOf(this, HttpError.prototype); // Set the prototype correctly
  }
}

// Configure lowdb
const file = './db.json'; // Path to the "database" file
const adapter = new JSONFile<{ items: Item[], tasks: Task[] }>(file);
const db = new Low(adapter, { items: [], tasks: [] });

// Initialize the database
await db.read();
db.data ||= { items: [], tasks: [] }; // Initialize with an empty array if no data exists
await db.write();

// GET /api/items - Retrieve all items
router.get('/api/items', async (req: Request, res: Response<Item[] | ErrorResponse>) => {
  await db.read();
  res.status(200).json(db.data.items);
});

// POST /api/items - Create a new item
router.post('/api/items', async (req: Request, res: Response<Item | ErrorResponse>, next: NextFunction) => {
  const { name, description, price } = req.body;

  if (!name || !description || price === undefined) {
    return next(new HttpError(400, 'Invalid request parameters'));
  }

  const newItem: Item = {
    id: db.data.items.length + 1,
    name,
    description,
    price,
    createdAt: new Date().toISOString(),
  };

  db.data.items.push(newItem);
  await db.write();
  res.status(201).json(newItem);
});

// GET /api/items/:id - Retrieve a single item by ID
router.get('/api/items/:id([0-9]*)', async (req: Request, res: Response<Item | ErrorResponse>, next: NextFunction) => {
  const id = parseInt(req.params.id, 10);
  await db.read();
  const item = db.data.items.find((item) => item.id === id);

  if (!item) {
    return next(new HttpError(404, 'Item not found'));
  }

  res.status(200).json(item);
});

// PUT /api/items/:id - Update an item by ID
router.put('/api/items/:id([0-9]*)', async (req: Request, res: Response<Item | ErrorResponse>, next: NextFunction) => {
  const id = parseInt(req.params.id, 10);
  const { name, description, price } = req.body;

  await db.read();
  const itemIndex = db.data.items.findIndex((item) => item.id === id);

  if (itemIndex === -1) {
    return next(new HttpError(404, 'Item not found'));
  }

  if (!name || !description || price === undefined) {
    return next(new HttpError(400, 'Invalid request parameters'));
  }

  db.data.items[itemIndex] = { ...db.data.items[itemIndex], name, description, price };
  await db.write();
  res.status(200).json(db.data.items[itemIndex]);
});

// DELETE /api/items/:id - Delete an item by ID
router.delete('/api/items/:id([0-9]*)', async (req: Request, res: Response<ErrorResponse | void>, next: NextFunction) => {
  console.log("Delete")
  const id = parseInt(req.params.id, 10);

  await db.read();
  const itemIndex = db.data.items.findIndex((item) => item.id === id);

  if (itemIndex === -1) {
    return next(new HttpError(404, `Item not found: ${id}`));
  }

  db.data.items.splice(itemIndex, 1);
  await db.write();
  res.status(204).send();
});

// GET /api/items/count - Retrieve the count of items
router.get('/api/items/count', async (req: Request, res: Response<{ count: number } | ErrorResponse>) => {
  await db.read();
  const count = db.data.items.length;
  res.status(200).json({ count });
});

router.post('/api/items/:id([0-9]*/actions)', async (req, res, next: NextFunction) => {
  const itemId = parseInt(req.params.id, 10);

  await db.read();
  const itemIndex = db.data.items.findIndex((item) => item.id === itemId);

  if (itemIndex === -1) {
    return next(new HttpError(404, `Item not found: ${itemId}`));
  }

  const { action } = req.body;

  if (!action){
    return next(new HttpError(400, 'Invalid request. Missing action'));
  }

  const task: Task = {
    id: db.data.tasks.length,
    itemId: itemId,
    status: TaskStatus.PENDING,
    action: action
  }
  const index = db.data.tasks.push(task) - 1;
  res.status(202).json(task);
  await db.write();

  setTimeout(async () => {
    db.data.tasks[index].status = TaskStatus.COMPLETED
    await db.write();
  }, 10000);
});

router.get('/api/tasks/:id([0-9]*)', async (req, res, next: NextFunction) => {
  try {
    let taskId = -1;

    try {
      taskId = parseInt(req.params.id, 10);
    } catch(err) {
      return next(new HttpError(400, `Invalid task ID: ${req.params.id}`));
    }

    await db.read();
    const taskIndex = db.data.tasks.findIndex((task) => task.id === taskId);
  
    if (taskIndex === -1) {
      return next(new HttpError(404, `Task not found: ${taskId}`));
    }
  
    res.status(200).json(db.data.tasks[taskIndex]);  
  } catch(err) {
    return next(new HttpError(500, `Unknown Error: ${err.message}`));
  }
});

export default router;