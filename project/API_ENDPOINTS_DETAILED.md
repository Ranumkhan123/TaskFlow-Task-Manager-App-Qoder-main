# TaskFlow API Documentation

Comprehensive documentation for all API endpoints, request/response formats, and payload requirements.

## Base URL
```
http://localhost:3000
```

## Authentication
All protected endpoints require a Bearer token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

---

## 🔐 Authentication Endpoints

### POST /api/auth/login
**Description:** Authenticate user and receive JWT token

**Request Body:**
```json
{
  "email": "string",
  "password": "string"
}
```

**Required Fields:**
- `email` (string) - User's email address
- `password` (string) - User's password

**Response (200):**
```json
{
  "token": "string",
  "user": {
    "id": "number",
    "name": "string",
    "email": "string"
  }
}
```

**Error Responses:**
- `400`: Email and password are required
- `401`: Invalid email or password
- `500`: Internal server error

**Sample Request:**
```bash
POST http://localhost:3000/api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

---

### POST /api/auth/signup
**Description:** Register a new user account

**Request Body:**
```json
{
  "name": "string",
  "email": "string",
  "password": "string"
}
```

**Required Fields:**
- `name` (string) - User's full name
- `email` (string) - User's email address
- `password` (string) - User's password (min 6 characters recommended)

**Response (201):**
```json
{
  "token": "string",
  "user": {
    "id": "number",
    "name": "string",
    "email": "string"
  }
}
```

**Error Responses:**
- `400`: All fields are required / Email already exists
- `500`: Internal server error

**Sample Request:**
```bash
POST http://localhost:3000/api/auth/signup
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword"
}
```

---

### GET /api/auth/me
**Description:** Get current authenticated user's profile information

**Authentication Required:** Yes

**Response (200):**
```json
{
  "id": "number",
  "name": "string",
  "email": "string",
  "createdAt": "string"
}
```

**Error Responses:**
- `401`: Unauthorized
- `404`: User not found
- `500`: Internal server error

**Sample Request:**
```bash
GET http://localhost:3000/api/auth/me
Authorization: Bearer <your-jwt-token>
```

---

### PUT /api/auth/profile
**Description:** Update user profile information

**Authentication Required:** Yes

**Request Body:**
```json
{
  "name": "string"
}
```

**Required Fields:**
- `name` (string) - New name for the user

**Response (200):**
```json
{
  "id": "number",
  "name": "string",
  "email": "string"
}
```

**Error Responses:**
- `400`: Name is required
- `500`: Internal server error

**Sample Request:**
```bash
PUT http://localhost:3000/api/auth/profile
Authorization: Bearer <your-jwt-token>
Content-Type: application/json

{
  "name": "Updated Name"
}
```

---

### PUT /api/auth/change-password
**Description:** Change user's password

**Authentication Required:** Yes

**Request Body:**
```json
{
  "currentPassword": "string",
  "newPassword": "string"
}
```

**Required Fields:**
- `currentPassword` (string) - Current password for verification
- `newPassword` (string) - New password to set

**Response (200):**
```json
{
  "message": "Password changed successfully"
}
```

**Error Responses:**
- `400`: Current and new password are required
- `401`: Current password is incorrect
- `500`: Internal server error

**Sample Request:**
```bash
PUT http://localhost:3000/api/auth/change-password
Authorization: Bearer <your-jwt-token>
Content-Type: application/json

