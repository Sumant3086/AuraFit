import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './myOrders.css';
import apiService from '../../services/api';
import toast from 'react-hot-toast';

export default function PaymentConfirmation() {
  const navigate = useNavigate();
  const [orderId, setOrderId] = useState('');
  const [paymentId, setPaymentId] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const pendingOrderId = localStorage.getItem('pendingOrderId');
    if (pendingOrderId) setOrderId(pendingOrderId);
  }, []);

  const handleConfirmPayment = async (e) => {
    e.preventDefault();
    if (!orderId.trim()) {
      toast.error('Order ID is required.');
      return;
    }

    setLoading(true);
    const toastId = toast.loading('Confirming payment…');
    try {
      const data = await apiService.orders.confirmPayment(orderId);
      if (data.success) {
        toast.success('Payment confirmed. Your order is being processed.', { id: toastId, duration: 5000 });
        localStorage.removeItem('pendingOrderId');
        setTimeout(() => navigate('/my-orders'), 1200);
      } else {
        toast.error(data.message || 'Failed to confirm payment.', { id: toastId });
      }
    } catch {
      toast.error('Confirmation failed. Please try again or contact support@aurafit.com', { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="orders-container">
      <div className="orders-header">
        <h1>Confirm payment</h1>
        <p>Verify your payment to complete the order</p>
      </div>

      <div className="payment-confirmation-form">
        <form onSubmit={handleConfirmPayment}>
          <div className="form-group">
            <label htmlFor="orderId">Order ID</label>
            <input
              type="text" id="orderId" value={orderId}
              onChange={e => setOrderId(e.target.value)}
              placeholder="Your order ID"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="paymentId">Payment ID <span style={{ fontWeight: 400, opacity: 0.6 }}>(optional)</span></label>
            <input
              type="text" id="paymentId" value={paymentId}
              onChange={e => setPaymentId(e.target.value)}
              placeholder="Razorpay payment ID if available"
            />
          </div>
          <button type="submit" className="checkout-btn" disabled={loading} style={{ opacity: loading ? 0.7 : 1 }}>
            {loading ? 'Confirming…' : 'Confirm payment'}
          </button>
        </form>

        <div className="payment-instructions">
          <h3>How it works</h3>
          <ul>
            <li>Complete payment via the Razorpay window that opened</li>
            <li>Your Order ID is pre-filled above</li>
            <li>Optionally add your Razorpay Payment ID for faster verification</li>
            <li>Click Confirm to update your order status</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
