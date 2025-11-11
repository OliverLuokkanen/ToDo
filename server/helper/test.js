import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { pool } from '../db.js'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const JWT_SECRET = process.env.JWT_SECRET || process.env.JWT_SECRET_KEY

// initializeTestDb now returns a Promise so tests can await it
const initializeTestDb = async () => {
  try {
    const sqlPath = path.resolve(__dirname, '..', 'todo.sql') // todo.sql should be in server/
    if (!fs.existsSync(sqlPath)) {
      throw new Error(`todo.sql not found at ${sqlPath}`)
    }
    const sql = fs.readFileSync(sqlPath, 'utf8')
    await pool.query(sql)
    console.log('Test database initialized successfully')
  } catch (err) {
    console.error('Error initializing test database:', err)
    throw err
  }
}

const insertTestUser = async (user) => {
  try {
    const hashedPassword = await bcrypt.hash(user.password, 10)
    await pool.query(
      'INSERT INTO account (email, password) VALUES ($1, $2)',
      [user.email, hashedPassword]
    )
    console.log('Test user inserted successfully')
  } catch (err) {
    console.error('Error inserting test user:', err)
    throw err
  }
}

const getToken = (email) => {
  if (!JWT_SECRET) {
    throw new Error('JWT secret is not configured on server (JWT_SECRET or JWT_SECRET_KEY)')
  }
  return jwt.sign({ email }, JWT_SECRET)
}

export { initializeTestDb, insertTestUser, getToken }