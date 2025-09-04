import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import type { JwtPayload } from "jwt-decode";

interface ProtectedRouteProps {
  children: React.ReactElement;
}

const isTokenValid = (token: string | null) => {
  if (!token) return false;
  try {
    
    const decoded = jwtDecode<JwtPayload>(token);

    if (typeof decoded.exp !== "number") return false; // no exp -> treat as invalid

    if (decoded.exp * 1000 <= Date.now()) return false; // expired
    
    return true;
  } catch {
    return false;
  }
};

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const location = useLocation();
  const token = localStorage.getItem("auth_token");
  const isAuth = isTokenValid(token);

  if (!isAuth) {
    return <Navigate to="/" replace state={{ from: location }} />;
  }

  return children;
};

export default ProtectedRoute;
