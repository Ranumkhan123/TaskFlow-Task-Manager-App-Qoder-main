import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import bcrypt from 'bcryptjs';

async function populateSampleData() {
  // Open a database connection
  const db = await open({
    filename: './db/taskflow_sample.db',
    driver: sqlite3.Database
  });

  // Get all users to assign tasks to them
  const users = await db.all('SELECT * FROM users');
  
  // Sample tasks for different users
  const sampleTasks = [
    // Tasks for Demo User (first user)
    {
      userId: users[0].id,
      title: 'Implement authentication system',
      description: 'Create a secure authentication system with JWT tokens',
      status: 'Completed',
      priority: 'High',
      dueDate: '2024-12-15'
    },
    {
      userId: users[0].id,
      title: 'Design dashboard UI',
      description: 'Create an intuitive dashboard UI with charts and graphs',
      status: 'Completed',
      priority: 'Medium',
      dueDate: '2024-12-10'
    },
    {
      userId: users[0].id,
      title: 'Setup CI/CD pipeline',
      description: 'Configure continuous integration and deployment pipeline',
      status: 'In Progress',
      priority: 'High',
      dueDate: '2025-01-10'
    },
    {
      userId: users[0].id,
      title: 'Write API documentation',
      description: 'Document all API endpoints with examples',
      status: 'Pending',
      priority: 'Medium',
      dueDate: '2025-01-20'
    },
    // Tasks for John Doe (second user)
    {
      userId: users[1].id,
      title: 'Refactor legacy code',
      description: 'Refactor old code to improve performance and maintainability',
      status: 'In Progress',
      priority: 'High',
      dueDate: '2025-01-15'
    },
    {
      userId: users[1].id,
      title: 'Fix reported bugs',
      description: 'Address critical bugs reported by users',
      status: 'Pending',
      priority: 'High',
      dueDate: '2025-01-05'
    },
    // Tasks for Jane Smith (third user)
    {
      userId: users[2].id,
      title: 'Conduct user research',
      description: 'Research user needs and preferences for new features',
      status: 'In Progress',
      priority: 'Medium',
      dueDate: '2025-01-25'
    },
    {
      userId: users[2].id,
      title: 'Create user personas',
      description: 'Develop detailed user personas for product development',
      status: 'Pending',
      priority: 'Low',
      dueDate: '2025-02-01'
    },
    // Tasks for Bob Johnson (fourth user)
    {
      userId: users[3].id,
      title: 'Optimize database queries',
      description: 'Improve performance of slow database queries',
      status: 'In Progress',
      priority: 'High',
      dueDate: '2025-01-12'
    },
    {
      userId: users[3].id,
      title: 'Setup monitoring system',
      description: 'Implement system monitoring and alerting',
      status: 'Pending',
      priority: 'Medium',
      dueDate: '2025-01-30'
    }
  ];

  // Insert sample tasks
  for (const task of sampleTasks) {
    const result = await db.run(
      'INSERT INTO tasks (userId, title, description, status, priority, dueDate) VALUES (?, ?, ?, ?, ?, ?)',
      [task.userId, task.title, task.description, task.status, task.priority, task.dueDate]
    );
    
    // Create activity records for each task
    await db.run(
      'INSERT INTO activities (userId, taskId, action, description) VALUES (?, ?, ?, ?)',
      [task.userId, result.lastID, 'created', `Created task: ${task.title}`]
    );
    
    if (task.status === 'Completed') {
      await db.run(
        'INSERT INTO activities (userId, taskId, action, description) VALUES (?, ?, ?, ?)',
        [task.userId, result.lastID, 'completed', `Completed task: ${task.title}`]
      );
    } else if (task.status === 'In Progress') {
      await db.run(
        'INSERT INTO activities (userId, taskId, action, description) VALUES (?, ?, ?, ?)',
        [task.userId, result.lastID, 'updated', `Started working on task: ${task.title}`]
      );
    }
  }

  // Add some more activity records for demonstration
  const additionalActivities = [
    {
      userId: users[0].id,
      taskId: 1, // First task
      action: 'updated',
      description: 'Updated the authentication system to use refresh tokens'
    },
    {
      userId: users[1].id,
      taskId: 5, // John's first task
      action: 'commented',
      description: 'Added notes about the refactoring approach'
    },
    {
      userId: users[2].id,
      taskId: 7, // Jane's first task
      action: 'assigned',
      description: 'Assigned to team member for execution'
    }
  ];

  for (const activity of additionalActivities) {
    await db.run(
      'INSERT INTO activities (userId, taskId, action, description) VALUES (?, ?, ?, ?)',
      [activity.userId, activity.taskId, activity.action, activity.description]
    );
  }

  console.log('Sample data populated successfully!');
  console.log(`Added ${sampleTasks.length} tasks and ${additionalActivities.length + sampleTasks.length + 3 /* completed tasks */} activities`);

  await db.close();
}

populateSampleData().catch(console.error);