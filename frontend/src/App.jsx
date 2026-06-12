import { Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider, CssBaseline } from "@mui/material";
import { AuthProvider } from "./context/AuthContext";
import SignUp from "./pages/SignUp";
import SignIn from "./pages/SignIn";
import SignOut from "./pages/SignOut";
import ProjectSpace from "./components/Project/ProjectSpace";
import Dashboard from "./components/Dashboard";
import { theme } from "./styles/theme";
import TaskPage from "./pages/TaskPage";
import Workflow from "./pages/Workflow";
import Admin from "./pages/Admin";

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />

      <AuthProvider>
        <Routes>
          
          <Route path="/" element={<Navigate to="/signin" replace />} />

          
          <Route path="/signup" element={<SignUp />} />

          <Route path="/signin" element={<SignIn />} />

          <Route path="/signout" element={<SignOut />} />

          {/* DASHBOARD LAYOUT */}
          <Route path="/" element={<Dashboard />}>
            <Route path="/projects" element={<ProjectSpace />} />
            <Route path="/tasks/:projectId" element={<TaskPage />} />
            <Route path="/workflow" element={<Workflow />} />
            <Route path="/admin" element={<Admin />} />
          </Route>
        </Routes>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
