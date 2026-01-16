# 📚 **TaskFlow Application Documentation**

Welcome to the complete documentation for TaskFlow - a comprehensive task management application with Pomodoro timer, weekly planning, and activity tracking features.

## 1. 🌐 **API Documentation**

### **Authentication Endpoints**

#### `POST /api/auth/register`
- **Description**: Register a new user
- **Authentication**: None
- **Request Body**:
```json
{
  "username": "string",
  "email": "string",
  "password": "string"
}
```
- **Response**:
```json
{
  "token": "string",
  "user": {
    "id": "integer",
    "username": "string",
    "email": "string"
  }
}
```

#### `POST /api/auth/login`
- **Description**: Login user
- **Authentication**: None
- **Request Body**:
```json
{
  "email": "string",
  "password": "string"
}
```
- **Response**:
```json
{
  "token": "string",
  "user": {
    "id": "integer",
    "username": "string",
    "email": "string"
  }
}
```

### **Task Endpoints**

#### `GET /api/tasks`
- **Description**: Get all user tasks
- **Authentication**: Required (Bearer token)
- **Query Parameters**:
  - `status`: Filter by status (Pending, In Progress, Completed)
  - `priority`: Filter by priority (Low, Medium, High)
  - `date`: Filter by specific date (YYYY-MM-DD)
- **Response**:
```json
[
  {
    "id": "integer",
    "title": "string",
    "description": "string",
    "status": "string",
    "priority": "string",
    "dueDate": "datetime",
    "createdAt": "datetime",
    "updatedAt": "datetime",
    "userId": "integer"
  }
]
```

#### `POST /api/tasks`
- **Description**: Create a new task
- **Authentication**: Required (Bearer token)
- **Request Body**:
```json
{
  "title": "string",
  "description": "string",
  "status": "string",
  "priority": "string",
  "dueDate": "datetime"
}
```
- **Response**:
```json
{
  "id": "integer",
  "title": "string",
  "description": "string",
  "status": "string",
  "priority": "string",
  "dueDate": "datetime",
  "createdAt": "datetime",
  "updatedAt": "datetime",
  "userId": "integer"
}
```

#### `GET /api/tasks/:id`
- **Description**: Get a specific task
- **Authentication**: Required (Bearer token)
- **Response**:
```json
{
  "id": "integer",
  "title": "string",
  "description": "string",
  "status": "string",
  "priority": "string",
  "dueDate": "datetime",
  "createdAt": "datetime",
  "updatedAt": "datetime",
  "userId": "integer"
}
```

#### `PUT /api/tasks/:id`
- **Description**: Update a task
- **Authentication**: Required (Bearer token)
- **Request Body**:
```json
{
  "title": "string",
  "description": "string",
  "status": "string",
  "priority": "string",
  "dueDate": "datetime"
}
```
- **Response**:
```json
{
  "id": "integer",
  "title": "string",
  "description": "string",
  "status": "string",
  "priority": "string",
  "dueDate": "datetime",
  "createdAt": "datetime",
  "updatedAt": "datetime",
  "userId": "integer"
}
```

#### `DELETE /api/tasks/:id`
- **Description**: Delete a task
- **Authentication**: Required (Bearer token)
- **Response**: 200 OK

#### `GET /api/tasks/stats`
- **Description**: Get task statistics for dashboard
- **Authentication**: Required (Bearer token)
- **Response**:
```json
{
  "total": "integer",
  "completed": "integer",
  "pending": "integer",
  "inProgress": "integer"
}
```

#### `GET /api/tasks/date/:date`
- **Description**: Get tasks for a specific date
- **Authentication**: Required (Bearer token)
- **Parameters**: 
  - `date`: Date in YYYY-MM-DD format
- **Response**:
```json
[
  {
    "id": "integer",
    "title": "string",
    "description": "string",
    "status": "string",
    "priority": "string",
    "dueDate": "datetime",
    "createdAt": "datetime",
    "updatedAt": "datetime",
    "userId": "integer"
  }
]
```

#### `GET /api/tasks/weekly`
- **Description**: Get weekly tasks summary
- **Authentication**: Required (Bearer token)
- **Query Parameters**:
  - `start`: Start date (YYYY-MM-DD)
  - `end`: End date (YYYY-MM-DD)
- **Response**:
```json
{
  "total": "integer",
  "completed": "integer",
  "pending": "integer",
  "byDay": {
    "YYYY-MM-DD": {
      "total": "integer",
      "completed": "integer",
      "pending": "integer"
    }
  }
}
```

