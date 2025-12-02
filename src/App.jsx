import React, { useEffect, useState } from 'react'
import axios from 'axios'
import Row from './components/Row'
import './App.css'

const API = 'http://localhost:3001'

export default function App() {
  const [task, setTask] = useState('')
  const [tasks, setTasks] = useState([])
  const [user, setUser] = useState(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignup, setIsSignup] = useState(false)

  // Check for saved token on mount
  useEffect(() => {
    const savedToken = localStorage.getItem('token')
    const savedEmail = localStorage.getItem('email')
    if (savedToken && savedEmail) {
      setUser({ email: savedEmail, token: savedToken })
    }
  }, [])

  // Fetch tasks
  useEffect(() => {
    axios.get(API)
      .then(response => setTasks(response.data))
      .catch(error => alert(error.response?.data?.error?.message || error.message))
  }, [])

  const handleAuth = async (e) => {
    e.preventDefault()
    const endpoint = isSignup ? '/user/signup' : '/user/signin'
    
    try {
      const response = await axios.post(`${API}${endpoint}`, { email, password })
      if (!isSignup) {
        // Save token on signin
        localStorage.setItem('token', response.data.token)
        localStorage.setItem('email', response.data.email)
        setUser({ email: response.data.email, token: response.data.token })
      } else {
        // After signup, switch to signin mode
        alert('Registration successful! Please sign in.')
        setIsSignup(false)
      }
      setEmail('')
      setPassword('')
    } catch (error) {
      alert(error.response?.data?.error?.message || error.message)
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('email')
    setUser(null)
  }

  const addTask = async (e) => {
    e.preventDefault()
    const trimmed = task.trim()
    if (!trimmed) return

    if (!user) {
      alert('Please sign in to add tasks')
      return
    }

    try {
      const response = await axios.post(
        `${API}/create`,
        { task: { description: trimmed } },
        { headers: { Authorization: `Bearer ${user.token}` } }
      )
      setTasks(prev => [...prev, response.data])
      setTask('')
    } catch (error) {
      alert(error.response?.data?.error?.message || error.message)
    }
  }

  const deleteTask = async (id) => {
    if (!user) {
      alert('Please sign in to delete tasks')
      return
    }

    try {
      await axios.delete(`${API}/delete/${id}`, {
        headers: { Authorization: `Bearer ${user.token}` }
      })
      setTasks(prev => prev.filter(t => t.id !== id))
    } catch (error) {
      alert(error.response?.data?.error?.message || error.message)
    }
  }

  return (
    <div id="container">
      <h3>Todos</h3>

      {!user ? (
        <div className="auth-section">
          <form onSubmit={handleAuth}>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
            <button type="submit">{isSignup ? 'Sign Up' : 'Sign In'}</button>
          </form>
          <p className="auth-toggle">
            {isSignup ? 'Already have an account? ' : "Don't have an account? "}
            <button type="button" onClick={() => setIsSignup(!isSignup)}>
              {isSignup ? 'Sign In' : 'Sign Up'}
            </button>
          </p>
        </div>
      ) : (
        <div className="user-section">
          <p>Logged in as: {user.email}</p>
          <button onClick={logout}>Logout</button>
        </div>
      )}

      <form onSubmit={addTask}>
        <input
          placeholder="Add new task"
          value={task}
          onChange={e => setTask(e.target.value)}
        />
        <button type="submit">Add</button>
      </form>

      <ul>
        {tasks.map(item => (
          <Row item={item} key={item.id} deleteTask={deleteTask} />
        ))}
      </ul>
    </div>
  )
}