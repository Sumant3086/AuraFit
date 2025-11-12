const express = require('express');
const router = express.Router();
const Product = require('../models/Product');

// Get all products
router.get('/', async (req, res) => {
  try {
    const { category } = req.query;
    const filter = category ? { category } : {};
    
    const products = await Product.find(filter);
    res.json({ success: true, data: products });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching products', 
      error: error.message 
    });
  }
});

// Get product by ID
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ 
        success: false, 
        message: 'Product not found' 
      });
    }
    res.json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching product', 
      error: error.message 
    });
  }
});

// Create product (admin)
router.post('/', async (req, res) => {
  try {
    const product = new Product(req.body);
    await product.save();
    res.status(201).json({ 
      success: true, 
      message: 'Product created successfully',
      data: product 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error creating product', 
      error: error.message 
    });
  }
});

// Add review
router.post('/:id/review', async (req, res) => {
  try {
    const { user, comment, rating } = req.body;
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ 
        success: false, 
        message: 'Product not found' 
      });
    }
    
    product.reviews.push({ user, comment, rating });
    
    // Update average rating
    const totalRating = product.reviews.reduce((sum, review) => sum + review.rating, 0);
    product.rating = totalRating / product.reviews.length;
    
    await product.save();
    res.json({ 
      success: true, 
      message: 'Review added successfully',
      data: product 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error adding review', 
      error: error.message 
    });
  }
});

module.exports = router;
