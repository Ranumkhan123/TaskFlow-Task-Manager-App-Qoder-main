import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import bcrypt from 'bcryptjs';

async function initDatabase() {
  // Open a database connection
  const db = await open({
    filename: './db/taskflow_sample.db',
    driver: sqlite3.Database
  });

  // Create users table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT DEFAULT 'User',
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create tasks table
  await db.exec(`
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

  // Create activities table (new table for tracking user activities)
  await db.exec(`
    CREATE TABLE IF NOT EXISTS activities (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER NOT NULL,
      taskId INTEGER,
      action TEXT NOT NULL, -- 'created', 'updated', 'deleted', 'completed'
      description TEXT,
      timestamp TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (userId) REFERENCES users (id) ON DELETE CASCADE,
      FOREIGN KEY (taskId) REFERENCES tasks (id) ON DELETE CASCADE
    )
  `);

  // Hash the demo password
  const hashedPassword = bcrypt.hashSync('demo123', 10);

  // Insert sample user if not exists
  const existingUser = await db.get('SELECT * FROM users WHERE email = ?', ['demo@taskflow.com']);
  let userId;
  
  if (!existingUser) {
    const result = await db.run(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      ['Demo User', 'demo@taskflow.com', hashedPassword, 'Admin']
    );
    userId = result.lastID;
    console.log('Demo user created: demo@taskflow.com / demo123');
  } else {
    userId = existingUser.id;
    console.log('Demo user already exists');
  }

  // Insert additional sample users
  const sampleUsers = [
    { name: 'John Doe', email: 'john@example.com', password: 'password123' },
    { name: 'Jane Smith', email: 'jane@example.com', password: 'password123' },
    { name: 'Bob Johnson', email: 'bob@example.com', password: 'password123' }
  ];

  for (const user of sampleUsers) {
    const existing = await db.get('SELECT * FROM users WHERE email = ?', [user.email]);
    if (!existing) {
      const hashedPass = bcrypt.hashSync(user.password, 10);
      await db.run(
        'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
        [user.name, user.email, hashedPass]
      );
      console.log(`Sample user created: ${user.email}`);
    }
  }

  // Insert sample tasks for the demo user
  const sampleTasks = [
    {
      title: 'Complete project proposal',
      description: 'Finish the project proposal document and send it to stakeholders for review',
      status: 'Pending',
      priority: 'High',
      dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 3 days from now
    },
    {
      title: 'Schedule team meeting',
      description: 'Organize a team meeting to discuss upcoming sprint goals',
      status: 'In Progress',
      priority: 'Medium',
      dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 2 days from now
    },
    {
      title: 'Review code changes',
      description: 'Review pull requests submitted by team members',
      status: 'Completed',
      priority: 'High',
      dueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 1 day ago
    },
    {
      title: 'Update documentation',
      description: 'Update the API documentation with new endpoints',
      status: 'Pending',
      priority: 'Low',
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 7 days from now
    },
    {
      title: 'Prepare presentation',
      description: 'Create slides for the quarterly business review',
      status: 'In Progress',
      priority: 'Medium',
      dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 5 days from now
    }
  ];

  for (const task of sampleTasks) {
    const result = await db.run(
      'INSERT INTO tasks (userId, title, description, status, priority, dueDate) VALUES (?, ?, ?, ?, ?, ?)',
      [userId, task.title, task.description, task.status, task.priority, task.dueDate]
    );
    
    // Create activity records for each task
    await db.run(
      'INSERT INTO activities (userId, taskId, action, description) VALUES (?, ?, ?, ?)',
      [userId, result.lastID, 'created', `Created task: ${task.title}`]
    );
    
    if (task.status === 'Completed') {
      await db.run(
        'INSERT INTO activities (userId, taskId, action, description) VALUES (?, ?, ?, ?)',
        [userId, result.lastID, 'completed', `Completed task: ${task.title}`]
      );
    }
  }

  console.log('Sample database initialized successfully!');
  console.log('Database file: db/taskflow_sample.db');

  await db.close();
}

initDatabase().catch(console.error);