import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const MainLayout = ({ children }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, logout, isAdmin } = useAuth();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const isActive = (path) => location.pathname === path ? 'active' : '';

    return (
        <div className="wrapper">
            {/* Navbar – phong cách MU */}
            <nav className="main-header navbar navbar-expand" style={{ background: 'linear-gradient(90deg, #0a0a1a 0%, #1e1e2f 100%)', borderBottom: '3px solid #FFD700' }}>
                <ul className="navbar-nav">
                    <li className="nav-item">
                        <a className="nav-link" data-widget="pushmenu" href="#" role="button" style={{ color: '#FFD700' }}>
                            <i className="fas fa-bars"></i>
                        </a>
                    </li>
                    <li className="nav-item d-none d-sm-inline-block">
                        <Link to="/" className="nav-link" style={{ color: '#ffffff', fontWeight: 500 }}>Trang chủ</Link>
                    </li>
                </ul>

                <ul className="navbar-nav ml-auto">
                    <li className="nav-item dropdown">
                        <a className="nav-link dropdown-toggle" data-toggle="dropdown" href="#" style={{ color: '#ffffff' }}>
                            <i className="far fa-user mr-1"></i> {user?.name || user?.username}
                        </a>
                        <div className="dropdown-menu dropdown-menu-right">
                            <span className="dropdown-item dropdown-header">{user?.email}</span>
                            <div className="dropdown-divider"></div>
                            <button className="dropdown-item" onClick={handleLogout}>
                                <i className="fas fa-sign-out-alt mr-2"></i> Đăng xuất
                            </button>
                        </div>
                    </li>
                </ul>
            </nav>

            {/* Sidebar – tông đỏ-đen-vàng */}
            <aside className="main-sidebar sidebar-dark elevation-4" style={{ background: '#111122' }}>
                <Link to="/" className="brand-link d-flex align-items-center" style={{ background: '#0a0a1a', borderBottom: '1px solid #FFD700' }}>
                    <span className="brand-text font-weight-bold ml-2" style={{ fontSize: '1.3rem', letterSpacing: '1px', color: '#FFD700' }}>
                        <i className="fas fa-futbol mr-2"></i>MU STORE
                    </span>
                </Link>

                <div className="sidebar" style={{ background: '#111122' }}>
                    <div className="user-panel mt-3 pb-3 mb-3 d-flex">
                        <div className="image">
                            <i className="fas fa-user-circle fa-2x" style={{ color: '#FFD700' }}></i>
                        </div>
                        <div className="info">
                            <Link to="#" className="d-block" style={{ color: '#fff', fontWeight: 500 }}>{user?.name || user?.username}</Link>
                        </div>
                    </div>

                    <nav className="mt-2">
                        <ul className="nav nav-pills nav-sidebar flex-column" data-widget="treeview" role="menu">
                            <li className="nav-item">
                                <Link to="/" className={`nav-link ${isActive('/')}`}>
                                    <i className="nav-icon fas fa-tachometer-alt"></i>
                                    <p>Bảng điều khiển</p>
                                </Link>
                            </li>  
                            <li className="nav-item">
                                <Link to="/products" className={`nav-link ${isActive('/products')}`}>
                                    <i className="nav-icon fas fa-box"></i>
                                    <p>Sản phẩm</p>
                                </Link>
                            </li>
                            <li className="nav-item">
                                <Link to="/categories" className={`nav-link ${isActive('/categories')}`}>
                                    <i className="nav-icon fas fa-tags"></i>
                                    <p>Danh mục</p>
                                </Link>
                            </li>
                            <li className="nav-item">
                                <Link to="/orders" className={`nav-link ${isActive('/orders')}`}>
                                    <i className="nav-icon fas fa-shopping-cart"></i>
                                    <p>Đơn hàng</p>
                                </Link>
                            </li>
                            {isAdmin() && (
                                <li className="nav-item">
                                    <Link to="/users" className={`nav-link ${isActive('/users')}`}>
                                        <i className="nav-icon fas fa-users"></i>
                                        <p>Người dùng</p>
                                    </Link>
                                </li>
                            )}
                        </ul>
                    </nav>
                </div>
            </aside>

            {/* Content – nền sáng nhẹ */}
            <div className="content-wrapper" style={{ background: '#f4f4f9' }}>
                {children}
            </div>

            {/* Footer */}
            <footer className="main-footer" style={{ background: '#111122', color: '#aaa', borderTop: '2px solid #FFD700' }}>
                <strong>© 2025 <a href="#" style={{ color: '#FFD700' }}>Manchester United Store</a>. Bản quyền thuộc về MU Official.</strong>
                <div className="float-right d-none d-sm-inline-block">
                    <b>Phiên bản</b> 2.0
                </div>
            </footer>

            {/* Style tùy chỉnh cho sidebar MU */}
            <style>{`
                .nav-sidebar .nav-link.active {
                    background: #DA020E !important;
                    box-shadow: 0 6px 14px rgba(218,2,14,0.35);
                    border-radius: 0.5rem;
                }
                .nav-sidebar .nav-link.active i {
                    color: #FFD700 !important;
                }
                .nav-sidebar .nav-link:hover:not(.active) {
                    background: rgba(218,2,14,0.2);
                    border-radius: 0.5rem;
                }
                .nav-sidebar .nav-link {
                    color: #e0e0e0;
                    transition: all 0.25s;
                    margin-bottom: 0.25rem;
                }
                .nav-sidebar .nav-link i {
                    color: #FFD700;
                }
                .brand-link .brand-text {
                    font-family: 'Poppins', sans-serif;
                }
                .small-box-footer, .small-box-footer:hover {
                    color: #111;
                }
                .main-footer a:hover {
                    color: #fff !important;
                }
            `}</style>
        </div>
    );
};

export default MainLayout;