import React, { useEffect, useState } from 'react'
import axios from 'axios'
import Row from './components/Row'
import './App.css'

const API = 'http://localhost:3001'

export default function App() {
  const [task, setTask] = useState('')
  const [tasks, setTasks] = useState([])

  useEffect(() => {
    axios.get(API)
      .then(response => setTasks(response.data))
      .catch(error => alert(error.response?.data?.error || error.message))
  }, [])

  const addTask = async (e) => {
    e.preventDefault()
    const trimmed = task.trim()
    if (!trimmed) return

    try {
      const response = await axios.post(`${API}/create`, { task: { description: trimmed } })
      setTasks(prev => [...prev, response.data])
      setTask('')
    } catch (error) {
      alert(error.response?.data?.error || error.message)
    }
  }

  const deleteTask = async (id) => {
    try {
      await axios.delete(`${API}/delete/${id}`)
      setTasks(prev => prev.filter(t => t.id !== id))
    } catch (error) {
      alert(error.response?.data?.error || error.message)
    }
  }

  return (
    <div id="container">
      <h3>Todos</h3>

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