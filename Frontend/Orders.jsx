// Orders.jsx
import React, { useContext } from 'react';
import './Orders.css';
import { ShopContext } from '../../context/ShopContext';
import { Link } from 'react-router-dom';

const BACKEND_URL = "http://localhost:8080"; // 

export const Orders = () => {
  const { orders } = useContext(ShopContext);

  return (
    <div className='orders'>
      <h1>Your Order History</h1>
      {orders.length === 0 ? (
        <div className="no-orders">
          <p>You haven't placed any orders yet.</p>
          <Link to="/" className="shop-link">Start Shopping</Link>
        </div>
      ) : (
        <div className="orders-list">
          {orders.map(order => (
            <div key={order._id || order.id} className="order-card">
              <div className="order-header">
                <div>
                  <h3>Order #{order._id || order.id}</h3>
                  <p className="order-date">
                    {new Date(order.orderedAt || order.date).toLocaleString()}
                  </p>
                </div>
                <span className={`status-badge ${order.status?.toLowerCase() || 'pending'}`}>
                  {order.status || 'Pending'}
                </span>
              </div>

              {order.items.map((item, index) => {
                if (!item.product) {
                  return (
                    <div key={index} className="order-item missing-product">
                      <p>⚠️ Product data not found for productId: {item.productId}</p>
                    </div>
                  );
                }

                return (
                  <div key={index} className="order-item">
                    <img
                      src={`${BACKEND_URL}${item.product.image}`}
                      alt={item.product.name}
                      width={100}
                    />
                    <p>{item.product.name}</p>
                    <p>Qty: {item.quantity}</p>
                    <p>Unit Price: ${item.product.price.toFixed(2)}</p>
                    <p>Subtotal: ${(item.quantity * item.product.price).toFixed(2)}</p>
                  </div>
                );
              })}

              <div className="order-footer">
                <p className="order-total"> ${order.total.toFixed(2)}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
