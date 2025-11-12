import React, { useState } from 'react';
import './product.css'
import { useParams } from 'react-router-dom';
import Footer from '../footer/Footer';
import ShoppingCartModal from './ShoppingCart';
import { useCart } from '../../context/CartContext';

const Product = ({ shopData }) => {
    const { id } = useParams();
    const product = shopData.find(item => item.id === Number(id));
    const { addToCart } = useCart();

    const [selectedColor, setSelectedColor] = useState(product?.colors[0] || 'black');
    const [activeButtonSize, setActiveButtonSize] = useState(0);
    const [addedToCart, setAddedToCart] = useState(false);
    
    const handleClickColor = (color) => {
      setSelectedColor(color);
    };
    
    const handleClickSize = (buttonIndexSize) => {
      setActiveButtonSize(buttonIndexSize);
    };

    const handleAddToCart = () => {
      const user = localStorage.getItem('user');
      
      if (!user) {
        localStorage.setItem('redirectAfterLogin', window.location.pathname);
        alert('Please login to add items to cart');
        window.location.href = '/login';
        return;
      }

      const sizeOptions = ['S', 'M', 'L', 'XL'];
      const selectedSize = sizeOptions[activeButtonSize];
      
      const cartItem = {
        id: product.id,
        name: product.name,
        price: product.price,
        color: selectedColor.charAt(0).toUpperCase() + selectedColor.slice(1),
        size: selectedSize,
        img: product.linkImg[selectedColor],
      };
      
      addToCart(cartItem);
      setAddedToCart(true);
      
      setTimeout(() => {
        setAddedToCart(false);
      }, 2000);
    };

    if (!product) {
        return <div>Product not found</div>;
    }

    const currentImage = product.linkImg[selectedColor] || product.linkImg.black;

    return (
      <div className='product-container'>

        <ShoppingCartModal />

        <div className="product-row">
          <div className="product-img-container">
            <img src={currentImage} alt="product-img" className='product-img' />
          </div>
          <div className="product-info-container">
            <h1 className='product-name'>{product.name}</h1>
            <p className='product-description'>
              Premium quality fitness wear designed for maximum comfort and performance during your workouts.
            </p>
            <p className='product-price'>{product.price}</p>
            <div className='product-colors'>
              {product.colors.includes('black') && (
                <button 
                  className={`color-black ${selectedColor === 'black' ? 'active' : ''}`} 
                  onClick={() => handleClickColor('black')}
                >
                  Black
                </button>
              )}
              {product.colors.includes('white') && (
                <button 
                  className={`color-white ${selectedColor === 'white' ? 'active' : ''}`} 
                  onClick={() => handleClickColor('white')}
                >
                  White
                </button>
              )}
              {product.colors.includes('pink') && (
                <button 
                  className={`color-pink show ${selectedColor === 'pink' ? 'active' : ''}`} 
                  onClick={() => handleClickColor('pink')}
                >
                  Pink
                </button>
              )}
            </div>
            {((product.id !== 5) && (product.id !== 6)) && (
              <div className="sizes">
                <button className={`size-btn ${activeButtonSize === 0 ? 'active' : ''}`} onClick={() => handleClickSize(0)}>s</button>
                <button className={`size-btn ${activeButtonSize === 1 ? 'active' : ''}`} onClick={() => handleClickSize(1)}>m</button>
                <button className={`size-btn ${activeButtonSize === 2 ? 'active' : ''}`} onClick={() => handleClickSize(2)}>l</button>
                <button className={`size-btn ${activeButtonSize === 3 ? 'active' : ''}`} onClick={() => handleClickSize(3)}>xl</button>
              </div>
            )}
            <button 
              className={`product-add-to-cart ${addedToCart ? 'added' : ''}`}
              onClick={handleAddToCart}
            >
              {addedToCart ? '✓ Added to Cart!' : 'Add to Cart'}
            </button>
          </div>

        </div>
        <Footer />
      </div>
    );
  };

export default Product;