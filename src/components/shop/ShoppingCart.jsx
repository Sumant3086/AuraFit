import React, { useState } from 'react';
import './shopping_cart.css'
import { CiShoppingCart } from 'react-icons/ci'
import { CgClose } from 'react-icons/cg'
import { FaPlus, FaMinus, FaTrash } from 'react-icons/fa'
import { useCart } from '../../context/CartContext';

const ShoppingCartModal = () => {
  const { cartItems, removeFromCart, updateQuantity, getCartTotal, getCartCount } = useCart();
  const [showModal, setShowModal] = useState(false);

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
      
      // Create order in database
      const response = await fetch('http://localhost:5000/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: userData.id,
          userName: userData.name,
          userEmail: userData.email,
          items: cartItems.map(item => ({
            productId: item.id,
            productName: item.name,
            quantity: item.quantity,
            price: parseFloat(item.price.replace(/[^0-9.-]+/g,"")),
            color: item.color,
            size: item.size,
            image: item.img
          })),
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
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Open Razorpay payment
        alert('Order placed! Redirecting to payment...');
        window.open('https://razorpay.me/@sumantyadav', '_blank');
        
        // Clear cart after successful order
        cartItems.forEach(item => removeFromCart(item.id, item.color, item.size));
        setShowModal(false);
      } else {
        alert(data.message || 'Failed to place order');
      }
    } catch (error) {
      console.error('Error placing order:', error);
      alert('Error placing order. Please try again.');
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
