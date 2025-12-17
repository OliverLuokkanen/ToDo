import { useState, useEffect } from "react";
import axios from "axios";
import "./App.css";
import Row from "./components/Row.jsx";

// Supports optional .env: VITE_API_URL=http://localhost:3001
const API = import.meta.env.VITE_API_URL ?? "http://localhost:3001";

export default function App() {
  const [task, setTask] = useState("");
  const [tasks, setTasks] = useState([]);

  // Helper: extract a useful error message from Axios error
  function extractErrorMessage(error) {
    const data = error?.response?.data;
    return (
      data?.error?.message ??
      data?.error ??
      data?.message ??
      error?.message ??
      String(error)
    );
  }

  // Fetch all tasks once when component mounts
  useEffect(() => {
    let cancelled = false;

    async function loadTasks() {
      try {
        const res = await axios.get(API);
        if (!cancelled) {
          const list = Array.isArray(res.data) ? res.data : [];
          setTasks(list);
        }
      } catch (error) {
        if (!cancelled) {
          alert(
            `Failed to load tasks from the server: ${extractErrorMessage(error)}`
          );
        }
      }
    }

    loadTasks();

    return () => {
      cancelled = true;
    };
  }, []);

  async function addTask() {
    const trimmed = task.trim();
    if (!trimmed) {
      // Do not send empty / whitespace-only tasks
      return;
    }

    try {
      const res = await axios.post(`${API}/create`, {
        description: trimmed
      });

      const created = res.data; // expected: { id, description }
      setTasks((prev) => [...prev, created]);
      setTask("");
    } catch (error) {
      alert(`Failed to create task: ${extractErrorMessage(error)}`);
    }
  }

  async function deleteTask(id) {
    try {
      await axios.delete(`${API}/delete/${id}`);
      setTasks((prev) => prev.filter((item) => item.id !== id));
    } catch (error) {
      alert(`Failed to delete task: ${extractErrorMessage(error)}`);
    }
  }

  function handleKeyDown(e) {
    if (e.key === "Enter") {
      e.preventDefault();
      addTask();
    }
  }

  return (
    <div className="app-root">
      <div className="app-card">
        <h1 className="app-title">Todos</h1>
        <p className="app-subtitle">
          Add tasks, and delete them when you&apos;re done.
        </p>

        <input
          type="text"
          className="task-input"
          placeholder="What needs to be done?"
          value={task}
          onChange={(e) => setTask(e.target.value)}
          onKeyDown={handleKeyDown}
        />

        <ul className="task-list">
          {tasks.length === 0 ? (
            <li className="task-empty">
              No tasks yet. Start by adding one above.
            </li>
          ) : (
            tasks.map((item) => (
              <Row key={item.id} item={item} deleteTask={deleteTask} />
            ))
          )}
        </ul>
      </div>
    </div>
  );
}