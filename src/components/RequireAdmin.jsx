import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/authContextBase";

const RequireAdmin = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return null;

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (user.role !== "Admin") {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default RequireAdmin;
