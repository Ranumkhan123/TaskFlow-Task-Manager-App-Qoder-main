/// <reference types="vite/client" />

// Type declarations for JavaScript modules
declare module './context/AuthContext' {
  export const AuthProvider: React.ComponentType<{ children: React.ReactNode }>;
  export const useAuth: () => any;
}

declare module './context/ThemeContext' {
  export const ThemeProvider: React.ComponentType<{ children: React.ReactNode }>;
}

declare module './pages/Login' {
  const Login: React.ComponentType;
  export default Login;
}

declare module './pages/Dashboard' {
  const Dashboard: React.ComponentType<{ onNavigate: (page: string) => void }>;
  export default Dashboard;
}

declare module './pages/TaskList' {
  const TaskList: React.ComponentType<{ onNavigate: (page: string) => void; onEditTask: (taskId: string | null) => void }>;
  export default TaskList;
}

declare module './pages/TaskForm' {
  const TaskForm: React.ComponentType<{
    onNavigate: (page: string) => void;
    editTaskId?: string | null;
    onTaskSaved: () => void;
  }>;
  export default TaskForm;
}

declare module './pages/Profile' {
  const Profile: React.ComponentType;
  export default Profile;
}

declare module './pages/Activity' {
  const Activity: React.ComponentType<{ onNavigate: (page: string) => void }>;
  export default Activity;
}

declare module './components/Layout' {
  const Layout: React.ComponentType<{
    currentPage: string;
    onNavigate: (page: string) => void;
    onLogout: () => void;
    children: React.ReactNode;
  }>;
  export default Layout;
}