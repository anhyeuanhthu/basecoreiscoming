import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';

const UserLayout = ({ children }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, logout } = useAuth();
    const { cartCount } = useCart();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const displayName = user?.fullName || user?.name || user?.username || user?.userName || 'Fan';

    return (
        <div style={{ fontFamily: "'Open Sans', sans-serif", background: '#f5f5f5', minHeight: '100vh' }}>
            {/* Header */}
            <header style={{ background: '#DA020E', padding: 0, boxShadow: '0 3px 12px rgba(0,0,0,0.3)', position: 'sticky', top: 0, zIndex: 100 }}>
                {/* Top bar */}
                <div style={{ background: '#1a0003', padding: '6px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontFamily: "'Open Sans', sans-serif", fontSize: '13px', color: '#ffb3b3' }}>
                            <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#DA020E', border: '2px solid #fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 700, color: 'white' }}>
                                {displayName.charAt(0).toUpperCase()}
                            </div>
                            Xin chào, <strong style={{ color: 'white' }}>{displayName}</strong>
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                        {/* Cart Icon */}
                        <div 
                            style={{ 
                                position: 'relative', 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: '8px', 
                                background: 'rgba(255,255,255,0.15)', 
                                padding: '6px 12px', 
                                borderRadius: '30px', 
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                            onClick={() => navigate('/cart')}
                            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.25)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
                        >
                            <span style={{ fontSize: '18px', color: 'white' }}>🛒</span>
                            <span style={{ fontSize: '13px', color: 'white', fontFamily: "'Open Sans', sans-serif" }}>Giỏ hàng</span>
                            {cartCount > 0 && (
                                <span style={{ 
                                    background: '#FFD700', 
                                    color: '#1a0003', 
                                    borderRadius: '20px', 
                                    padding: '2px 8px', 
                                    fontSize: '12px', 
                                    fontWeight: 'bold',
                                    minWidth: '24px',
                                    textAlign: 'center'
                                }}>
                                    {cartCount > 99 ? '99+' : cartCount}
                                </span>
                            )}
                        </div>
                        <button 
                            onClick={handleLogout}
                            style={{ 
                                background: 'transparent', 
                                border: '1px solid rgba(255,255,255,0.3)', 
                                color: '#ffb3b3', 
                                borderRadius: '4px', 
                                padding: '4px 12px', 
                                fontSize: '12px', 
                                fontFamily: "'Open Sans', sans-serif", 
                                cursor: 'pointer', 
                                transition: 'all 0.2s', 
                                letterSpacing: '0.5px'
                            }}
                            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = 'white'; e.currentTarget.style.borderColor = 'white'; }}
                            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#ffb3b3'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)'; }}
                        >
                            ⎋ Đăng xuất
                        </button>
                    </div>
                </div>

                {/* Main header */}
                <div style={{ padding: '14px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px', cursor: 'pointer' }} onClick={() => navigate('/shop')}>
                        <img 
                            src="https://upload.wikimedia.org/wikipedia/en/7/7a/Manchester_United_FC_crest.svg" 
                            alt="MU Crest" 
                            style={{ width: '52px', height: '52px' }}
                            onError={e => e.target.style.display = 'none'}
                        />
                        <div style={{ color: 'white' }}>
                            <div style={{ fontSize: '22px', fontWeight: 700, letterSpacing: '2px', lineHeight: 1, textTransform: 'uppercase' }}>Man United Store</div>
                            <div style={{ fontSize: '10px', letterSpacing: '3px', color: 'rgba(255,255,255,0.75)', textTransform: 'uppercase', fontFamily: "'Open Sans', sans-serif" }}>Official Fan Shop</div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Content */}
            <main>
                {children}
            </main>

            {/* Footer */}
            <footer style={{ background: '#1a0003', color: 'rgba(255,255,255,0.5)', textAlign: 'center', padding: '20px', fontFamily: "'Open Sans', sans-serif", fontSize: '12px', letterSpacing: '1px', borderTop: '3px solid #DA020E' }}>
                © 2024 <span style={{ color: '#DA020E' }}>Manchester United</span> Fan Store · Glory Glory Man United 🔴
            </footer>
        </div>
    );
};

export default UserLayout;