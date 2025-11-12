const express = require('express');
const router = express.Router();
const Contact = require('../models/Contact');

// Submit contact form
router.post('/', async (req, res) => {
  try {
    const { name, email, phone, message } = req.body;
    
    const contact = new Contact({
      name,
      email,
      phone,
      message
    });
    
    await contact.save();
    res.status(201).json({ 
      success: true, 
      message: 'Contact form submitted successfully',
      data: contact 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error submitting contact form', 
      error: error.message 
    });
  }
});

// Get all contacts (admin)
router.get('/', async (req, res) => {
  try {
    const contacts = await Contact.find().sort({ createdAt: -1 });
    res.json({ success: true, data: contacts });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching contacts', 
      error: error.message 
    });
  }
});

module.exports = router;
