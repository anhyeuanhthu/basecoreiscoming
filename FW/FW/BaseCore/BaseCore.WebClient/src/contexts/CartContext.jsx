import React, { createContext, useContext, useState, useEffect } from 'react';
import { cartApi } from '../services/api';

const CartContext = createContext(null);

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) throw new Error('useCart must be used within CartProvider');
    return context;
};

export const CartProvider = ({ children }) => {
    const [cart, setCart] = useState({ items: [], subTotal: 0, shippingFee: 30000, total: 0 });
    const [loading, setLoading] = useState(true);

    const loadCart = async () => {
        try {
            const response = await cartApi.getCart();
            setCart(response.data);
        } catch (error) {
            console.error('Failed to load cart:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadCart();
    }, []);

    const addToCart = async (product, quantity = 1) => {
        try {
            console.log('🛒 Adding to cart:', { product, quantity });
            const response = await cartApi.addToCart({
                productId: product.id.toString(),
                productName: product.name,
                price: product.price,
                quantity: quantity,
                image: product.image || ''
            });
            console.log('✅ Add to cart response:', response.data);
            setCart(response.data);
            return { success: true };
        } catch (error) {
            console.error('❌ Add to cart error:', error.response?.data || error.message);
            return { success: false, message: error.response?.data?.message || 'Thêm vào giỏ thất bại' };
        }
    };

    const updateQuantity = async (productId, quantity) => {
        try {
            const response = await cartApi.updateQuantity(productId, quantity);
            setCart(response.data);
            return { success: true };
        } catch (error) {
            console.error('Update quantity error:', error);
            return { success: false };
        }
    };

    const removeFromCart = async (productId) => {
        try {
            const response = await cartApi.removeFromCart(productId);
            setCart(response.data);
            return { success: true };
        } catch (error) {
            console.error('Remove from cart error:', error);
            return { success: false };
        }
    };

    const clearCart = async () => {
        try {
            await cartApi.clearCart();
            setCart({ items: [], subTotal: 0, shippingFee: 30000, total: 0 });
            return { success: true };
        } catch (error) {
            console.error('Clear cart error:', error);
            return { success: false };
        }
    };

    const buyNow = async (product, quantity, checkoutInfo) => {
        try {
            const response = await cartApi.buyNow({
                productId: product.id.toString(),
                productName: product.name,
                price: product.price,
                quantity: quantity,
                image: product.image || '',
                checkoutInfo: checkoutInfo
            });
            return { success: true, orderId: response.data.orderId, total: response.data.total };
        } catch (error) {
            console.error('Buy now error:', error);
            return { success: false, message: error.response?.data?.message || 'Mua hàng thất bại' };
        }
    };

    const checkout = async (checkoutInfo) => {
        try {
            const response = await cartApi.checkout(checkoutInfo);
            if (response.data.success) {
                setCart({ items: [], subTotal: 0, shippingFee: 30000, total: 0 });
            }
            return { 
                success: response.data.success, 
                message: response.data.message,
                orderId: response.data.orderId, 
                total: response.data.total 
            };
        } catch (error) {
            console.error('Checkout error:', error);
            return { success: false, message: error.response?.data?.message || 'Thanh toán thất bại' };
        }
    };

    const cartCount = cart.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;

    return (
        <CartContext.Provider value={{
            cart,
            loading,
            cartCount,
            addToCart,
            updateQuantity,
            removeFromCart,
            clearCart,
            buyNow,
            checkout,
            loadCart
        }}>
            {children}
        </CartContext.Provider>
    );
};