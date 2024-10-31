import React, { useState } from "react";
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/navbar/Navbar";
import Dropdown from "./components/navbar/Dropdown";
import Home from "./components/home/Home";
import Contact from "./components/contact/Contact";
import Shop from "./components/shop/Shop";
import Product from "./components/shop/Product";
import shopData from "./components/shop/shopData";
import Classes from './components/classes/Classes';
import Pricing from "./components/pricing/Pricing";
import ScrollToTop from "./components/scrollToTop";

const App = () => {
  const [isOpen, setIsOpen] = useState(false);
  const toggle = () => {
    setIsOpen(!isOpen);
  };
  

  return (
    <>
      <Navbar toggle={toggle} />
      <Dropdown isOpen={isOpen} toggle={toggle} />
      <Routes>
        <Route exact path="/" element={<Home />} />
        <Route exact path="/contact" element={<Contact />} />
        <Route exact path="/shop" element={<Shop />} />
        <Route path="/shop/:id" element={<Product shopData={shopData} />} />
        <Route exact path="/classes" element={<Classes />} />
        <Route exact path="/pricing" element={<Pricing />} />
      </Routes>
      <ScrollToTop />
    </>
  );
};

export default App;
