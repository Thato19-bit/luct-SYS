import sqlite3 from "sqlite3";
import bcrypt from "bcrypt";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbDir = path.join(__dirname, "db");
if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir);

const dbPath = path.join(dbDir, "faculty.db");
const db = new sqlite3.Database(dbPath);
const SALT_ROUNDS = 10;

// Helper to run queries as promises
function runAsync(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve(this);
    });
  });
}

async function initDb() {
  try {
    // Create users table
    await runAsync(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE,
        password TEXT,
        role TEXT
      )
    `);

    // Seed admin user
    const admin = { name: "THATO", password: "MOHLANKA1", role: "admin" };
    const hash = await bcrypt.hash(admin.password, SALT_ROUNDS);

    await runAsync(
      "INSERT OR IGNORE INTO users (name, password, role) VALUES (?, ?, ?)",
      [admin.name, hash, admin.role]
    );

    console.log(`✅ Admin user seeded: ${admin.name} / ${admin.password}`);
    console.log("✅ Database initialized successfully!");
  } catch (err) {
    console.error("❌ DB init error:", err.message);
  } finally {
    db.close();
  }
}

initDb();
