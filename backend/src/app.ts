import express from 'express';
import itemsRouter from './routes/items.js';
import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';

// Configure lowdb
const file = './db.json';
const adapter = new JSONFile<{ items: any[] }>(file);
const db = new Low(adapter, { items: [] });

const app = express();
app.use(express.json());
app.use('/api', itemsRouter);

// Start the server
const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

// Graceful shutdown
const shutdown = async () => {
  console.log('Shutting down server...');
  await db.write(); // Ensure the database is saved to disk
  console.log('Database saved.');
  server.close(() => {
    console.log('Server closed.');
    process.exit(0);
  });
};

// Handle termination signals
process.on('SIGINT', shutdown); // Handle Ctrl+C
process.on('SIGTERM', shutdown); // Handle termination signal