{
  "currentPassword": "oldpassword",
  "newPassword": "newpassword123"
}
```

---

## 📋 Task Endpoints

### GET /api/tasks
**Description:** Get all tasks for the authenticated user with optional filtering

**Authentication Required:** Yes

**Query Parameters:**
- `search` (string) - Search term for title/description
- `status` (string) - Filter by status: "All", "Pending", "In Progress", "Completed"
- `priority` (string) - Filter by priority: "All", "Low", "Medium", "High"

**Response (200):**
```json
[
  {
    "id": "number",
    "userId": "number",
    "title": "string",
    "description": "string",
    "status": "string",
    "priority": "string",
    "dueDate": "string",
    "createdAt": "string",
    "updatedAt": "string"
  }
]
```

**Sample Request:**
```bash
GET http://localhost:3000/api/tasks?status=Pending&priority=High
Authorization: Bearer <your-jwt-token>
```

---

### GET /api/tasks/stats
**Description:** Get task statistics for dashboard

**Authentication Required:** Yes

**Response (200):**
```json
{
  "total": "number",
  "completed": "number",
  "pending": "number",
  "inProgress": "number"
}
```

**Sample Request:**
```bash
GET http://localhost:3000/api/tasks/stats
Authorization: Bearer <your-jwt-token>
```

---

### GET /api/tasks/:id
**Description:** Get a specific task by ID

**Authentication Required:** Yes

**URL Parameters:**
- `id` (number) - Task ID

**Response (200):**
```json
{
  "id": "number",
  "userId": "number",
  "title": "string",
  "description": "string",
  "status": "string",
  "priority": "string",
  "dueDate": "string",
  "createdAt": "string",
  "updatedAt": "string"
}
```

**Error Responses:**
- `404`: Task not found
- `500`: Internal server error

**Sample Request:**
```bash
GET http://localhost:3000/api/tasks/1
Authorization: Bearer <your-jwt-token>
```

---

### POST /api/tasks
**Description:** Create a new task

**Authentication Required:** Yes

**Request Body:**
```json
{
  "title": "string",
  "description": "string",
  "status": "string",
  "priority": "string",
  "dueDate": "string"
}
```

**Required Fields:**
- `title` (string) - Task title
- `priority` (string) - Priority level: "Low", "Medium", "High"
- `dueDate` (string) - Due date in ISO format (YYYY-MM-DD)

**Optional Fields:**
- `description` (string) - Task description
- `status` (string) - Initial status (defaults to "Pending")

**Response (201):**
```json
{
  "id": "number",
  "userId": "number",
  "title": "string",
  "description": "string",
  "status": "string",
  "priority": "string",
  "dueDate": "string",
  "createdAt": "string",
  "updatedAt": "string"
}
```

**Error Responses:**
- `400`: Title, priority, and due date are required
- `500`: Internal server error

**Sample Request:**
```bash
POST http://localhost:3000/api/tasks
Authorization: Bearer <your-jwt-token>
Content-Type: application/json

{
  "title": "Complete project proposal",
  "description": "Finish the quarterly business proposal",
  "status": "Pending",
  "priority": "High",
  "dueDate": "2025-01-20"
}
```

---

### PUT /api/tasks/:id
**Description:** Update an existing task

**Authentication Required:** Yes

**URL Parameters:**
- `id` (number) - Task ID

**Request Body:**
```json
{
  "title": "string",
  "description": "string",
  "status": "string",
  "priority": "string",
  "dueDate": "string"
}
```

**Required Fields:**
- `title` (string) - Updated task title
- `priority` (string) - Updated priority level
- `dueDate` (string) - Updated due date

**Response (200):**
```json
{
  "id": "number",
  "userId": "number",
  "title": "string",
  "description": "string",
  "status": "string",
  "priority": "string",
  "dueDate": "string",
  "createdAt": "string",
  "updatedAt": "string"
}
```

**Error Responses:**
- `400`: Title, priority, and due date are required
- `404`: Task not found
- `500`: Internal server error

**Sample Request:**
```bash
PUT http://localhost:3000/api/tasks/1
Authorization: Bearer <your-jwt-token>
Content-Type: application/json

