import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../services/api';

const AuthContext = createContext(null);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within AuthProvider');
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        const token = localStorage.getItem('token');
        console.log('🔐 AuthProvider init - token exists:', !!token);
        console.log('🔐 AuthProvider init - user:', storedUser);
        if (storedUser && token) {
            try {
                const userData = JSON.parse(storedUser);
                setUser(userData);
                console.log('✅ User loaded from localStorage:', userData);
            } catch (e) {
                console.error('Failed to parse user:', e);
            }
        }
        setLoading(false);
    }, []);

    const login = async (username, password) => {
        try {
            console.log('🔐 Logging in:', username);
            const response = await authApi.login(username, password);
            const userData = response.data;
            console.log('✅ Login response:', userData);
            
            localStorage.setItem('token', userData.token);
            localStorage.setItem('user', JSON.stringify(userData));
            setUser(userData);
            
            console.log('👤 User role:', userData.role);
            
            return { success: true, role: userData.role };
        } catch (error) {
            console.error('❌ Login error:', error.response?.data);
            return { success: false, message: error.response?.data?.message || 'Login failed' };
        }
    };

    const logout = () => {
        console.log('🔓 Logging out...');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
    };

    const isAdmin = () => {
        const role = user?.role;
        console.log('🔍 Checking isAdmin - role:', role, 'result:', role === 'Admin');
        return role === 'Admin';
    };

    const value = {
        user,
        login,
        logout,
        isAdmin,
        isAuthenticated: !!user,
        loading
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;