import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { pool } from './db.js'
import todoRouter from './routes/todoRouter.js'
import userRouter from './routes/userRouter.js'

dotenv.config()

const app = express()

app.use(cors())
app.use(express.json())

app.use('/', todoRouter)
app.use('/user', userRouter)

// Yksinkertainen health-check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' })
})

// Virheenkäsittelijä
app.use((err, req, res, next) => {
  console.error(err)
  const status = err.status || 500
  res.status(status).json({
    error: {
      message:
        status === 500 ? 'Internal server error' : err.message || 'Error',
      status
    }
  })
})

const port = process.env.PORT || 3001
const host = process.env.HOST || '127.0.0.1'

if (process.env.NODE_ENV !== 'test') {
  app.listen(port, host, () => {
    console.log(`Server running at http://${host}:${port}`)
  })
}

export default app