import React, { useState } from "react"
import { Link } from "react-router-dom"
import { motion } from "framer-motion"
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

        <motion.h1 
          className="shop-title"
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          Train in our <span>colors!</span>
        </motion.h1>
        <motion.div 
          className="shop-container"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
            {products.map((product, index) => (
                <motion.div 
                  key={product.id} 
                  className="shop-card"
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.05, y: -10 }}
                >

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
                            <motion.div 
                            key={color}
                            className={`btn-color ${product.checkImg[color] && 'active' } `} style={{backgroundColor:color}}
                            onClick={() => handleChooseColor(product.id, color)}
                            whileHover={{ scale: 1.2 }}
                            whileTap={{ scale: 0.9 }}
                            >
                            </motion.div>
                        ))}
                    </div>
                    <p className="shop-product-name">{product.name}</p>
                    <p className="shop-product-price">{product.price}</p>
                    <Link to={`/shop/${product.id}`}>
                        <motion.div 
                          className="details"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                            Details
                        </motion.div>
                    </Link>
                </motion.div>
            ))}
        </motion.div>
        <Footer />
    </div>
  )
}

export default Shop