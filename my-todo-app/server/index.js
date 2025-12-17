import express from "express";
import cors from "cors";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const app = express();
const PORT = process.env.PORT || 3001;

// JWT-salasana – dev/test-käyttöön, tuotannossa .env
const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";

// Middleware
app.use(cors());
app.use(express.json());




let tasks = [];
let nextId = 1;


let users = []; 
let nextUserId = 1;


app.post("/user/signup", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res
      .status(400)
      .json({ error: "email and password are required" });
  }

  const existing = users.find((u) => u.email === email);
  if (existing) {
    return res.status(400).json({ error: "User already exists" });
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const user = {
    id: nextUserId++,
    email,
    passwordHash
  };

  users.push(user);

  return res.status(201).json({ message: "User created" });
});


app.post("/user/signin", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res
      .status(400)
      .json({ error: "email and password are required" });
  }

  const user = users.find((u) => u.email === email);
  if (!user) {
    return res.status(401).json({ error: "Invalid email or password" });
  }

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) {
    return res.status(401).json({ error: "Invalid email or password" });
  }

  const token = jwt.sign(
    { id: user.id, email: user.email },
    JWT_SECRET,
    { expiresIn: "1h" }
  );

  return res.json({
    id: user.id,
    email: user.email,
    token
  });
});

app.get("/", (req, res) => {
  res.json(tasks);
});

app.post("/create", (req, res) => {
  const { description } = req.body;

  if (!description) {
    return res.status(400).json({ error: "description is required" });
  }

  const task = { id: nextId++, description };
  tasks.push(task);
  res.status(201).json(task);
});

app.delete("/delete/:id", (req, res) => {
  const id = Number(req.params.id);
  const index = tasks.findIndex((t) => t.id === id);

  if (index === -1) {
    return res.status(404).json({ error: "Task not found" });
  }

  const [deleted] = tasks.splice(index, 1);
  res.json(deleted);
});


export default app;

if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
  });
}