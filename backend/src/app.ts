import express, { Request, Response, NextFunction } from 'express';
import itemsRouter, { APIError } from './routes/items.js';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { db } from './db.js';

dotenv.config();

const app = express();
app.use(express.json());
app.disable("x-powered-by")

app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(req.path);
  res.set('Content-Type', 'application/json');
  next();
});

function generateSessionToken(username) {
  return jwt.sign(username, process.env.TOKEN_SECRET, { expiresIn: '1800s' });
}

if (process.env.USE_AUTH && process.env.USE_AUTH === 'true') {
  app.post('/api/createSession', async (req, res) => {
    if (!req.body.username) {
      res.status(400).json({ error: 'Username not specified' });
      return;
    }
    const token = generateSessionToken({ username: req.body.username });
    const user = db.data.sessions.find((user) => user.username === req.body.username);
    if (user) {
      user.token = token;
    } else {
      const sessionIndex = db.data.sessions.push({ username: req.body.username, token });
      setTimeout(async () => {
        console.log(`Session expire user: ${db.data.sessions[sessionIndex - 1].username}`);
        db.data.sessions = db.data.sessions.splice(sessionIndex, 1);
        await db.write();
      }, 5000);
    }
    await db.write();
    res.json({ token });
  });

  app.use(authenticateToken);
}

app.use(itemsRouter);

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]

  if (token == null) return res.sendStatus(401)

  jwt.verify(token, process.env.TOKEN_SECRET as string, (err: any, user: any) => {
    console.log(err)

    // Simple check that ensures the user is in the DB.
    if (err || !db.data.sessions.find((session) => user.username === session.username)) {
      return res.sendStatus(403)
    }

    req.user = user

    next()
  })
}

app.use((req: Request, res: Response, next: NextFunction) => {
  next(new APIError(404, `${req.method} ${req.originalUrl} not found.`));
});

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(err);  // Log the error or handle it as needed

  // If the error object has a status code set, use it
  const statusCode = err.status || 500;

  if (err instanceof APIError) {
    return res.status(err.statusCode).json(err.toJSON());
  }

  res.status(500).json({error: { message: "Internal Server Error"}});

  // Set Content-Type to JSON
  res.setHeader('Content-Type', 'application/json');

  // Send JSON error response with the correct status code
  res.status(statusCode).json({
    code: statusCode,
    message: err.message || 'Internal Server Error',
    ...(err.details && { details: err.details }), // Optional: additional error details
  });
});

// Start the server
const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, async () => {
  await db.read();
  console.log(`API Server is running on http://localhost:${PORT}`);
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