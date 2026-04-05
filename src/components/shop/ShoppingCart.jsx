import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './shopping_cart.css'
import { CiShoppingCart } from 'react-icons/ci'
import { CgClose } from 'react-icons/cg'
import { FaPlus, FaMinus, FaTrash } from 'react-icons/fa'
import { useCart } from '../../context/CartContext';
import apiService, { getRazorpayKey } from '../../services/api';

const ShoppingCartModal = () => {
  const { cartItems, removeFromCart, updateQuantity, getCartTotal, getCartCount } = useCart();
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  const handleRemoveFromCart = (item) => {
    removeFromCart(item.id, item.color, item.size);
  };

  const handleCheckout = async () => {
    if (cartItems.length === 0) {
      alert('Your cart is empty!');
      return;
    }
    
    // Check if user is logged in
    const user = localStorage.getItem('user');
    if (!user) {
      alert('Please login to place an order');
      window.location.href = '/login';
      return;
    }
    
    // Wait for Razorpay SDK to load
    let retries = 0;
    while (!window.Razorpay && retries < 10) {
      console.log('Waiting for Razorpay SDK to load...');
      await new Promise(resolve => setTimeout(resolve, 500));
      retries++;
    }
    
    if (!window.Razorpay) {
      console.error('Razorpay SDK failed to load after 5 seconds');
      alert('Payment system could not be loaded. Please refresh the page and try again.');
      return;
    }
    
    try {
      const userData = JSON.parse(user);
      console.log('User data:', userData); // Debug log
      console.log('Cart items raw:', cartItems); // Debug log
      
      // Prepare order items with proper price parsing
      const orderItems = cartItems.map(item => {
        // More robust price parsing
        let price = item.price;
        if (typeof price === 'string') {
          price = price.replace(/[₹,\s]/g, ''); // Remove rupee symbol, commas, and spaces
          price = parseFloat(price);
        }
        
        if (isNaN(price)) {
          throw new Error(`Invalid price for item: ${item.name}`);
        }
        
        return {
          productId: item.id.toString(), // Convert to string instead of ObjectId
          productName: item.name,
          quantity: item.quantity,
          price: price,
          color: item.color,
          size: item.size,
          image: item.img
        };
      });
      
      console.log('Order items:', orderItems); // Debug log
      
      // Create order in database
      const orderData = {
        userId: userData._id || userData.id, // Try both _id and id
        userName: userData.name,
        userEmail: userData.email,
        items: orderItems,
        totalAmount: getCartTotal(),
        shippingAddress: {
          street: '',
          city: '',
          state: '',
          zipCode: '',
          country: 'India'
        },
        paymentMethod: 'Razorpay',
        paymentStatus: 'Pending'
      };
      
      console.log('Order data:', orderData); // Debug log
      
      // Create order via apiService (uses environment API base)
      const data = await apiService.orders.create(orderData);
      console.log('Order response:', data); // Debug log
      
      if (data.success) {
        try {
          // Razorpay SDK is already checked at the start of handleCheckout
          console.log('Razorpay SDK loaded successfully');

          // Create Razorpay order
          const orderResponse = await apiService.orders.createRazorpayOrder({
            amount: getCartTotal(),
            orderId: data.data._id
          });

          console.log('Razorpay order response:', orderResponse);

          if (orderResponse.success) {
            // Get Razorpay key (works in both dev and production)
            const razorpayKey = await getRazorpayKey();
            
            // Initialize Razorpay checkout
            const options = {
              key: razorpayKey,
              amount: orderResponse.data.amount,
              currency: orderResponse.data.currency,
              name: 'AURA FIT',
              description: 'Product Purchase',
              order_id: orderResponse.data.orderId,
              handler: async function (response) {
                try {
                  // Verify payment
                  const verifyResponse = await apiService.orders.verifyPayment({
                    razorpay_order_id: response.razorpay_order_id,
                    razorpay_payment_id: response.razorpay_payment_id,
                    razorpay_signature: response.razorpay_signature
                  });

                  if (verifyResponse.success) {
                    // Clear cart after successful payment
                    cartItems.forEach(item => removeFromCart(item.id, item.color, item.size));
                    setShowModal(false);
                    alert('Payment successful! Your order has been placed.');
                    navigate('/profile');
                  } else {
                    alert('Payment verification failed. Please contact support.');
                  }
                } catch (verifyError) {
                  console.error('Payment verification error:', verifyError);
                  alert('Payment verification failed. Please contact support with your payment ID.');
                }
              },
              prefill: {
                name: userData.name || '',
                email: userData.email || ''
              },
              theme: {
                color: '#9d00ff'
              },
              modal: {
                ondismiss: function() {
                  console.log('Payment cancelled by user');
                }
              }
            };

            console.log('Opening Razorpay with options:', { ...options, key: 'HIDDEN' });
            const rzp = new window.Razorpay(options);
            rzp.on('payment.failed', function (response) {
              console.error('Payment failed:', response.error);
              alert('Payment failed: ' + response.error.description);
            });
            rzp.open();
          } else {
            console.error('Failed to create Razorpay order:', orderResponse);
            alert('Failed to initialize payment: ' + (orderResponse.message || 'Unknown error'));
          }
        } catch (err) {
          console.error('Payment error:', err);
          alert('Payment initialization failed: ' + err.message);
        }
      } else {
        console.error('Order creation failed:', data);
        alert(data.message || 'Failed to place order. Please check console for details.');
      }
    } catch (error) {
      console.error('Error placing order:', error);
      alert('Error placing order: ' + error.message);
    }
  };

  return (
    <div className='cart-container'>
        <button className="shopping-cart" onClick={() => setShowModal(true)}>
            <CiShoppingCart alt="shopping-cart" className="cart-img"/> 
            <span className="cart-number">{getCartCount()}</span>
        </button>

        {showModal && (
          <div className="modal-wrapper" onClick={() => setShowModal(false)}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <div className="close-container">
                <CgClose className="modal-close" onClick={() => setShowModal(false)} />
              </div>
              <h2>Shopping Cart</h2>
              {cartItems.length === 0 ? (
                <p className="empty-cart-message">Your cart is empty.</p>
              ) : (
                <>
                  <ul className="cart-items-list">
                    {cartItems.map((item, index) => (
                      <li key={`${item.id}-${item.color}-${item.size}-${index}`} className="cart-item">
                        <img src={item.img} alt={item.name} className="cart-item-img" />
                        <div className="cart-item-details">
                          <h3>{item.name}</h3>
                          <p>Color: {item.color}</p>
                          <p>Size: {item.size}</p>
                          <p className="cart-item-price">{item.price}</p>
                          <div className="quantity-controls">
                            <button 
                              className="quantity-btn"
                              onClick={() => updateQuantity(item.id, item.color, item.size, item.quantity - 1)}
                            >
                              <FaMinus />
                            </button>
                            <span className="quantity">{item.quantity}</span>
                            <button 
                              className="quantity-btn"
                              onClick={() => updateQuantity(item.id, item.color, item.size, item.quantity + 1)}
                            >
                              <FaPlus />
                            </button>
                            <button 
                              className="remove-btn"
                              onClick={() => handleRemoveFromCart(item)}
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
                    <button className="checkout-btn" onClick={handleCheckout}>
                      Proceed to Checkout
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
    </div>
    );
};
export default ShoppingCartModal;
