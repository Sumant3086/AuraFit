import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './shopping_cart.css';
import { CiShoppingCart } from 'react-icons/ci';
import { CgClose } from 'react-icons/cg';
import { FaPlus, FaMinus, FaTrash } from 'react-icons/fa';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import apiService, { getRazorpayKey } from '../../services/api';
import toast from 'react-hot-toast';

export default function ShoppingCartModal() {
  const { cartItems, removeFromCart, updateQuantity, getCartTotal, getCartCount } = useCart();
  const { isAuthenticated } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [checkingOut, setCheckingOut] = useState(false);
  const navigate = useNavigate();

  const handleCheckout = async () => {
    if (cartItems.length === 0) {
      toast.error('Your cart is empty.');
      return;
    }

    if (!isAuthenticated) {
      toast.error('Sign in to place an order.');
      navigate('/login');
      return;
    }

    setCheckingOut(true);
    const toastId = toast.loading('Preparing your order…');

    try {
      // Wait for Razorpay SDK (max 5s)
      let retries = 0;
      while (!window.Razorpay && retries < 10) {
        await new Promise(r => setTimeout(r, 500));
        retries++;
      }
      if (!window.Razorpay) {
        toast.error('Payment system unavailable. Please refresh and try again.', { id: toastId });
        return;
      }

      const userData = JSON.parse(localStorage.getItem('user') || '{}');

      const orderItems = cartItems.map(item => {
        let price = item.price;
        if (typeof price === 'string') price = parseFloat(price.replace(/[₹,\s]/g, ''));
        if (isNaN(price)) throw new Error(`Invalid price for: ${item.name}`);
        return {
          productId: item.id.toString(),
          productName: item.name,
          quantity: item.quantity,
          price,
          color: item.color,
          size: item.size,
          image: item.img,
        };
      });

      const data = await apiService.orders.create({
        userId: userData._id || userData.id,
        userName: userData.name,
        userEmail: userData.email,
        items: orderItems,
        totalAmount: getCartTotal(),
        shippingAddress: { street: '', city: '', state: '', zipCode: '', country: 'India' },
        paymentMethod: 'Razorpay',
        paymentStatus: 'Pending',
      });

      if (!data.success) {
        toast.error(data.message || 'Failed to place order. Please try again.', { id: toastId });
        return;
      }

      const orderResponse = await apiService.orders.createRazorpayOrder({
        amount: getCartTotal(),
        orderId: data.data._id,
      });

      if (!orderResponse.success) {
        toast.error('Failed to initialize payment. Please try again.', { id: toastId });
        return;
      }

      toast.dismiss(toastId);
      const razorpayKey = await getRazorpayKey();

      const rzp = new window.Razorpay({
        key: razorpayKey,
        amount: orderResponse.data.amount,
        currency: orderResponse.data.currency,
        name: 'AuraFit',
        description: 'Product Purchase',
        order_id: orderResponse.data.orderId,
        prefill: { name: userData.name || '', email: userData.email || '' },
        theme: { color: '#8B5CF6' },
        handler: async (response) => {
          const verifyId = toast.loading('Verifying payment…');
          try {
            const verify = await apiService.orders.verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            if (verify.success) {
              cartItems.forEach(item => removeFromCart(item.id, item.color, item.size));
              setShowModal(false);
              toast.success('Order placed successfully! 🎉', { id: verifyId, duration: 5000 });
              setTimeout(() => navigate('/my-orders'), 1200);
            } else {
              toast.error('Payment verification failed. Contact support@aurafit.com', { id: verifyId });
            }
          } catch {
            toast.error('Verification error. Contact support@aurafit.com with your payment ID.', { id: verifyId });
          }
        },
        modal: { ondismiss: () => toast('Payment cancelled.', { icon: '↩️' }) },
      });

      rzp.on('payment.failed', (e) => {
        toast.error(`Payment failed: ${e.error?.description || 'Unknown error'}`);
      });

      rzp.open();
    } catch (err) {
      toast.error(err.message || 'Something went wrong. Please try again.', { id: toastId });
    } finally {
      setCheckingOut(false);
    }
  };

  return (
    <div className="cart-container">
      <button className="shopping-cart" onClick={() => setShowModal(true)} aria-label={`Open cart (${getCartCount()} items)`}>
        <CiShoppingCart className="cart-img" />
        {getCartCount() > 0 && <span className="cart-number">{getCartCount()}</span>}
      </button>

      {showModal && (
        <div className="modal-wrapper" onClick={() => setShowModal(false)} role="dialog" aria-modal="true" aria-label="Shopping cart">
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="close-container">
              <CgClose className="modal-close" onClick={() => setShowModal(false)} aria-label="Close cart" />
            </div>
            <h2>Your cart</h2>

            {cartItems.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>🛒</div>
                <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Nothing here yet. Browse the shop!</p>
              </div>
            ) : (
              <>
                <ul className="cart-items-list">
                  {cartItems.map((item, idx) => (
                    <li key={`${item.id}-${item.color}-${item.size}-${idx}`} className="cart-item">
                      <img src={item.img} alt={item.name} className="cart-item-img" />
                      <div className="cart-item-details">
                        <h3>{item.name}</h3>
                        {item.color && <p>Color: {item.color}</p>}
                        {item.size && <p>Size: {item.size}</p>}
                        <p className="cart-item-price">{item.price}</p>
                        <div className="quantity-controls">
                          <button
                            className="quantity-btn"
                            onClick={() => updateQuantity(item.id, item.color, item.size, item.quantity - 1)}
                            aria-label="Decrease quantity"
                          >
                            <FaMinus />
                          </button>
                          <span className="quantity">{item.quantity}</span>
                          <button
                            className="quantity-btn"
                            onClick={() => updateQuantity(item.id, item.color, item.size, item.quantity + 1)}
                            aria-label="Increase quantity"
                          >
                            <FaPlus />
                          </button>
                          <button
                            className="remove-btn"
                            onClick={() => handleRemoveFromCart(item)}
                            aria-label={`Remove ${item.name}`}
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
                <div className="cart-total">
                  <h3>Total: ₹{getCartTotal().toFixed(2)}</h3>
                  <button
                    className="checkout-btn"
                    onClick={handleCheckout}
                    disabled={checkingOut}
                    style={{ opacity: checkingOut ? 0.7 : 1 }}
                  >
                    {checkingOut ? 'Processing…' : 'Checkout'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
