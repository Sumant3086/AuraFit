import React, { useState } from "react";
import { Routes, Route } from "react-router-dom";
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
import AdminLogin from "./components/admin/AdminLogin";
import AdminDashboard from "./components/admin/AdminDashboard";
import ProtectedAdminRoute from "./components/admin/ProtectedAdminRoute";
import UserProfile from "./components/profile/UserProfile";
import MyOrders from "./components/orders/MyOrders";
import PaymentConfirmation from "./components/orders/PaymentConfirmation";
import LiveChat from "./components/chat/LiveChat";
import ScrollToTop from "./components/scrollToTop";

const App = () => {
  const [isOpen, setIsOpen] = useState(false);
  const toggle = () => {
    setIsOpen(!isOpen);
  };
  

  return (
    <SocketProvider>
      <CartProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
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
      </CartProvider>
    </SocketProvider>
  );
};

export default App;
