import jwt from "jsonwebtoken";

export function auth(req, res, next) {
  const authHeader = req.headers.authorization || "";
  const [scheme, token] = authHeader.split(" ");

  if (scheme !== "Bearer" || !token) {
    return res
      .status(401)
      .json({ error: "Authorization header missing or invalid" });
  }

  try {
    const secret = process.env.JWT_SECRET || "test-secret";
    const decoded = jwt.verify(token, secret);
    req.user = decoded;
    return next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid token" });
  }
}