import React from 'react';
import LandingHero from '../landing/LandingHero';
import TrustBar from '../landing/TrustBar';
import ProductShowcase from '../landing/ProductShowcase';
import HowItWorks from '../landing/HowItWorks';
import FeaturesShowcase from '../featuresShowcase/FeaturesShowcase';
import LandingCTA from '../landing/LandingCTA';
import Footer from '../footer/Footer';

// TransformationStories removed — contained fabricated testimonials and fake stats.
// Will be restored when real user testimonials are submitted through the platform.

const Home = () => (
  <div style={{ background: 'var(--surface-bg)' }}>
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
