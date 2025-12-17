import { useState, useEffect } from "react";
import axios from "axios";
import Row from "../components/Row.jsx";
import { useUser } from "../context/userProvider.jsx";
import "../App.css";

// API-pohja .env:stä
const API = import.meta.env.VITE_API_URL ?? "http://localhost:3001";

export default function App() {
  const [task, setTask] = useState("");
  const [tasks, setTasks] = useState([]);
  const { user, logout } = useUser();

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

  // Hae tehtävät, kun komponentti mounttaa ja kun user/token muuttuu.
  useEffect(() => {
    // Jos ei ole kirjautunut, ei edes yritetä
    if (!user || !user.token) {
      setTasks([]);
      return;
    }

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
  }, [user]);

  async function addTask() {
    const trimmed = task.trim();
    if (!trimmed) return;
    if (!user || !user.token) {
      alert("You must be signed in to add tasks.");
      return;
    }

    try {
      const headers = {
        headers: {
          Authorization: `Bearer ${user.token}`,
          "Content-Type": "application/json"
        }
      };

      const res = await axios.post(
        `${API}/create`,
        { description: trimmed },
        headers
      );

      const created = res.data;
      setTasks((prev) => [...prev, created]);
      setTask("");
    } catch (error) {
      alert(`Failed to create task: ${extractErrorMessage(error)}`);
    }
  }

  async function deleteTask(id) {
    if (!user || !user.token) {
      alert("You must be signed in to delete tasks.");
      return;
    }

    try {
      const headers = {
        headers: {
          Authorization: `Bearer ${user.token}`
        }
      };

      await axios.delete(`${API}/delete/${id}`, headers);
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

  function handleLogout() {
    logout(); // tyhjentää käyttäjän + tokenin
    // ProtectedRoute huolehtii siitä, ettei ilman useria pääse takaisin /
  }

  return (
    <div className="app-root">
      <div className="app-card">
        <header className="app-header">
          <div>
            <h1 className="app-title">Todos</h1>
            <p className="app-subtitle">
              Add tasks, and delete them when you&apos;re done.
            </p>
          </div>

          {user && (
            <div className="app-user">
              <span className="app-user-email">{user.email}</span>
              <button className="logout-button" onClick={handleLogout}>
                Logout
              </button>
            </div>
          )}
        </header>

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