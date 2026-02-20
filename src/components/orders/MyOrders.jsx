import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './myOrders.css';
import apiService from '../../services/api';
import { FaShoppingBag, FaArrowLeft, FaBox, FaTruck, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import Navbar from '../navbar/Navbar';
import Dropdown from '../navbar/Dropdown';

const MyOrders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState('all');

  const toggle = () => {
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    // Check if user is logged in
    const user = localStorage.getItem('user');
    if (!user) {
      navigate('/login');
      return;
    }

    // Load orders from API
    loadOrders();
  }, [navigate]);

  const loadOrders = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      
      // Fetch orders from API using apiService
      const data = await apiService.orders.getByUserEmail(user.email);
      
      if (data.success && data.data.length > 0) {
        // Transform API data to match component format
        const transformedOrders = data.data.map(order => ({
          id: order._id.slice(-6).toUpperCase(),
          date: order.orderDate,
          items: order.items || [],
          total: order.totalAmount,
          status: order.status || 'Processing',
          trackingNumber: order.trackingNumber || null,
          deliveryDate: order.deliveryDate || null,
          estimatedDelivery: order.estimatedDelivery || null,
          cancelReason: order.cancelReason || null
        }));
        
        setOrders(transformedOrders);
        console.log(`📦 Loaded ${transformedOrders.length} orders`);
      } else {
        console.log('No orders found for this user');
        setOrders([]);
      }
    } catch (error) {
      console.error('Error loading orders:', error);
      setOrders([]);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Delivered':
        return <FaCheckCircle className="status-icon delivered" />;
      case 'Shipped':
        return <FaTruck className="status-icon shipped" />;
      case 'Processing':
        return <FaBox className="status-icon processing" />;
      case 'Cancelled':
        return <FaTimesCircle className="status-icon cancelled" />;
      default:
        return <FaBox className="status-icon" />;
    }
  };

  const filteredOrders = filter === 'all' 
    ? orders 
    : orders.filter(order => order.status.toLowerCase() === filter);

  return (
    <>
      <Navbar toggle={toggle} />
      <Dropdown isOpen={isOpen} toggle={toggle} />
      
      <div className="orders-container">
        <div className="orders-back-btn">
          <Link to="/" className="back-link">
            <FaArrowLeft /> Back to Home
          </Link>
        </div>

        <div className="orders-header">
          <div className="orders-icon">
            <FaShoppingBag />
          </div>
          <h1>My Orders</h1>
          <p>Track and manage your orders</p>
        </div>

        <div className="orders-content">
          <div className="orders-filters">
            <button 
              className={filter === 'all' ? 'filter-btn active' : 'filter-btn'}
              onClick={() => setFilter('all')}
            >
              All Orders ({orders.length})
            </button>
            <button 
              className={filter === 'processing' ? 'filter-btn active' : 'filter-btn'}
              onClick={() => setFilter('processing')}
            >
              Processing ({orders.filter(o => o.status === 'Processing').length})
            </button>
            <button 
              className={filter === 'shipped' ? 'filter-btn active' : 'filter-btn'}
              onClick={() => setFilter('shipped')}
            >
              Shipped ({orders.filter(o => o.status === 'Shipped').length})
            </button>
            <button 
              className={filter === 'delivered' ? 'filter-btn active' : 'filter-btn'}
              onClick={() => setFilter('delivered')}
            >
              Delivered ({orders.filter(o => o.status === 'Delivered').length})
            </button>
            <Link to="/confirm-payment" className="filter-btn confirm-payment-btn">
              Confirm Payment
            </Link>
          </div>

          <div className="orders-list">
            {filteredOrders.length > 0 ? (
              filteredOrders.map(order => (
                <div key={order.id} className="order-card">
                  <div className="order-header-section">
                    <div className="order-info">
                      <h3>Order #{order.id}</h3>
                      <p className="order-date">Placed on {new Date(order.date).toLocaleDateString('en-IN', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}</p>
                    </div>
                    <div className="order-status">
                      {getStatusIcon(order.status)}
                      <span className={`status-text ${order.status.toLowerCase()}`}>
                        {order.status}
                      </span>
                    </div>
                  </div>

                  <div className="order-items">
                    {order.items.map((item, index) => (
                      <div key={index} className="order-item">
                        <div className="item-image-placeholder">
                          📦
                        </div>
                        <div className="item-details">
                          <h4>{item.name}</h4>
                          <p>Quantity: {item.quantity}</p>
                        </div>
                        <div className="item-price">
                          ₹{item.price.toLocaleString()}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="order-footer">
                    <div className="order-total">
                      <span>Total Amount:</span>
                      <span className="total-price">₹{order.total.toLocaleString()}</span>
                    </div>
                    
                    {order.trackingNumber && (
                      <div className="tracking-info">
                        <span>Tracking: {order.trackingNumber}</span>
                      </div>
                    )}
                    
                    {order.estimatedDelivery && order.status !== 'Delivered' && (
                      <div className="delivery-info">
                        <span>Estimated Delivery: {new Date(order.estimatedDelivery).toLocaleDateString('en-IN')}</span>
                      </div>
                    )}
                    
                    {order.deliveryDate && order.status === 'Delivered' && (
                      <div className="delivery-info delivered">
                        <span>Delivered on: {new Date(order.deliveryDate).toLocaleDateString('en-IN')}</span>
                      </div>
                    )}
                    
                    {order.cancelReason && (
                      <div className="cancel-reason">
                        <span>Reason: {order.cancelReason}</span>
                      </div>
                    )}

                    <div className="order-actions">
                      {order.status === 'Delivered' && (
                        <button className="action-btn review">Write Review</button>
                      )}
                      {order.status === 'Shipped' && (
                        <button className="action-btn track">Track Order</button>
                      )}
                      {order.status === 'Processing' && (
                        <button className="action-btn cancel">Cancel Order</button>
                      )}
                      <button className="action-btn details">View Details</button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="no-orders">
                <FaShoppingBag />
                <h3>No orders found</h3>
                <p>You haven't placed any orders yet</p>
                <Link to="/shop" className="shop-now-btn">
                  Start Shopping
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default MyOrders;
