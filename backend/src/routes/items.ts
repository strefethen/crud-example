import { Router, Request, Response, NextFunction } from 'express';
import { Item, ErrorResponse, Task, TaskStatus, ItemTask } from '../models/item.js';
import { db } from '../db.js';
import { customAlphabet } from 'nanoid';
import { createTask } from '../services/tasks.js';

const nanoid = customAlphabet("ABC123456789", 5);

const router = Router();

/**
 * Represents a custom API error with an associated HTTP status code and optional details.
 * Extends the built-in `Error` class to provide additional functionality for API error handling.
 */
export class APIError extends Error {
  /**
   * The HTTP status code associated with the error.
   */
  statusCode: number;

  /**
   * Additional details about the error, if any.
   */
  details: object;

  /**
   * Constructs a new `APIError` instance.
   * 
   * @param statusCode - The HTTP status code representing the error type.
   * @param message - A descriptive error message.
   */
  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;
    this.name = 'APIError';

    // Maintains proper prototype chain (important for custom Error subclasses)
    Object.setPrototypeOf(this, new.target.prototype);
  }

  /**
   * Converts the error instance to a JSON representation.
   * 
   * @returns An object containing the error details, including the status code, message,
   *          and any additional details if provided.
   */
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
router.get('/api/items', async (req: Request, res: Response<Item[] | ErrorResponse>, next: NextFunction) => {
  const { limit, offset } = req.query;
  const index = offset ? parseInt(offset) : 0;
  if (isNaN(index)) {
    return next(new APIError(400, `Invalid offset: ${offset} is not a number.`));
  }
  const max = limit ? parseInt(limit) : 0;  
  if (isNaN(max)) {
    return next(new APIError(400, `Invalid limit: ${limit} is not a number.`));
  }
  await db.read();
  const items = limit ? db.data.items.slice(index, max + index) : db.data.items;
  res.status(200).json(items);
});

// POST /api/items - Create a new item
router.post('/api/items', async (req: Request, res: Response<Item | ErrorResponse>, next: NextFunction) => {
  const { name, description, price } = req.body;

  if (!name || !description || !price === undefined) {
    return next(new APIError(400, 'Invalid request parameters'));
  }

  const newItem: Item = {
    id: nanoid(),
    name,
    description,
    price,
    createdAt: new Date().toISOString(),  // remove decimal
  };

  db.data.items.push(newItem);
  await db.write();
  res.status(201).json(newItem);
});

// GET /api/items/:id - Retrieve a single item by ID
router.get('/api/items/:id([A-Z0-9_-]*)', async (req: Request, res: Response<Item | ErrorResponse>, next: NextFunction) => {
  const id = req.params.id;
  await db.read();
  const item = db.data.items.find((item) => item.id === id);

  if (!item) {
    return next(new APIError(404, 'Item not found'));
  }

  res.status(200).json(item);
});

// PUT /api/items/:id - Update an item by ID
router.put('/api/items/:id([A-Z0-9_-]*)', async (req: Request, res: Response<Item | ErrorResponse>, next: NextFunction) => {
  const id = req.params.id;

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
router.delete('/api/items/:id([A-Z0-9_-]*)', async (req: Request, res: Response<ErrorResponse | void>, next: NextFunction) => {
  const itemId = req.params.id;

  await db.read();
  const itemIndex = db.data.items.findIndex((item) => item.id === itemId);

  if (itemIndex === -1) {
    return next(new APIError(404, `: ${itemId}`));
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

router.post('/api/items/:id([A-Z0-9_-]*)/tasks', async (req: Request, res: Response, next: NextFunction) => {
  const { task } = req.body
  const result = await createTask('items', req.params.id, task, req, res, next);
  //('items', req.params.id, task, req, res, next);
  if (result) {
    res.status(202).json(result);
  }
});

router.post('/api/items/:id([A-Z0-9_-]*)/tasks-oneof', async (req, res, next: NextFunction) => {
  const itemId = req.params.id;

  await db.read();
  const itemIndex = db.data.items.findIndex((item) => item.id === itemId);

  if (itemIndex === -1) {
    return next(new APIError(404, `Item not found: ${itemId}`));
  }

  const { task } = req.body;

  if (!task){
    return next(new APIError(400, 'Invalid request. No task specified.'));
  }

  if (!(task in ItemTask)) {
    return next(new APIError(400, `Invalid request. Task ${task} not supported. Supported tasks are: ${Object.keys(ItemTask).filter(key => isNaN(Number(key))).join(', ')}`));
  }

  const { length, duration, seconds } = req.body;

  if (!length && !duration && !seconds) {
    return next(new APIError(400, `Invalid request. Missing task ${task} properties.`));
  }
  switch (task) {
    case ItemTask.WAIT:
      if (!length) {
        return next(new APIError(400, 'Invalid request. WaitTask requires a "length" parameter.'));
      }
      break;
    case ItemTask.PAUSE:
      if (!duration) {
        return next(new APIError(400, 'Invalid request. PauseTask requires a "duration" parameter.'));
      }
      break;
    case ItemTask.DELAY:
      if (!seconds) {
        return next(new APIError(400, 'Invalid request. DelayTask requires a "seconds" parameter.'));
      }
      break;
    default:
      break;
  }
  const itemTask: Task = {
    id: nanoid(),
    itemId: itemId,
    status: TaskStatus.PENDING,
    task: task,
    monitorUrl: `${req.protocol}://${req.hostname}/services/tasks/items/${itemId}/status`
  }
  const index = db.data.tasks.push(itemTask) - 1;
  res.status(202).json(task);
  await db.write();

  const delay = length || duration || seconds || 10000;

  setTimeout(async () => {
    db.data.tasks[index].status = TaskStatus.COMPLETED
    await db.write();
  }, delay);
});

router.get('/api/tasks/:id([A-Z0-9_-]*)', async (req, res, next: NextFunction) => {
  const taskId = req.params.id;

  await db.read();
  const taskIndex = db.data.tasks.findIndex((task) => task.id === taskId);

  if (taskIndex === -1) {
    return next(new APIError(404, `Task not found: ${taskId}`));
  }

  res.status(200).json(db.data.tasks[taskIndex]);  
});

export default router;