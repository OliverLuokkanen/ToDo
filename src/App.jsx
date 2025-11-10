import React, { useState } from 'react'
import './App.css'

export default function App() {
  const [task, setTask] = useState('')
  const [tasks, setTasks] = useState([])

  const addTask = () => {
    const trimmed = task.trim()
    if (trimmed === '') return
    setTasks([...tasks, trimmed])
    setTask('')
  }

  const deleteTask = (deleted) => {
    setTasks(tasks.filter(item => item !== deleted))
  }

  return (
    <div id="container">
      <h3>Todos</h3>

      <form onSubmit={(e) => { e.preventDefault(); addTask(); }}>
        <input
          placeholder="Add new task"
          value={task}
          onChange={e => setTask(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter') {
              e.preventDefault()
              addTask()
            }
          }}
        />
      </form>

      <ul>
        {tasks.map((item, idx) => (
          <li key={idx}>
            {item}
            <button className="delete-button" onClick={() => deleteTask(item)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  )
}