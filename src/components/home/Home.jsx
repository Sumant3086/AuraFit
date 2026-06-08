import React from 'react';
import LandingHero from '../landing/LandingHero';
import TrustBar from '../landing/TrustBar';
import ProductShowcase from '../landing/ProductShowcase';
import HowItWorks from '../landing/HowItWorks';
import FeaturesShowcase from '../featuresShowcase/FeaturesShowcase';
import LandingCTA from '../landing/LandingCTA';
import Footer from '../footer/Footer';

// The home page follows a deliberate narrative arc:
// Hero → Platform proof → Product depth → How it works → Plans → CTA
const Home = () => (
  <div style={{ background: 'var(--bg)' }}>
    <LandingHero />
    <TrustBar />
    <ProductShowcase />
    <HowItWorks />
    <FeaturesShowcase />
    <LandingCTA />
    <Footer />
  </div>
);

export default Home;
