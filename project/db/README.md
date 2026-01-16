# TaskFlow Sample Database

This directory contains the sample SQLite database for the TaskFlow application with pre-populated data for testing and development purposes.

## Database Structure

The sample database includes the following tables:

### users
- id: INTEGER PRIMARY KEY
- name: TEXT NOT NULL
- email: TEXT UNIQUE NOT NULL
- password: TEXT NOT NULL
- role: TEXT DEFAULT 'User'
- createdAt: TEXT DEFAULT CURRENT_TIMESTAMP

### tasks
- id: INTEGER PRIMARY KEY
- userId: INTEGER NOT NULL (foreign key to users)
- title: TEXT NOT NULL
- description: TEXT
- status: TEXT NOT NULL DEFAULT 'Pending'
- priority: TEXT NOT NULL DEFAULT 'Medium'
- dueDate: TEXT NOT NULL
- createdAt: TEXT DEFAULT CURRENT_TIMESTAMP
- updatedAt: TEXT DEFAULT CURRENT_TIMESTAMP

### activities
- id: INTEGER PRIMARY KEY
- userId: INTEGER NOT NULL (foreign key to users)
- taskId: INTEGER (foreign key to tasks)
- action: TEXT NOT NULL ('created', 'updated', 'deleted', 'completed', 'commented', 'assigned')
- description: TEXT
- timestamp: TEXT DEFAULT CURRENT_TIMESTAMP

## Sample Data

The database comes pre-populated with:

- 1 admin user: `demo@taskflow.com` / `demo123`
- 3 additional sample users
- 14 sample tasks distributed among the users
- 16 sample activity records

## How to Use

1. The application automatically connects to the sample database when running the server
2. The database file is located at `db/taskflow_sample.db`
3. You can open the database file with any SQLite browser tool (DB Browser for SQLite, DBeaver, DataGrip, etc.)

## Regenerating Sample Data

If you need to regenerate the sample data, you can run:

```bash
npm install sqlite sqlite3 bcryptjs
node db/init_db.js
node db/populate_sample_data.js
```

## Connection Details

The application connects to the sample database through the existing API endpoints. All functionality remains the same as the original application.