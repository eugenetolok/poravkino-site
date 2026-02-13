import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { Spinner } from "@heroui/spinner"; // Import a spinner for better UX

import { useAuth } from "@/hooks/useAuth";

interface ProtectedRouteProps {
  allowedRoles?: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
  const { isAuthenticated, user, isLoading } = useAuth();

  if (isLoading) {
    // While checking for token, show a loading spinner
    return (
      <div className="flex justify-center items-center h-full">
        <Spinner color="primary" label="Загрузка..." size="lg" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate replace to="/adminGUI/login" />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    // Optional: Redirect to a 'not-authorized' page or back to dashboard
    return <Navigate replace to="/adminGUI/dashboard" />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
