import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import RequireAuth from "./components/RequireAuth";
import RequireAdmin from "./components/RequireAdmin";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import MOAList from "./pages/MOAList";
import UserManagement from "./pages/UserManagement";
import AuditTrail from "./pages/AuditTrail";
import "./index.css";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/dashboard"
            element={
              <RequireAuth>
                <Dashboard />
              </RequireAuth>
            }
          />
          <Route
            path="/moas"
            element={
              <RequireAuth>
                <MOAList />
              </RequireAuth>
            }
          />
          <Route
            path="/users"
            element={
              <RequireAdmin>
                <UserManagement />
              </RequireAdmin>
            }
          />
          <Route
            path="/audit"
            element={
              <RequireAdmin>
                <AuditTrail />
              </RequireAdmin>
            }
          />
          
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
