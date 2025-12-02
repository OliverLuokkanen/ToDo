import { Router } from 'express'
import { pool } from '../db.js'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

const router = Router()

const JWT_SECRET = process.env.JWT_SECRET || process.env.JWT_SECRET_KEY

router.post('/signup', async (req, res, next) => {
  try {
    const user = (req.body && (req.body.user || req.body)) || {}

    if (!user.email || !user.password) {
      const err = new Error('Email and password are required')
      err.status = 400
      return next(err)
    }

    if (!JWT_SECRET) {
      const err = new Error(
        'JWT secret is not set on server (JWT_SECRET or JWT_SECRET_KEY)'
      )
      err.status = 500
      return next(err)
    }

    const hashed = await bcrypt.hash(user.password, 10)

    const result = await pool.query(
      'INSERT INTO account (email, password) VALUES ($1, $2) RETURNING id, email',
      [user.email, hashed]
    )

    res.status(201).json({
      id: result.rows[0].id,
      email: result.rows[0].email
    })
  } catch (err) {
    // unique violation
    if (err.code === '23505') {
      const e = new Error('Email already exists')
      e.status = 409
      return next(e)
    }
    next(err)
  }
})

router.post('/signin', async (req, res, next) => {
  try {
    const user = (req.body && (req.body.user || req.body)) || {}

    if (!user.email || !user.password) {
      const err = new Error('Email and password are required')
      err.status = 400
      return next(err)
    }

    if (!JWT_SECRET) {
      const err = new Error(
        'JWT secret is not set on server (JWT_SECRET or JWT_SECRET_KEY)'
      )
      err.status = 500
      return next(err)
    }

    const { rows } = await pool.query(
      'SELECT * FROM account WHERE email = $1',
      [user.email]
    )

    if (!rows.length) {
      const err = new Error('User not found')
      err.status = 404
      return next(err)
    }

    const dbUser = rows[0]
    const isMatch = await bcrypt.compare(user.password, dbUser.password)

    if (!isMatch) {
      const err = new Error('Invalid password')
      err.status = 401
      return next(err)
    }

    const token = jwt.sign({ email: dbUser.email }, JWT_SECRET)

    res.status(200).json({
      id: dbUser.id,
      email: dbUser.email,
      token
    })
  } catch (err) {
    next(err)
  }
})

export default router