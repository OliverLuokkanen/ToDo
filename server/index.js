import express from 'express'
import cors from 'cors'
import todoRouter from './routes/todoRouter.js'
import userRouter from './routes/userRouter.js'

const app = express()
const port = process.env.PORT || 3001

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: false }))

// Delegate endpoints to router
app.use('/', todoRouter)
app.use('/user', userRouter)
// Centralized error handler middleware
app.use((err, req, res, next) => {
  const statusCode = err.status || 500
  res.status(statusCode).json({
    error: {
      message: err.message || 'Internal server error',
      status: statusCode
    }
  })
})

app.listen(port, () => {
  console.log(`Server running on port ${port}`)
})