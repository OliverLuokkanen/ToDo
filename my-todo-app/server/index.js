import express from 'express';
import cors from 'cors';
import pkg from 'pg';
// Optional: uncomment if you use .env
// import dotenv from 'dotenv';

// Optional: load environment variables from .env
// dotenv.config();

const { Pool } = pkg;

function openDb() {
  return new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'todo',
    password: 'OliverL17', // sama salasana kuin kontissa
    port: 5434
  });
}
const dbTestPool = openDb();
dbTestPool.query('SELECT current_database()', (err, res) => {
  if (err) {
    console.error('DB TEST ERROR:', err);
  } else {
    console.log('DB TEST connected to database:', res.rows[0].current_database);
  }
});

const pool = openDb();
const app = express();
const port = 3001;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Simple request logging (optional enhancement)
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// GET / - list all tasks
app.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM task ORDER BY id ASC');
    return res.status(200).json(result.rows);
  } catch (err) {
    console.error('Error fetching tasks:', err);
    return res.status(500).json({ error: err.message });
  }
});

// POST /create - create a new task
app.post('/create', async (req, res) => {
  try {
    // Accept both { description } and { task: { description } }
    let description = null;

    if (typeof req.body.description === 'string') {
      description = req.body.description;
    } else if (req.body.task && typeof req.body.task.description === 'string') {
      description = req.body.task.description;
    }

    if (!description || !description.trim()) {
      return res.status(400).json({ error: 'Task is required' });
    }

    const trimmed = description.trim();

    // Optional validation: max 255 chars
    if (trimmed.length > 255) {
      return res.status(400).json({ error: 'Task must be at most 255 characters' });
    }

    const insertQuery =
      'INSERT INTO task (description) VALUES ($1) RETURNING id, description';
    const result = await pool.query(insertQuery, [trimmed]);
    const inserted = result.rows[0];

    return res.status(201).json(inserted);
  } catch (err) {
    console.error('Error creating task:', err);
    return res.status(500).json({ error: err.message });
  }
});

// DELETE /delete/:id - delete a task by id
app.delete('/delete/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const numericId = Number(id);

    if (!Number.isInteger(numericId) || numericId <= 0) {
      return res.status(400).json({ error: 'Invalid id' });
    }

    const deleteQuery = 'DELETE FROM task WHERE id = $1';
    const result = await pool.query(deleteQuery, [numericId]);

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }

    return res.status(200).json({ id: numericId });
  } catch (err) {
    console.error('Error deleting task:', err);
    return res.status(500).json({ error: err.message });
  }
});

// Optional enhancement: GET /health
app.get('/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    return res.status(200).json({ status: 'ok' });
  } catch (err) {
    console.error('Health check failed:', err);
    return res.status(500).json({ status: 'error', error: err.message });
  }
});

// Optional enhancement: PUT /update/:id - update task description
app.put('/update/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const numericId = Number(id);

    if (!Number.isInteger(numericId) || numericId <= 0) {
      return res.status(400).json({ error: 'Invalid id' });
    }

    let { description } = req.body;
    if (!description || !description.trim()) {
      return res.status(400).json({ error: 'Task is required' });
    }

    description = description.trim();
    if (description.length > 255) {
      return res.status(400).json({ error: 'Task must be at most 255 characters' });
    }

    const updateQuery =
      'UPDATE task SET description = $1 WHERE id = $2 RETURNING id, description';
    const result = await pool.query(updateQuery, [description, numericId]);

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }

    return res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error('Error updating task:', err);
    return res.status(500).json({ error: err.message });
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});