import pg from 'pg'
import dotenv from 'dotenv'

dotenv.config()

const { Pool } = pg

const isTest = process.env.NODE_ENV === 'test'
const databaseName = isTest
  ? process.env.TEST_DB_NAME || process.env.PGDATABASE
  : process.env.PGDATABASE

export const pool = new Pool({
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  host: process.env.PGHOST || 'localhost',
  port: process.env.PGPORT ? Number(process.env.PGPORT) : 5432,
  database: databaseName
})