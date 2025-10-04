const express = require('express');
const router = express.Router();
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const dbPath = path.join(__dirname, '..', 'db', 'faculty.db');
const { verifyToken, requireRole } = require('../middleware/auth');

function openDb() { return new sqlite3.Database(dbPath); }

// list classes
router.get('/', (req, res) => {
  const db = openDb();
  db.all("SELECT cl.*, c.name as course_name FROM classes cl LEFT JOIN courses c ON cl.course_id = c.id", (err, rows) => {
    if(err) return res.status(500).json({ error: err.message });
    res.json(rows);
    db.close();
  });
});

// create class (PL only)
router.post('/', verifyToken, requireRole('pl'), (req, res) => {
  const { name, course_id, total_registered } = req.body;
  const db = openDb();
  db.run("INSERT INTO classes (name, course_id, total_registered) VALUES (?, ?, ?)", [name, course_id, total_registered || 0], function(err){
    if(err) return res.status(500).json({ error: err.message });
    res.json({ id: this.lastID });
    db.close();
  });
});

module.exports = router;
