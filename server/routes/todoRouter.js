import { Router } from 'express'
import { pool } from '../db.js'
import { auth } from '../helper/auth.js'

const router = Router()

// GET / - list all tasks
router.get('/', async (req, res, next) => {
  try {
    const { rows } = await pool.query('SELECT * FROM task')
    res.status(200).json(rows || [])
  } catch (err) {
    next(err)
  }
})

// POST /create - create a new task (requires auth)
router.post('/create', auth, async (req, res, next) => {
  try {
    const payload = (req.body && (req.body.task || req.body)) || {}
    const description = payload.description

    if (!description || description.toString().trim() === '') {
      const error = new Error('Task is required')
      error.status = 400
      return next(error)
    }

    const result = await pool.query(
      'INSERT INTO task (description) VALUES ($1) RETURNING id, description',
      [description]
    )

    res.status(201).json({ id: result.rows[0].id, description: result.rows[0].description })
  } catch (err) {
    next(err)
  }
})

// DELETE /delete/:id - delete a task by id (requires auth)
router.delete('/delete/:id', auth, async (req, res, next) => {
  try {
    const id = Number(req.params.id)
    if (Number.isNaN(id)) {
      const error = new Error('Invalid id')
      error.status = 400
      return next(error)
    }

    const result = await pool.query('DELETE FROM task WHERE id = $1 RETURNING id', [id])

    if (!result.rows.length) {
      const error = new Error('Task not found')
      error.status = 404
      return next(error)
    }

    res.status(200).json({ id: result.rows[0].id })
  } catch (err) {
    next(err)
  }
})

export default router