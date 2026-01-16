# TaskFlow API Documentation

This document provides a complete reference for all available API endpoints in the TaskFlow application.

## Base URL
`http://localhost:3000/api`

## Authentication
Most endpoints require authentication using JWT tokens. Include the token in the request header:
```
Authorization: Bearer <your-jwt-token>
```

## API Endpoints

### Authentication Endpoints

#### POST /api/auth/login
**Description:** Authenticate user and retrieve JWT token

**Request Body:**
```json
{
  "email": "string",
  "password": "string"
}
```

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

**Response (400):**
```json
{
  "error": "Email and password are required"
}
```

**Response (401):**
```json
{
  "error": "Invalid email or password"
}
```

**Sample Request:**
```
POST http://localhost:3000/api/auth/login
Content-Type: application/json

{
  "email": "demo@taskflow.com",
  "password": "demo123"
}
```

---

#### POST /api/auth/signup
**Description:** Create a new user account

**Request Body:**
```json
{
  "name": "string",
  "email": "string",
  "password": "string"
}
```

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

**Response (400):**
```json
{
  "error": "All fields are required"
}
```

**Response (400):**
```json
{
  "error": "Email already exists"
}
```

**Sample Request:**
```
POST http://localhost:3000/api/auth/signup
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john.doe@example.com",
  "password": "securepassword"
}
```

---

#### GET /api/auth/me
**Description:** Get current user information

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

**Response (401):**
```json
{
  "error": "Unauthorized"
}
```

**Sample Request:**
```
GET http://localhost:3000/api/auth/me
Authorization: Bearer <your-jwt-token>
```

---

#### PUT /api/auth/profile
**Description:** Update user profile information

**Authentication Required:** Yes

**Request Body:**
```json
{
  "name": "string"
}
```

**Response (200):**
```json
{
  "id": "number",
  "name": "string",
  "email": "string"
}
```

**Response (400):**
```json
{
  "error": "Name is required"
}
```

**Sample Request:**
```
PUT http://localhost:3000/api/auth/profile
Authorization: Bearer <your-jwt-token>
Content-Type: application/json

{
  "name": "Updated Name"
}
```

---

#### PUT /api/auth/change-password
**Description:** Change user password

**Authentication Required:** Yes

**Request Body:**
```json
{
  "currentPassword": "string",
  "newPassword": "string"
}
```

**Response (200):**
```json
{
  "message": "Password changed successfully"
}
```

**Response (400):**
```json
{
  "error": "Current and new password are required"
}
```

**Response (401):**
```json
{
  "error": "Current password is incorrect"
}
```

**Sample Request:**
```
PUT http://localhost:3000/api/auth/change-password
Authorization: Bearer <your-jwt-token>
Content-Type: application/json

{
  "currentPassword": "oldpassword",
  "newPassword": "newpassword"
}
```

---

### Task Endpoints

#### GET /api/tasks
**Description:** Get all tasks for the authenticated user with optional filtering

**Authentication Required:** Yes

**Query Parameters:**
- `search` (optional): Search term for title or description
- `status` (optional): Filter by status (Pending, In Progress, Completed)
- `priority` (optional): Filter by priority (Low, Medium, High)

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
```
GET http://localhost:3000/api/tasks?search=project&status=Pending&priority=High
Authorization: Bearer <your-jwt-token>
```

---

#### GET /api/tasks/stats
**Description:** Get task statistics for the authenticated user

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
```
GET http://localhost:3000/api/tasks/stats
Authorization: Bearer <your-jwt-token>
```

---

#### GET /api/tasks/:id
**Description:** Get a specific task by ID

**Authentication Required:** Yes

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

**Response (404):**
```json
{
  "error": "Task not found"
}
```

**Sample Request:**
```
GET http://localhost:3000/api/tasks/1
Authorization: Bearer <your-jwt-token>
```

---

#### POST /api/tasks
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

**Response (400):**
```json
{
  "error": "Title, priority, and due date are required"
}
```

