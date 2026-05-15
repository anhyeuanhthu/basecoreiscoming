import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';

const Cart = () => {
    const navigate = useNavigate();
    const { cart, updateQuantity, removeFromCart, loading } = useCart();
    const [updatingId, setUpdatingId] = useState(null);

    const handleQuantityChange = async (productId, newQuantity) => {
        if (newQuantity < 1) return;
        setUpdatingId(productId);
        await updateQuantity(productId, newQuantity);
        setUpdatingId(null);
    };

    const handleRemove = async (productId, productName) => {
        if (window.confirm(`Bạn có chắc muốn xóa "${productName}" khỏi giỏ hàng?`)) {
            await removeFromCart(productId);
        }
    };

    const handleCheckout = () => {
        navigate('/checkout');
    };

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
                <div className="spinner-border text-danger" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    if (!cart.items || cart.items.length === 0) {
        return (
            <div style={{ fontFamily: "'Open Sans', sans-serif", background: '#f5f5f5', minHeight: '100vh' }}>
                {/* Header */}
                <header style={{ background: '#DA020E', padding: '15px 40px', color: 'white' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: '1200px', margin: '0 auto' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }} onClick={() => navigate('/shop')}>
                            <img 
                                src="https://upload.wikimedia.org/wikipedia/en/7/7a/Manchester_United_FC_crest.svg" 
                                alt="MU" 
                                style={{ width: '40px', height: '40px' }}
                                onError={e => e.target.style.display = 'none'}
                            />
                            <div>
                                <div style={{ fontSize: '18px', fontWeight: 'bold', letterSpacing: '1px' }}>MAN UNITED STORE</div>
                                <div style={{ fontSize: '10px', opacity: 0.8 }}>Official Fan Shop</div>
                            </div>
                        </div>
                        <div style={{ cursor: 'pointer' }} onClick={() => navigate('/shop')}>
                            ← Tiếp tục mua sắm
                        </div>
                    </div>
                </header>

                <div className="container mt-5" style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 20px' }}>
                    <div className="text-center py-5">
                        <div style={{ fontSize: '80px', marginBottom: '20px' }}>🛒</div>
                        <h3 style={{ color: '#333', marginBottom: '10px' }}>Giỏ hàng của bạn đang trống</h3>
                        <p style={{ color: '#888', marginBottom: '30px' }}>Hãy thêm sản phẩm vào giỏ hàng để tiếp tục mua sắm</p>
                        <button 
                            className="btn btn-danger btn-lg"
                            onClick={() => navigate('/shop')}
                            style={{ background: '#DA020E', border: 'none' }}
                        >
                            🔴 Tiếp tục mua sắm
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div style={{ fontFamily: "'Open Sans', sans-serif", background: '#f5f5f5', minHeight: '100vh' }}>
            {/* Header */}
            <header style={{ background: '#DA020E', padding: '15px 40px', color: 'white' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: '1200px', margin: '0 auto' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }} onClick={() => navigate('/shop')}>
                        <img 
                            src="https://upload.wikimedia.org/wikipedia/en/7/7a/Manchester_United_FC_crest.svg" 
                            alt="MU" 
                            style={{ width: '40px', height: '40px' }}
                            onError={e => e.target.style.display = 'none'}
                        />
                        <div>
                            <div style={{ fontSize: '18px', fontWeight: 'bold', letterSpacing: '1px' }}>MAN UNITED STORE</div>
                            <div style={{ fontSize: '10px', opacity: 0.8 }}>Official Fan Shop</div>
                        </div>
                    </div>
                    <div style={{ cursor: 'pointer' }} onClick={() => navigate('/shop')}>
                        ← Tiếp tục mua sắm
                    </div>
                </div>
            </header>

            <div className="container mt-4" style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
                <h2 className="mb-4" style={{ fontFamily: "'Oswald', sans-serif", color: '#DA020E' }}>🛒 Giỏ hàng của bạn</h2>
                
                <div className="row">
                    {/* Danh sách sản phẩm */}
                    <div className="col-md-8">
                        <div className="card shadow-sm">
                            <div className="card-body">
                                {cart.items.map((item) => (
                                    <div key={item.productId} className="row align-items-center mb-3 pb-3" style={{ borderBottom: '1px solid #eee' }}>
                                        {/* Ảnh sản phẩm */}
                                        <div className="col-md-2">
                                            {item.image ? (
                                                <img 
                                                    src={item.image} 
                                                    alt={item.productName} 
                                                    className="img-fluid rounded"
                                                    style={{ maxHeight: '80px', objectFit: 'cover' }}
                                                    onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                                                />
                                            ) : null}
                                            <div className="bg-light text-center p-2 rounded" style={{ display: item.image ? 'none' : 'flex', alignItems: 'center', justifyContent: 'center', height: '80px' }}>
                                                <span style={{ fontSize: '30px' }}>👕</span>
                                            </div>
                                        </div>
                                        
                                        {/* Thông tin sản phẩm */}
                                        <div className="col-md-4">
                                            <h6 style={{ fontWeight: 'bold', marginBottom: '5px' }}>{item.productName}</h6>
                                            <p className="text-muted mb-0" style={{ fontSize: '14px' }}>{item.price.toLocaleString()}đ</p>
                                        </div>
                                        
                                        {/* Số lượng */}
                                        <div className="col-md-3">
                                            <div className="input-group" style={{ width: '120px' }}>
                                                <button
                                                    className="btn btn-outline-secondary"
                                                    onClick={() => handleQuantityChange(item.productId, item.quantity - 1)}
                                                    disabled={updatingId === item.productId}
                                                    style={{ borderColor: '#ddd' }}
                                                >
                                                    -
                                                </button>
                                                <input
                                                    type="number"
                                                    className="form-control text-center"
                                                    value={item.quantity}
                                                    onChange={(e) => handleQuantityChange(item.productId, parseInt(e.target.value) || 1)}
                                                    disabled={updatingId === item.productId}
                                                    style={{ minWidth: '50px', textAlign: 'center' }}
                                                />
                                                <button
                                                    className="btn btn-outline-secondary"
                                                    onClick={() => handleQuantityChange(item.productId, item.quantity + 1)}
                                                    disabled={updatingId === item.productId}
                                                    style={{ borderColor: '#ddd' }}
                                                >
                                                    +
                                                </button>
                                            </div>
                                        </div>
                                        
                                        {/* Thành tiền */}
                                        <div className="col-md-2 text-end">
                                            <strong style={{ color: '#DA020E', fontSize: '16px' }}>
                                                {(item.price * item.quantity).toLocaleString()}đ
                                            </strong>
                                        </div>
                                        
                                        {/* Xóa */}
                                        <div className="col-md-1 text-end">
                                            <button
                                                className="btn btn-sm"
                                                onClick={() => handleRemove(item.productId, item.productName)}
                                                style={{ color: '#DA020E', background: 'transparent' }}
                                            >
                                                🗑️
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                    
                    {/* Thông tin đơn hàng */}
                    <div className="col-md-4">
                        <div className="card shadow-sm">
                            <div className="card-body">
                                <h5 className="card-title" style={{ fontFamily: "'Oswald', sans-serif" }}>Thông tin đơn hàng</h5>
                                <hr />
                                <div className="d-flex justify-content-between mb-2">
                                    <span>Tạm tính:</span>
                                    <span>{cart.subTotal?.toLocaleString()}đ</span>
                                </div>
                                <div className="d-flex justify-content-between mb-2">
                                    <span>Phí vận chuyển:</span>
                                    <span>{cart.shippingFee?.toLocaleString()}đ</span>
                                </div>
                                <hr />
                                <div className="d-flex justify-content-between mb-3">
                                    <strong>Tổng cộng:</strong>
                                    <strong className="text-danger fs-5">{cart.total?.toLocaleString()}đ</strong>
                                </div>
                                
                                <button
                                    className="btn btn-danger w-100 mb-2"
                                    onClick={handleCheckout}
                                    style={{ background: '#DA020E', border: 'none', padding: '12px', fontWeight: 'bold' }}
                                >
                                    💳 Tiến hành thanh toán
                                </button>
                                
                                <button
                                    className="btn btn-outline-secondary w-100"
                                    onClick={() => navigate('/shop')}
                                >
                                    🛍️ Tiếp tục mua sắm
                                </button>
                                
                                <hr />
                                <small className="text-muted d-block text-center">
                                    <i className="fas fa-lock"></i> Thanh toán an toàn
                                </small>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            {/* CSS inline cho number input */}
            <style>{`
                input[type="number"]::-webkit-inner-spin-button,
                input[type="number"]::-webkit-outer-spin-button {
                    opacity: 1;
                }
                .card {
                    border-radius: 12px;
                    border: none;
                }
                .btn-outline-secondary:hover {
                    background-color: #DA020E;
                    border-color: #DA020E;
                    color: white;
                }
            `}</style>
        </div>
    );
};

export default Cart;