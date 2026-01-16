# TaskFlow - Task Manager Application

A complete Task Manager web application built for QA learning, manual testing, API testing, database validation, and UI automation.

## Tech Stack

- **Frontend**: React with Vite, Tailwind CSS
- **Backend**: Node.js with Express
- **Database**: SQLite (file-based)
- **Language**: JavaScript

## Features

### Authentication
- Login and Signup pages
- Demo credentials available (demo@taskflow.com / demo123)
- Profile management with password change

### Dashboard
- Summary cards showing:
  - Total Tasks
  - Completed Tasks
  - Pending Tasks
  - In Progress Tasks
- Expandable/collapsible cards
- Quick action buttons

### Task Management
- Create, read, update, and delete tasks
- Task fields:
  - Title (required, must contain alphanumeric characters)
  - Description (max 500 characters with counter)
  - Status (Pending, In Progress, Completed)
  - Priority (Low, Medium, High - required)
  - Due Date (required, no past dates)
- Search and filter by status and priority
- Complete validation with error messages

### UI Features
- Light and dark theme toggle
- Responsive layout
- Left sidebar navigation
- Professional, production-ready design
- All elements have `data-testid` attributes for automation

## Setup Instructions

### 1. Install Dependencies

**Frontend:**
```bash
npm install
```

**Backend:**
```bash
cd server
npm install
```

### 2. Start the Application

**Start Backend (Terminal 1):**
```bash
cd server
npm start
```
The backend runs on http://localhost:3001

**Start Frontend (Terminal 2):**
```bash
npm run dev
```
The frontend runs on http://localhost:5173

### 3. Login

Use the demo credentials:
- Email: `demo@taskflow.com`
- Password: `demo123`

Or create a new account using the Sign Up tab.

## Database

The SQLite database is automatically created at `db/taskflow_sample.db` when the backend starts. This sample database includes pre-populated data for testing and development purposes.

### Tables

**users:**
- id (primary key)
- name
- email (unique)
- password (hashed with bcrypt)
- createdAt

**tasks:**
- id (primary key)
- userId (foreign key)
- title
- description
- status
- priority
- dueDate
- createdAt

## Testing & Automation

All interactive elements have stable `data-testid` attributes for:
- Manual testing
- Regression testing
- Selenium automation
- Database validation

### Example data-testid values:
- Login: `login-email-input`, `login-password-input`, `login-submit-button`
- Navigation: `nav-dashboard`, `nav-task-list`, `nav-new-task`, `nav-profile`, `nav-logout`
- Task Form: `task-title-input`, `task-description-input`, `task-priority-select`, `task-duedate-input`
- Task List: `task-row-{id}`, `task-edit-button-{id}`, `task-delete-button-{id}`
- Dashboard: `card-total-tasks`, `card-completed-tasks`, `card-pending-tasks`, `card-inprogress-tasks`
- Theme: `theme-toggle-button`

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login
- `POST /api/auth/signup` - Sign up
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile
- `PUT /api/auth/change-password` - Change password

### Tasks
- `GET /api/tasks` - Get all tasks (with search and filters)
- `GET /api/tasks/stats` - Get task statistics
- `GET /api/tasks/:id` - Get single task
- `POST /api/tasks` - Create task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task

## Validation Rules

### Task Title
- Required field
- Must contain at least one alphanumeric character
- Special characters allowed only with letters/numbers

### Task Description
- Optional
- Maximum 500 characters
- Character counter displayed

### Task Priority
- Required field
- Options: Low, Medium, High

### Task Due Date
- Required field
- Must be today or a future date
- Past dates not allowed

## Project Structure

```
taskflow/
├── server/
│   ├── index.js          # Express server
│   ├── database.js       # SQLite setup
│   ├── auth.js           # JWT authentication
│   ├── package.json
│   └── taskflow.db       # SQLite database (auto-generated)
├── src/
│   ├── api/
│   │   └── tasks.js      # API client functions
│   ├── components/
│   │   └── Layout.jsx    # Main layout with sidebar
│   ├── context/
│   │   ├── AuthContext.jsx   # Authentication state
│   │   └── ThemeContext.jsx  # Theme state
│   ├── pages/
│   │   ├── Login.jsx         # Login/Signup page
│   │   ├── Dashboard.jsx     # Dashboard with stats
│   │   ├── TaskList.jsx      # Task list with filters
│   │   ├── TaskForm.jsx      # Create/Edit task
│   │   └── Profile.jsx       # User profile
│   ├── App.tsx           # Main app component
│   ├── main.tsx          # App entry point
│   └── index.css         # Global styles
└── package.json
```

## Notes for QA

- This application is designed specifically for learning and practicing QA skills
- The codebase is intentionally kept simple and readable
- No aggressive optimizations or complex abstractions
- Stable DOM structure for reliable automation
- Comprehensive `data-testid` attributes on all interactive elements
- Clear validation messages for testing error scenarios
