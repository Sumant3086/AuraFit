import React from 'react';
import LandingHero from '../landing/LandingHero';
import TrustBar from '../landing/TrustBar';
import ProductShowcase from '../landing/ProductShowcase';
import HowItWorks from '../landing/HowItWorks';
import FeaturesShowcase from '../featuresShowcase/FeaturesShowcase';
import TransformationStories from '../landing/TransformationStories';
import LandingCTA from '../landing/LandingCTA';
import Footer from '../footer/Footer';

/*
  Landing page composition — v2.4
  Sections: Hero → Trust → Product → HowItWorks → Features → Stories → CTA → Footer

  Old components (Header, Hero/hero.css, Stats, Membership, Testimonials, Playlist)
  are preserved in their directories for potential future use but not rendered here.
*/
const Home = () => (
  <div style={{ background: 'var(--surface-bg)' }}>
    <LandingHero />
    <TrustBar />
    <ProductShowcase />
    <HowItWorks />
    <FeaturesShowcase />
    <TransformationStories />
    <LandingCTA />
    <Footer />
  </div>
);

export default Home;