### **User Endpoints**

#### `GET /api/users/profile`
- **Description**: Get user profile
- **Authentication**: Required (Bearer token)
- **Response**:
```json
{
  "id": "integer",
  "name": "string",
  "email": "string",
  "createdAt": "datetime"
}
```

#### `PUT /api/users/profile`
- **Description**: Update user profile
- **Authentication**: Required (Bearer token)
- **Request Body**:
```json
{
  "name": "string",
  "email": "string"
}
```
- **Response**:
```json
{
  "id": "integer",
  "name": "string",
  "email": "string",
  "createdAt": "datetime"
}
```

#### `PUT /api/users/profile/password`
- **Description**: Update user password
- **Authentication**: Required (Bearer token)
- **Request Body**:
```json
{
  "currentPassword": "string",
  "newPassword": "string"
}
```
- **Response**: 200 OK

### **Pomodoro Endpoints**

#### `POST /api/pomodoro/sessions`
- **Description**: Create a pomodoro session
- **Authentication**: Required (Bearer token)
- **Request Body**:
```json
{
  "taskId": "integer",
  "duration": "integer",
  "type": "string"
}
```
- **Response**:
```json
{
  "id": "integer",
  "taskId": "integer",
  "duration": "integer",
  "type": "string",
  "completed": "boolean",
  "createdAt": "datetime",
  "userId": "integer"
}
```

## 2. 🖥️ **Frontend Documentation**

### **Main Components & Pages**

#### **Core Components**
- **Layout.jsx**: Main layout with sidebar navigation, header, and footer
- **AuthContext.jsx**: Authentication state management
- **ThemeContext.jsx**: Dark/light theme management
- **PomodoroContext.jsx**: Pomodoro timer state management

#### **Pages**
- **Dashboard.jsx**: Main dashboard with task stats, quick actions, and progress overview
- **TaskList.jsx**: List view of all tasks with filtering and search
- **TaskForm.jsx**: Create/edit task form with validation
- **Login.jsx**: User authentication page
- **Profile.jsx**: User profile management
- **Activity.jsx**: Recent activity tracking with filtering
- **WeeklyCalendar.jsx**: Weekly calendar view with day-by-day task display

### **UI Elements & Interactions**

#### **Navigation & Layout**
- **Sidebar**: Contains navigation links to all main pages
- **Header**: Shows app name, theme toggle, and user profile dropdown
- **Footer**: Contains copyright information and developer credit

#### **Dashboard Features**
- **Task Statistics Cards**: Total, completed, pending, in-progress tasks
- **Quick Actions**: Buttons for creating tasks, viewing all tasks, weekly calendar, and activity
- **Task Progress Chart**: Visual donut chart showing task completion status
- **Pomodoro Timer**: Focus timer with start/pause/reset functionality

#### **Task Management**
- **Task Form**: Complete form with title, description, status, priority, and due date fields
- **Task List**: Grid/table view with filtering and sorting capabilities
- **Task Cards**: Individual task displays with status indicators and action buttons

#### **API Interactions**
- **Authentication**: Token-based authentication using localStorage
- **Error Handling**: Consistent error handling across all API calls
- **Loading States**: Visual feedback during API operations
- **Validation**: Client-side form validation with error messages

### **Global State Management**
- **Auth Context**: Manages user authentication state and token
- **Theme Context**: Handles light/dark mode preferences
- **Pomodoro Context**: Manages timer state, duration, and session tracking

## 3. 🛠️ **Backend Documentation**

### **Server Structure**
- **Main Server File**: `server/index.js` - Express server with middleware and routes
- **Database**: SQLite with `better-sqlite3` driver
- **Authentication**: JWT-based with middleware for protected routes
- **CORS**: Configured for frontend integration

### **Middleware**
- **Authentication Middleware**: Validates JWT tokens for protected routes
- **CORS Middleware**: Enables cross-origin requests from frontend
- **JSON Middleware**: Parses JSON request bodies
- **Static Files**: Serves static assets

### **Business Logic**
- **User Management**: Registration, login, profile updates, password changes
- **Task Management**: CRUD operations, statistics calculation, date-based queries
- **Activity Tracking**: Automatic logging of task creation, updates, and completions
- **Pomodoro Sessions**: Timer session tracking and completion logging

