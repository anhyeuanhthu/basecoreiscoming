import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { productApi, userApi, categoryApi, orderApi } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const Dashboard = () => {
    const [stats, setStats] = useState({ products: 0, categories: 0, users: 0, pendingOrders: 0, totalOrders: 0, revenue: 0 });
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('stats');
    const { isAdmin } = useAuth();

    useEffect(() => { loadStats(); loadOrders(); }, []);

    const loadStats = async () => {
        try {
            const [productsRes, categoriesRes] = await Promise.all([productApi.getAll(), categoryApi.getAll()]);
            let usersCount = 0;
            if (isAdmin()) {
                try { const usersRes = await userApi.getAll({ page: 1, pageSize: 1 }); usersCount = usersRes.data.totalCount || 0; } catch (e) {}
            }
            setStats(prev => ({
                ...prev,
                products: productsRes.data?.totalCount || productsRes.data?.items?.length || productsRes.data?.length || 0,
                categories: categoriesRes.data?.length || 0,
                users: usersCount,
            }));
        } catch (e) { console.error(e); }
    };

    const loadOrders = async () => {
        try {
            const response = await orderApi.getAll();
            const ordersData = response.data || [];
            setOrders(ordersData);
            setStats(prev => ({
                ...prev,
                pendingOrders: ordersData.filter(o => o.status === 'Pending').length,
                totalOrders: ordersData.length,
                revenue: ordersData.filter(o => o.status === 'Delivered').reduce((sum, o) => sum + (o.totalAmount || 0), 0),
            }));
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    const updateOrderStatus = async (orderId, action) => {
        try {
            let response;
            if (action === 'confirm') response = await orderApi.confirm(orderId);
            else if (action === 'deliver') response = await orderApi.deliver(orderId);
            else if (action === 'cancel') response = await orderApi.cancel(orderId);
            if (response?.data) { alert(response.data.message); loadOrders(); loadStats(); }
        } catch (e) { alert(e.response?.data?.message || 'Action failed'); }
    };

    const getStatusBadge = (status) => {
        const map = {
            'Pending': ['bg-warning text-dark', '⏳ Chờ xác nhận'],
            'Confirmed': ['bg-info', '✅ Đã xác nhận'],
            'Delivered': ['bg-success', '📦 Đã giao'],
            'Cancelled': ['bg-danger', '❌ Đã hủy'],
        };
        const [bg, text] = map[status] || ['bg-secondary', status];
        return <span className={`badge ${bg} px-3 py-2 rounded-pill`}>{text}</span>;
    };

    const getActionButtons = (order) => {
        if (order.status === 'Pending') return (
            <>
                <button className="btn btn-sm btn-success me-2 rounded-pill px-3" onClick={() => updateOrderStatus(order.id, 'confirm')}>Xác nhận</button>
                <button className="btn btn-sm btn-danger rounded-pill px-3" onClick={() => updateOrderStatus(order.id, 'cancel')}>Hủy</button>
            </>
        );
        if (order.status === 'Confirmed') return (
            <button className="btn btn-sm btn-primary rounded-pill px-3" onClick={() => updateOrderStatus(order.id, 'deliver')}>Xác nhận đã giao</button>
        );
        return <span className="text-muted">—</span>;
    };

    const parseShippingAddress = (address) => {
        if (!address) return { fullName: '', phone: '', address: '', note: '' };
        const parts = address.split('|');
        return { fullName: parts[0] || '', phone: parts[1] || '', address: parts[2] || '', note: parts[3] || '' };
    };

    if (loading) return (
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
            <div className="spinner-border text-danger" style={{ width: '3rem', height: '3rem' }}></div>
        </div>
    );

    return (
        <div className="dashboard-container" style={{ background: '#f4f4f9', minHeight: '100vh' }}>
            {/* Custom Styles for Premium MU Look */}
            <style>{`
                :root {
                    --mu-red: #DA020E;
                    --mu-gold: #FFD700;
                    --mu-dark: #1a1a2e;
                    --mu-gray: #2d2d3a;
                }
                .stat-card {
                    background: white;
                    border-radius: 1.5rem;
                    border: none;
                    box-shadow: 0 20px 35px -12px rgba(0,0,0,0.08);
                    transition: all 0.3s ease;
                    overflow: hidden;
                    position: relative;
                }
                .stat-card:hover { transform: translateY(-5px); box-shadow: 0 25px 40px -12px rgba(0,0,0,0.15); }
                .stat-card .stat-icon {
                    position: absolute;
                    right: 1.5rem;
                    bottom: 1rem;
                    font-size: 3.5rem;
                    opacity: 0.2;
                    color: var(--mu-dark);
                }
                .stat-card .stat-value { font-size: 2.2rem; font-weight: 800; margin-bottom: 0.25rem; }
                .stat-card .stat-label { font-size: 0.85rem; text-transform: uppercase; letter-spacing: 1px; font-weight: 600; color: #6c757d; }
                .stat-card .stat-link {
                    display: inline-block;
                    margin-top: 1rem;
                    font-size: 0.8rem;
                    font-weight: 600;
                    text-decoration: none;
                    transition: 0.2s;
                }
                .card-premium {
                    background: white;
                    border-radius: 1.5rem;
                    border: none;
                    box-shadow: 0 20px 35px -12px rgba(0,0,0,0.05);
                    overflow: hidden;
                }
                .card-header-premium {
                    background: white;
                    border-bottom: 2px solid var(--mu-gold);
                    padding: 1.2rem 1.5rem;
                }
                .card-header-premium h3 {
                    font-weight: 700;
                    margin: 0;
                    font-size: 1.25rem;
                    color: var(--mu-dark);
                }
                .btn-tab {
                    border-radius: 2rem;
                    padding: 0.5rem 1.5rem;
                    font-weight: 600;
                    transition: 0.2s;
                }
                .btn-tab.active {
                    background: var(--mu-red);
                    color: white;
                    box-shadow: 0 8px 20px rgba(218,2,14,0.3);
                }
                .btn-tab:not(.active) {
                    background: transparent;
                    color: #555;
                    border: 1px solid #dee2e6;
                }
                .btn-tab:not(.active):hover {
                    background: #f8f9fa;
                    border-color: var(--mu-red);
                    color: var(--mu-red);
                }
                .table-premium {
                    border-collapse: separate;
                    border-spacing: 0 10px;
                }
                .table-premium thead th {
                    border: none;
                    background: transparent;
                    font-weight: 700;
                    font-size: 0.8rem;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                    color: #6c757d;
                    padding: 12px 16px;
                }
                .table-premium tbody tr {
                    background: white;
                    border-radius: 1rem;
                    box-shadow: 0 5px 15px rgba(0,0,0,0.03);
                    transition: 0.2s;
                }
                .table-premium tbody tr:hover {
                    transform: scale(1.01);
                    box-shadow: 0 10px 25px rgba(0,0,0,0.08);
                }
                .table-premium td {
                    border: none;
                    padding: 14px 16px;
                    vertical-align: middle;
                    background: white;
                }
                .table-premium td:first-child { border-top-left-radius: 1rem; border-bottom-left-radius: 1rem; }
                .table-premium td:last-child { border-top-right-radius: 1rem; border-bottom-right-radius: 1rem; }
                .badge-custom {
                    font-weight: 500;
                    padding: 6px 14px;
                    border-radius: 2rem;
                }
                @media (max-width: 768px) {
                    .stat-value { font-size: 1.5rem; }
                    .table-premium td, .table-premium th { padding: 10px 8px; font-size: 0.8rem; }
                }
            `}</style>

            {/* Header */}
            <div className="px-4 py-4" style={{ background: 'linear-gradient(115deg, #0a0a1a 0%, #1e1e2f 100%)', borderBottom: `3px solid var(--mu-gold)` }}>
                <div className="container-fluid">
                    <div className="d-flex justify-content-between align-items-center flex-wrap">
                        <div>
                            <h1 className="text-white mb-0" style={{ fontWeight: 800, letterSpacing: '-0.5px' }}>Dashboard</h1>
                            <p className="text-white-50 mt-2 mb-0">Tổng quan hoạt động kinh doanh Manchester United Store</p>
                        </div>
                        <div className="mt-2 mt-sm-0">
                            <div className="btn-group">
                                <button className={`btn-tab ${activeTab === 'stats' ? 'active' : ''}`} onClick={() => setActiveTab('stats')}>📊 Thống kê</button>
                                <button className={`btn-tab ${activeTab === 'orders' ? 'active' : ''}`} onClick={() => setActiveTab('orders')}>📋 Đơn hàng ({stats.pendingOrders} chờ)</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="container-fluid py-5">
                {activeTab === 'stats' ? (
                    <>
                        {/* Stat cards */}
                        <div className="row g-4 mb-5">
                            <div className="col-md-6 col-lg-3">
                                <div className="stat-card p-4">
                                    <div className="stat-icon"><i className="fas fa-box"></i></div>
                                    <div className="stat-value">{stats.products}</div>
                                    <div className="stat-label">Sản phẩm</div>
                                    <Link to="/products" className="stat-link text-danger">Chi tiết <i className="fas fa-arrow-right ms-1"></i></Link>
                                </div>
                            </div>
                            <div className="col-md-6 col-lg-3">
                                <div className="stat-card p-4">
                                    <div className="stat-icon"><i className="fas fa-tags"></i></div>
                                    <div className="stat-value">{stats.categories}</div>
                                    <div className="stat-label">Danh mục</div>
                                    <Link to="/categories" className="stat-link text-danger">Chi tiết <i className="fas fa-arrow-right ms-1"></i></Link>
                                </div>
                            </div>
                            <div className="col-md-6 col-lg-3">
                                <div className="stat-card p-4">
                                    <div className="stat-icon"><i className="fas fa-clock"></i></div>
                                    <div className="stat-value">{stats.pendingOrders}</div>
                                    <div className="stat-label">Đơn hàng chờ xử lý</div>
                                    <button className="stat-link text-danger p-0 bg-transparent border-0" onClick={() => setActiveTab('orders')}>Xem đơn hàng <i className="fas fa-arrow-right ms-1"></i></button>
                                </div>
                            </div>
                            <div className="col-md-6 col-lg-3">
                                <div className="stat-card p-4">
                                    <div className="stat-icon"><i className="fas fa-chart-line"></i></div>
                                    <div className="stat-value">{stats.revenue.toLocaleString()}đ</div>
                                    <div className="stat-label">Doanh thu đã giao</div>
                                </div>
                            </div>
                        </div>

                        {/* Recent orders table */}
                        <div className="card-premium">
                            <div className="card-header-premium">
                                <h3><i className="fas fa-receipt me-2 text-danger"></i> Đơn hàng gần đây</h3>
                            </div>
                            <div className="p-4">
                                <div className="table-responsive">
                                    <table className="table table-premium">
                                        <thead>
                                            <tr>
                                                <th>Mã ĐH</th><th>Khách hàng</th><th>Tổng tiền</th><th>Trạng thái</th><th>Ngày đặt</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {orders.slice(0, 5).map(order => {
                                                const s = parseShippingAddress(order.shippingAddress);
                                                return (
                                                    <tr key={order.id}>
                                                        <td><span className="fw-bold">#{order.id}</span></td>
                                                        <td>{s.fullName || '—'}</td>
                                                        <td><span className="text-danger fw-semibold">{order.totalAmount?.toLocaleString()}đ</span></td>
                                                        <td>{getStatusBadge(order.status)}</td>
                                                        <td>{new Date(order.orderDate).toLocaleDateString('vi-VN')}</td>
                                                    </tr>
                                                );
                                            })}
                                            {orders.length === 0 && (
                                                <tr><td colSpan="5" className="text-center py-5">Chưa có đơn hàng nào</td></tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </>
                ) : (
                    /* Orders management tab */
                    <div className="card-premium">
                        <div className="card-header-premium">
                            <h3><i className="fas fa-truck me-2 text-danger"></i> Quản lý đơn hàng</h3>
                        </div>
                        <div className="p-4">
                            <div className="table-responsive">
                                <table className="table table-premium">
                                    <thead>
                                        <tr>
                                            <th>Mã ĐH</th><th>Khách hàng</th><th>SĐT</th><th>Địa chỉ</th><th>Sản phẩm</th><th>Tổng tiền</th><th>Ngày đặt</th><th>Trạng thái</th><th>Thao tác</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {orders.map(order => {
                                            const s = parseShippingAddress(order.shippingAddress);
                                            return (
                                                <tr key={order.id}>
                                                    <td>#{order.id}</td>
                                                    <td>{s.fullName}</td>
                                                    <td>{s.phone}</td>
                                                    <td style={{ maxWidth: '220px' }}>{s.address}{s.note && <small className="d-block text-muted">📝 {s.note}</small>}</td>
                                                    <td>
                                                        {order.orderDetails?.map((d, i) => (
                                                            <div key={i} className="small">SP#{d.productId} x {d.quantity} = {(d.unitPrice * d.quantity).toLocaleString()}đ</div>
                                                        ))}
                                                    </td>
                                                    <td><span className="fw-bold text-danger">{order.totalAmount?.toLocaleString()}đ</span></td>
                                                    <td>{new Date(order.orderDate).toLocaleDateString('vi-VN')}</td>
                                                    <td>{getStatusBadge(order.status)}</td>
                                                    <td>{getActionButtons(order)}</td>
                                                </tr>
                                            );
                                        })}
                                        {orders.length === 0 && (
                                            <tr><td colSpan="9" className="text-center py-5">Không có đơn hàng nào</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Dashboard;