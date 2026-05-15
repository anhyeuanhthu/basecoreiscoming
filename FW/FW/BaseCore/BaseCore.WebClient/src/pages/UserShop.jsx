// BaseCore.WebClient/src/pages/UserShop.jsx
import React, { useState, useEffect } from 'react';
import { productApi, categoryApi } from '../services/api';
import { useCart } from '../contexts/CartContext';
import { useNavigate } from 'react-router-dom';
import { Carousel } from 'react-responsive-carousel';
import 'react-responsive-carousel/lib/styles/carousel.min.css';

const UserShop = () => {
    const navigate = useNavigate();
    const { addToCart } = useCart();
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    
    const [keyword, setKeyword] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [priceRange, setPriceRange] = useState('');
    const [sortBy, setSortBy] = useState('');
    
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [totalCount, setTotalCount] = useState(0);
    
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [addingToCart, setAddingToCart] = useState(false);
    
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [toastType, setToastType] = useState('success');
    
    const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    
    const pageSize = 12;
    
    const CAT_ICONS = { 
        'Áo đấu': '👕', 
        'Quần & Quần short': '🩳', 
        'Giày & Tất': '👟', 
        'Phụ kiện': '🎽' 
    };

    const getPriceRangeValues = () => {
        switch(priceRange) {
            case 'under500k': return { min: 0, max: 500000 };
            case '500k-1m': return { min: 500000, max: 1000000 };
            case '1m-2m': return { min: 1000000, max: 2000000 };
            case 'over2m': return { min: 2000000, max: null };
            default: return { min: null, max: null };
        }
    };

    useEffect(() => { loadCategories(); }, []);
    useEffect(() => { loadProducts(); }, [page, selectedCategory, priceRange, sortBy, keyword]);

    const loadCategories = async () => {
        try { 
            const res = await categoryApi.getAll(); 
            setCategories(res.data || []); 
        } catch (e) { console.error(e); }
    };

    const loadProducts = async () => {
        setLoading(true);
        try {
            const price = getPriceRangeValues();
            const params = {
                keyword: keyword || undefined,
                categoryId: selectedCategory || undefined,
                minPrice: price.min,
                maxPrice: price.max,
                sortBy: sortBy || undefined,
                page: page,
                pageSize: pageSize
            };
            Object.keys(params).forEach(key => params[key] === undefined && delete params[key]);
            const res = await productApi.search(params);
            setProducts(res.data.items || []);
            setTotalPages(res.data.totalPages || 0);
            setTotalCount(res.data.totalCount || 0);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    const handleSearch = (e) => { e.preventDefault(); setPage(1); loadProducts(); };
    const handleResetFilters = () => {
        setKeyword('');
        setSelectedCategory('');
        setPriceRange('');
        setSortBy('');
        setPage(1);
    };

    const showNotification = (message, type = 'success') => {
        setToastMessage(message);
        setToastType(type);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
    };

    const handleAddToCart = async (product, qty) => {
        if (product.stock <= 0) {
            showNotification('Sản phẩm đã hết hàng!', 'error');
            return;
        }
        setAddingToCart(true);
        const result = await addToCart(product, qty);
        setAddingToCart(false);
        if (result.success) {
            showNotification(`Đã thêm ${qty} ${product.name} vào giỏ hàng!`, 'success');
            setQuantity(1);
        } else {
            showNotification(result.message || 'Thêm vào giỏ thất bại!', 'error');
        }
    };

    const handleBuyNow = async (product, qty) => {
        if (product.stock <= 0) {
            showNotification('Sản phẩm đã hết hàng!', 'error');
            return;
        }
        navigate('/checkout', { state: { buyNow: true, product: product, quantity: qty } });
    };

    const openModal = async (product) => {
        try {
            const response = await productApi.getById(product.id);
            setSelectedProduct(response.data);
            setQuantity(1);
        } catch (error) {
            console.error('Failed to load product details', error);
            setSelectedProduct(product); // fallback
        }
    };
    
    const formatPrice = (price) => {
        if (!price) return 'Liên hệ';
        return price.toLocaleString('vi-VN') + '₫';
    };

    return (
        <div style={{ fontFamily: "'Inter', 'Oswald', sans-serif", background: '#f8f9fa', minHeight: '100vh' }}>
            <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Oswald:wght@400;500;600;700&display=swap" rel="stylesheet" />
            
            <style>{`
                /* Giữ nguyên CSS như cũ (đã được đồng bộ) */
                * { margin: 0; padding: 0; box-sizing: border-box; }
                .toast-notification { position: fixed; bottom: 30px; right: 30px; z-index: 1000; min-width: 300px; padding: 14px 20px; border-radius: 12px; background: white; box-shadow: 0 8px 24px rgba(0,0,0,0.15); display: flex; align-items: center; gap: 12px; animation: slideInRight 0.3s ease; border-left: 4px solid; }
                @keyframes slideInRight { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
                .toast-notification.success { border-left-color: #28a745; }
                .toast-notification.error { border-left-color: #dc3545; }
                .toast-message { flex: 1; font-size: 14px; color: #333; }
                .hero-section { background: linear-gradient(135deg, #DA020E 0%, #8B0000 50%, #1a0003 100%); padding: 50px 40px; position: relative; overflow: hidden; }
                .hero-section::before { content: 'MUFC'; position: absolute; right: -20px; top: -40px; font-size: 180px; font-weight: 700; color: rgba(255,255,255,0.04); font-family: 'Oswald', sans-serif; pointer-events: none; }
                .hero-badge { display: inline-block; background: rgba(255,215,0,0.15); border: 1px solid rgba(255,215,0,0.4); color: #FFD700; border-radius: 30px; padding: 6px 16px; font-size: 11px; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 16px; }
                .hero-title { font-size: clamp(32px, 5vw, 56px); font-weight: 700; color: white; line-height: 1.1; margin-bottom: 8px; }
                .hero-title span { color: #FFD700; }
                .hero-sub { font-size: 14px; color: rgba(255,255,255,0.7); margin-bottom: 24px; }
                .search-wrapper { display: flex; gap: 12px; flex-wrap: wrap; align-items: center; }
                .search-input-group { flex: 1; display: flex; max-width: 500px; background: rgba(255,255,255,0.1); border-radius: 50px; border: 1px solid rgba(255,255,255,0.2); overflow: hidden; }
                .search-input { flex: 1; padding: 14px 20px; background: transparent; border: none; color: white; font-size: 14px; outline: none; }
                .search-input::placeholder { color: rgba(255,255,255,0.5); }
                .search-btn { padding: 0 24px; background: #FFD700; border: none; color: #1a0003; font-weight: 600; cursor: pointer; }
                .filter-toggle-btn { padding: 12px 24px; background: rgba(255,255,255,0.15); border: 1px solid rgba(255,255,255,0.3); border-radius: 50px; color: white; cursor: pointer; font-size: 13px; }
                .filter-panel { background: white; border-radius: 16px; padding: 24px; margin-top: 24px; box-shadow: 0 4px 20px rgba(0,0,0,0.08); }
                .filter-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin-bottom: 20px; }
                .filter-group label { display: block; font-weight: 600; font-size: 13px; margin-bottom: 10px; color: #333; }
                .price-options, .sort-options { display: flex; flex-wrap: wrap; gap: 8px; }
                .price-chip, .sort-chip { padding: 8px 16px; background: #f0f0f0; border-radius: 30px; font-size: 12px; cursor: pointer; }
                .price-chip.active, .sort-chip.active { background: #DA020E; color: white; }
                .reset-btn { padding: 10px 20px; background: #f0f0f0; border: none; border-radius: 8px; cursor: pointer; font-size: 13px; }
                .main-layout { display: flex; padding: 32px 40px; gap: 32px; max-width: 1400px; margin: 0 auto; }
                .sidebar { width: 260px; flex-shrink: 0; }
                .category-card { background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 2px 12px rgba(0,0,0,0.06); position: sticky; top: 20px; }
                .category-header { background: #DA020E; padding: 16px 20px; color: white; font-weight: 700; font-size: 15px; }
                .category-list { padding: 8px 0; }
                .category-item { display: flex; align-items: center; gap: 12px; padding: 12px 20px; cursor: pointer; transition: all 0.2s; border-left: 3px solid transparent; }
                .category-item:hover { background: #fff5f5; }
                .category-item.active { background: #fff0f0; border-left-color: #DA020E; }
                .category-icon { font-size: 24px; width: 36px; text-align: center; }
                .category-info { flex: 1; }
                .category-name { font-weight: 600; font-size: 14px; color: #333; }
                .category-count { font-size: 11px; color: #999; margin-top: 2px; }
                .category-item.active .category-name { color: #DA020E; }
                .products-container { flex: 1; }
                .results-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
                .results-count { font-size: 14px; color: #666; }
                .results-count strong { color: #DA020E; }
                .mobile-filter-btn { display: none; padding: 10px 18px; background: white; border: 1px solid #ddd; border-radius: 30px; cursor: pointer; font-size: 13px; }
                .products-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 24px; }
                .product-card { background: white; border-radius: 16px; overflow: hidden; cursor: pointer; transition: all 0.3s; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
                .product-card:hover { transform: translateY(-6px); box-shadow: 0 12px 28px rgba(218,2,14,0.12); }
                .product-image { width: 100%; aspect-ratio: 1; object-fit: cover; }
                .product-info { padding: 16px; }
                .product-name { font-weight: 600; font-size: 14px; color: #333; margin-bottom: 8px; line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
                .product-price { font-size: 16px; font-weight: 700; color: #DA020E; margin-bottom: 8px; }
                .stock-badge { display: inline-block; padding: 4px 10px; border-radius: 20px; font-size: 11px; font-weight: 500; }
                .in-stock { background: #e8f5e9; color: #2e7d32; }
                .low-stock { background: #fff3e0; color: #ed6c02; }
                .out-stock { background: #ffebee; color: #c62828; }
                .pagination { display: flex; justify-content: center; gap: 8px; margin-top: 48px; }
                .page-btn { width: 40px; height: 40px; border-radius: 10px; border: 1px solid #e0e0e0; background: white; cursor: pointer; }
                .page-btn:hover { border-color: #DA020E; color: #DA020E; }
                .page-btn.active { background: #DA020E; border-color: #DA020E; color: white; }
                .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.7); display: flex; align-items: center; justify-content: center; z-index: 1000; }
                .modal-content { background: white; border-radius: 24px; max-width: 560px; width: 90%; max-height: 90vh; overflow-y: auto; position: relative; }
                .modal-close { position: absolute; top: 16px; right: 16px; width: 36px; height: 36px; border-radius: 50%; background: rgba(0,0,0,0.5); border: none; color: white; font-size: 20px; cursor: pointer; }
                .modal-body { padding: 28px; }
                .modal-product-name { font-size: 22px; font-weight: 700; margin: 12px 0 8px; }
                .quantity-control { display: flex; align-items: center; gap: 16px; margin: 20px 0; }
                .qty-btn { width: 40px; height: 40px; border-radius: 10px; border: 1px solid #ddd; background: white; font-size: 18px; cursor: pointer; }
                .action-buttons { display: flex; gap: 12px; }
                .btn-cart { flex: 1; padding: 14px; background: white; border: 2px solid #DA020E; color: #DA020E; border-radius: 12px; font-weight: 600; cursor: pointer; }
                .btn-buy { flex: 1; padding: 14px; background: #DA020E; border: none; color: white; border-radius: 12px; font-weight: 600; cursor: pointer; }
                @media (max-width: 768px) { .main-layout { flex-direction: column; padding: 20px; } .sidebar { width: 100%; display: ${isMobileMenuOpen ? 'block' : 'none'}; } .mobile-filter-btn { display: block; } .products-grid { grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); } .hero-section { padding: 30px 20px; } }
            `}</style>

            {showToast && (
                <div className={`toast-notification ${toastType}`}>
                    <div className="toast-message">{toastMessage}</div>
                </div>
            )}

            {/* Hero Section */}
            <div className="hero-section">
                <div className="hero-badge">🔴 Manchester United Official Store</div>
                <div className="hero-title">GLORY GLORY<br /><span>MAN UNITED</span></div>
                <div className="hero-sub">{totalCount} sản phẩm chính hãng</div>
                <div className="search-wrapper">
                    <div className="search-input-group">
                        <input className="search-input" placeholder="Tìm kiếm sản phẩm..." value={keyword} onChange={e => setKeyword(e.target.value)} onKeyPress={e => e.key === 'Enter' && handleSearch(e)} />
                        <button className="search-btn" onClick={handleSearch}>🔍 Tìm</button>
                    </div>
                    <button className="filter-toggle-btn" onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}>
                        {showAdvancedFilters ? '📋 Ẩn bộ lọc' : '⚙️ Bộ lọc nâng cao'}
                    </button>
                </div>
                {showAdvancedFilters && (
                    <div className="filter-panel">
                        <div className="filter-grid">
                            <div className="filter-group">
                                <label>💰 Khoảng giá</label>
                                <div className="price-options">
                                    {[
                                        { value: '', label: 'Tất cả' },
                                        { value: 'under500k', label: 'Dưới 500k' },
                                        { value: '500k-1m', label: '500k - 1tr' },
                                        { value: '1m-2m', label: '1tr - 2tr' },
                                        { value: 'over2m', label: 'Trên 2tr' }
                                    ].map(option => (
                                        <div key={option.value} className={`price-chip ${priceRange === option.value ? 'active' : ''}`} onClick={() => { setPriceRange(option.value); setPage(1); }}>{option.label}</div>
                                    ))}
                                </div>
                            </div>
                            <div className="filter-group">
                                <label>🔄 Sắp xếp</label>
                                <div className="sort-options">
                                    {[
                                        { value: '', label: 'Mặc định' },
                                        { value: 'price_asc', label: 'Giá tăng dần' },
                                        { value: 'price_desc', label: 'Giá giảm dần' },
                                        { value: 'name_asc', label: 'Tên A-Z' },
                                        { value: 'newest', label: 'Mới nhất' }
                                    ].map(option => (
                                        <div key={option.value} className={`sort-chip ${sortBy === option.value ? 'active' : ''}`} onClick={() => { setSortBy(option.value); setPage(1); }}>{option.label}</div>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div style={{ textAlign: 'right' }}><button className="reset-btn" onClick={handleResetFilters}>⟳ Đặt lại bộ lọc</button></div>
                    </div>
                )}
            </div>

            {/* Main Layout */}
            <div className="main-layout">
                <aside className="sidebar">
                    <div className="category-card">
                        <div className="category-header">📦 DANH MỤC SẢN PHẨM</div>
                        <div className="category-list">
                            <div className={`category-item ${selectedCategory === '' ? 'active' : ''}`} onClick={() => { setSelectedCategory(''); setPage(1); }}>
                                <div className="category-icon">🏪</div>
                                <div className="category-info"><div className="category-name">Tất cả sản phẩm</div><div className="category-count">{totalCount} sản phẩm</div></div>
                            </div>
                            {categories.map(cat => (
                                <div key={cat.id} className={`category-item ${selectedCategory == cat.id ? 'active' : ''}`} onClick={() => { setSelectedCategory(cat.id); setPage(1); }}>
                                    <div className="category-icon">{CAT_ICONS[cat.name] || '📦'}</div>
                                    <div className="category-info"><div className="category-name">{cat.name}</div><div className="category-count">{cat.productCount || 0} sản phẩm</div></div>
                                </div>
                            ))}
                        </div>
                    </div>
                </aside>

                <div className="products-container">
                    <div className="results-header">
                        <div className="results-count">Hiển thị <strong>{products.length}</strong> / <strong>{totalCount}</strong> sản phẩm</div>
                        <button className="mobile-filter-btn" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>📋 Danh mục</button>
                    </div>
                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '80px' }}><div className="spinner"></div></div>
                    ) : products.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '80px', background: 'white', borderRadius: '16px' }}>
                            <div style={{ fontSize: '64px', marginBottom: '16px' }}>🔍</div>
                            <h3>Không tìm thấy sản phẩm</h3>
                            <p style={{ color: '#666', marginTop: '8px' }}>Thử thay đổi từ khóa hoặc bộ lọc tìm kiếm</p>
                            <button className="reset-btn" onClick={handleResetFilters} style={{ marginTop: '20px' }}>Đặt lại bộ lọc</button>
                        </div>
                    ) : (
                        <div className="products-grid">
                            {products.map(p => (
                                <div key={p.id} className="product-card" onClick={() => openModal(p)}>
                                    <img className="product-image" src={p.imageUrl} alt={p.name} onError={e => e.target.src = 'https://via.placeholder.com/300?text=MU'} />
                                    <div className="product-info">
                                        <div className="product-name">{p.name}</div>
                                        <div className="product-price">{formatPrice(p.price)}</div>
                                        <span className={`stock-badge ${p.stock > 10 ? 'in-stock' : p.stock > 0 ? 'low-stock' : 'out-stock'}`}>
                                            {p.stock > 10 ? 'Còn hàng' : p.stock > 0 ? `Còn ${p.stock}` : 'Hết hàng'}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                    {totalPages > 1 && (
                        <div className="pagination">
                            <button className="page-btn" disabled={page === 1} onClick={() => setPage(p => p - 1)}>‹</button>
                            {[...Array(Math.min(totalPages, 5))].map((_, i) => {
                                let pageNum = page - 2 + i;
                                if (pageNum < 1) pageNum = i + 1;
                                if (pageNum > totalPages) return null;
                                return <button key={pageNum} className={`page-btn ${page === pageNum ? 'active' : ''}`} onClick={() => setPage(pageNum)}>{pageNum}</button>;
                            })}
                            <button className="page-btn" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>›</button>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal với Carousel */}
            {selectedProduct && (
                <div className="modal-overlay" onClick={() => setSelectedProduct(null)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <button className="modal-close" onClick={() => setSelectedProduct(null)}>×</button>
                        {selectedProduct.images && selectedProduct.images.length > 0 ? (
                            <Carousel showThumbs={false} dynamicHeight={true} infiniteLoop={true}>
                                {selectedProduct.images.map((img, idx) => (
                                    <div key={idx}>
                                        <img src={img.imageUrl} alt={selectedProduct.name} style={{ objectFit: 'contain', maxHeight: '400px' }} />
                                    </div>
                                ))}
                            </Carousel>
                        ) : (
                            <img style={{ width: '100%', aspectRatio: '1', objectFit: 'cover' }} src={selectedProduct.imageUrl} alt={selectedProduct.name} />
                        )}
                        <div className="modal-body">
                            <div className="modal-product-name">{selectedProduct.name}</div>
                            <div className="product-price" style={{ fontSize: '28px', marginBottom: '12px' }}>{formatPrice(selectedProduct.price)}</div>
                            {selectedProduct.description && <p style={{ color: '#666', fontSize: '14px', lineHeight: '1.6' }}>{selectedProduct.description}</p>}
                            {selectedProduct.stock > 0 && (
                                <div className="quantity-control">
                                    <button className="qty-btn" onClick={() => setQuantity(prev => Math.max(1, prev - 1))}>-</button>
                                    <span style={{ fontSize: '18px', fontWeight: '600', minWidth: '40px', textAlign: 'center' }}>{quantity}</span>
                                    <button className="qty-btn" onClick={() => setQuantity(prev => Math.min(selectedProduct.stock, prev + 1))}>+</button>
                                    <span style={{ fontSize: '13px', color: '#888' }}>{selectedProduct.stock} sản phẩm có sẵn</span>
                                </div>
                            )}
                            <div className="action-buttons">
                                <button className="btn-cart" onClick={() => handleAddToCart(selectedProduct, quantity)}>🛒 Thêm vào giỏ</button>
                                <button className="btn-buy" onClick={() => handleBuyNow(selectedProduct, quantity)}>⚡ Mua ngay</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserShop;