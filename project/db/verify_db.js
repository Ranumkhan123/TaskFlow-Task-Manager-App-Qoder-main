import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

async function verifyDatabase() {
  try {
    // Open database connection
    const db = await open({
      filename: './db/taskflow_sample.db',
      driver: sqlite3.Database
    });

    // Check if tables exist and count records
    console.log('Verifying TaskFlow sample database...\n');

    // Check users table
    const users = await db.all('SELECT COUNT(*) as count FROM users');
    console.log(`✓ Users table: ${users[0].count} records`);

    // Check tasks table
    const tasks = await db.all('SELECT COUNT(*) as count FROM tasks');
    console.log(`✓ Tasks table: ${tasks[0].count} records`);

    // Check activities table
    const activities = await db.all('SELECT COUNT(*) as count FROM activities');
    console.log(`✓ Activities table: ${activities[0].count} records`);

    // Show sample data
    console.log('\nSample Users:');
    const sampleUsers = await db.all('SELECT id, name, email FROM users LIMIT 5');
    for (const user of sampleUsers) {
      console.log(`  - ${user.name} (${user.email}) [ID: ${user.id}]`);
    }

    console.log('\nSample Tasks:');
    const sampleTasks = await db.all(`
      SELECT t.id, t.title, u.name as user_name, t.status, t.priority 
      FROM tasks t 
      JOIN users u ON t.userId = u.id 
      LIMIT 5
    `);
    for (const task of sampleTasks) {
      console.log(`  - ${task.title} [Status: ${task.status}, Priority: ${task.priority}, User: ${task.user_name}]`);
    }

    console.log('\nSample Activities:');
    const sampleActivities = await db.all(`
      SELECT a.id, u.name as user_name, t.title as task_title, a.action, a.description 
      FROM activities a 
      JOIN users u ON a.userId = u.id 
      LEFT JOIN tasks t ON a.taskId = t.id 
      LIMIT 5
    `);
    for (const activity of sampleActivities) {
      console.log(`  - ${activity.action}: ${activity.description}`);
    }

    console.log('\n✓ Database verification completed successfully!');
    console.log('✓ Database file: db/taskflow_sample.db');
    console.log('✓ Ready for use with the TaskFlow application');

    await db.close();
  } catch (error) {
    console.error('Error verifying database:', error);
  }
}

verifyDatabase();