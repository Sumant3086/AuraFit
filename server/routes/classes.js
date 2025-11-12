const express = require('express');
const router = express.Router();
const Class = require('../models/Class');

// Get all classes
router.get('/', async (req, res) => {
  try {
    const classes = await Class.find({ isActive: true });
    res.json({ success: true, data: classes });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching classes', 
      error: error.message 
    });
  }
});

// Get class by ID
router.get('/:id', async (req, res) => {
  try {
    const classItem = await Class.findById(req.params.id);
    if (!classItem) {
      return res.status(404).json({ 
        success: false, 
        message: 'Class not found' 
      });
    }
    res.json({ success: true, data: classItem });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching class', 
      error: error.message 
    });
  }
});

// Create class (admin)
router.post('/', async (req, res) => {
  try {
    const classItem = new Class(req.body);
    await classItem.save();
    res.status(201).json({ 
      success: true, 
      message: 'Class created successfully',
      data: classItem 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error creating class', 
      error: error.message 
    });
  }
});

// Enroll in class
router.post('/:id/enroll', async (req, res) => {
  try {
    const classItem = await Class.findById(req.params.id);
    
    if (!classItem) {
      return res.status(404).json({ 
        success: false, 
        message: 'Class not found' 
      });
    }
    
    if (classItem.enrolled >= classItem.capacity) {
      return res.status(400).json({ 
        success: false, 
        message: 'Class is full' 
      });
    }
    
    classItem.enrolled += 1;
    await classItem.save();
    
    res.json({ 
      success: true, 
      message: 'Enrolled successfully',
      data: classItem 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error enrolling in class', 
      error: error.message 
    });
  }
});

module.exports = router;
