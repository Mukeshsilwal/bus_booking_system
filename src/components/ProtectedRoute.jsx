import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import authService from '../services/authService';

/**
 * Protected Route Component - Role-based route protection
 * @param {React.Component} children - Child components to render if authorized
 * @param {string[]} allowedRoles - Array of roles allowed to access this route
 * @param {string} redirectTo - Path to redirect unauthorized users (optional)
 */
export function ProtectedRoute({ children, allowedRoles = [], redirectTo = null }) {
    const location = useLocation();
    const isAuthenticated = authService.isAuthenticated();
    const userRole = authService.getRole();

    // Not authenticated - redirect to login
    if (!isAuthenticated) {
        // Determine which login page based on current path
        let loginPath = '/';
        if (location.pathname.startsWith('/admin')) {
            loginPath = '/admin/login';
        } else if (location.pathname.startsWith('/super-admin')) {
            loginPath = '/super-admin/login';
        }

        return <Navigate to={loginPath} state={{ from: location }} replace />;
    }

    // Authenticated but no role restrictions - allow access
    if (allowedRoles.length === 0) {
        return children;
    }

    // Check if user has required role
    const hasAccess = authService.hasRole(allowedRoles);

    if (!hasAccess) {
        // User doesn't have required role - redirect
        const defaultRedirect = redirectTo || authService.getDefaultRedirect();
        return <Navigate to={defaultRedirect} replace />;
    }

    // User has required role - render children
    return children;
}

export default ProtectedRoute;
