import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
    const user = JSON.parse(localStorage.getItem('user'));

    // If no user token exists in localStorage, redirect to login page
    if (!user || !user.token) {
        return <Navigate to="/login" replace />;
    }

    // Otherwise, render the child component (the protected route content)
    return children;
};

export default ProtectedRoute;
