import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || process.env.JWT_SECRET_KEY

const auth = (req, res, next) => {
  const token = req.headers['authorization'] || req.headers['Authorization']
  if (!token) {
    return res.status(401).json({ message: 'No token provided' })
  }

  if (!JWT_SECRET) {
    return res.status(500).json({ message: 'JWT secret is not configured on server' })
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: 'Failed to authenticate token' })
    }
    // Attach decoded payload to request for handlers that need it
    req.user = decoded
    next()
  })
}

export { auth }