# TaskFlow - Task Management App

TaskFlow is a comprehensive task management tool that helps you focus, plan, and track your work efficiently. It includes a **Pomodoro timer**, **weekly planning**, and **activity tracking**, all while retaining a clean and responsive interface.  

---

## Features

-  **Task Management:** Add, edit, delete, and track tasks with status and priority.
-  **Pomodoro Timer:** Stay focused with persistent timers that continue across page navigation.
-  **Weekly Calendar:** View tasks for each day of the week with completion status.
-  **Activity Tracking:** Logs all task actions automatically.
-  **Dashboard Stats:** Visual charts for task progress and completion.
-  **Quick Actions:** Easily create new tasks or view weekly plans.
-  **Dark/Light Mode:** Switch between themes.
-  **Responsive Design:** Works seamlessly on desktop and mobile.

---

##  Frontend

### **Main Components**

- **Layout.jsx:** Main layout with header, footer, and sidebar.
- **AuthContext.jsx:** Manages authentication state.
- **ThemeContext.jsx:** Handles theme switching (Dark/Light mode).
- **PomodoroContext.jsx:** Global state for Pomodoro timer persistence.
  
### **Pages**

- **Dashboard.jsx:** Task stats, progress overview, quick actions, and Pomodoro timer.
- **TaskList.jsx:** List and manage tasks with filters.
- **TaskForm.jsx:** Create/edit task form.
- **Login.jsx / Register.jsx:** Authentication pages.
- **Profile.jsx:** User profile management.
- **Activity.jsx:** Recent activity tracking.
- **WeeklyCalendar.jsx:** Weekly calendar view showing tasks per day.

### **Interactions**

- Token-based authentication with localStorage.
- Error handling, loading states, and form validation.
- API interactions handled consistently with proper state updates.

---

## API Documentation

### **Authentication**
- `POST /api/auth/register` - Register a new user.
- `POST /api/auth/login` - Login user.
- `GET /api/users/profile` - Get user profile.
- `PUT /api/users/profile` - Update profile.
- `PUT /api/users/profile/password` - Update password.

### **Tasks**
- `GET /api/tasks` - Fetch all tasks (filterable by status, priority, date).
- `POST /api/tasks` - Create a new task.
- `GET /api/tasks/:id` - Get a specific task.
- `PUT /api/tasks/:id` - Update a task.
- `DELETE /api/tasks/:id` - Delete a task.
- `GET /api/tasks/stats` - Fetch task statistics for the dashboard.
- `GET /api/tasks/date/:date` - Tasks for a specific date.
- `GET /api/tasks/weekly` - Weekly summary of tasks.

### **Pomodoro**
- `POST /api/pomodoro/sessions` - Create a Pomodoro session.
- Stores duration, type (focus/break), completed status, and optional task reference.

---

## Backend

- **Server:** Node.js with Express.
- **Database:** SQLite.
- **Authentication:** JWT-based.
- **Business Logic:**
  - Task CRUD operations
  - Pomodoro session management
  - Activity logging
  - Statistics calculation
- **Middleware:** Auth verification, CORS, JSON parsing.

---

## Workflows

### Task Workflow

User fills TaskForm → API POST /api/tasks → Backend validates → Task saved in DB → Response returns task → Dashboard updates.

### Pomodoro Workflow

User starts Pomodoro → PomodoroContext manages countdown globally → On complete, POST /api/pomodoro/sessions → Session stored in DB → Activity logged.

### Weekly Calendar

User navigates to WeeklyCalendar → GET /api/tasks/weekly → Tasks grouped by day → Displayed with counts & status.

### Activity Tracking

Logs all task actions automatically and displays them in the Activity page.

---

## Additional Features

- Global persistent Pomodoro timer
- Dark/Light theme support
- Responsive design
- Activity tracking for analytics
- End-to-end JWT-secured authentication
- Optimized performance with efficient database queries


---

## Security & Performance

- Password hashing with bcrypt.
- JWT authentication.
- Input validation and SQL injection prevention.
- Efficient queries, lazy loading, and optimized rendering


---


## Getting Started


1. Clone the repository = git clone <repo-url>
2. Install dependencies = cd taskflow
npm install
3. Run the backend = npm run server
4. Run the frontend = npm start

### Access

Frontend: http://localhost:3000
API: http://localhost:3000/api


---


## Author

Ranum Khan  
QA Engineer | Manual & Automation Testing  
LinkedIn: https://www.linkedin.com/in/ranum-khan-qaengineer  
GitHub: https://github.com/Ranumkhan123


---


## License

This project is for educational & portfolio purposes only.


---


## Credits

TaskFlow 2026 ©. All rights reserved.
Built by **Ranum Khan** to help you focus, plan, and conquer your tasks with ❤️ and ☕.


---


Feel free to use, modify, and share it for learning or project reference.

