import { Router } from 'express';
const router = Router();
// In-memory database for items
let items = [
    {
        id: 1,
        name: 'Sample Item 1',
        description: 'This is a sample item 1.',
        price: 9.99,
        createdAt: '2023-01-01T00:00:00Z',
    },
    {
        id: 2,
        name: 'Sample Item 2',
        description: 'This is a sample item 2.',
        price: 19.99,
        createdAt: '2023-01-02T00:00:00Z',
    },
];
// GET /api/items - Retrieve all items
router.get('/api/items', (req, res) => {
    res.status(200).json(items);
});
// POST /api/items - Create a new item
router.post('/api/items', (req, res) => {
    const { name, description, price } = req.body;
    if (!name || !description || price === undefined) {
        return res.status(400).json({ code: 400, message: 'Invalid request parameters' });
    }
    const newItem = {
        id: items.length + 1,
        name,
        description,
        price,
        createdAt: new Date().toISOString(),
    };
    items.push(newItem);
    res.status(201).json(newItem);
});
// GET /api/items/:id - Retrieve a single item by ID
router.get('/api/items/:id', (req, res) => {
    const id = parseInt(req.params.id, 10);
    const item = items.find((item) => item.id === id);
    if (!item) {
        return res.status(404).json({ code: 404, message: 'Item not found' });
    }
    res.status(200).json(item);
});
// PUT /api/items/:id - Update an item by ID
router.put('/api/items/:id', (req, res) => {
    const id = parseInt(req.params.id, 10);
    const { name, description, price } = req.body;
    const itemIndex = items.findIndex((item) => item.id === id);
    if (itemIndex === -1) {
        return res.status(404).json({ code: 404, message: 'Item not found' });
    }
    if (!name || !description || price === undefined) {
        return res.status(400).json({ code: 400, message: 'Invalid request parameters' });
    }
    items[itemIndex] = { ...items[itemIndex], name, description, price };
    res.status(200).json(items[itemIndex]);
});
// DELETE /api/items/:id - Delete an item by ID
router.delete('/api/items/:id', (req, res) => {
    const id = parseInt(req.params.id, 10);
    const itemIndex = items.findIndex((item) => item.id === id);
    if (itemIndex === -1) {
        return res.status(404).json({ code: 404, message: 'Item not found' });
    }
    items.splice(itemIndex, 1);
    res.status(204).send();
});
export default router;
//# sourceMappingURL=items.js.map