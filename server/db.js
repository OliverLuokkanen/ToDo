import dotenv from 'dotenv'
import { Pool } from 'pg'

dotenv.config()

const environment = process.env.NODE_ENV || 'development'
const database = environment === 'test'
  ? (process.env.TEST_DB_NAME || process.env.PGDATABASE)
  : process.env.PGDATABASE

const pool = new Pool({
  user: process.env.PGUSER,
  host: process.env.PGHOST,
  database,
  password: process.env.PGPASSWORD,
  port: process.env.PGPORT ? Number(process.env.PGPORT) : 5432,
})

export { pool }