import React, { useState, useEffect } from 'react';
import './shopping_cart.css'
import { CiShoppingCart } from 'react-icons/ci'
import { CgClose } from 'react-icons/cg'

const ShoppingCartModal = () => {
  const [cartItems, setCartItems] = useState([]);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const savedCartItems = localStorage.getItem('cartItems');
    if (savedCartItems) {
      setCartItems(JSON.parse(savedCartItems));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('cartItems', JSON.stringify(cartItems));
  }, [cartItems]);


  const handleRemoveFromCart = (item) => {
    const updatedCart = cartItems.filter((cartItem) => cartItem.id !== item.id);
    setCartItems(updatedCart);
  };

  return (
    <div className='cart-container'>
        <button className="shopping-cart" onClick={() => setShowModal(true)}>
            <CiShoppingCart alt="shopping-cart" className="cart-img"/> 
            <span className="cart-number">0</span>

          {showModal && (
            <div className="modal-wrapper">
              <div className="modal">
                <div className="close-container">
                  <CgClose className="modal-close" onClick={(e) => { e.stopPropagation(); setShowModal(false)}} />
                </div>
                  <h2>Shopping Cart</h2>
          {cartItems.length === 0 ? (
            <p>Your cart is empty.</p>
          ) : (
            <ul>
              {cartItems.map((item) => (
                <li key={item.id}>
                  <img src={item.img} alt={item.name} />
                  <h3>{item.name}</h3>
                  <p>Color: {item.color}</p>
                  <p>Size: {item.size}</p>
                  <p>Price: {item.price}</p>
                  <button onClick={() => handleRemoveFromCart(item)}>
                    Remove from Cart
                  </button>
                </li>
              ))}
            </ul>
          )}
            </div>
          </div>
          )};
          </button>
        </div>
    );
};
export default ShoppingCartModal;