**Sample Request:**
```
POST http://localhost:3000/api/tasks
Authorization: Bearer <your-jwt-token>
Content-Type: application/json

{
  "title": "Complete project proposal",
  "description": "Finish the project proposal document",
  "status": "Pending",
  "priority": "High",
  "dueDate": "2025-01-15"
}
```

---

#### PUT /api/tasks/:id
**Description:** Update an existing task

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

**Response (400):**
```json
{
  "error": "Title, priority, and due date are required"
}
```

**Response (404):**
```json
{
  "error": "Task not found"
}
```

**Sample Request:**
```
PUT http://localhost:3000/api/tasks/1
Authorization: Bearer <your-jwt-token>
Content-Type: application/json

{
  "title": "Updated project proposal",
  "description": "Updated description",
  "status": "In Progress",
  "priority": "High",
  "dueDate": "2025-01-20"
}
```

---

#### DELETE /api/tasks/:id
**Description:** Delete a task

**Authentication Required:** Yes

**Response (200):**
```json
{
  "message": "Task deleted successfully"
}
```

**Response (404):**
```json
{
  "error": "Task not found"
}
```

**Sample Request:**
```
DELETE http://localhost:3000/api/tasks/1
Authorization: Bearer <your-jwt-token>
```

---

### Activity Endpoints

#### GET /api/activities
**Description:** Get all activities for the authenticated user with pagination

**Authentication Required:** Yes

**Query Parameters:**
- `limit` (optional): Number of records to return (default: 20)
- `offset` (optional): Number of records to skip (default: 0)

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
```
GET http://localhost:3000/api/activities?limit=10&offset=0
Authorization: Bearer <your-jwt-token>
```

---

#### GET /api/tasks/:id/activities
**Description:** Get activities for a specific task

**Authentication Required:** Yes

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

**Response (404):**
```json
{
  "error": "Task not found"
}
```

**Sample Request:**
```
GET http://localhost:3000/api/tasks/1/activities
Authorization: Bearer <your-jwt-token>
```

---

## Special Functionality

### Activity Logging
The system automatically logs activities for various operations:
- Creating a task logs a "created" activity
- Updating a task logs an "updated" activity
- Completing a task logs a "completed" activity
- Reopening a task logs a "reopened" activity
- Deleting a task logs a "deleted" activity

### Filtering and Sorting
- Tasks can be filtered by search term, status, and priority
- Tasks are sorted by creation date (newest first)
- Activities are sorted by timestamp

### Pagination
- Activity endpoints support pagination with limit and offset parameters

## End-to-End User Workflows

### Workflow 1: Create Task
1. **Frontend:** User fills out task form and clicks "Create Task"
2. **API:** POST /api/tasks with task data
3. **Database:** New task record created, activity record created with action "created"
4. **API:** Returns 201 with created task data
5. **Frontend:** Task appears in task list with success message

### Workflow 2: Update Task Status
1. **Frontend:** User changes task status to "Completed"
2. **API:** PUT /api/tasks/:id with updated status
3. **Database:** Task record updated, activity record created with action "completed"
4. **API:** Returns 200 with updated task data
5. **Frontend:** Task status updated in UI, dashboard stats refresh

### Workflow 3: Delete Task
1. **Frontend:** User clicks "Delete" button on task
2. **API:** DELETE /api/tasks/:id
3. **Database:** Activity record created with action "deleted", task record removed
4. **API:** Returns 200 with success message
5. **Frontend:** Task removed from UI

### Workflow 4: View Task Activities
1. **Frontend:** User navigates to Recent Activity page
2. **API:** GET /api/activities
3. **Database:** Retrieves activity records for user
4. **API:** Returns list of activities
5. **Frontend:** Displays activity timeline

### Workflow 5: View Task-Specific Activities
1. **Frontend:** User clicks on specific task to see its history
2. **API:** GET /api/tasks/:id/activities
3. **Database:** Retrieves activity records for specific task
4. **API:** Returns list of activities for the task
5. **Frontend:** Displays activity timeline for the task