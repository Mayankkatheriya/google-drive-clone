// ProtectedRoute.js

import React from "react";
import { useSelector } from "react-redux";
import { Navigate, useLocation } from "react-router-dom";
import { selectUserName } from "../store/UserSlice";

/**
 * A wrapper component to protect routes by checking user authentication.
 * Redirects to the login page if the user is not authenticated.
 * @param {Object} children - The components to be rendered if the user is authenticated.
 * @returns {JSX.Element} - Protected route component.
 */
const ProtectedRoute = ({ children }) => {
  const userName = useSelector(selectUserName);
  const location = useLocation();

  // Redirect to login page if the user is not authenticated
  if (!userName) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }
  
  return children;
};

export default ProtectedRoute;
