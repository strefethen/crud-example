import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import itemsRoutes from './routes/items.js';

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Routes
app.use(itemsRoutes);

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});