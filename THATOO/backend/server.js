const express = require("express");
const cors = require("cors");
const sqlite3 = require("sqlite3").verbose();
const path = require("path");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";
const dbPath = path.join(__dirname, "faculty.db");

app.use(cors());
app.use(express.json());

// --- OPEN DATABASE ---
function openDb() {
  return new sqlite3.Database(dbPath);
}

// --- AUTH ROUTES ---
app.post("/api/auth/register", async (req, res) => {
  const { name, password, role } = req.body;
  if (!name || !password || !role)
    return res.status(400).json({ error: "Missing fields" });

  const db = openDb();
  const hashed = await bcrypt.hash(password, 10);

  db.run(
    "INSERT INTO users (name, password, role) VALUES (?, ?, ?)",
    [name, hashed, role],
    function (err) {
      if (err) {
        db.close();
        return res.status(400).json({ error: err.message });
      }
      const user = { id: this.lastID, name, role };
      const token = jwt.sign(user, JWT_SECRET, { expiresIn: "12h" });
      db.close();
      res.json({ user, token });
    }
  );
});

app.post("/api/auth/login", (req, res) => {
  const { name, password } = req.body;
  const db = openDb();
  db.get("SELECT * FROM users WHERE name = ?", [name], async (err, row) => {
    if (err) {
      db.close();
      return res.status(500).json({ error: err.message });
    }
    if (!row) {
      db.close();
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const match = await bcrypt.compare(password, row.password);
    if (!match) {
      db.close();
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const user = { id: row.id, name: row.name, role: row.role };
    const token = jwt.sign(user, JWT_SECRET, { expiresIn: "12h" });
    db.close();
    res.json({ user, token });
  });
});

// --- AUTH MIDDLEWARE ---
function authMiddleware(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: "No token" });
  const token = auth.split(" ")[1];
  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) return res.status(401).json({ error: "Invalid token" });
    req.user = decoded;
    next();
  });
}

app.get("/api/auth/me", authMiddleware, (req, res) => {
  res.json({ user: req.user });
});

// --- COURSES / CLASSES ---
let courses = [
  { id: 1, name: "Computer Science" },
  { id: 2, name: "Business Management" },
  { id: 3, name: "Business Intelligence" },
  { id: 4, name: "Maths" },
];

let classes = [
  {
    id: 1,
    name: "CS101 - Intro to Programming",
    course_id: 1,
    course_name: "Computer Science",
    total_registered: 30,
    active: true,
    created_by: "Admin",
    updated_at: new Date().toISOString(),
  },
  {
    id: 2,
    name: "MC1 - Calculus I",
    course_id: 4,
    course_name: "Maths",
    total_registered: 25,
    active: true,
    created_by: "Admin",
    updated_at: new Date().toISOString(),
  },
];

// --- COURSE ROUTES ---
app.get("/api/courses", (req, res) => res.json(courses));

app.post("/api/courses", authMiddleware, (req, res) => {
  const newCourse = { id: Date.now(), name: req.body.name };
  courses.push(newCourse);
  res.json(newCourse);
});

// --- CLASS ROUTES ---
app.get("/api/classes", (req, res) => res.json(classes));

app.post("/api/classes", authMiddleware, (req, res) => {
  const course = courses.find((c) => c.id == req.body.course_id);
  if (!course) return res.status(400).json({ error: "Invalid course_id" });

  const newClass = {
    id: Date.now(),
    name: req.body.name,
    course_id: req.body.course_id,
    course_name: course.name,
    total_registered: 0,
    active: true,
    created_by: req.user.name,
    updated_at: new Date().toISOString(),
  };
  classes.push(newClass);
  res.json(newClass);
});

// --- HEALTH CHECK ---
app.get("/api/health", (req, res) => res.json({ status: "ok" }));

// --- START SERVER ---
app.listen(PORT, () =>
  console.log(`✅ Server running on http://localhost:${PORT}`)
);
