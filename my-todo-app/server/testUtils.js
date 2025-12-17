import jwt from "jsonwebtoken";

export function createTestToken() {
  const payload = { id: 1, email: "test@example.com" };
  const secret = process.env.JWT_SECRET || "test-secret";
  return jwt.sign(payload, secret, { expiresIn: "1h" });
}