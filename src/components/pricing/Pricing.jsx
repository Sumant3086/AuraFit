import React from "react";
import { useNavigate } from "react-router-dom";
import "../membership/membership.css";
import Footer from "../footer/Footer";
import { FaArrowRight } from 'react-icons/fa';
import apiService from '../../services/api';

const Pricing = () => {
  const navigate = useNavigate();

  const handleMembershipClick = async (plan) => {
    const user = localStorage.getItem('user');
    
    if (!user) {
      localStorage.setItem('redirectAfterLogin', '/pricing');
      localStorage.setItem('selectedPlan', plan);
      alert('Please login to purchase a membership');
      navigate('/login');
    } else {
      try {
        const userData = JSON.parse(user);
        
        // Get plan details
        const planDetails = {
          'Basic': { price: 999, duration: '1-month' },
          'Pro': { price: 1699, duration: '1-month' },
          'Premium': { price: 2499, duration: '1-month' }
        };
        
        const selectedPlan = planDetails[plan];
        
        // Create pending membership order via API
        const data = await apiService.membership.purchase({
          userId: userData.id,
          name: userData.name,
          email: userData.email,
          plan: plan,
          price: selectedPlan.price,
          duration: selectedPlan.duration,
          paymentStatus: 'pending'
        });

        if (data.success) {
          // Open Razorpay payment gateway
          alert(`Redirecting to payment gateway for ${plan} membership (₹${selectedPlan.price})...`);
          // Fetch payment link from server and open it
          try {
            const paymentResp = await apiService.orders.getRazorpayLink();
            if (paymentResp.success) {
              window.open(paymentResp.data.paymentLink, '_blank');
            } else {
              // Fallback to frontend env var if server doesn't return link
              window.open(process.env.REACT_APP_RAZORPAY_LINK, '_blank');
            }
          } catch (err) {
            window.open(process.env.REACT_APP_RAZORPAY_LINK, '_blank');
          }
          
          // Show message to user
          alert('After completing payment, your membership will be pending admin approval. You will be notified once approved.');
          
          navigate('/profile');
        } else {
          alert(data.message || 'Failed to initiate membership purchase');
        }
      } catch (error) {
        console.error('Error purchasing membership:', error);
        alert('Error initiating membership purchase. Please try again.');
      }
    }
  };

  const handleFreeEntry = async () => {
    const user = localStorage.getItem('user');
    
    if (!user) {
      localStorage.setItem('redirectAfterLogin', '/pricing');
      alert('Please login to claim your free entry');
      navigate('/login');
    } else {
      try {
        const userData = JSON.parse(user);
        
        // Create free trial via API
        const data = await apiService.membership.freeTrial({
          userId: userData.id,
          name: userData.name,
          email: userData.email
        });

        if (data.success) {
          alert('🎉 Free day pass claimed successfully! Check your email for details.');
        } else {
          alert(data.message || 'Failed to claim free trial');
        }
      } catch (error) {
        console.error('Error claiming free trial:', error);
        alert('Free entry voucher will be sent to your email!');
      }
    }
  };

  return (
    <section id="membership">
      <div className="membership-container">
          <h1>
            Transform Your Life <span>Today!</span>
          </h1>
          <h2 className="plans-h2">Flexible Membership Plans</h2>

        <div className="membership-cards">
          <div className="membership-card">
            <p className="price">₹999</p>
            <p className="per_month">Per month</p>
            <ul>
              <li> ✓ 10 gym entries per month</li>
              <li> ✓ Ladies exclusive zone access</li>
              <li> ✓ Boxing arena access</li>
              <li> ✓ Personal locker facility</li>
              <li> ✓ AI workout & nutrition tools</li>
              <li> ✓ Progress tracking dashboard</li>
            </ul>
            <div className="btn-basic" onClick={() => handleMembershipClick('Basic')}>Get Started</div>
          </div>

          <div className="membership-card-strike">
            <p className="price">₹2,499</p>
            <p className="per_month">Per month • Most Popular</p>
            <ul>
              <li> ✓ Unlimited 24/7 gym access</li>
              <li> ✓ All group classes included</li>
              <li> ✓ Ladies exclusive zone</li>
              <li> ✓ Boxing arena & equipment</li>
              <li> ✓ 4 personal training sessions</li>
              <li> ✓ Free protein shakes daily</li>
              <li> ✓ Body composition analysis</li>
              <li> ✓ Nutrition consultation</li>
              <li> ✓ AURA FIT premium merchandise</li>
              <li> ✓ Guest passes (2 per month)</li>
            </ul>
            <div className="btn-strike" onClick={() => handleMembershipClick('Premium')}>Join Premium</div>
          </div>

          <div className="membership-card">
            <p className="price">₹1,699</p>
            <p className="per_month">Per month</p>
            <ul>
              <li> ✓ 20 gym entries per month</li>
              <li> ✓ All group classes included</li>
              <li> ✓ Ladies exclusive zone</li>
              <li> ✓ Boxing arena access</li>
              <li> ✓ 2 personal training sessions</li>
              <li> ✓ Free protein shakes</li>
              <li> ✓ Personal locker</li>
              <li> ✓ AI fitness tools access</li>
            </ul>
            <div className="btn-pro" onClick={() => handleMembershipClick('Pro')}>Choose Pro</div>
          </div>

        </div>
          <h2 className="voucher-h2">Not ready to commit? Try us first!</h2>
          <div className="btn-voucher" onClick={handleFreeEntry}>
            Claim Your Free Day Pass <FaArrowRight className="voucher-icon" />
          </div>
      </div>
      <Footer />
    </section>
  );
};

export default Pricing;
