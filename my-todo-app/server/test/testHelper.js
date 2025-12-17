import pkg from "pg";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pkg;

// Käytetään TEST_DB_NAME / DATABASE_URL_TEST-konfiguraatiota helper/db.js:n tyyliin
const environment = process.env.NODE_ENV || "test";

const configFromEnv = () => {
  // Jos haluat käyttää DATABASE_URL_TEST-tyyppistä env-arvoa, voit laajentaa tätä.
  if (process.env.DATABASE_URL_TEST) {
    return {
      connectionString: process.env.DATABASE_URL_TEST
    };
  }

  const dbName =
    environment === "test"
      ? process.env.TEST_DB_NAME
      : process.env.DB_NAME;

  return {
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: dbName,
    password: process.env.DB_PASSWORD,
    port: Number(process.env.DB_PORT)
  };
};

const pool = new Pool(configFromEnv());

export async function initializeTestDb() {
  // Pyyhitään ja luodaan skeema puhtaaksi testejä varten
  await pool.query("DROP TABLE IF EXISTS task CASCADE;");
  await pool.query("DROP TABLE IF EXISTS account CASCADE;");

  await pool.query(`
    CREATE TABLE IF NOT EXISTS account (
      id SERIAL PRIMARY KEY,
      email VARCHAR(255) NOT NULL UNIQUE,
      password_hash VARCHAR(255) NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS task (
      id SERIAL PRIMARY KEY,
      description VARCHAR(255) NOT NULL
    );
  `);
}

export async function insertTestUser(email = "test@example.com", password = "password") {
  const saltRounds = 10;
  const passwordHash = await bcrypt.hash(password, saltRounds);

  const result = await pool.query(
    "INSERT INTO account (email, password_hash) VALUES ($1, $2) RETURNING id, email",
    [email.toLowerCase(), passwordHash]
  );

  return result.rows[0];
}

export function createTokenForUser(user) {
  const secret = process.env.JWT_SECRET || "test_secret";
  const payload = {
    id: user.id,
    email: user.email
  };
  return jwt.sign(payload, secret, { expiresIn: "1h" });
}