import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute = ({ children, adminOnly = false }) => {
    const { isAuthenticated, loading, isAdmin, user } = useAuth();

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
                <div className="spinner-border text-primary" role="status">
                    <span className="sr-only">Loading...</span>
                </div>
            </div>
        );
    }

    // Chưa login → về trang login
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    // Route chỉ dành cho admin nhưng user thường vào → redirect về shop
    if (adminOnly && !isAdmin()) {
        return <Navigate to="/shop" replace />;
    }

    return children;
};

export default ProtectedRoute;
