import React, { useState } from 'react';
import './membershipRecommender.css';
import { FaCalculator, FaCheckCircle } from 'react-icons/fa';

const MembershipRecommender = () => {
  const [visits, setVisits] = useState('');
  const [recommendation, setRecommendation] = useState(null);

  const calculateRecommendation = () => {
    const monthlyVisits = parseInt(visits);
    
    if (!monthlyVisits || monthlyVisits < 1) {
      alert('Please enter valid number of visits');
      return;
    }

    let recommended = {};
    
    // Basic: ₹999 for 10 entries = ₹99.9 per visit
    // Pro: ₹1,699 for 20 entries = ₹84.95 per visit
    // Premium: ₹2,499 unlimited = best for 15+ visits

    const basicCostPerVisit = 999 / 10;
    const proCostPerVisit = 1699 / 20;
    const premiumCostPerVisit = monthlyVisits > 0 ? 2499 / monthlyVisits : 0;

    if (monthlyVisits <= 10) {
      recommended = {
        plan: 'Basic',
        price: '₹999',
        reason: `Perfect for ${monthlyVisits} visits/month`,
        costPerVisit: `₹${basicCostPerVisit.toFixed(2)} per visit`,
        savings: 'Most economical for your usage',
        features: ['10 entries', 'Ladies zone', 'Boxing gym', 'Personal locker']
      };
    } else if (monthlyVisits <= 20) {
      const basicTotal = Math.ceil(monthlyVisits / 10) * 999;
      const savings = basicTotal - 1699;
      recommended = {
        plan: 'Pro',
        price: '₹1,699',
        reason: `Best value for ${monthlyVisits} visits/month`,
        costPerVisit: `₹${proCostPerVisit.toFixed(2)} per visit`,
        savings: `Save ₹${savings} vs Basic plan`,
        features: ['20 entries', 'Group lessons', 'Protein shakes', 'All Basic features']
      };
    } else {
      const proTotal = Math.ceil(monthlyVisits / 20) * 1699;
      const savings = proTotal - 2499;
      recommended = {
        plan: 'Premium',
        price: '₹2,499',
        reason: `Unlimited access for ${monthlyVisits}+ visits/month`,
        costPerVisit: `₹${premiumCostPerVisit.toFixed(2)} per visit`,
        savings: `Save ₹${savings} vs Pro plan`,
        features: ['Unlimited access', 'Personal trainer', 'Merchandise', 'All Pro features']
      };
    }

    setRecommendation(recommended);
  };

  return (
    <div className="recommender-section">
      <div className="recommender-header">
        <FaCalculator className="recommender-icon" />
        <h2>Smart Membership Recommender</h2>
        <p>Find the perfect plan based on your gym usage</p>
      </div>

      <div className="recommender-calculator">
        <div className="calculator-input">
          <label>How many times will you visit per month?</label>
          <input
            type="number"
            value={visits}
            onChange={(e) => setVisits(e.target.value)}
            placeholder="Enter number of visits"
            min="1"
            max="31"
          />
          <button onClick={calculateRecommendation} className="calculate-btn">
            <FaCalculator /> Calculate Best Plan
          </button>
        </div>

        {recommendation && (
          <div className="recommendation-result">
            <div className="result-badge">
              <FaCheckCircle /> Recommended for You
            </div>
            <h3>{recommendation.plan} Plan</h3>
            <div className="result-price">{recommendation.price}/month</div>
            <p className="result-reason">{recommendation.reason}</p>
            <div className="result-cost">{recommendation.costPerVisit}</div>
            <div className="result-savings">{recommendation.savings}</div>
            
            <div className="result-features">
              <h4>What you get:</h4>
              <ul>
                {recommendation.features.map((feature, index) => (
                  <li key={index}>
                    <FaCheckCircle className="feature-check" /> {feature}
                  </li>
                ))}
              </ul>
            </div>

            <button className="select-plan-btn">
              Select {recommendation.plan} Plan
            </button>
          </div>
        )}
      </div>

      <div className="recommender-comparison">
        <h3>Quick Comparison</h3>
        <div className="comparison-grid">
          <div className="comparison-card">
            <h4>Basic</h4>
            <p className="comparison-price">₹999</p>
            <p className="comparison-visits">10 visits</p>
            <p className="comparison-cost">₹99.9/visit</p>
          </div>
          <div className="comparison-card">
            <h4>Pro</h4>
            <p className="comparison-price">₹1,699</p>
            <p className="comparison-visits">20 visits</p>
            <p className="comparison-cost">₹85/visit</p>
          </div>
          <div className="comparison-card highlighted">
            <h4>Premium</h4>
            <p className="comparison-price">₹2,499</p>
            <p className="comparison-visits">Unlimited</p>
            <p className="comparison-cost">Best for 15+</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MembershipRecommender;
