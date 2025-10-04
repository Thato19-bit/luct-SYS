const express = require('express');
const router = express.Router();
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const dbPath = path.join(__dirname, '..', 'db', 'faculty.db');
const { verifyToken, requireRole } = require('../middleware/auth');

function openDb() { return new sqlite3.Database(dbPath); }

// list users (PL access) - but allow public read for demo limited set
router.get('/', (req, res) => {
  const db = openDb();
  db.all("SELECT id, name, email, role FROM users", (err, rows) => {
    if(err) return res.status(500).json({ error: err.message });
    res.json(rows);
    db.close();
  });
});

module.exports = router;
