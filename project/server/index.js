import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import db from './database.js';
import { generateToken, authMiddleware } from './auth.js';

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

app.post('/api/auth/login', (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    db.get('SELECT * FROM users WHERE email = ?', [email], (err, user) => {
      if (err) {
        console.error('Login error:', err);
        return res.status(500).json({ error: 'Internal server error' });
      }

      if (!user) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      const isValidPassword = bcrypt.compareSync(password, user.password);

      if (!isValidPassword) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      const token = generateToken(user);

      res.json({
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email
        }
      });
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/auth/signup', (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    db.get('SELECT * FROM users WHERE email = ?', [email], (err, existingUser) => {
      if (err) {
        console.error('Signup error:', err);
        return res.status(500).json({ error: 'Internal server error' });
      }

      if (existingUser) {
        return res.status(400).json({ error: 'Email already exists' });
      }

      const hashedPassword = bcrypt.hashSync(password, 10);
      
      db.run('INSERT INTO users (name, email, password) VALUES (?, ?, ?)', [name, email, hashedPassword], function(err) {
        if (err) {
          console.error('Signup error:', err);
          return res.status(500).json({ error: 'Internal server error' });
        }

        const user = {
          id: this.lastID,
          name,
          email
        };

        const token = generateToken(user);

        res.status(201).json({
          token,
          user
        });
      });
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/auth/me', authMiddleware, (req, res) => {
  try {
    db.get('SELECT id, name, email, createdAt FROM users WHERE id = ?', [req.user.id], (err, user) => {
      if (err) {
        console.error('Get user error:', err);
        return res.status(500).json({ error: 'Internal server error' });
      }

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json(user);
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/api/auth/profile', authMiddleware, (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }

    db.run('UPDATE users SET name = ? WHERE id = ?', [name, req.user.id], (err) => {
      if (err) {
        console.error('Update profile error:', err);
        return res.status(500).json({ error: 'Internal server error' });
      }

      db.get('SELECT id, name, email FROM users WHERE id = ?', [req.user.id], (err, user) => {
        if (err) {
          console.error('Get updated user error:', err);
          return res.status(500).json({ error: 'Internal server error' });
        }

        res.json(user);
      });
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/api/auth/change-password', authMiddleware, (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current and new password are required' });
    }

    db.get('SELECT * FROM users WHERE id = ?', [req.user.id], (err, user) => {
      if (err) {
        console.error('Change password error:', err);
        return res.status(500).json({ error: 'Internal server error' });
      }

      const isValidPassword = bcrypt.compareSync(currentPassword, user.password);

      if (!isValidPassword) {
        return res.status(401).json({ error: 'Current password is incorrect' });
      }

      const hashedPassword = bcrypt.hashSync(newPassword, 10);
      
      db.run('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, req.user.id], (err) => {
        if (err) {
          console.error('Change password error:', err);
          return res.status(500).json({ error: 'Internal server error' });
        }

        res.json({ message: 'Password changed successfully' });
      });
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/tasks', authMiddleware, (req, res) => {
  try {
    const { search, status, priority } = req.query;

    let query = 'SELECT * FROM tasks WHERE userId = ?';
    const params = [req.user.id];

    if (search) {
      query += ' AND (title LIKE ? OR description LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    if (status && status !== 'All') {
      query += ' AND status = ?';
      params.push(status);
    }

    if (priority && priority !== 'All') {
      query += ' AND priority = ?';
      params.push(priority);
    }

    query += ' ORDER BY createdAt DESC';

    db.all(query, params, (err, tasks) => {
      if (err) {
        console.error('Get tasks error:', err);
        return res.status(500).json({ error: 'Internal server error' });
      }

      res.json(tasks);
    });
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/tasks/stats', authMiddleware, (req, res) => {
  try {
    const userId = req.user.id;
    
    // Count total tasks
    db.get('SELECT COUNT(*) as count FROM tasks WHERE userId = ?', [userId], (err, totalRow) => {
      if (err) {
        console.error('Get stats error:', err);
        return res.status(500).json({ error: 'Internal server error' });
      }

      // Count completed tasks
      db.get('SELECT COUNT(*) as count FROM tasks WHERE userId = ? AND status = ?', [userId, 'Completed'], (err, completedRow) => {
        if (err) {
          console.error('Get stats error:', err);
          return res.status(500).json({ error: 'Internal server error' });
        }

        // Count pending tasks
        db.get('SELECT COUNT(*) as count FROM tasks WHERE userId = ? AND status = ?', [userId, 'Pending'], (err, pendingRow) => {
          if (err) {
            console.error('Get stats error:', err);
            return res.status(500).json({ error: 'Internal server error' });
          }

          // Count in progress tasks
          db.get('SELECT COUNT(*) as count FROM tasks WHERE userId = ? AND status = ?', [userId, 'In Progress'], (err, inProgressRow) => {
            if (err) {
              console.error('Get stats error:', err);
              return res.status(500).json({ error: 'Internal server error' });
            }

            res.json({
              total: totalRow.count,
              completed: completedRow.count,
              pending: pendingRow.count,
              inProgress: inProgressRow.count
            });
          });
        });
      });
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/tasks/:id', authMiddleware, (req, res) => {
  try {
    const taskId = req.params.id;
    const userId = req.user.id;

    db.get('SELECT * FROM tasks WHERE id = ? AND userId = ?', [taskId, userId], (err, task) => {
      if (err) {
        console.error('Get task error:', err);
        return res.status(500).json({ error: 'Internal server error' });
      }

      if (!task) {
        return res.status(404).json({ error: 'Task not found' });
      }

      res.json(task);
    });
  } catch (error) {
    console.error('Get task error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/tasks', authMiddleware, (req, res) => {
  try {
    const { title, description, status, priority, dueDate } = req.body;

    if (!title || !priority || !dueDate) {
      return res.status(400).json({ error: 'Title, priority, and due date are required' });
    }

    const userId = req.user.id;
    const insertQuery = 'INSERT INTO tasks (userId, title, description, status, priority, dueDate) VALUES (?, ?, ?, ?, ?, ?)';
    
    db.run(insertQuery, [userId, title, description || '', status || 'Pending', priority, dueDate], function(err) {
      if (err) {
        console.error('Create task error:', err);
        return res.status(500).json({ error: 'Internal server error' });
      }

      const taskId = this.lastID;

      // Create activity record for the creation
      db.run(
        'INSERT INTO activities (userId, taskId, action, description) VALUES (?, ?, ?, ?)',
        [userId, taskId, 'created', `Created task: ${title}`],
        (err) => {
          if (err) {
            console.error('Error creating activity record:', err);
          }
        }
      );

      // Get the newly created task
      db.get('SELECT * FROM tasks WHERE id = ?', [taskId], (err, task) => {
        if (err) {
          console.error('Get created task error:', err);
          return res.status(500).json({ error: 'Internal server error' });
        }

        res.status(201).json(task);
      });
    });
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/api/tasks/:id', authMiddleware, (req, res) => {
  try {
    const { title, description, status, priority, dueDate } = req.body;
    const taskId = req.params.id;
    const userId = req.user.id;

    if (!title || !priority || !dueDate) {
      return res.status(400).json({ error: 'Title, priority, and due date are required' });
    }

    // Check if task exists and belongs to user
    db.get('SELECT * FROM tasks WHERE id = ? AND userId = ?', [taskId, userId], (err, existingTask) => {
      if (err) {
        console.error('Update task error:', err);
        return res.status(500).json({ error: 'Internal server error' });
      }

      if (!existingTask) {
        return res.status(404).json({ error: 'Task not found' });
      }

      // Get the existing task to log the update
      db.get('SELECT * FROM tasks WHERE id = ? AND userId = ?', [taskId, userId], (err, existingTask) => {
        if (err) {
          console.error('Update task error:', err);
          return res.status(500).json({ error: 'Internal server error' });
        }

        if (!existingTask) {
          return res.status(404).json({ error: 'Task not found' });
        }

        // Update the task
        const updateQuery = 'UPDATE tasks SET title = ?, description = ?, status = ?, priority = ?, dueDate = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ? AND userId = ?';
        
        db.run(updateQuery, [title, description || '', status || 'Pending', priority, dueDate, taskId, userId], (err) => {
          if (err) {
            console.error('Update task error:', err);
            return res.status(500).json({ error: 'Internal server error' });
          }

          // Create activity record for the update
          let action = 'updated';
          let description = `Updated task: ${title}`;
          
          // Determine specific action based on status change
          if (existingTask.status !== status && status === 'Completed') {
            action = 'completed';
            description = `Completed task: ${title}`;
          } else if (existingTask.status !== status && existingTask.status === 'Completed' && status !== 'Completed') {
            action = 'reopened';
            description = `Reopened task: ${title}`;
          }

          db.run(
            'INSERT INTO activities (userId, taskId, action, description) VALUES (?, ?, ?, ?)',
            [userId, taskId, action, description],
            (err) => {
              if (err) {
                console.error('Error creating activity record:', err);
              }
            }
          );

          // Return updated task
          db.get('SELECT * FROM tasks WHERE id = ?', [taskId], (err, task) => {
            if (err) {
              console.error('Get updated task error:', err);
              return res.status(500).json({ error: 'Internal server error' });
            }

            res.json(task);
          });
        });
      });
    });
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete('/api/tasks/:id', authMiddleware, (req, res) => {
  try {
    const taskId = req.params.id;
    const userId = req.user.id;

    // Check if task exists and belongs to user
    db.get('SELECT * FROM tasks WHERE id = ? AND userId = ?', [taskId, userId], (err, existingTask) => {
      if (err) {
        console.error('Delete task error:', err);
        return res.status(500).json({ error: 'Internal server error' });
      }

      if (!existingTask) {
        return res.status(404).json({ error: 'Task not found' });
      }

      // Create activity record for deletion
      db.run(
        'INSERT INTO activities (userId, taskId, action, description) VALUES (?, ?, ?, ?)',
        [userId, taskId, 'deleted', `Deleted task: ${existingTask.title}`],
        (err) => {
          if (err) {
            console.error('Error creating activity record:', err);
          }
        }
      );

      // Delete the task
      db.run('DELETE FROM tasks WHERE id = ? AND userId = ?', [taskId, userId], (err) => {
        if (err) {
          console.error('Delete task error:', err);
          return res.status(500).json({ error: 'Internal server error' });
        }

        res.json({ message: 'Task deleted successfully' });
      });
    });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get activities for a user
app.get('/api/activities', authMiddleware, (req, res) => {
  try {
    const userId = req.user.id;
    const { limit = 20, offset = 0 } = req.query;

    // Get activities with task information
    const query = `
      SELECT a.*, t.title as taskTitle, u.name as userName
      FROM activities a
      LEFT JOIN tasks t ON a.taskId = t.id
      LEFT JOIN users u ON a.userId = u.id
      WHERE a.userId = ?
      ORDER BY a.timestamp DESC
      LIMIT ? OFFSET ?
    `;

    db.all(query, [userId, parseInt(limit), parseInt(offset)], (err, activities) => {
      if (err) {
        console.error('Get activities error:', err);
        return res.status(500).json({ error: 'Internal server error' });
      }

      res.json(activities);
    });
  } catch (error) {
    console.error('Get activities error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get activities for a specific task
app.get('/api/tasks/:id/activities', authMiddleware, (req, res) => {
  try {
    const taskId = req.params.id;
    const userId = req.user.id;

    // Verify task belongs to user
    db.get('SELECT * FROM tasks WHERE id = ? AND userId = ?', [taskId, userId], (err, task) => {
      if (err) {
        console.error('Get task activities error:', err);
        return res.status(500).json({ error: 'Internal server error' });
      }

      if (!task) {
        return res.status(404).json({ error: 'Task not found' });
      }

      // Get activities for the task
      const query = `
        SELECT a.*, u.name as userName
        FROM activities a
        LEFT JOIN users u ON a.userId = u.id
        WHERE a.taskId = ?
        ORDER BY a.timestamp ASC
      `;

      db.all(query, [taskId], (err, activities) => {
        if (err) {
          console.error('Get task activities error:', err);
          return res.status(500).json({ error: 'Internal server error' });
        }

        res.json(activities);
      });
    });
  } catch (error) {
    console.error('Get task activities error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Pomodoro Timer API Endpoints

// Start a new Pomodoro session
app.post('/api/pomodoro/start', authMiddleware, (req, res) => {
  try {
    const { mode, duration, taskId } = req.body;
    const userId = req.user.id;

    if (!mode || !duration || !['focus', 'break'].includes(mode)) {
      return res.status(400).json({ error: 'Mode (focus/break) and duration are required' });
    }

    // Check if there's already a running session
    db.get('SELECT * FROM pomodoro_sessions WHERE userId = ? AND status = "running"', [userId], (err, existingSession) => {
      if (err) {
        console.error('Check existing session error:', err);
        return res.status(500).json({ error: 'Internal server error' });
      }

      if (existingSession) {
        // Return the existing session instead of creating a new one
        return res.json({
          id: existingSession.id,
          mode: existingSession.mode,
          status: existingSession.status,
          duration: existingSession.duration,
          elapsed: existingSession.elapsed,
          startTime: existingSession.startTime,
          taskId: existingSession.taskId
        });
      }

      // Create new session
      const startTime = new Date().toISOString();
      const insertQuery = `INSERT INTO pomodoro_sessions (userId, mode, status, duration, elapsed, startTime, taskId) 
                        VALUES (?, ?, ?, ?, ?, ?, ?)`;
      
      db.run(insertQuery, [userId, mode, 'running', duration, 0, startTime, taskId || null], function(err) {
        if (err) {
          console.error('Create pomodoro session error:', err);
          return res.status(500).json({ error: 'Internal server error' });
        }

        const sessionId = this.lastID;
        
        // Create activity record for pomodoro start
        db.run(
          'INSERT INTO activities (userId, taskId, action, description) VALUES (?, ?, ?, ?)',
          [userId, taskId || null, 'pomodoro_started', `Started ${mode} session for ${duration} seconds`],
          (err) => {
          if (err) {
            console.error('Error creating pomodoro activity record:', err);
          }
        }
      );

        res.json({
          id: sessionId,
          mode,
          status: 'running',
          duration,
          elapsed: 0,
          startTime,
          taskId: taskId || null
        });
      });
    });
  } catch (error) {
    console.error('Start pomodoro session error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Pause the current Pomodoro session
app.post('/api/pomodoro/pause', authMiddleware, (req, res) => {
  try {
    const userId = req.user.id;

    // Get the running session
    db.get('SELECT * FROM pomodoro_sessions WHERE userId = ? AND status = "running"', [userId], (err, session) => {
      if (err) {
        console.error('Get running session error:', err);
        return res.status(500).json({ error: 'Internal server error' });
      }

      if (!session) {
        return res.status(404).json({ error: 'No running session found' });
      }

      // Calculate elapsed time
      const now = new Date();
      const startTime = new Date(session.startTime);
      const elapsedSinceStart = Math.floor((now - startTime) / 1000);
      const newElapsed = Math.min(session.elapsed + elapsedSinceStart, session.duration);

      // Update session to paused
      db.run('UPDATE pomodoro_sessions SET status = ?, elapsed = ?, updatedAt = ? WHERE id = ?', 
        ['paused', newElapsed, new Date().toISOString(), session.id], (err) => {
          if (err) {
            console.error('Pause session error:', err);
            return res.status(500).json({ error: 'Internal server error' });
          }

          // Create activity record for pomodoro pause
          db.run(
            'INSERT INTO activities (userId, taskId, action, description) VALUES (?, ?, ?, ?)',
            [userId, session.taskId, 'pomodoro_paused', `Paused ${session.mode} session at ${newElapsed} seconds`],
            (err) => {
              if (err) {
                console.error('Error creating pomodoro activity record:', err);
              }
            }
          );

          res.json({
            id: session.id,
            mode: session.mode,
            status: 'paused',
            duration: session.duration,
            elapsed: newElapsed,
            startTime: session.startTime,
            taskId: session.taskId
          });
        });
    });
  } catch (error) {
    console.error('Pause pomodoro session error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Resume the paused Pomodoro session
app.post('/api/pomodoro/resume', authMiddleware, (req, res) => {
  try {
    const userId = req.user.id;

    // Get the paused session
    db.get('SELECT * FROM pomodoro_sessions WHERE userId = ? AND status = "paused"', [userId], (err, session) => {
      if (err) {
        console.error('Get paused session error:', err);
        return res.status(500).json({ error: 'Internal server error' });
      }

      if (!session) {
        return res.status(404).json({ error: 'No paused session found' });
      }

      // Update session to running
      db.run('UPDATE pomodoro_sessions SET status = ?, updatedAt = ? WHERE id = ?', 
        ['running', new Date().toISOString(), session.id], (err) => {
          if (err) {
            console.error('Resume session error:', err);
            return res.status(500).json({ error: 'Internal server error' });
          }

          // Create activity record for pomodoro resume
          db.run(
            'INSERT INTO activities (userId, taskId, action, description) VALUES (?, ?, ?, ?)',
            [userId, session.taskId, 'pomodoro_resumed', `Resumed ${session.mode} session`],
            (err) => {
              if (err) {
                console.error('Error creating pomodoro activity record:', err);
              }
            }
          );

          res.json({
            id: session.id,
            mode: session.mode,
            status: 'running',
            duration: session.duration,
            elapsed: session.elapsed,
            startTime: session.startTime,
            taskId: session.taskId
          });
        });
    });
  } catch (error) {
    console.error('Resume pomodoro session error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Complete the current Pomodoro session
app.post('/api/pomodoro/complete', authMiddleware, (req, res) => {
  try {
    const userId = req.user.id;

    // Get the running or paused session
    db.get('SELECT * FROM pomodoro_sessions WHERE userId = ? AND (status = "running" OR status = "paused")', [userId], (err, session) => {
      if (err) {
        console.error('Get session to complete error:', err);
        return res.status(500).json({ error: 'Internal server error' });
      }

      if (!session) {
        return res.status(404).json({ error: 'No active session found' });
      }

      // Calculate final elapsed time
      let finalElapsed = session.elapsed;
      if (session.status === 'running') {
        const now = new Date();
        const startTime = new Date(session.startTime);
        const elapsedSinceStart = Math.floor((now - startTime) / 1000);
        finalElapsed = Math.min(session.elapsed + elapsedSinceStart, session.duration);
      }

      // Update session to completed
      const endTime = new Date().toISOString();
      db.run('UPDATE pomodoro_sessions SET status = ?, elapsed = ?, endTime = ?, updatedAt = ? WHERE id = ?', 
        ['completed', finalElapsed, endTime, new Date().toISOString(), session.id], (err) => {
          if (err) {
            console.error('Complete session error:', err);
            return res.status(500).json({ error: 'Internal server error' });
          }

          // Create activity record for pomodoro completion
          db.run(
            'INSERT INTO activities (userId, taskId, action, description) VALUES (?, ?, ?, ?)',
            [userId, session.taskId, 'pomodoro_completed', `Completed ${session.mode} session with ${finalElapsed} seconds`],
            (err) => {
              if (err) {
                console.error('Error creating pomodoro activity record:', err);
              }
            }
          );

          res.json({
            id: session.id,
            mode: session.mode,
            status: 'completed',
            duration: session.duration,
            elapsed: finalElapsed,
            startTime: session.startTime,
            endTime: endTime,
            taskId: session.taskId
          });
        });
    });
  } catch (error) {
    console.error('Complete pomodoro session error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get current Pomodoro session
app.get('/api/pomodoro/current', authMiddleware, (req, res) => {
  try {
    const userId = req.user.id;

    // Get the active session (running or paused)
    db.get(`SELECT * FROM pomodoro_sessions 
           WHERE userId = ? AND (status = "running" OR status = "paused") 
           ORDER BY startTime DESC LIMIT 1`, [userId], (err, session) => {
      if (err) {
        console.error('Get current session error:', err);
        return res.status(500).json({ error: 'Internal server error' });
      }

      if (!session) {
        return res.json(null); // No active session
      }

      // If session is running, calculate current elapsed time
      let currentElapsed = session.elapsed;
      if (session.status === 'running') {
        const now = new Date();
        const startTime = new Date(session.startTime);
        const elapsedSinceStart = Math.floor((now - startTime) / 1000);
        currentElapsed = Math.min(session.elapsed + elapsedSinceStart, session.duration);
      }

      // Calculate remaining time
      const remainingTime = Math.max(0, session.duration - currentElapsed);

      res.json({
        id: session.id,
        mode: session.mode,
        status: session.status,
        duration: session.duration,
        elapsed: currentElapsed,
        remainingTime: remainingTime,
        startTime: session.startTime,
        taskId: session.taskId,
        isRunning: session.status === 'running'
      });
    });
  } catch (error) {
    console.error('Get current pomodoro session error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get Pomodoro history
app.get('/api/pomodoro/history', authMiddleware, (req, res) => {
  try {
    const userId = req.user.id;
    const { limit = 20, offset = 0 } = req.query;

    // Get pomodoro sessions with task information
    const query = `
      SELECT ps.*, t.title as taskTitle, t.status as taskStatus
      FROM pomodoro_sessions ps
      LEFT JOIN tasks t ON ps.taskId = t.id
      WHERE ps.userId = ?
      ORDER BY ps.startTime DESC
      LIMIT ? OFFSET ?
    `;

    db.all(query, [userId, parseInt(limit), parseInt(offset)], (err, sessions) => {
      if (err) {
        console.error('Get pomodoro history error:', err);
        return res.status(500).json({ error: 'Internal server error' });
      }

      res.json(sessions);
    });
  } catch (error) {
    console.error('Get pomodoro history error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


// Get tasks for a specific date
app.get('/api/tasks/date/:date', authMiddleware, (req, res) => {
  try {
    const userId = req.user.id;
    const { date } = req.params;

    // Validate date format (YYYY-MM-DD)
    if (!/^(\d{4})-(\d{2})-(\d{2})$/.test(date)) {
      return res.status(400).json({ error: 'Invalid date format. Use YYYY-MM-DD' });
    }

    db.all('SELECT * FROM tasks WHERE userId = ? AND dueDate LIKE ? ORDER BY dueDate ASC, createdAt DESC', [userId, `${date}%`], (err, tasks) => {
      if (err) {
        console.error('Get tasks by date error:', err);
        return res.status(500).json({ error: 'Internal server error' });
      }

      res.json(tasks);
    });
  } catch (error) {
    console.error('Get tasks by date error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get weekly tasks data
app.get('/api/tasks/weekly', authMiddleware, (req, res) => {
  try {
    const userId = req.user.id;
    const { start, end } = req.query;

    // Validate date formats (YYYY-MM-DD)
    if (!start || !end) {
      return res.status(400).json({ error: 'Start and end dates are required. Use YYYY-MM-DD format' });
    }

    if (!/^(\d{4})-(\d{2})-(\d{2})$/.test(start) || !/^(\d{4})-(\d{2})-(\d{2})$/.test(end)) {
      return res.status(400).json({ error: 'Invalid date format. Use YYYY-MM-DD for both start and end dates' });
    }

    // Query to get tasks for the week grouped by date
    const query = `SELECT *, 
                  COUNT(*) OVER (PARTITION BY SUBSTR(dueDate, 1, 10)) as daily_total,
                  SUM(CASE WHEN status = 'Completed' THEN 1 ELSE 0 END) OVER (PARTITION BY SUBSTR(dueDate, 1, 10)) as daily_completed,
                  SUM(CASE WHEN status != 'Completed' THEN 1 ELSE 0 END) OVER (PARTITION BY SUBSTR(dueDate, 1, 10)) as daily_pending
                  FROM tasks 
                  WHERE userId = ? AND dueDate BETWEEN ? AND ? 
                  ORDER BY dueDate ASC, createdAt DESC`;

    db.all(query, [userId, start, end], (err, tasks) => {
      if (err) {
        console.error('Get weekly tasks error:', err);
        return res.status(500).json({ error: 'Internal server error' });
      }

      // Group tasks by date and calculate daily summaries
      const groupedByDate = {};
      const uniqueDates = new Set();
      
      tasks.forEach(task => {
        const date = task.dueDate.split('T')[0]; // Get just the date part
        if (!groupedByDate[date]) {
          groupedByDate[date] = {
            tasks: [],
            total: 0,
            completed: 0,
            pending: 0
          };
          uniqueDates.add(date);
        }
        
        groupedByDate[date].tasks.push(task);
      });
      
      // Calculate totals for each day
      uniqueDates.forEach(date => {
        const dayTasks = groupedByDate[date].tasks;
        const completed = dayTasks.filter(task => task.status === 'Completed').length;
        const pending = dayTasks.filter(task => task.status !== 'Completed').length;
        
        groupedByDate[date].total = dayTasks.length;
        groupedByDate[date].completed = completed;
        groupedByDate[date].pending = pending;
      });

      // Calculate overall weekly summary
      const weeklySummary = {
        total: tasks.length,
        completed: tasks.filter(task => task.status === 'Completed').length,
        pending: tasks.filter(task => task.status !== 'Completed').length,
        days: Object.keys(groupedByDate).map(date => ({
          date,
          total: groupedByDate[date].total,
          completed: groupedByDate[date].completed,
          pending: groupedByDate[date].pending
        }))
      };

      res.json(weeklySummary);
    });
  } catch (error) {
    console.error('Get weekly tasks error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(PORT, () => {
  console.log(`TaskFlow server running on http://localhost:${PORT}`);
});