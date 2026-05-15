import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import React from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import MainLayout from './components/MainLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Users from './pages/Users';
import Categories from './pages/Categories';

// Redirect user đã login ra khỏi trang login
const PublicRoute = ({ children }) => {
    const { isAuthenticated, loading, user } = useAuth();

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
                <div className="spinner-border text-primary" role="status">
                    <span className="sr-only">Loading...</span>
                </div>
            </div>
        );
    }

    if (isAuthenticated) {
        // Nếu đã login, redirect đúng trang theo role
        return <Navigate to={user?.role === 'Admin' ? '/' : '/shop'} replace />;
    }

    return children;
};

// Trang shop dành cho User - load Electro từ public/shop/index.html
const ShopPage = () => {
    const { isAuthenticated, user } = useAuth();

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    // Nếu admin vào /shop thì redirect về dashboard
    if (user?.role === 'Admin') {
        return <Navigate to="/" replace />;
    }

    return (
        <iframe
            src="/shop/index.html"
            style={{ width: '100%', height: '100vh', border: 'none' }}
            title="Electro Shop"
        />
    );
};

function AppRoutes() {
    return (
        <Routes>
            <Route
                path="/login"
                element={
                    <PublicRoute>
                        <Login />
                    </PublicRoute>
                }
            />

            {/* Route dành cho User: Electro shop */}
            <Route path="/shop" element={<ShopPage />} />

            {/* Các route dành cho Admin */}
            <Route
                path="/"
                element={
                    <ProtectedRoute adminOnly={true}>
                        <MainLayout>
                            <Dashboard />
                        </MainLayout>
                    </ProtectedRoute>
                }
            />
            <Route
                path="/products"
                element={
                    <ProtectedRoute adminOnly={true}>
                        <MainLayout>
                            <Products />
                        </MainLayout>
                    </ProtectedRoute>
                }
            />
            <Route
                path="/categories"
                element={
                    <ProtectedRoute adminOnly={true}>
                        <MainLayout>
                            <Categories />
                        </MainLayout>
                    </ProtectedRoute>
                }
            />
            <Route
                path="/users"
                element={
                    <ProtectedRoute adminOnly={true}>
                        <MainLayout>
                            <Users />
                        </MainLayout>
                    </ProtectedRoute>
                }
            />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
    );
}

function App() {
    return (
        <Router>
            <AuthProvider>
                <AppRoutes />
            </AuthProvider>
        </Router>
    );
}

export default App;
