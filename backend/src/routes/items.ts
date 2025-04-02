import { Router, Request, Response, NextFunction } from 'express';
import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import { Item, ErrorResponse, Task, TaskStatus, ItemAction } from '../models/item.js';
import { db } from '../db.js';

const router = Router();

export class APIError extends Error {
  statusCode: number;
  details: object;

  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;
    this.name = 'APIError';

    // Maintains proper prototype chain (important for custom Error subclasses)
    Object.setPrototypeOf(this, new.target.prototype);
  }

  toJSON() {
    return {
      error: {
        statusCode: this.statusCode,
        message: this.message || 'Internal Server Error',
        ...(this.details && { details: this.details }), // Optional: additional error details
      },
    };
  }
}

// GET /api/items - Retrieve all items
router.get('/api/items', async (req: Request, res: Response<Item[] | ErrorResponse>) => {
  await db.read();
  res.status(200).json(db.data.items);
});

// POST /api/items - Create a new item
router.post('/api/items', async (req: Request, res: Response<Item | ErrorResponse>, next: NextFunction) => {
  const { name, description, price } = req.body;

  if (!name || !description || !price === undefined) {
    return next(new APIError(400, 'Invalid request parameters'));
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
    return next(new APIError(404, 'Item not found'));
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
    return next(new APIError(404, 'Item not found'));
  }

  if (!name || !description || price === undefined) {
    return next(new APIError(400, 'Invalid request parameters'));
  }

  db.data.items[itemIndex] = { ...db.data.items[itemIndex], name, description, price };
  await db.write();
  res.status(200).json(db.data.items[itemIndex]);
});

// DELETE /api/items/:id - Delete an item by ID
router.delete('/api/items/:id([0-9]*)', async (req: Request, res: Response<ErrorResponse | void>, next: NextFunction) => {
  const itemId = parseInt(req.params.id, 10);

  await db.read();
  const itemIndex = db.data.items.findIndex((item) => item.id === itemId);

  if (itemIndex === -1) {
    return next(new APIError(404, `Item not found: ${itemId}`));
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
    return next(new APIError(404, `Item not found: ${itemId}`));
  }

  const { action } = req.body;

  if (!action){
    return next(new APIError(400, 'Invalid request. No action specified.'));
  }

  if (!(action in ItemAction)) {
    return next(new APIError(400, `Invalid request. Action ${action} not supported.`));
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

router.post('/api/items/:id([0-9]*/actions-oneOf)', async (req, res, next: NextFunction) => {
  const itemId = parseInt(req.params.id, 10);

  await db.read();
  const itemIndex = db.data.items.findIndex((item) => item.id === itemId);

  if (itemIndex === -1) {
    return next(new APIError(404, `Item not found: ${itemId}`));
  }

  const { action } = req.body;

  if (!action){
    return next(new APIError(400, 'Invalid request. No action specified.'));
  }

  if (!(action in ItemAction)) {
    return next(new APIError(400, `Invalid request. Action ${action} not supported. Supported actions are: ${Object.keys(ItemAction).filter(key => isNaN(Number(key))).join(', ')}`));
  }

  const { length, duration, seconds } = req.body;

  if (!length && !duration && !seconds) {
    return next(new APIError(400, `Invalid request. Missing action ${action} properties.`));
  }
  switch (action) {
    case ItemAction.WAIT:
      if (!length) {
        return next(new APIError(400, 'Invalid request. WaitAction requires a "length" parameter.'));
      }
      break;
    case ItemAction.PAUSE:
      if (!duration) {
        return next(new APIError(400, 'Invalid request. PauseAction requires a "duration" parameter.'));
      }
      break;
    case ItemAction.DELAY:
      if (!seconds) {
        return next(new APIError(400, 'Invalid request. DelayAction requires a "seconds" parameter.'));
      }
      break;
    default:
      break;
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

  const delay = length || duration || seconds || 10000;

  setTimeout(async () => {
    db.data.tasks[index].status = TaskStatus.COMPLETED
    await db.write();
  }, delay);
});

router.get('/api/tasks/:id([0-9]*)', async (req, res, next: NextFunction) => {
  const taskId = parseInt(req.params.id, 10);

  await db.read();
  const taskIndex = db.data.tasks.findIndex((task) => task.id === taskId);

  if (taskIndex === -1) {
    return next(new APIError(404, `Task not found: ${taskId}`));
  }

  res.status(200).json(db.data.tasks[taskIndex]);  
});

export default router;