{
  "title": "Updated project proposal",
  "description": "Updated description",
  "status": "In Progress",
  "priority": "High",
  "dueDate": "2025-01-25"
}
```

---

### DELETE /api/tasks/:id
**Description:** Delete a task

**Authentication Required:** Yes

**URL Parameters:**
- `id` (number) - Task ID

**Response (200):**
```json
{
  "message": "Task deleted successfully"
}
```

**Error Responses:**
- `404`: Task not found
- `500`: Internal server error

**Sample Request:**
```bash
DELETE http://localhost:3000/api/tasks/1
Authorization: Bearer <your-jwt-token>
```

---

### GET /api/tasks/date/:date
**Description:** Get tasks for a specific date

**Authentication Required:** Yes

**URL Parameters:**
- `date` (string) - Date in YYYY-MM-DD format

**Response (200):**
```json
[
  {
    "id": "number",
    "userId": "number",
    "title": "string",
    "description": "string",
    "status": "string",
    "priority": "string",
    "dueDate": "string",
    "createdAt": "string",
    "updatedAt": "string"
  }
]
```

**Error Responses:**
- `400`: Invalid date format
- `500`: Internal server error

**Sample Request:**
```bash
GET http://localhost:3000/api/tasks/date/2025-01-20
Authorization: Bearer <your-jwt-token>
```

---

### GET /api/tasks/weekly
**Description:** Get weekly tasks summary

**Authentication Required:** Yes

**Query Parameters:**
- `start` (string) - Start date in YYYY-MM-DD format (required)
- `end` (string) - End date in YYYY-MM-DD format (required)

**Response (200):**
```json
{
  "total": "number",
  "completed": "number",
  "pending": "number",
  "days": [
    {
      "date": "string",
      "total": "number",
      "completed": "number",
      "pending": "number"
    }
  ]
}
```

**Error Responses:**
- `400`: Start and end dates are required / Invalid date format
- `500`: Internal server error

**Sample Request:**
```bash
GET http://localhost:3000/api/tasks/weekly?start=2025-01-15&end=2025-01-22
Authorization: Bearer <your-jwt-token>
```

---

## ⏰ Pomodoro Timer Endpoints

### POST /api/pomodoro/start
**Description:** Start a new Pomodoro session

**Authentication Required:** Yes

**Request Body:**
```json
{
  "mode": "string",
  "duration": "number",
  "taskId": "number"
}
```

**Required Fields:**
- `mode` (string) - Session mode: "focus" or "break"
- `duration` (number) - Duration in seconds

**Optional Fields:**
- `taskId` (number) - Associated task ID

**Response (200):**
```json
{
  "id": "number",
  "mode": "string",
  "status": "string",
  "duration": "number",
  "elapsed": "number",
  "startTime": "string",
  "taskId": "number"
}
```

**Error Responses:**
- `400`: Mode and duration are required / Invalid mode
- `500`: Internal server error

**Sample Request:**
```bash
POST http://localhost:3000/api/pomodoro/start
Authorization: Bearer <your-jwt-token>
Content-Type: application/json

