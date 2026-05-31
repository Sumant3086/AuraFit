import React, { useState, useEffect, lazy, Suspense } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { Toaster } from 'react-hot-toast';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { CartProvider } from "./context/CartContext";
import { SocketProvider } from "./context/SocketContext";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import './styles/animations.css';
import './styles/responsive.css';

// Eagerly loaded (critical path)
import Navbar from "./components/navbar/Navbar";
import Dropdown from "./components/navbar/Dropdown";
import Home from "./components/home/Home";
import Login from "./components/auth/Login";
import Signup from "./components/auth/Signup";
import ScrollToTop from "./components/scrollToTop";
import ScrollToTopButton from "./components/common/ScrollToTop";
import ProgressBar from "./components/common/ProgressBar";
import LiveChat from "./components/chat/LiveChat";
import BottomNav from "./components/common/BottomNav";
import FitnessAssistant from "./components/chat/FitnessAssistant";

// Lazy loaded (code-split for performance)
const Contact = lazy(() => import("./components/contact/Contact"));
const Shop = lazy(() => import("./components/shop/Shop"));
const Product = lazy(() => import("./components/shop/Product"));
const Classes = lazy(() => import("./components/classes/Classes"));
const Pricing = lazy(() => import("./components/pricing/Pricing"));
const Features = lazy(() => import("./components/features/Features"));
const ForgotPassword = lazy(() => import("./components/auth/ForgotPassword"));
const AdminLogin = lazy(() => import("./components/admin/AdminLogin"));
const AdminDashboard = lazy(() => import("./components/admin/AdminDashboard"));
const ProtectedAdminRoute = lazy(() => import("./components/admin/ProtectedAdminRoute"));
const UserProfile = lazy(() => import("./components/profile/UserProfile"));
const MyOrders = lazy(() => import("./components/orders/MyOrders"));
const PaymentConfirmation = lazy(() => import("./components/orders/PaymentConfirmation"));

// New feature components
const MemberDashboard = lazy(() => import("./components/dashboard/MemberDashboard"));
const OnboardingFlow = lazy(() => import("./components/onboarding/OnboardingFlow"));
const Leaderboard = lazy(() => import("./components/gamification/Leaderboard"));
const Achievements = lazy(() => import("./components/gamification/Achievements"));
const QRCheckIn = lazy(() => import("./components/attendance/QRCheckIn"));
const TrainerBooking = lazy(() => import("./components/booking/TrainerBooking"));
const GymLandingPage = lazy(() => import("./components/gym/GymLandingPage"));

// v2.1 features
const CommunityFeed = lazy(() => import("./components/social/CommunityFeed"));
const Settings = lazy(() => import("./components/settings/Settings"));
const TrainerDashboard = lazy(() => import("./components/trainer/TrainerDashboard"));

// v2.2 features
const TrainerDirectory = lazy(() => import("./components/trainers/TrainerDirectory"));
const TrainerProfile = lazy(() => import("./components/trainers/TrainerProfile"));

// Lazy load shop data to avoid circular dependency
import shopDataModule from "./components/shop/shopData";

// Loading spinner
const PageLoader = () => (
  <div style={{ minHeight: '100vh', background: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <div style={{ textAlign: 'center' }}>
      <div style={{ width: 40, height: 40, border: '3px solid #1a1a1a', borderTop: '3px solid #9d00ff', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <p style={{ color: '#444', fontSize: 14, margin: 0 }}>Loading...</p>
    </div>
  </div>
);

// Protected route for authenticated users
const ProtectedRoute = ({ children, redirectTo = '/login' }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <PageLoader />;
  return isAuthenticated ? children : <Navigate to={redirectTo} replace />;
};

// Onboarding guard - redirect to onboarding if not completed
const OnboardingGuard = ({ children }) => {
  const { isAuthenticated, loading, needsOnboarding } = useAuth();
  const location = useLocation();
  if (loading) return <PageLoader />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (needsOnboarding && location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" replace />;
  }
  return children;
};

const AOS_CONFIG = { duration: 800, once: true, offset: 100, easing: 'ease-out' };

// Inner app that can access AuthContext
const AppInner = () => {
  const [isOpen, setIsOpen] = useState(false);
  const toggle = () => setIsOpen(o => !o);

  useEffect(() => { AOS.init(AOS_CONFIG); }, []);

  return (
    <SocketProvider>
      <CartProvider>
        <ProgressBar />
        <Toaster
          position="top-right"
          reverseOrder={false}
          toastOptions={{
            duration: 3000,
            style: { background: '#1a1a1a', color: '#fff', border: '1px solid #9d00ff', borderRadius: '10px' },
          }}
        />
        <FitnessAssistant />
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* Auth routes (no navbar) */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/admin/login" element={<AdminLogin />} />

            {/* Onboarding */}
            <Route path="/onboarding" element={
              <ProtectedRoute>
                <OnboardingFlow />
              </ProtectedRoute>
            } />

            {/* Admin routes */}
            <Route path="/admin/dashboard" element={
              <Suspense fallback={<PageLoader />}>
                <ProtectedAdminRoute>
                  <AdminDashboard />
                </ProtectedAdminRoute>
              </Suspense>
            } />

            {/* Protected member routes (with onboarding check) */}
            <Route path="/dashboard" element={
              <OnboardingGuard><MemberDashboard /></OnboardingGuard>
            } />
            <Route path="/profile" element={
              <OnboardingGuard><UserProfile /></OnboardingGuard>
            } />
            <Route path="/my-orders" element={
              <OnboardingGuard><MyOrders /></OnboardingGuard>
            } />
            <Route path="/confirm-payment" element={
              <ProtectedRoute><PaymentConfirmation /></ProtectedRoute>
            } />
            <Route path="/checkin" element={
              <OnboardingGuard><QRCheckIn /></OnboardingGuard>
            } />
            <Route path="/leaderboard" element={
              <OnboardingGuard><Leaderboard /></OnboardingGuard>
            } />
            <Route path="/achievements" element={
              <OnboardingGuard><Achievements /></OnboardingGuard>
            } />
            <Route path="/book-trainer" element={
              <OnboardingGuard><TrainerBooking /></OnboardingGuard>
            } />
            <Route path="/community" element={
              <OnboardingGuard><CommunityFeed /></OnboardingGuard>
            } />
            <Route path="/settings" element={
              <OnboardingGuard><Settings /></OnboardingGuard>
            } />
            <Route path="/trainer/dashboard" element={
              <OnboardingGuard><TrainerDashboard /></OnboardingGuard>
            } />
            <Route path="/trainers" element={<TrainerDirectory />} />
            <Route path="/trainers/:id" element={<TrainerProfile />} />

            {/* Gym landing pages */}
            <Route path="/gym/:slug" element={<GymLandingPage />} />

            {/* Public routes (with navbar) */}
            <Route path="*" element={
              <>
                <Navbar toggle={toggle} />
                <Dropdown isOpen={isOpen} toggle={toggle} />
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/shop" element={<Shop />} />
                  <Route path="/shop/:id" element={<Product shopData={shopDataModule} />} />
                  <Route path="/classes" element={<Classes />} />
                  <Route path="/pricing" element={<Pricing />} />
                  <Route path="/features" element={<Features />} />
                </Routes>
                <LiveChat />
              </>
            } />
          </Routes>
        </Suspense>
        <ScrollToTop />
        <ScrollToTopButton />
        <BottomNav />
      </CartProvider>
    </SocketProvider>
  );
};

const App = () => (
  <ThemeProvider>
    <AuthProvider>
      <AppInner />
    </AuthProvider>
  </ThemeProvider>
);

export default App;
