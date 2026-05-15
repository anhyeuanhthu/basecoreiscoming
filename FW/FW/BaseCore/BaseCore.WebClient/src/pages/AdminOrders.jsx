import React, { useState, useEffect } from 'react';
import { orderApi } from '../services/api';

const AdminOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');

    useEffect(() => { loadOrders(); }, [filter]);
    const loadOrders = async () => {
        setLoading(true);
        try { const res = await orderApi.getAdminOrders(filter !== 'all' ? filter : null); setOrders(res.data); } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };
    const updateStatus = async (id, action) => {
        try {
            let res;
            if (action === 'confirm') res = await orderApi.confirm(id);
            else if (action === 'deliver') res = await orderApi.deliver(id);
            else if (action === 'cancel') res = await orderApi.cancel(id);
            if (res?.data) alert(res.data.message);
            loadOrders();
        } catch (err) { alert(err.response?.data?.message || 'Lỗi'); }
    };
    const parseAddress = (addr) => {
        if (!addr) return { fullName: '', phone: '', address: '', note: '' };
        const parts = addr.split('|');
        return { fullName: parts[0] || '', phone: parts[1] || '', address: parts[2] || '', note: parts[3] || '' };
    };
    const statusBadge = (status) => {
        const map = { Pending: 'warning', Confirmed: 'info', Delivered: 'success', Cancelled: 'danger' };
        return <span className={`badge bg-${map[status] || 'secondary'} px-3 py-2 rounded-pill`}>{status}</span>;
    };
    const actionButtons = (order) => {
        if (order.status === 'Pending') return (<><button className="btn btn-sm btn-success me-1 rounded-pill px-3" onClick={() => updateStatus(order.id, 'confirm')}>Xác nhận</button><button className="btn btn-sm btn-danger rounded-pill px-3" onClick={() => updateStatus(order.id, 'cancel')}>Hủy</button></>);
        if (order.status === 'Confirmed') return <button className="btn btn-sm btn-primary rounded-pill px-3" onClick={() => updateStatus(order.id, 'deliver')}>Giao hàng</button>;
        return <span className="text-muted">—</span>;
    };
    if (loading) return <div className="text-center p-5"><div className="spinner-border text-danger"></div></div>;

    return (
        <div style={{ background: '#f4f4f9', minHeight: '100vh' }}>
            <div className="px-4 py-4" style={{ background: 'linear-gradient(115deg, #0a0a1a 0%, #1e1e2f 100%)', borderBottom: '3px solid #FFD700' }}>
                <div className="container-fluid d-flex justify-content-between align-items-center flex-wrap">
                     <div style={{ background: 'linear-gradient(115deg, #0a0a1a 0%)',  padding: '20px 24px' }}>
                <h1 className="text-white mb-0" style={{ fontWeight: 800, fontSize: '1.8rem' }}>Quản lý đơn hàng</h1>
                
            </div>
                    <select className="form-select w-auto mt-2 mt-sm-0" value={filter} onChange={e => setFilter(e.target.value)}>
                        <option value="all">Tất cả</option><option value="Pending">Chờ xác nhận</option><option value="Confirmed">Đã xác nhận</option><option value="Delivered">Đã giao</option><option value="Cancelled">Đã hủy</option>
                    </select>
                </div>
            </div>
            <div className="container-fluid py-4">
                <div className="card" style={{ background: 'white', borderRadius: '1.5rem', boxShadow: '0 20px 35px -12px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
                    <div className="p-4">
                        <div className="table-responsive">
                            <table className="table-premium w-100">
                                <thead><tr><th>ID</th><th>Khách hàng</th><th>SĐT</th><th>Địa chỉ</th><th>Sản phẩm</th><th>Tổng tiền</th><th>Ngày đặt</th><th>Trạng thái</th><th>Thao tác</th></tr></thead>
                                <tbody>
                                    {orders.map(order => {
                                        const addr = parseAddress(order.shippingAddress);
                                        return (
                                            <tr key={order.id}>
                                                <td>#{order.id}</td><td>{addr.fullName}</td><td>{addr.phone}</td><td>{addr.address}<br/><small className="text-muted">{addr.note}</small></td>
                                                <td>{order.orderDetails?.map((d,i) => <div key={i}>{d.product?.name || `SP #${d.productId}`} x {d.quantity} = {(d.unitPrice*d.quantity).toLocaleString()}đ</div>)}</td>
                                                <td><strong className="text-danger">{order.totalAmount?.toLocaleString()}đ</strong></td>
                                                <td>{new Date(order.orderDate).toLocaleDateString('vi-VN')}</td>
                                                <td>{statusBadge(order.status)}</td>
                                                <td>{actionButtons(order)}</td>
                                            </tr>
                                        );
                                    })}
                                    {orders.length===0 && <tr><td colSpan="9" className="text-center py-4">Không có đơn hàng</td></tr>}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
export default AdminOrders;