
import React from 'react';
import './SuccessPopup.css';
import { Link } from 'react-router-dom';

export const SuccessPopup = ({ order, onContinue, onNewCart }) => {
    return (
        <div className="success-popup-overlay">
            <div className="success-popup">
                <div className="success-icon">✓</div>
                <h2>Order Placed Successfully!</h2>
                <p>Your order #{order.id} has been placed.</p>
                <p>Total: ${(order?.total ?? 0).toFixed(2)}</p>
                
                <div className="success-actions">
                    <button onClick={onContinue} className="continue-btn">
                        Continue Shopping (Keep Cart)
                    </button>
                    <button onClick={onNewCart} className="new-cart-btn">
                        Start New Cart
                    </button>
                    <Link to="/orders" className="view-orders-btn">
                        View Your Orders
                    </Link>
                </div>
            </div>
        </div>
    );
};