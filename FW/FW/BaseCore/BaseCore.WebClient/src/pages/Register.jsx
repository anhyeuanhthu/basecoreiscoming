import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '../services/api';

const Register = () => {
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        confirmPassword: '',
        name: '',
        email: '',
        phone: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            setError('Confirm password does not match');
            return;
        }

        setLoading(true);
        try {
            await authApi.register({
                username: formData.username,
                password: formData.password,
                name: formData.name,
                email: formData.email,
                phone: formData.phone
            });

            navigate('/login', {
                replace: true,
                state: { message: 'Registration successful. Please sign in with your new account.' }
            });
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed');
            setLoading(false);
        }
    };

    return (
        <div className="register-page" style={{ minHeight: '100vh' }}>
            <div className="register-box">
                <div className="login-logo"><a href="#">BaseCore Sales</a></div>
                <div className="card">
                    <div className="card-body register-card-body">
                        <p className="login-box-msg">Register a new account</p>
                        {error && (
                            <div className="alert alert-danger alert-dismissible">
                                <button type="button" className="close" onClick={() => setError('')}>&times;</button>
                                {error}
                            </div>
                        )}
                        <form onSubmit={handleSubmit}>
                            <div className="input-group mb-3">
                                <input
                                    type="text"
                                    name="username"
                                    className="form-control"
                                    placeholder="Username"
                                    value={formData.username}
                                    onChange={handleChange}
                                    required
                                />
                                <div className="input-group-append">
                                    <div className="input-group-text"><span className="fas fa-user"></span></div>
                                </div>
                            </div>
                            <div className="input-group mb-3">
                                <input
                                    type="text"
                                    name="name"
                                    className="form-control"
                                    placeholder="Full name"
                                    value={formData.name}
                                    onChange={handleChange}
                                />
                                <div className="input-group-append">
                                    <div className="input-group-text"><span className="fas fa-id-card"></span></div>
                                </div>
                            </div>
                            <div className="input-group mb-3">
                                <input
                                    type="email"
                                    name="email"
                                    className="form-control"
                                    placeholder="Email"
                                    value={formData.email}
                                    onChange={handleChange}
                                />
                                <div className="input-group-append">
                                    <div className="input-group-text"><span className="fas fa-envelope"></span></div>
                                </div>
                            </div>
                            <div className="input-group mb-3">
                                <input
                                    type="tel"
                                    name="phone"
                                    className="form-control"
                                    placeholder="Phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                />
                                <div className="input-group-append">
                                    <div className="input-group-text"><span className="fas fa-phone"></span></div>
                                </div>
                            </div>
                            <div className="input-group mb-3">
                                <input
                                    type="password"
                                    name="password"
                                    className="form-control"
                                    placeholder="Password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                />
                                <div className="input-group-append">
                                    <div className="input-group-text"><span className="fas fa-lock"></span></div>
                                </div>
                            </div>
                            <div className="input-group mb-3">
                                <input
                                    type="password"
                                    name="confirmPassword"
                                    className="form-control"
                                    placeholder="Confirm password"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    required
                                />
                                <div className="input-group-append">
                                    <div className="input-group-text"><span className="fas fa-lock"></span></div>
                                </div>
                            </div>
                            <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
                                {loading ? <span className="spinner-border spinner-border-sm"></span> : 'Register'}
                            </button>
                        </form>
                        <div className="mt-3 text-center">
                            <Link to="/login">I already have an account</Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;
