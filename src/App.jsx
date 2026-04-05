import React, { useState, useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import { Toaster } from 'react-hot-toast';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { CartProvider } from "./context/CartContext";
import { SocketProvider } from "./context/SocketContext";
import Navbar from "./components/navbar/Navbar";
import Dropdown from "./components/navbar/Dropdown";
import Home from "./components/home/Home";
import Contact from "./components/contact/Contact";
import Shop from "./components/shop/Shop";
import Product from "./components/shop/Product";
import shopData from "./components/shop/shopData";
import Classes from './components/classes/Classes';
import Pricing from "./components/pricing/Pricing";
import Features from "./components/features/Features";
import Login from "./components/auth/Login";
import Signup from "./components/auth/Signup";
import ForgotPassword from "./components/auth/ForgotPassword";
import AdminLogin from "./components/admin/AdminLogin";
import AdminDashboard from "./components/admin/AdminDashboard";
import ProtectedAdminRoute from "./components/admin/ProtectedAdminRoute";
import UserProfile from "./components/profile/UserProfile";
import MyOrders from "./components/orders/MyOrders";
import PaymentConfirmation from "./components/orders/PaymentConfirmation";
import LiveChat from "./components/chat/LiveChat";
import ScrollToTop from "./components/scrollToTop";
import ScrollToTopButton from "./components/common/ScrollToTop";
import ProgressBar from "./components/common/ProgressBar";
import './styles/animations.css';
import './styles/responsive.css';

const App = () => {
  const [isOpen, setIsOpen] = useState(false);
  const toggle = () => {
    setIsOpen(!isOpen);
  };
  
  // Initialize AOS animations
  useEffect(() => {
    AOS.init({
      duration: 800,
      once: true,
      offset: 100,
      easing: 'ease-out',
    });
  }, []);

  return (
    <SocketProvider>
      <CartProvider>
        <ProgressBar />
        <Toaster 
          position="top-right"
          reverseOrder={false}
          toastOptions={{
            duration: 3000,
            style: {
              background: '#1a1a1a',
              color: '#fff',
              border: '1px solid #9d00ff',
            },
          }}
        />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/profile" element={<UserProfile />} />
          <Route path="/my-orders" element={<MyOrders />} />
          <Route path="/confirm-payment" element={<PaymentConfirmation />} />
          <Route path="/admin/dashboard" element={
            <ProtectedAdminRoute>
              <AdminDashboard />
            </ProtectedAdminRoute>
          } />
          <Route path="*" element={
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
                <Route exact path="/features" element={<Features />} />
              </Routes>
              <LiveChat />
            </>
          } />
        </Routes>
        <ScrollToTop />
        <ScrollToTopButton />
      </CartProvider>
    </SocketProvider>
  );
};

export default App;
