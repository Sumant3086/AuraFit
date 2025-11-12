import React from 'react';
import './testimonials.css';
import { FaStar, FaQuoteLeft } from 'react-icons/fa';
import { Fade } from 'react-awesome-reveal';

const Testimonials = () => {
  const testimonials = [
    {
      name: 'Priya Sharma',
      role: 'Software Engineer | Weight Loss Success',
      image: '👩',
      rating: 5,
      text: 'AURA FIT\'s AI workout generator was a game-changer! As a working professional, I needed flexible plans. Lost 14 kg in 4 months while building sustainable habits. The personalized approach made all the difference.',
      result: '-14 kg in 4 months'
    },
    {
      name: 'Arjun Patel',
      role: 'Entrepreneur | Muscle Building',
      image: '👨',
      rating: 5,
      text: 'The combination of expert trainers and AI-powered nutrition guidance helped me gain 7 kg of lean muscle in 6 months. The progress tracking kept me accountable. Best investment in my health!',
      result: '+7 kg lean muscle'
    },
    {
      name: 'Ananya Reddy',
      role: 'Marketing Manager | Complete Transformation',
      image: '👩',
      rating: 5,
      text: 'From struggling with consistency to becoming a fitness enthusiast! The body tracker visualized my progress, group classes kept me motivated, and trainers pushed me beyond my limits. Reduced body fat by 25% in 8 months!',
      result: '25% body fat reduction'
    }
  ];

  return (
    <section className="testimonials-section">
      <Fade triggerOnce>
        <div className="testimonials-header">
          <h2>Success <span className="gradient-text">Stories</span></h2>
          <p>Real people, real results</p>
        </div>
      </Fade>

      <div className="testimonials-grid">
        {testimonials.map((testimonial, index) => (
          <Fade key={index} triggerOnce delay={index * 100}>
            <div className="testimonial-card">
              <FaQuoteLeft className="quote-icon" />
              <div className="testimonial-rating">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <FaStar key={i} className="star-icon" />
                ))}
              </div>
              <p className="testimonial-text">{testimonial.text}</p>
              <div className="testimonial-result">{testimonial.result}</div>
              <div className="testimonial-author">
                <div className="author-image">{testimonial.image}</div>
                <div className="author-info">
                  <div className="author-name">{testimonial.name}</div>
                  <div className="author-role">{testimonial.role}</div>
                </div>
              </div>
            </div>
          </Fade>
        ))}
      </div>
    </section>
  );
};

export default Testimonials;
