const express = require('express');
const router = express.Router();
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const dbPath = path.join(__dirname, '..', 'db', 'faculty.db');
const { verifyToken, requireRole } = require('../middleware/auth');

function openDb() { return new sqlite3.Database(dbPath); }

// list courses
router.get('/', (req, res) => {
  const db = openDb();
  db.all("SELECT c.*, u.name as lecturer_name FROM courses c LEFT JOIN users u ON c.assigned_to = u.id", (err, rows) => {
    if(err) return res.status(500).json({ error: err.message });
    res.json(rows);
    db.close();
  });
});

// create course (PL only)
router.post('/', verifyToken, requireRole('pl'), (req, res) => {
  const { name, code, faculty } = req.body;
  const db = openDb();
  db.run("INSERT INTO courses (name, code, faculty) VALUES (?, ?, ?)", [name, code, faculty], function(err){
    if(err) return res.status(500).json({ error: err.message });
    res.json({ id: this.lastID });
    db.close();
  });
});

// assign lecturer to course (PL only)
router.put('/:id/assign', verifyToken, requireRole('pl'), (req, res) => {
  const id = req.params.id;
  const { userId } = req.body;
  const db = openDb();
  db.run("UPDATE courses SET assigned_to = ? WHERE id = ?", [userId, id], function(err){
    if(err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
    db.close();
  });
});

module.exports = router;
