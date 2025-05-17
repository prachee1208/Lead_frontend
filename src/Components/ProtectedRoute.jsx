import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = ({ allowedRoles }) => {
    // Check if the user is authenticated and has the correct role
    const isAuthenticated = () => {
        // Check if token exists in localStorage
        return localStorage.getItem('token') !== null;
    };

    const getUserRole = () => {
        // Try to get the role from localStorage
        const userRole = localStorage.getItem('userRole');

        // If no role is found, default to 'guest'
        return userRole || 'guest';
    };

    const userRole = getUserRole();

    // Check if the user is authenticated and has an allowed role
    if (isAuthenticated() && allowedRoles.includes(userRole)) {
        return <Outlet />;
    }

    // If not authenticated or not authorized, redirect to login
    return <Navigate to="/login" replace />;
};

export default ProtectedRoute;
