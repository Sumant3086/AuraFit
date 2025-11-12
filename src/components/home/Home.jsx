import React from "react";
import Header from "../header/Header";
import Hero from "../hero/Hero";
import Stats from "../stats/Stats";
import FeaturesShowcase from "../featuresShowcase/FeaturesShowcase";
import Membership from "../membership/Membership";
import Testimonials from "../testimonials/Testimonials";
import Playlist from "../playlist/Playlist";
import Footer from "../footer/Footer";
import { Fade } from "react-awesome-reveal";

const Home = () => {
  return (
    <>
      <Fade triggerOnce="true">
        <Header />
      </Fade>
      <Hero />
      <Stats />
      <FeaturesShowcase />
      <Membership />
      <Testimonials />
      <Fade bottom triggerOnce="true">
        <Playlist />
      </Fade>
      <Footer />
    </>
  );
};

export default Home;
