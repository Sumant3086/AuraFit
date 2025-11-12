import React from 'react';
import './features.css';
import WorkoutGenerator from './WorkoutGenerator';
import BodyTracker from './BodyTracker';
import NutritionCalculator from './NutritionCalculator';
import Footer from '../footer/Footer';
import { Fade } from 'react-awesome-reveal';

const Features = () => {
  return (
    <div className="features-page">
      <Fade triggerOnce>
        <div className="features-hero">
          <h1>Smart Fitness <span className="gradient-text">Features</span></h1>
          <p>AI-powered tools to accelerate your fitness journey</p>
        </div>
      </Fade>

      <Fade triggerOnce delay={200}>
        <WorkoutGenerator />
      </Fade>

      <Fade triggerOnce delay={300}>
        <NutritionCalculator />
      </Fade>

      <Fade triggerOnce delay={400}>
        <BodyTracker />
      </Fade>

      <Footer />
    </div>
  );
};

export default Features;
