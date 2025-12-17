import { Router } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { pool } from "../helper/db.js";

const router = Router();

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "1h";

if (!JWT_SECRET) {
  console.warn(
    "[AUTH WARNING] JWT_SECRET is not set. Set it in .env for production use."
  );
}

/**
 * POST /user/signup
 * Body: { email, password }
 *
 * 201: { id, email }
 * 400: puuttuvat kentät
 * 409: duplikaatti email
 */
router.post("/signup", async (req, res, next) => {
  try {
    const email = (req.body?.email || "").trim().toLowerCase();
    const password = req.body?.password || "";

    if (!email || !password) {
      const error = new Error("Email and password are required");
      error.status = 400;
      return next(error);
    }

    const existing = await pool.query(
      "SELECT id FROM account WHERE email = $1",
      [email]
    );
    if (existing.rowCount > 0) {
      const error = new Error("Email already registered");
      error.status = 409;
      return next(error);
    }

    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    const insert = await pool.query(
      "INSERT INTO account (email, password_hash) VALUES ($1, $2) RETURNING id, email",
      [email, passwordHash]
    );
    const user = insert.rows[0];

    res.status(201).json({
      id: user.id,
      email: user.email
    });
  } catch (err) {
    return next(err);
  }
});

/**
 * POST /user/signin
 * Body: { email, password }
 *
 * 200: { id, email, token }
 * 400: puuttuvat kentät
 * 401: väärä email tai salasana
 */
router.post("/signin", async (req, res, next) => {
  try {
    const email = (req.body?.email || "").trim().toLowerCase();
    const password = req.body?.password || "";

    if (!email || !password) {
      const error = new Error("Email and password are required");
      error.status = 400;
      return next(error);
    }

    const result = await pool.query(
      "SELECT id, email, password_hash FROM account WHERE email = $1",
      [email]
    );
    if (result.rowCount === 0) {
      const error = new Error("Invalid email or password");
      error.status = 401;
      return next(error);
    }

    const user = result.rows[0];

    const passwordMatches = await bcrypt.compare(
      password,
      user.password_hash
    );
    if (!passwordMatches) {
      const error = new Error("Invalid email or password");
      error.status = 401;
      return next(error);
    }

    const payload = {
      id: user.id,
      email: user.email
    };

    const token = jwt.sign(payload, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN
    });

    res.status(200).json({
      id: user.id,
      email: user.email,
      token
    });
  } catch (err) {
    return next(err);
  }
});

export default router;