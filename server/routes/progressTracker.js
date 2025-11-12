const express = require('express');
const router = express.Router();
const ProgressTracker = require('../models/ProgressTracker');

// Create or update progress tracker
router.post('/', async (req, res) => {
  try {
    const { userId, name, email, measurements, goals } = req.body;
    
    let tracker = await ProgressTracker.findOne({ userId });
    
    if (tracker) {
      // Update existing tracker
      if (measurements) {
        tracker.measurements.push(measurements);
      }
      if (goals) {
        tracker.goals = goals;
      }
      await tracker.save();
    } else {
      // Create new tracker
      tracker = new ProgressTracker({
        userId,
        name,
        email,
        measurements: measurements ? [measurements] : [],
        goals
      });
      await tracker.save();
    }
    
    res.status(201).json({ 
      success: true, 
      message: 'Progress tracked successfully',
      data: tracker 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error tracking progress', 
      error: error.message 
    });
  }
});

// Get progress by userId
router.get('/:userId', async (req, res) => {
  try {
    const tracker = await ProgressTracker.findOne({ userId: req.params.userId });
    
    if (!tracker) {
      return res.status(404).json({ 
        success: false, 
        message: 'Progress tracker not found' 
      });
    }
    
    res.json({ success: true, data: tracker });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching progress', 
      error: error.message 
    });
  }
});

// Get progress comparison (before/after)
router.get('/:userId/comparison', async (req, res) => {
  try {
    const tracker = await ProgressTracker.findOne({ userId: req.params.userId });
    
    if (!tracker || tracker.measurements.length < 2) {
      return res.status(404).json({ 
        success: false, 
        message: 'Not enough data for comparison' 
      });
    }
    
    const first = tracker.measurements[0];
    const latest = tracker.measurements[tracker.measurements.length - 1];
    
    const comparison = {
      before: first,
      after: latest,
      changes: {
        weight: latest.weight - first.weight,
        bodyFat: latest.bodyFat - first.bodyFat,
        chest: latest.chest - first.chest,
        waist: latest.waist - first.waist,
        hips: latest.hips - first.hips,
        biceps: latest.biceps - first.biceps,
        thighs: latest.thighs - first.thighs
      },
      progress: calculateProgress(first, latest, tracker.goals)
    };
    
    res.json({ success: true, data: comparison });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching comparison', 
      error: error.message 
    });
  }
});

// Helper function to calculate progress percentage
function calculateProgress(first, latest, goals) {
  if (!goals || !goals.targetWeight) return null;
  
  const totalChange = goals.targetWeight - first.weight;
  const currentChange = latest.weight - first.weight;
  const percentage = (currentChange / totalChange) * 100;
  
  return {
    percentage: Math.round(percentage),
    remaining: goals.targetWeight - latest.weight
  };
}

module.exports = router;