{
  "mode": "focus",
  "duration": 1500,
  "taskId": 1
}
```

---

### POST /api/pomodoro/pause
**Description:** Pause the current Pomodoro session

**Authentication Required:** Yes

**Response (200):**
```json
{
  "id": "number",
  "mode": "string",
  "status": "string",
  "duration": "number",
  "elapsed": "number",
  "startTime": "string",
  "taskId": "number"
}
```

**Error Responses:**
- `404`: No running session found
- `500`: Internal server error

**Sample Request:**
```bash
POST http://localhost:3000/api/pomodoro/pause
Authorization: Bearer <your-jwt-token>
```

---

### POST /api/pomodoro/resume
**Description:** Resume a paused Pomodoro session

**Authentication Required:** Yes

**Response (200):**
```json
{
  "id": "number",
  "mode": "string",
  "status": "string",
  "duration": "number",
  "elapsed": "number",
  "startTime": "string",
  "taskId": "number"
}
```

**Error Responses:**
- `404`: No paused session found
- `500`: Internal server error

**Sample Request:**
```bash
POST http://localhost:3000/api/pomodoro/resume
Authorization: Bearer <your-jwt-token>
```

---

### POST /api/pomodoro/complete
**Description:** Complete the current Pomodoro session

**Authentication Required:** Yes

**Response (200):**
```json
{
  "id": "number",
  "mode": "string",
  "status": "string",
  "duration": "number",
  "elapsed": "number",
  "startTime": "string",
  "endTime": "string",
  "taskId": "number"
}
```

**Error Responses:**
- `404`: No active session found
- `500`: Internal server error

**Sample Request:**
```bash
POST http://localhost:3000/api/pomodoro/complete
Authorization: Bearer <your-jwt-token>
```

---

### GET /api/pomodoro/current
**Description:** Get the current active Pomodoro session

**Authentication Required:** Yes

**Response (200):**
```json
{
  "id": "number",
  "mode": "string",
  "status": "string",
  "duration": "number",
  "elapsed": "number",
  "remainingTime": "number",
  "startTime": "string",
  "taskId": "number",
  "isRunning": "boolean"
}
```

**Sample Request:**
```bash
GET http://localhost:3000/api/pomodoro/current
Authorization: Bearer <your-jwt-token>
```

---

### GET /api/pomodoro/history
**Description:** Get Pomodoro session history

**Authentication Required:** Yes

**Query Parameters:**
- `limit` (number) - Number of records to return (default: 20)
- `offset` (number) - Number of records to skip (default: 0)

**Response (200):**
```json
[
  {
    "id": "number",
    "userId": "number",
    "mode": "string",
    "status": "string",
    "duration": "number",
    "elapsed": "number",
    "startTime": "string",
    "endTime": "string",
    "taskId": "number",
    "taskTitle": "string",
    "taskStatus": "string"
  }
]
```

**Sample Request:**
```bash
GET http://localhost:3000/api/pomodoro/history?limit=10&offset=0
Authorization: Bearer <your-jwt-token>
```

---

## 📊 Activity Endpoints

### GET /api/activities
**Description:** Get user's activity history

**Authentication Required:** Yes

**Query Parameters:**
- `limit` (number) - Number of records to return (default: 20)
- `offset` (number) - Number of records to skip (default: 0)

**Response (200):**
```json
[
  {
    "id": "number",
    "userId": "number",
    "taskId": "number",
    "action": "string",
    "description": "string",
    "timestamp": "string",
    "taskTitle": "string",
    "userName": "string"
  }
]
```

**Sample Request:**
```bash
GET http://localhost:3000/api/activities?limit=20&offset=0
Authorization: Bearer <your-jwt-token>
```

---

### GET /api/tasks/:id/activities
**Description:** Get activities for a specific task

**Authentication Required:** Yes

**URL Parameters:**
- `id` (number) - Task ID

**Response (200):**
```json
[
  {
    "id": "number",
    "userId": "number",
    "taskId": "number",
    "action": "string",
    "description": "string",
    "timestamp": "string",
    "userName": "string"
  }
]
```

**Error Responses:**
- `404`: Task not found
- `500`: Internal server error

**Sample Request:**
```bash
GET http://localhost:3000/api/tasks/1/activities
Authorization: Bearer <your-jwt-token>
```

---

## 📝 Data Models

### User Model
```json
{
  "id": "number",
  "name": "string",
  "email": "string",
  "password": "string", // Hashed, not exposed in responses
  "createdAt": "string"
}
```

### Task Model
```json
{
  "id": "number",
  "userId": "number",
  "title": "string",
  "description": "string",
  "status": "string", // "Pending", "In Progress", "Completed"
  "priority": "string", // "Low", "Medium", "High"
  "dueDate": "string", // ISO format datetime
  "createdAt": "string",
  "updatedAt": "string"
}
```

### Pomodoro Session Model
```json
{
  "id": "number",
  "userId": "number",
  "mode": "string", // "focus", "break"
  "status": "string", // "running", "paused", "completed"
  "duration": "number", // in seconds
  "elapsed": "number", // in seconds
  "startTime": "string", // ISO format datetime
  "endTime": "string", // ISO format datetime (when completed)
  "taskId": "number", // optional reference to task
  "createdAt": "string",
  "updatedAt": "string"
}
```

### Activity Model
```json
{
  "id": "number",
  "userId": "number",
  "taskId": "number", // nullable
  "action": "string", // "created", "updated", "deleted", "completed", etc.
  "description": "string",
  "timestamp": "string" // ISO format datetime
}
```

---

## 🛠️ Common Status Codes

| Status Code | Description |
|-------------|-------------|
| 200 | OK - Request successful |
| 201 | Created - Resource created successfully |
| 400 | Bad Request - Invalid request data |
| 401 | Unauthorized - Authentication required |
| 404 | Not Found - Resource not found |
| 500 | Internal Server Error - Server error |

---

## 🔧 Error Response Format

All error responses follow this format:
```json
{
  "error": "string"
}
```

---

## 📱 Client Integration Example

### JavaScript/Fetch Example
```javascript
// Login
async function login(email, password) {
  const response = await fetch('http://localhost:3000/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ email, password })
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error);
  }
  
  return response.json();
}

// Get tasks with authentication
async function getTasks(token) {
  const response = await fetch('http://localhost:3000/api/tasks', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error);
  }
  
  return response.json();
}
```

---

*Last Updated: January 2026*