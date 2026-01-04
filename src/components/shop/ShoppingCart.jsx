import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './shopping_cart.css'
import { CiShoppingCart } from 'react-icons/ci'
import { CgClose } from 'react-icons/cg'
import { FaPlus, FaMinus, FaTrash } from 'react-icons/fa'
import { useCart } from '../../context/CartContext';

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
      
      const response = await fetch('http://localhost:5000/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData)
      });
      
      const data = await response.json();
      console.log('Order response:', data); // Debug log
      
      if (data.success) {
        // Get Razorpay payment link from server
        const paymentResponse = await fetch('http://localhost:5000/api/orders/payment/razorpay-link');
        const paymentData = await paymentResponse.json();
        
        if (paymentData.success) {
          // Store order ID for payment confirmation
          localStorage.setItem('pendingOrderId', data.data._id);
          
          // Clear cart after successful order
          cartItems.forEach(item => removeFromCart(item.id, item.color, item.size));
          setShowModal(false);
          
          // Open Razorpay payment in new tab
          window.open(paymentData.data.paymentLink, '_blank');
          
          // Navigate to payment confirmation page
          navigate('/confirm-payment');
        } else {
          alert('Payment link not available. Please contact support.');
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
