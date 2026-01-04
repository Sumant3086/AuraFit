import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './myOrders.css';

const PaymentConfirmation = () => {
  const navigate = useNavigate();
  const [orderId, setOrderId] = useState('');
  const [paymentId, setPaymentId] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Get pending order ID from localStorage
    const pendingOrderId = localStorage.getItem('pendingOrderId');
    if (pendingOrderId) {
      setOrderId(pendingOrderId);
    }
  }, []);

  const handleConfirmPayment = async (e) => {
    e.preventDefault();
    
    if (!orderId) {
      alert('Order ID is required');
      return;
    }

    setLoading(true);
    
    try {
      const response = await fetch(`http://localhost:5000/api/orders/${orderId}/confirm-payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paymentId: paymentId || 'manual-confirmation',
          paymentStatus: 'Paid'
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        alert('Payment confirmed successfully! Your order is now being processed.');
        localStorage.removeItem('pendingOrderId');
        navigate('/my-orders');
      } else {
        alert(data.message || 'Failed to confirm payment');
      }
    } catch (error) {
      console.error('Error confirming payment:', error);
      alert('Error confirming payment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="orders-container">
      <div className="orders-header">
        <h1>Confirm Payment</h1>
        <p>Confirm your payment to complete the order</p>
      </div>

      <div className="payment-confirmation-form">
        <form onSubmit={handleConfirmPayment}>
          <div className="form-group">
            <label htmlFor="orderId">Order ID:</label>
            <input
              type="text"
              id="orderId"
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              placeholder="Enter your order ID"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="paymentId">Payment ID (Optional):</label>
            <input
              type="text"
              id="paymentId"
              value={paymentId}
              onChange={(e) => setPaymentId(e.target.value)}
              placeholder="Enter Razorpay payment ID if available"
            />
          </div>
          
          <button 
            type="submit" 
            className="checkout-btn"
            disabled={loading}
          >
            {loading ? 'Confirming...' : 'Confirm Payment'}
          </button>
        </form>
        
        <div className="payment-instructions">
          <h3>Instructions:</h3>
          <ul>
            <li>Complete your payment using the Razorpay link that opened</li>
            <li>Enter your Order ID above (it should be pre-filled)</li>
            <li>Optionally enter the Payment ID from Razorpay</li>
            <li>Click "Confirm Payment" to update your order status</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default PaymentConfirmation;