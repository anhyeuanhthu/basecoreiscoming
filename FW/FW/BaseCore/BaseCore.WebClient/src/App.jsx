import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import React from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import ProtectedRoute from './components/ProtectedRoute';
import MainLayout from './components/MainLayout';
import UserLayout from './components/UserLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Users from './pages/Users';
import Categories from './pages/Categories';
import UserShop from './pages/UserShop';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import AdminOrders from './pages/AdminOrders';

function AppRoutes() {
    return (
        <Routes>
            <Route path="/login" element={<Login />} />

            {/* User routes */}
            <Route path="/shop" element={
                <ProtectedRoute userOnly={true}>
                    <CartProvider>
                        <UserLayout><UserShop /></UserLayout>
                    </CartProvider>
                </ProtectedRoute>
            } />
            <Route path="/cart" element={
                <ProtectedRoute userOnly={true}>
                    <CartProvider>
                        <UserLayout><Cart /></UserLayout>
                    </CartProvider>
                </ProtectedRoute>
            } />
            <Route path="/checkout" element={
                <ProtectedRoute userOnly={true}>
                    <CartProvider>
                        <Checkout />
                    </CartProvider>
                </ProtectedRoute>
            } />

            {/* Admin routes */}
            <Route path="/" element={
                <ProtectedRoute adminOnly={true}>
                    <MainLayout><Dashboard /></MainLayout>
                </ProtectedRoute>
            } />
            <Route path="/products" element={
                <ProtectedRoute adminOnly={true}>
                    <MainLayout><Products /></MainLayout>
                </ProtectedRoute>
            } />
            <Route path="/categories" element={
                <ProtectedRoute adminOnly={true}>
                    <MainLayout><Categories /></MainLayout>
                </ProtectedRoute>
            } />
            <Route path="/users" element={
                <ProtectedRoute adminOnly={true}>
                    <MainLayout><Users /></MainLayout>
                </ProtectedRoute>
            } />
            <Route path="/orders" element={
    <ProtectedRoute adminOnly={true}>
        <MainLayout><AdminOrders /></MainLayout>
    </ProtectedRoute>
} />
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
