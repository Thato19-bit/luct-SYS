const express = require('express');
const router = express.Router();
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const ExcelJS = require('exceljs');
const dbPath = path.join(__dirname, '..', 'db', 'faculty.db');

function openDb() {
  return new sqlite3.Database(dbPath);
}

// Create a report
router.post('/', (req, res) => {
  const r = req.body;
  const db = openDb();
  const stmt = `INSERT INTO reports
    (faculty_name, class_name, week_of_reporting, date_of_lecture, course_name, course_code,
     lecturer_name, actual_present, total_registered, venue, scheduled_time, topic, learning_outcomes, recommendations)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
  const params = [
    r.faculty_name, r.class_name, r.week_of_reporting, r.date_of_lecture, r.course_name, r.course_code,
    r.lecturer_name, r.actual_present || 0, r.total_registered || 0, r.venue, r.scheduled_time,
    r.topic_taught || r.topic || '', r.learning_outcomes || '', r.lecturer_recommendations || r.recommendations || ''
  ];
  db.run(stmt, params, function(err) {
    if (err) {
      console.error(err);
      res.status(500).json({ error: err.message });
    } else {
      res.status(201).json({ id: this.lastID });
    }
  });
  db.close();
});

// Get reports, supports optional search query ?q=term
router.get('/', (req, res) => {
  const q = req.query.q;
  const db = openDb();
  let sql = "SELECT * FROM reports ORDER BY created_at DESC";
  const params = [];
  if (q) {
    sql = `SELECT * FROM reports WHERE
      faculty_name LIKE ? OR class_name LIKE ? OR course_name LIKE ? OR course_code LIKE ? OR lecturer_name LIKE ? OR topic LIKE ?
      ORDER BY created_at DESC`;
    const w = `%${q}%`;
    params.push(w,w,w,w,w,w);
  }
  db.all(sql, params, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
  db.close();
});

// Export reports to Excel
router.get('/export', async (req, res) => {
  const db = openDb();
  db.all("SELECT * FROM reports ORDER BY created_at DESC", async (err, rows) => {
    if (err) {
      db.close();
      return res.status(500).json({ error: err.message });
    }
    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet('Reports');
    ws.columns = [
      { header: 'ID', key: 'id', width: 7 },
      { header: 'Faculty', key: 'faculty_name', width: 20 },
      { header: 'Class', key: 'class_name', width: 20 },
      { header: 'Week', key: 'week_of_reporting', width: 12 },
      { header: 'Date', key: 'date_of_lecture', width: 15 },
      { header: 'Course', key: 'course_name', width: 25 },
      { header: 'Course Code', key: 'course_code', width: 15 },
      { header: 'Lecturer', key: 'lecturer_name', width: 20 },
      { header: 'Present', key: 'actual_present', width: 10 },
      { header: 'Registered', key: 'total_registered', width: 12 },
      { header: 'Venue', key: 'venue', width: 20 },
      { header: 'Time', key: 'scheduled_time', width: 15 },
      { header: 'Topic', key: 'topic', width: 30 },
      { header: 'Learning Outcomes', key: 'learning_outcomes', width: 30 },
      { header: 'Recommendations', key: 'recommendations', width: 30 },
      { header: 'Created At', key: 'created_at', width: 20 }
    ];
    rows.forEach(r => ws.addRow(r));
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="reports.xlsx"');
    await wb.xlsx.write(res);
    res.end();
    db.close();
  });
});

// get totals (example for total registered)
router.get('/totals', (req, res) => {
  const db = openDb();
  db.all("SELECT * FROM totals", (err, rows) => {
    if(err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
  db.close();
});

module.exports = router;
