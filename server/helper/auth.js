import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || process.env.JWT_SECRET_KEY

const auth = (req, res, next) => {
  let token = req.headers['authorization'] || req.headers['Authorization']

  if (!token) {
    return res.status(401).json({ message: 'No token provided' })
  }

  // Jos token on muodossa "Bearer <token>", irrota prefiksi
  if (typeof token === 'string' && token.startsWith('Bearer ')) {
    token = token.slice(7)
  }

  if (!JWT_SECRET) {
    return res
      .status(500)
      .json({ message: 'JWT secret is not configured on server' })
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res
        .status(401)
        .json({ message: 'Failed to authenticate token' })
    }
    req.user = decoded
    next()
  })
}

export { auth }