import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import UserLayout from '../components/UserLayout';

const Checkout = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuth();
    const { cart, checkout, buyNow, loading } = useCart();
    const [submitting, setSubmitting] = useState(false);
    const [isBuyNow, setIsBuyNow] = useState(false);
    const [buyNowProduct, setBuyNowProduct] = useState(null);
    const [buyNowQuantity, setBuyNowQuantity] = useState(1);
    const [orderItems, setOrderItems] = useState([]);
    const [subTotal, setSubTotal] = useState(0);

    const [formData, setFormData] = useState({
        fullName: user?.name || user?.fullName || '',
        phone: user?.phone || '',
        address: '',
        note: '',
        paymentMethod: 'cod'
    });

    useEffect(() => {
        // Kiểm tra xem có phải mua ngay không
        if (location.state?.buyNow) {
            setIsBuyNow(true);
            setBuyNowProduct(location.state.product);
            setBuyNowQuantity(location.state.quantity);
            const items = [{
                productId: location.state.product.id,
                productName: location.state.product.name,
                price: location.state.product.price,
                quantity: location.state.quantity,
                total: location.state.product.price * location.state.quantity
            }];
            setOrderItems(items);
            setSubTotal(location.state.product.price * location.state.quantity);
        } else if (cart.items && cart.items.length > 0) {
            setOrderItems(cart.items);
            setSubTotal(cart.subTotal || 0);
        } else {
            navigate('/shop');
        }
    }, [location, cart]);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.fullName || !formData.phone || !formData.address) {
            alert('Vui lòng điền đầy đủ thông tin!');
            return;
        }

        setSubmitting(true);
        
        let result;
        if (isBuyNow) {
            result = await buyNow(buyNowProduct, buyNowQuantity, formData);
        } else {
            result = await checkout(formData);
        }
        
        setSubmitting(false);

        if (result.success) {
            alert(`Đặt hàng thành công! Mã đơn hàng: ${result.orderId}\nTổng tiền: ${result.total?.toLocaleString()}đ`);
            navigate('/shop');
        } else {
            alert(result.message || 'Đặt hàng thất bại!');
        }
    };

    const shippingFee = 30000;
    const total = subTotal + shippingFee;

    if (loading && !isBuyNow) {
        return (
            <UserLayout>
                <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
                    <div className="spinner-border text-primary"></div>
                </div>
            </UserLayout>
        );
    }

    return (
        <UserLayout>
            <div className="container mt-4" style={{ maxWidth: '1200px' }}>
                <h2 className="mb-4" style={{ fontFamily: "'Oswald', sans-serif" }}>Thanh toán</h2>
                <div className="row">
                    <div className="col-md-7">
                        <div className="card shadow-sm">
                            <div className="card-body">
                                <h5 className="card-title">Thông tin giao hàng</h5>
                                <form onSubmit={handleSubmit}>
                                    <div className="mb-3">
                                        <label className="form-label">Họ và tên *</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            name="fullName"
                                            value={formData.fullName}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Số điện thoại *</label>
                                        <input
                                            type="tel"
                                            className="form-control"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Địa chỉ giao hàng *</label>
                                        <textarea
                                            className="form-control"
                                            name="address"
                                            rows="3"
                                            value={formData.address}
                                            onChange={handleChange}
                                            required
                                        ></textarea>
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Ghi chú (tùy chọn)</label>
                                        <textarea
                                            className="form-control"
                                            name="note"
                                            rows="2"
                                            value={formData.note}
                                            onChange={handleChange}
                                            placeholder="Ghi chú về giao hàng..."
                                        ></textarea>
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Phương thức thanh toán</label>
                                        <select
                                            className="form-select"
                                            name="paymentMethod"
                                            value={formData.paymentMethod}
                                            onChange={handleChange}
                                        >
                                            <option value="cod">Thanh toán khi nhận hàng (COD)</option>
                                            <option value="banking">Chuyển khoản ngân hàng</option>
                                        </select>
                                    </div>
                                    <button
                                        type="submit"
                                        className="btn btn-danger w-100"
                                        disabled={submitting}
                                        style={{ background: '#DA020E', border: 'none' }}
                                    >
                                        {submitting ? (
                                            <span className="spinner-border spinner-border-sm me-2"></span>
                                        ) : null}
                                        ĐẶT HÀNG NGAY
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-5">
                        <div className="card shadow-sm">
                            <div className="card-body">
                                <h5 className="card-title">Đơn hàng của bạn</h5>
                                <hr />
                                {orderItems.map((item, index) => (
                                    <div key={index} className="d-flex justify-content-between mb-2">
                                        <span>
                                            {item.productName} x {item.quantity}
                                        </span>
                                        <span>{(item.price * item.quantity).toLocaleString()}đ</span>
                                    </div>
                                ))}
                                <hr />
                                <div className="d-flex justify-content-between mb-2">
                                    <span>Tạm tính:</span>
                                    <span>{subTotal.toLocaleString()}đ</span>
                                </div>
                                <div className="d-flex justify-content-between mb-2">
                                    <span>Phí vận chuyển:</span>
                                    <span>{shippingFee.toLocaleString()}đ</span>
                                </div>
                                <hr />
                                <div className="d-flex justify-content-between">
                                    <strong>Tổng cộng:</strong>
                                    <strong className="text-danger fs-5">{total.toLocaleString()}đ</strong>
                                </div>
                                <small className="text-muted d-block mt-3">
                                    * Đơn hàng sẽ được giao trong vòng 3-5 ngày làm việc
                                </small>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </UserLayout>
    );
};

export default Checkout;