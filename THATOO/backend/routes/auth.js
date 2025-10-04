const express = require('express');
const router = express.Router();
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const dbPath = path.join(__dirname, '..', 'db', 'faculty.db');

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';

function openDb() {
  return new sqlite3.Database(dbPath);
}

// Register
router.post('/register', async (req, res) => {
  const { name, email, password, role } = req.body;
  if(!name || !email || !password || !role) return res.status(400).json({ error: 'Missing fields' });
  const db = openDb();
  const hashed = await bcrypt.hash(password, 10);
  db.run("INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)", [name, email, hashed, role], function(err) {
    if(err){
      db.close();
      return res.status(400).json({ error: err.message });
    }
    const user = { id: this.lastID, name, email, role };
    const token = jwt.sign(user, JWT_SECRET, { expiresIn: '12h' });
    db.close();
    res.json({ user, token });
  });
});

// Login
router.post('/login', (req, res) => {
  const { email, password } = req.body;
  if(!email || !password) return res.status(400).json({ error: 'Missing fields' });
  const db = openDb();
  db.get("SELECT * FROM users WHERE email = ?", [email], async (err, row) => {
    if(err) { db.close(); return res.status(500).json({ error: err.message }); }
    if(!row) { db.close(); return res.status(401).json({ error: 'Invalid credentials' }); }
    const match = await bcrypt.compare(password, row.password);
    if(!match) { db.close(); return res.status(401).json({ error: 'Invalid credentials' }); }
    const user = { id: row.id, name: row.name, email: row.email, role: row.role };
    const token = jwt.sign(user, JWT_SECRET, { expiresIn: '12h' });
    db.close();
    res.json({ user, token });
  });
});

// Middleware to verify token
function authMiddleware(req, res, next){
  const auth = req.headers.authorization;
  if(!auth) return res.status(401).json({ error: 'No token' });
  const token = auth.split(' ')[1];
  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if(err) return res.status(401).json({ error: 'Invalid token' });
    req.user = decoded;
    next();
  });
}

// Example protected route
router.get('/me', authMiddleware, (req, res) => {
  res.json({ user: req.user });
});

module.exports = router;
