import React, { useState, useEffect } from 'react';
import { categoryApi } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const Categories = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [formData, setFormData] = useState({ name: '', description: '' });
    const [error, setError] = useState('');
    const { isAdmin } = useAuth();

    useEffect(() => { loadCategories(); }, []);
    const loadCategories = async () => {
        setLoading(true);
        try { const res = await categoryApi.getAll(); setCategories(res.data || []); } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };
    const openModal = (cat = null) => {
        if (cat) { setEditingCategory(cat); setFormData({ name: cat.name, description: cat.description || '' }); }
        else { setEditingCategory(null); setFormData({ name: '', description: '' }); }
        setError(''); setShowModal(true);
    };
    const closeModal = () => { setShowModal(false); setEditingCategory(null); setError(''); };
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingCategory) await categoryApi.update(editingCategory.id, { id: editingCategory.id, ...formData });
            else await categoryApi.create(formData);
            closeModal(); loadCategories();
        } catch (error) { setError(error.response?.data?.message || 'Thất bại'); }
    };
    const handleDelete = async (id) => {
        if (!window.confirm('Xóa danh mục này?')) return;
        try { await categoryApi.delete(id); loadCategories(); } catch (e) { alert('Không thể xóa vì có sản phẩm liên quan'); }
    };

    return (
        <div style={{ background: '#f4f4f9', minHeight: '100vh' }}>
            <div className="px-4 py-4" style={{ background: 'linear-gradient(115deg, #0a0a1a 0%, #1e1e2f 100%)', borderBottom: '3px solid #FFD700' }}>
                <div className="container-fluid d-flex justify-content-between align-items-center flex-wrap">
                    <div style={{ background: 'linear-gradient(115deg, #0a0a1a 0%)',  padding: '20px 24px' }}>
                <h1 className="text-white mb-0" style={{ fontWeight: 800, fontSize: '1.8rem' }}>Quản lý danh mục</h1>
                <p className="text-white-50 mt-1 mb-0">Danh sách danh mục Manchester United Store</p>
            </div>
                    {isAdmin() && <button className="btn btn-success btn-sm" onClick={() => openModal()}><i className="fas fa-plus"></i> Thêm danh mục</button>}
                </div>
            </div>
            <div className="container-fluid py-4">
                <div className="card" style={{ background: 'white', borderRadius: '1.5rem', boxShadow: '0 20px 35px -12px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
                    <div className="p-4">
                        {loading ? <div className="text-center py-5"><div className="spinner-border text-danger"></div></div> :
                            <div className="table-responsive">
                                <table className="table-premium w-100">
                                    <thead><tr><th>ID</th><th>Tên danh mục</th><th>Mô tả</th>{isAdmin() && <th>Thao tác</th>}</tr></thead>
                                    <tbody>
                                        {categories.length === 0 ? <tr><td colSpan={isAdmin() ? 4 : 3} className="text-center py-4">Chưa có danh mục</td></tr> :
                                            categories.map(c => (
                                                <tr key={c.id}>
                                                    <td>{c.id}</td><td>{c.name}</td><td>{c.description || '-'}</td>
                                                    {isAdmin() && <td><button className="btn btn-sm btn-info me-1" onClick={() => openModal(c)}><i className="fas fa-edit"></i></button><button className="btn btn-sm btn-danger" onClick={() => handleDelete(c.id)}><i className="fas fa-trash"></i></button></td>}
                                                </tr>
                                            ))}
                                    </tbody>
                                </table>
                            </div>
                        }
                    </div>
                </div>
            </div>
            {/* Modal giữ nguyên */}
        </div>
    );
};
export default Categories;