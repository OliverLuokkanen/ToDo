import dotenv from "dotenv";
import pkg from "pg";

dotenv.config();

const { Pool } = pkg;

const environment = process.env.NODE_ENV || "development";

const config = {
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database:
    environment === "development"
      ? process.env.DB_NAME
      : process.env.TEST_DB_NAME,
  password: process.env.DB_PASSWORD,
  port: Number(process.env.DB_PORT)
};

if (!config.user || !config.host || !config.database) {
  // Selkeä virhe, jos konfiguraatio puuttuu
  // Tämä näkyy backendin käynnistyksessä
  console.warn(
    "[DB CONFIG WARNING] Some database environment variables are missing:",
    config
  );
}

const pool = new Pool(config);

export { pool };