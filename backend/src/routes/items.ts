import { Router, Request, Response, NextFunction } from 'express';
import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import { Item, ErrorResponse } from '../models/item.js';

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
const file = './db.json'; // Path to the database file
const adapter = new JSONFile<{ items: Item[] }>(file);
const db = new Low(adapter, { items: [] });

// Initialize the database
await db.read();
db.data ||= { items: [] }; // Initialize with an empty array if no data exists
await db.write();

router.use((req: Request, res: Response, next: NextFunction) => {
  console.log(req.path);
  res.set('Content-Type', 'application/json');
  next();
});

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
    return next(new HttpError(404, "Item not found"));
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

router.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(err);  // Log the error or handle it as needed

  // If the error object has a status code set, use it
  const statusCode = err.status || 500;

  // Set Content-Type to JSON
  res.setHeader('Content-Type', 'application/json');

  // Send JSON error response with the correct status code
  res.status(statusCode).json({
    code: statusCode,
    message: err.message || 'Internal Server Error',
    ...(err.details && { details: err.details }), // Optional: additional error details
  });
});

export default router;