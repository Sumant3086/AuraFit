import React, { useState } from "react"
import { Link } from "react-router-dom"
import './shop.css'
import shopData from "./shopData"
import Footer from "../footer/Footer"
import ShoppingCartModal from "./ShoppingCart"

const Shop = () => {
    
    // Removed problematic page refresh code that caused infinite reload

    const [products, setProducts] = useState(shopData);

    const handleChooseColor = (id, color) => {
        setProducts ((prev) => {
            return prev.map((product) => {
                if (product.id === id) {
                    let newCheckImg = {};

                    Object.keys(product.checkImg).map((item) => {
                        product.checkImg[item] = false;
                        newCheckImg = {...product.checkImg, [color]: true}
                        return null;
                    });

                    return {...product, checkImg: newCheckImg};
                } else {
                    return product;
                }
            });
        });
    };

  return (
    <div className="shop">

        <ShoppingCartModal />

        <h1 className="shop-title">Train in our <span>colors!</span></h1>
        <div className="shop-container">
            {products.map((product) => (
                <div key={product.id} className="shop-card">

                    {Object.keys(product.checkImg).map((item) => {
                        if(product.checkImg[item]) {
                            return (
                            <img key={item} src={product.linkImg[item]} alt={product.name} className='bg-img' />
                            );
                        } else {
                            return null;
                        }
                    })}
                    <div className="colors">
                        {product.colors.map((color) => (
                            <div 
                            key={color}
                            className={`btn-color ${product.checkImg[color] && 'active' } `} style={{backgroundColor:color}}
                            onClick={() => handleChooseColor(product.id, color)}
                            >
                            </div>
                        ))}
                    </div>
                    <p className="shop-product-name">{product.name}</p>
                    <p className="shop-product-price">{product.price}</p>
                    <Link to={`/shop/${product.id}`}>
                        <div className="details">
                            Details
                        </div>
                    </Link>
                </div>
            ))}
        </div>
        <Footer />
    </div>
  )
}

export default Shop