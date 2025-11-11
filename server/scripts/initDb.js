import dotenv from 'dotenv'
import { Pool } from 'pg'

dotenv.config()

// Kun haluat alustaa testitietokannan, aseta NODE_ENV=test ennen skriptin ajoa
// tai varmista että .env sisältää TEST_DB_NAME-arvon.
const environment = process.env.NODE_ENV || 'development'
const targetDb = environment === 'test' ? (process.env.TEST_DB_NAME || process.env.PGDATABASE) : (process.env.PGDATABASE)

if (!targetDb) {
  console.error('Database name not found. Set PGDATABASE or TEST_DB_NAME in .env')
  process.exit(1)
}

const pool = new Pool({
  user: process.env.PGUSER,
  host: process.env.PGHOST,
  database: targetDb,
  password: process.env.PGPASSWORD,
  port: process.env.PGPORT ? Number(process.env.PGPORT) : 5432,
})

const initSql = `
DROP TABLE IF EXISTS task;
CREATE TABLE task (
  id SERIAL PRIMARY KEY,
  description VARCHAR(255) NOT NULL
);

INSERT INTO task (description) VALUES ('My test task');
INSERT INTO task (description) VALUES ('My other test task');
`

async function init() {
  try {
    console.log(`Initializing database "${targetDb}" (NODE_ENV=${environment})...`)
    await pool.query(initSql)
    console.log('Database initialized successfully.')
  } catch (err) {
    console.error('Error initializing database:', err)
    process.exitCode = 1
  } finally {
    await pool.end()
  }
}

init()