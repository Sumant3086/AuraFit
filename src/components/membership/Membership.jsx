import React from "react";
import { useNavigate } from "react-router-dom";
import "./membership.css";
import { Fade } from "react-awesome-reveal";
import { FaArrowRight } from 'react-icons/fa';
import apiService from '../../services/api';

const Membership = () => {
  const navigate = useNavigate();

  const handleMembershipClick = async (plan) => {
    const user = localStorage.getItem('user');
    
    if (!user) {
      localStorage.setItem('redirectAfterLogin', '/');
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
              window.open(import.meta.env.VITE_RAZORPAY_LINK, '_blank');
            }
          } catch (err) {
            window.open(import.meta.env.VITE_RAZORPAY_LINK, '_blank');
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
      localStorage.setItem('redirectAfterLogin', '/');
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
        <Fade bottom triggerOnce="true">
          <h1>
            It's your time to <span>Push your limits!</span>
          </h1>
          <h2 className="plans-h2">Membership plans</h2>
        </Fade>

        <Fade bottom triggerOnce="true">
        <div className="membership-cards">
          <div className="membership-card">
            <p className="price">₹999</p>
            <p className="per_month">Per month</p>
            <ul>
              <li> - 10 entries</li>
              <li> - Ladies zone</li>
              <li> - Access to boxing gym</li>
              <li> - Personal locker</li>
            </ul>
            <div className="btn-basic" onClick={() => handleMembershipClick('Basic')}>Basic</div>
          </div>

          <div className="membership-card-strike">
            <p className="price">₹2,499</p>
            <p className="per_month">Per month</p>
            <ul>
              <li> - Unlimited access</li>
              <li> - Ladies zone</li>
              <li> - Access to boxing gym</li>
              <li> - Group lessons</li>
              <li> - Free protein shakes</li>
              <li> - Personal trainer (2 sessions)</li>
              <li> - AURA FIT merchandise</li>
            </ul>
            <div className="btn-strike" onClick={() => handleMembershipClick('Premium')}>Premium</div>
          </div>

          <div className="membership-card">
            <p className="price">₹1,699</p>
            <p className="per_month">Per month</p>
            <ul>
              <li> - 20 entries</li>
              <li> - Ladies zone</li>
              <li> - Access to boxing gym</li>
              <li> - Group lessons</li>
              <li> - Free protein shakes</li>
              <li> - Personal locker</li>
            </ul>
            <div className="btn-pro" onClick={() => handleMembershipClick('Pro')}>Pro</div>
          </div>

        </div>
        </Fade>
        
        <Fade bottom triggerOnce="true">
          <h2 className="voucher-h2">Still not sure?</h2>
          <div className="btn-voucher" onClick={handleFreeEntry}>Get 1 free entry <FaArrowRight className="voucher-icon" /></div>
        </Fade>
      </div>
    </section>
  );
};

export default Membership;
