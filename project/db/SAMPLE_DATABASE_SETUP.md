# TaskFlow Sample Database Setup

This document provides a complete guide to the sample database implementation for the TaskFlow application.

## Overview

The TaskFlow application now includes a comprehensive sample database with pre-populated data for testing and development purposes. The database includes:

- **users** table: Stores user information
- **tasks** table: Stores task information
- **activities** table: Tracks user activities and task events

## Database File Location

The sample database is located at:
`project/db/taskflow_sample.db`

## Table Structures

### users
- id: INTEGER PRIMARY KEY AUTOINCREMENT
- name: TEXT NOT NULL
- email: TEXT UNIQUE NOT NULL
- password: TEXT NOT NULL (hashed)
- role: TEXT DEFAULT 'User'
- createdAt: TEXT DEFAULT CURRENT_TIMESTAMP

### tasks
- id: INTEGER PRIMARY KEY AUTOINCREMENT
- userId: INTEGER NOT NULL (foreign key to users)
- title: TEXT NOT NULL
- description: TEXT
- status: TEXT NOT NULL DEFAULT 'Pending' (Pending, In Progress, Completed)
- priority: TEXT NOT NULL DEFAULT 'Medium' (Low, Medium, High)
- dueDate: TEXT NOT NULL
- createdAt: TEXT DEFAULT CURRENT_TIMESTAMP
- updatedAt: TEXT DEFAULT CURRENT_TIMESTAMP

### activities
- id: INTEGER PRIMARY KEY AUTOINCREMENT
- userId: INTEGER NOT NULL (foreign key to users)
- taskId: INTEGER (foreign key to tasks, nullable)
- action: TEXT NOT NULL (created, updated, completed, deleted, commented, assigned, reopened)
- description: TEXT
- timestamp: TEXT DEFAULT CURRENT_TIMESTAMP

## Sample Data

The database comes pre-populated with:

- **Users**: 4 users including the demo user
  - Demo User: demo@taskflow.com / demo123 (admin)
  - John Doe: john@example.com / password123
  - Jane Smith: jane@example.com / password123
  - Bob Johnson: bob@example.com / password123

- **Tasks**: 15 sample tasks distributed among users with various statuses and priorities

- **Activities**: 25 activity records tracking task lifecycle events

## API Integration

The backend server has been enhanced with new API endpoints:

- `GET /api/activities` - Get all activities for a user
- `GET /api/tasks/:id/activities` - Get activities for a specific task
- Enhanced existing endpoints to automatically log activities:
  - Creating a task logs a "created" activity
  - Updating a task logs an "updated" activity
  - Completing a task logs a "completed" activity
  - Deleting a task logs a "deleted" activity

## Running the Application

1. **Start the backend server**:
   ```bash
   cd project/server
   npm start
   ```
   The server will run on http://localhost:3000

2. **Start the frontend server**:
   ```bash
   cd project
   npm run dev
   ```
   The frontend will be available at http://localhost:5175 (or similar port)

3. **Access the application**:
   - Navigate to the frontend URL
   - Login with demo credentials: demo@taskflow.com / demo123
   - The application will connect to the sample database automatically

## Database Management

### Adding More Sample Data

To add more sample data, run:
```bash
node db/populate_sample_data.js
```

### Regenerating the Database

To completely regenerate the database with fresh sample data:
```bash
node db/init_db.js
node db/populate_sample_data.js
```

### Connecting with Database Tools

You can open the database file (`db/taskflow_sample.db`) with any SQLite database browser tool such as:
- DB Browser for SQLite
- DBeaver
- DataGrip
- SQLite Studio

## Verification

Run the verification script to confirm the database is set up correctly:
```bash
node db/verify_db.js
```

## Key Features

1. **Automatic Activity Tracking**: Every task operation generates activity records
2. **Pre-populated Data**: Ready-to-use sample data for immediate testing
3. **Compatible API**: All existing API endpoints continue to work unchanged
4. **Development Ready**: Perfect for testing, demos, and development
5. **Production-like Schema**: Uses the same structure as a production database

The sample database is now fully integrated with the TaskFlow application and ready for use!