### **Database Interactions**
- **SQLite Database**: File-based database with ACID transactions
- **Prepared Statements**: Prevents SQL injection attacks
- **Connection Pooling**: Efficient database connection management
- **Transaction Handling**: Ensures data consistency

## 4. 🗄️ **Database Schema**

### **Users Table**
```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### **Tasks Table**
```sql
CREATE TABLE tasks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'Pending',
  priority TEXT DEFAULT 'Medium',
  dueDate DATETIME,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  userId INTEGER NOT NULL,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);
```

### **Pomodoro Sessions Table**
```sql
CREATE TABLE pomodoro_sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  taskId INTEGER,
  duration INTEGER NOT NULL,
  type TEXT NOT NULL, -- 'focus' or 'break'
  completed BOOLEAN DEFAULT 0,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  userId INTEGER NOT NULL,
  FOREIGN KEY (taskId) REFERENCES tasks(id) ON DELETE SET NULL,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);
```

### **Sample Data**
The database includes sample data for demonstration purposes with:
- Pre-populated users for testing
- Sample tasks with various statuses and priorities
- Pomodoro session history for activity tracking

### **Data Operations**
- **CREATE**: Insert new records with proper validation
- **READ**: Query with filtering, sorting, and pagination
- **UPDATE**: Update records with timestamp tracking
- **DELETE**: Soft/hard delete with cascade operations

## 5. 🔄 **Workflows & End-to-End Flows**

### **Task Creation Workflow**
1. **Frontend**: User fills TaskForm and clicks "Create Task"
2. **Validation**: Client-side validation ensures required fields
3. **API Call**: POST `/api/tasks` with task data and auth token
4. **Backend**: Server validates data and creates task in database
5. **Response**: Returns created task with ID and timestamps
6. **Database**: New task inserted with userId and current timestamps

### **Task Update Workflow**
1. **Frontend**: User clicks edit button and modifies task
2. **API Call**: PUT `/api/tasks/:id` with updated data
3. **Backend**: Updates task and updates `updatedAt` timestamp
4. **Response**: Returns updated task object
5. **UI Update**: Task list refreshes with new data

### **Pomodoro Session Workflow**
1. **Frontend**: User starts Pomodoro timer from dashboard
2. **Timer Logic**: Frontend manages countdown and state
3. **Session Creation**: When timer completes, POST to `/api/pomodoro/sessions`
4. **Backend**: Records session with duration and type
5. **Database**: Session stored with user and optional task reference

### **Weekly Planning Workflow**
1. **Frontend**: User navigates to WeeklyCalendar page
2. **API Call**: GET `/api/tasks/weekly` with date range
3. **Backend**: Groups tasks by day within the week
4. **Response**: Returns daily task counts and summaries
5. **UI Display**: Calendar view shows tasks by day with color coding

### **Activity Tracking Workflow**
1. **Backend**: Automatic activity logging on task operations
2. **Frontend**: Activity page fetches recent activities
3. **API Call**: GET `/api/tasks` to get all user tasks
4. **Processing**: Create activity entries from task timestamps
5. **Display**: Shows chronological list of task activities

## 6. 💡 **Additional Notes**

### **Global State Usage**
- **Auth Context**: Maintains user session across application
- **Theme Context**: Persists user theme preference
- **Pomodoro Context**: Manages timer state that persists across components

### **Persistent Features**
- **Timer Management**: Pomodoro timer continues across page navigations
- **Local Storage**: Theme preferences and user settings
- **Session Management**: JWT token storage and automatic refresh

### **Advanced Features**
- **Activity Tracking**: Automatic logging of user actions
- **Weekly Planning**: Intelligent grouping of tasks by date
- **Responsive Design**: Works on desktop and mobile devices
- **Dark/Light Mode**: User preference-based theme switching
- **Real-time Updates**: Live dashboard statistics and progress tracking

### **Security Features**
- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: Bcrypt for secure password storage
- **Input Validation**: Server-side validation and sanitization
- **SQL Injection Prevention**: Prepared statements for all queries

### **Performance Optimizations**
- **Efficient Queries**: Indexed database queries
- **Caching**: Minimal caching for frequently accessed data
- **Lazy Loading**: Component-based loading for better performance
- **Optimized Rendering**: React best practices for efficient updates

The TaskFlow application provides a complete task management solution with Pomodoro timer integration, weekly planning capabilities, and comprehensive activity tracking while maintaining security, performance, and user experience standards.