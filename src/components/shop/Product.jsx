import React, { useState } from 'react';
import './product.css'
import { useParams } from 'react-router-dom';
import Footer from '../footer/Footer';
import ShoppingCartModal from './ShoppingCart';

const Product = ({ shopData }) => {
    const { id } = useParams();
    const product = shopData.find(item => item.id === Number(id));

    const [activeButtonColor, setActiveButtonColor] = useState(0);
    const [activeButtonSize, setActiveButtonSize] = useState(0);
    
    const handleClickColor = (buttonIndexColor) => {
      setActiveButtonColor(buttonIndexColor);
    };
    const handleClickSize = (buttonIndexSize) => {
      setActiveButtonSize(buttonIndexSize);
    };

    if (!product) {
        return <div>Product not found</div>;
    }

    return (
      <div className='product-container'>

        <ShoppingCartModal />

        <div className="product-row">
          <div className="product-img-container">
            <img src={product.linkImg.black} alt="product-img" className='product-img' />
          </div>
          <div className="product-info-container">
            <h1 className='product-name'>{product.name}</h1>
            <p className='product-description'>
              Lorem ipsum dolor sit amet, consectetuer adipiscing elit.
            </p>
            <p className='product-price'>{product.price}</p>
            <div className='product-colors'>
              <button className={`color-black ${activeButtonColor === 0 ? 'active' : ''} `} onClick={() => handleClickColor(0)}>Black</button>
              <button className={`color-white ${activeButtonColor === 1 ? 'active' : ''}`} onClick={() => handleClickColor(1)}>White</button>
              <button className={`color-pink  ${((product.id === 3) || (product.id === 4)) && 'show'} ${activeButtonColor === 2 ? 'active' : ''}`} onClick={() => handleClickColor(2)}>Pink</button>
            </div>
            <div className="sizes">
              <button className={`size-btn ${((product.id === 5) || (product.id === 6)) && 'hide'} ${activeButtonSize === 0 ? 'active' : ''}`} onClick={() => handleClickSize(0)}>s</button>
              <button className={`size-btn ${((product.id === 5) || (product.id === 6)) && 'hide'} ${activeButtonSize === 1 ? 'active' : ''}`} onClick={() => handleClickSize(1)}>m</button>
              <button className={`size-btn ${((product.id === 5) || (product.id === 6)) && 'hide'} ${activeButtonSize === 2 ? 'active' : ''}`} onClick={() => handleClickSize(2)}>l</button>
              <button className={`size-btn ${((product.id === 5) || (product.id === 6)) && 'hide'} ${activeButtonSize === 3 ? 'active' : ''}`} onClick={() => handleClickSize(3)}>xl</button>
            </div>
            <button className='product-add-to-cart'>
              Add to cart
            </button>
          </div>

        </div>
        <Footer />
      </div>
    );
  };

export default Product;