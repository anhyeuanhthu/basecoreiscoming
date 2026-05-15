import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { productApi, categoryApi } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const Products = () => {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [keyword, setKeyword] = useState('');
    const [categoryId, setCategoryId] = useState('');
    const [minPrice, setMinPrice] = useState('');
    const [maxPrice, setMaxPrice] = useState('');
    const [page, setPage] = useState(1);
    const [pageSize] = useState(10);
    const [totalPages, setTotalPages] = useState(0);
    const [totalCount, setTotalCount] = useState(0);
    const [showModal, setShowModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [formData, setFormData] = useState({ name: '', price: 0, stock: 0, description: '', categoryId: '' });
    const [imageUrls, setImageUrls] = useState([]);
    const [mainImageIndex, setMainImageIndex] = useState(0);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');
    const { isAdmin } = useAuth();

    const adminFlag = isAdmin(); // Gọi 1 lần, không gọi trong render

    useEffect(() => { loadCategories(); }, []);
    useEffect(() => { loadProducts(); }, [page, keyword, categoryId, minPrice, maxPrice]);

    const loadCategories = async () => {
        try { const res = await categoryApi.getAll(); setCategories(res.data || []); }
        catch (err) { console.error(err); }
    };

    const loadProducts = async () => {
        setLoading(true);
        try {
            const params = { page, pageSize };
            if (keyword) params.keyword = keyword;
            if (categoryId) params.categoryId = categoryId;
            if (minPrice) params.minPrice = minPrice;
            if (maxPrice) params.maxPrice = maxPrice;
            const res = await productApi.search(params);
            setProducts(res.data.items || []);
            setTotalPages(res.data.totalPages || 0);
            setTotalCount(res.data.totalCount || 0);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    const handleSearch = (e) => { e.preventDefault(); setPage(1); loadProducts(); };
    const handleReset = () => { setKeyword(''); setCategoryId(''); setMinPrice(''); setMaxPrice(''); setPage(1); };

    const handleFileUpload = async (files) => {
        setUploading(true);
        const uploadedUrls = [];
        for (let file of files) {
            const fd = new FormData();
            fd.append('file', file);
            try {
                const res = await api.post('/products/upload-image', fd, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                uploadedUrls.push(res.data.url);
            } catch (err) {
                alert(`Upload thất bại: ${file.name} — ${err.response?.data?.message || err.message}`);
            }
        }
        setUploading(false);
        return uploadedUrls;
    };

    const onFileSelect = async (e) => {
        const files = Array.from(e.target.files);
        if (!files.length) return;
        const newUrls = await handleFileUpload(files);
        setImageUrls(prev => {
            const updated = [...prev, ...newUrls];
            if (prev.length === 0 && updated.length > 0) setMainImageIndex(0);
            return updated;
        });
        e.target.value = ''; // reset input để chọn lại được
    };

    const addImageUrl = () => setImageUrls(prev => [...prev, '']);
    const updateImageUrl = (idx, value) => setImageUrls(prev => { const n = [...prev]; n[idx] = value; return n; });
    const removeImageUrl = (idx) => {
        setImageUrls(prev => prev.filter((_, i) => i !== idx));
        if (mainImageIndex === idx) setMainImageIndex(0);
        else if (mainImageIndex > idx) setMainImageIndex(prev => prev - 1);
    };

    const openModal = (product = null) => {
        if (product) {
            setEditingProduct(product);
            setFormData({ name: product.name, price: product.price, stock: product.stock, description: product.description || '', categoryId: product.categoryId });
            if (product.images && product.images.length) {
                setImageUrls(product.images.map(img => img.imageUrl));
                const mainIdx = product.images.findIndex(img => img.isMain);
                setMainImageIndex(mainIdx >= 0 ? mainIdx : 0);
            } else if (product.imageUrl) {
                setImageUrls([product.imageUrl]);
                setMainImageIndex(0);
            } else {
                setImageUrls([]);
                setMainImageIndex(0);
            }
        } else {
            setEditingProduct(null);
            setFormData({ name: '', price: 0, stock: 0, description: '', categoryId: categories[0]?.id || '' });
            setImageUrls([]);
            setMainImageIndex(0);
        }
        setError('');
        setShowModal(true);
    };

    const closeModal = () => { setShowModal(false); setEditingProduct(null); setImageUrls([]); setError(''); };
    const handleFormChange = (e) => { const { name, value } = e.target; setFormData(prev => ({ ...prev, [name]: value })); };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            // Lọc bỏ URL rỗng
            const validUrls = imageUrls.filter(u => u && u.trim() !== '');
            const safeMainIndex = validUrls.length > 0 ? Math.min(mainImageIndex, validUrls.length - 1) : 0;

            // Đúng tên field với backend (ImageUrls, MainImageIndex)
            const data = {
                Name: formData.name,
                Price: parseFloat(formData.price),
                Stock: parseInt(formData.stock),
                CategoryId: parseInt(formData.categoryId),
                Description: formData.description || '',
                ImageUrls: validUrls,
                MainImageIndex: safeMainIndex,
            };

            if (editingProduct) {
                await productApi.update(editingProduct.id, data);
            } else {
                await productApi.create(data);
            }
            closeModal();
            loadProducts();
        } catch (err) {
            setError(err.response?.data?.message || err.response?.data || 'Thao tác thất bại');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Xóa sản phẩm này?')) return;
        try { await productApi.delete(id); loadProducts(); }
        catch { alert('Xóa thất bại'); }
    };

    const renderPagination = () => Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
        <li key={p} className={`page-item ${page === p ? 'active' : ''}`}>
            <button className="page-link" onClick={() => setPage(p)}>{p}</button>
        </li>
    ));

    const renderProductImage = (imageUrl, productName) => {
        if (!imageUrl) return (
            <div style={{ width: 40, height: 40, background: '#f4f4f9', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 6 }}>
                <i className="fas fa-image text-secondary"></i>
            </div>
        );
        return <img src={imageUrl} alt={productName} style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 6 }} />;
    };

    return (
        <div style={{ background: '#f4f4f9', minHeight: '100vh' }}>
            <div style={{ background: 'linear-gradient(115deg, #0a0a1a 0%, #1e1e2f 100%)', borderBottom: '3px solid #FFD700', padding: '20px 24px' }}>
                <h1 style={{ fontWeight: 800, fontSize: '1.8rem', color: 'white' }}>Quản lý sản phẩm</h1>
                <p style={{ color: 'rgba(255,255,255,0.5)' }}>Danh sách sản phẩm Manchester United Store</p>
            </div>

            <div style={{ padding: '24px' }}>
                <div style={{ background: 'white', borderRadius: '1.5rem', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
                    <div style={{ padding: '16px 24px', borderBottom: '2px solid #FFD700' }}>
                        <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
                            <div className="d-flex gap-2 flex-wrap">
                                <input type="text" className="form-control form-control-sm" placeholder="Tên sản phẩm..." value={keyword} onChange={e => setKeyword(e.target.value)} style={{ width: 160 }} />
                                <select className="form-select form-select-sm" value={categoryId} onChange={e => setCategoryId(e.target.value)} style={{ width: 140 }}>
                                    <option value="">Tất cả danh mục</option>
                                    {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                                </select>
                                <input type="number" className="form-control form-control-sm" placeholder="Giá từ" value={minPrice} onChange={e => setMinPrice(e.target.value)} style={{ width: 110 }} />
                                <input type="number" className="form-control form-control-sm" placeholder="Giá đến" value={maxPrice} onChange={e => setMaxPrice(e.target.value)} style={{ width: 110 }} />
                                <button className="btn btn-danger btn-sm" onClick={handleSearch}>Tìm</button>
                                <button className="btn btn-secondary btn-sm" onClick={handleReset}>Reset</button>
                            </div>
                            {adminFlag && <button className="btn btn-success btn-sm" onClick={() => openModal()}>+ Thêm sản phẩm</button>}
                        </div>
                    </div>

                    {loading ? (
                        <div className="text-center py-5"><div className="spinner-border text-danger"></div></div>
                    ) : (
                        <>
                            <div className="table-responsive">
                                <table className="table" style={{ marginBottom: 0 }}>
                                    <thead>
                                        <tr>
                                            <th>ID</th><th>Hình ảnh</th><th>Tên sản phẩm</th><th>Danh mục</th><th>Giá</th><th>Tồn kho</th>
                                            {adminFlag && <th>Thao tác</th>}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {products.length === 0 ? (
                                            <tr><td colSpan={adminFlag ? 7 : 6} className="text-center py-4">Không tìm thấy sản phẩm</td></tr>
                                        ) : products.map(p => (
                                            <tr key={p.id}>
                                                <td>{p.id}</td>
                                                <td>{renderProductImage(p.imageUrl, p.name)}</td>
                                                <td>{p.name}</td>
                                                <td>{p.category?.name || '-'}</td>
                                                <td>{p.price?.toLocaleString()} VND</td>
                                                <td>{p.stock}</td>
                                                {adminFlag && (
                                                    <td>
                                                        <button className="btn btn-sm btn-info me-1" onClick={() => openModal(p)}><i className="fas fa-edit"></i></button>
                                                        <button className="btn btn-sm btn-danger" onClick={() => handleDelete(p.id)}><i className="fas fa-trash"></i></button>
                                                    </td>
                                                )}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <div className="d-flex justify-content-between align-items-center p-3 border-top">
                                <span>Tổng {totalCount} sản phẩm</span>
                                <nav><ul className="pagination pagination-sm mb-0">
                                    <li className={`page-item ${page === 1 ? 'disabled' : ''}`}><button className="page-link" onClick={() => setPage(p => p - 1)}>Previous</button></li>
                                    {renderPagination()}
                                    <li className={`page-item ${page === totalPages ? 'disabled' : ''}`}><button className="page-link" onClick={() => setPage(p => p + 1)}>Next</button></li>
                                </ul></nav>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="modal fade show" style={{ display: 'block', background: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-dialog-centered modal-lg">
                        <div className="modal-content" style={{ borderRadius: '1rem' }}>
                            <div className="modal-header" style={{ borderBottom: '2px solid #FFD700' }}>
                                <h5>{editingProduct ? 'Sửa sản phẩm' : 'Thêm sản phẩm'}</h5>
                                <button type="button" className="btn-close" onClick={closeModal}></button>
                            </div>
                            <form onSubmit={handleSubmit}>
                                <div className="modal-body">
                                    {error && <div className="alert alert-danger">{error}</div>}
                                    <div className="mb-3">
                                        <label className="form-label">Tên sản phẩm</label>
                                        <input type="text" className="form-control" name="name" value={formData.name} onChange={handleFormChange} required />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Danh mục</label>
                                        <select className="form-select" name="categoryId" value={formData.categoryId} onChange={handleFormChange} required>
                                            <option value="">Chọn danh mục</option>
                                            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                        </select>
                                    </div>
                                    <div className="row mb-3">
                                        <div className="col">
                                            <label className="form-label">Giá (VND)</label>
                                            <input type="number" className="form-control" name="price" value={formData.price} onChange={handleFormChange} required min="0" step="1000" />
                                        </div>
                                        <div className="col">
                                            <label className="form-label">Tồn kho</label>
                                            <input type="number" className="form-control" name="stock" value={formData.stock} onChange={handleFormChange} required min="0" />
                                        </div>
                                    </div>

                                    {/* ===== HÌNH ẢNH ===== */}
                                    <div className="mb-3">
                                        <label className="form-label">Hình ảnh sản phẩm</label>
                                        <input type="file" multiple accept="image/*" className="form-control mb-2" onChange={onFileSelect} disabled={uploading} />
                                        {uploading && (
                                            <div className="d-flex align-items-center gap-2 mb-2">
                                                <div className="spinner-border spinner-border-sm text-primary"></div>
                                                <span className="text-muted">Đang upload...</span>
                                            </div>
                                        )}

                                        {imageUrls.length > 0 && (
                                            <div className="border rounded p-2 mb-2" style={{ background: '#f8f9fa' }}>
                                                <small className="text-muted d-block mb-2">Danh sách ảnh ({imageUrls.length} ảnh) — chọn ảnh chính:</small>
                                                {imageUrls.map((url, idx) => (
                                                    <div key={idx} className="d-flex align-items-center gap-2 mb-2">
                                                        {url && <img src={url} alt="" style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 6, border: mainImageIndex === idx ? '2px solid #DA020E' : '1px solid #ddd' }} onError={e => e.target.style.display='none'} />}
                                                        <input type="text" className="form-control form-control-sm" value={url} onChange={e => updateImageUrl(idx, e.target.value)} placeholder="URL ảnh" />
                                                        <div className="form-check mb-0" style={{ whiteSpace: 'nowrap' }}>
                                                            <input className="form-check-input" type="radio" name="mainImage" id={`main-${idx}`} checked={mainImageIndex === idx} onChange={() => setMainImageIndex(idx)} />
                                                            <label className="form-check-label" htmlFor={`main-${idx}`}>Chính</label>
                                                        </div>
                                                        <button type="button" className="btn btn-sm btn-outline-danger" onClick={() => removeImageUrl(idx)}>🗑️</button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                        <button type="button" className="btn btn-sm btn-outline-secondary" onClick={addImageUrl}>+ Thêm URL thủ công</button>
                                    </div>

                                    <div className="mb-3">
                                        <label className="form-label">Mô tả</label>
                                        <textarea className="form-control" name="description" value={formData.description} onChange={handleFormChange} rows="3"></textarea>
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-secondary" onClick={closeModal}>Hủy</button>
                                    <button type="submit" className="btn btn-danger" disabled={uploading}>
                                        {uploading ? <span className="spinner-border spinner-border-sm me-1"></span> : null}
                                        {editingProduct ? 'Cập nhật' : 'Thêm mới'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Products;
