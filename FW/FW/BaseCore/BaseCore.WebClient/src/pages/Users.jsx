import React, { useState, useEffect } from 'react';
import { userApi } from '../services/api';

const Users = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [keyword, setKeyword] = useState('');
    const [page, setPage] = useState(1);
    const [pageSize] = useState(10);
    const [totalPages, setTotalPages] = useState(0);
    const [totalCount, setTotalCount] = useState(0);
    const [showModal, setShowModal] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [formData, setFormData] = useState({ username: '', password: '', name: '', email: '', phone: '', position: '', userType: 0, isActive: true });
    const [error, setError] = useState('');

    useEffect(() => { loadUsers(); }, [page, keyword]);
    const loadUsers = async () => {
        setLoading(true);
        try { const res = await userApi.getAll({ keyword, page, pageSize }); setUsers(res.data.data || []); setTotalPages(res.data.totalPages || 0); setTotalCount(res.data.totalCount || 0); } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };
    const handleSearch = (e) => { e.preventDefault(); setPage(1); loadUsers(); };
    const openModal = (user = null) => {
        if (user) {
            setEditingUser(user);
            setFormData({ username: user.username, password: '', name: user.name||'', email: user.email||'', phone: user.phone||'', position: user.position||'', userType: user.userType||0, isActive: user.isActive });
        } else {
            setEditingUser(null);
            setFormData({ username: '', password: '', name: '', email: '', phone: '', position: '', userType: 0, isActive: true });
        }
        setError(''); setShowModal(true);
    };
    const closeModal = () => { setShowModal(false); setEditingUser(null); setError(''); };
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingUser) {
                const updateData = { name: formData.name, email: formData.email, phone: formData.phone, position: formData.position, userType: parseInt(formData.userType), isActive: formData.isActive };
                if (formData.password) updateData.password = formData.password;
                await userApi.update(editingUser.id, updateData);
            } else {
                if (!formData.password) { setError('Mật khẩu bắt buộc'); return; }
                await userApi.create({ username: formData.username, password: formData.password, name: formData.name, email: formData.email, phone: formData.phone, position: formData.position, userType: parseInt(formData.userType) });
            }
            closeModal(); loadUsers();
        } catch (err) { setError(err.response?.data?.message || 'Thất bại'); }
    };
    const handleDelete = async (id) => {
        if (!window.confirm('Xóa người dùng này?')) return;
        try { await userApi.delete(id); loadUsers(); } catch (e) { alert('Xóa thất bại'); }
    };
    const renderPagination = () => {
        const pages = [];
        for (let i=1; i<=totalPages; i++) pages.push(<li key={i} className={`page-item ${page===i?'active':''}`}><button className="page-link" onClick={()=>setPage(i)}>{i}</button></li>);
        return pages;
    };

    return (
        <div style={{ background: '#f4f4f9', minHeight: '100vh' }}>
            <div className="px-4 py-4" style={{ background: 'linear-gradient(115deg, #0a0a1a 0%, #1e1e2f 100%)', borderBottom: '3px solid #FFD700' }}>
                <div className="container-fluid d-flex justify-content-between align-items-center flex-wrap">
                     <div style={{ background: 'linear-gradient(115deg, #0a0a1a 0%)',  padding: '20px 24px' }}>
                <h1 className="text-white mb-0" style={{ fontWeight: 800, fontSize: '1.8rem' }}>Quản lý người dùng</h1>
                
            </div>
                    <button className="btn btn-success btn-sm" onClick={() => openModal()}><i className="fas fa-plus"></i> Thêm người dùng</button>
                </div>
            </div>
            <div className="container-fluid py-4">
                <div className="card" style={{ background: 'white', borderRadius: '1.5rem', boxShadow: '0 20px 35px -12px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
                    <div className="p-4" style={{ borderBottom: '2px solid #FFD700' }}>
                        <form onSubmit={handleSearch} className="d-flex gap-2">
                            <input type="text" className="form-control form-control-sm" placeholder="Tìm kiếm theo tên, email, số điện thoại..." value={keyword} onChange={e=>setKeyword(e.target.value)} style={{ maxWidth: '300px' }} />
                            <button type="submit" className="btn btn-danger btn-sm"><i className="fas fa-search"></i> Tìm</button>
                        </form>
                    </div>
                    <div className="p-4">
                        {loading ? <div className="text-center py-5"><div className="spinner-border text-danger"></div></div> :
                            <>
                                <div className="table-responsive">
                                    <table className="table-premium w-100">
                                        <thead><tr><th>Username</th><th>Họ tên</th><th>Email</th><th>SĐT</th><th>Vai trò</th><th>Trạng thái</th><th>Thao tác</th></tr></thead>
                                        <tbody>
                                            {users.length===0 ? <tr><td colSpan="7" className="text-center py-4">Không có người dùng</td></tr> :
                                                users.map(u => (
                                                    <tr key={u.id}>
                                                        <td>{u.username}</td><td>{u.name}</td><td>{u.email}</td><td>{u.phone}</td>
                                                        <td><span className={`badge ${u.userType===1?'bg-danger':'bg-info'} px-3 py-2 rounded-pill`}>{u.userType===1?'Admin':'User'}</span></td>
                                                        <td><span className={`badge ${u.isActive?'bg-success':'bg-secondary'} px-3 py-2 rounded-pill`}>{u.isActive?'Hoạt động':'Khóa'}</span></td>
                                                        <td><button className="btn btn-sm btn-info me-1" onClick={()=>openModal(u)}><i className="fas fa-edit"></i></button><button className="btn btn-sm btn-danger" onClick={()=>handleDelete(u.id)}><i className="fas fa-trash"></i></button></td>
                                                    </tr>
                                                ))}
                                        </tbody>
                                    </table>
                                </div>
                                <div className="d-flex justify-content-between align-items-center mt-4">
                                    <span>Tổng {totalCount} người dùng</span>
                                    <nav><ul className="pagination mb-0">
                                        <li className={`page-item ${page===1?'disabled':''}`}><button className="page-link" onClick={()=>setPage(p=>p-1)}>Previous</button></li>
                                        {renderPagination()}
                                        <li className={`page-item ${page===totalPages?'disabled':''}`}><button className="page-link" onClick={()=>setPage(p=>p+1)}>Next</button></li>
                                    </ul></nav>
                                </div>
                            </>
                        }
                    </div>
                </div>
            </div>
            {/* Modal giữ nguyên */}
        </div>
    );
};
export default Users;