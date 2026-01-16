import sqlite3 from 'sqlite3';
import bcrypt from 'bcryptjs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Ensure db directory exists
const dbDir = join(__dirname, '..', 'db');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const dbPath = join(dbDir, 'taskflow_sample.db'); // Use the sample database file
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to SQLite database');
  }
});

// Create tables if they don't exist
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT DEFAULT 'User',
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      status TEXT NOT NULL DEFAULT 'Pending',
      priority TEXT NOT NULL DEFAULT 'Medium',
      dueDate TEXT NOT NULL,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
      updatedAt TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (userId) REFERENCES users (id) ON DELETE CASCADE
    )
  `);

  // Create activities table
  db.run(`
    CREATE TABLE IF NOT EXISTS activities (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER NOT NULL,
      taskId INTEGER,
      action TEXT NOT NULL,
      description TEXT,
      timestamp TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (userId) REFERENCES users (id) ON DELETE CASCADE,
      FOREIGN KEY (taskId) REFERENCES tasks (id) ON DELETE CASCADE
    )
  `);



  // Create pomodoro_sessions table
  db.run(`
    CREATE TABLE IF NOT EXISTS pomodoro_sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER NOT NULL,
      mode TEXT NOT NULL CHECK(mode IN ('focus', 'break')),
      status TEXT NOT NULL CHECK(status IN ('running', 'paused', 'completed')),
      duration INTEGER NOT NULL,
      elapsed INTEGER DEFAULT 0,
      startTime TEXT NOT NULL,
      endTime TEXT,
      taskId INTEGER,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
      updatedAt TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (userId) REFERENCES users (id) ON DELETE CASCADE,
      FOREIGN KEY (taskId) REFERENCES tasks (id) ON DELETE SET NULL
    )
  `);

  // Check if demo user exists
  db.get('SELECT * FROM users WHERE email = ?', ['demo@taskflow.com'], (err, row) => {
    if (err) {
      console.error('Error checking demo user:', err);
    } else if (!row) {
      // Create demo user if it doesn't exist
      const hashedPassword = bcrypt.hashSync('demo123', 10);
      db.run(
        'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
        ['Demo User', 'demo@taskflow.com', hashedPassword],
        function (err) {
          if (err) {
            console.error('Error creating demo user:', err);
          } else {
            console.log('Demo user created: demo@taskflow.com / demo123');
          }
        }
      );
    }
  });
});

export default db;