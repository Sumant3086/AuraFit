import React, { useState, useEffect, lazy, Suspense } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import logoImg from "./assets/logos/aurafit-logo.png";
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
import ErrorBoundary from "./components/common/ErrorBoundary";

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

// Page loader — shown during lazy chunk loading and auth checks
const PageLoader = () => (
  <div style={{
    minHeight: '100vh',
    background: 'var(--surface-bg, #050507)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  }}>
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
      {/* Real brand logo */}
      <div style={{
        background: '#fff', borderRadius: 12,
        padding: '6px 12px',
        boxShadow: '0 2px 16px rgba(0,0,0,0.2)',
      }}>
        <img src={logoImg} alt="AuraFit" style={{ height: 36, width: 'auto', display: 'block' }} />
      </div>
      {/* Pulse dots */}
      <div style={{ display: 'flex', gap: 5 }}>
        {[0, 1, 2].map(i => (
          <div key={i} style={{
            width: 4, height: 4, borderRadius: '50%', background: '#9d00ff',
            animation: `pl-dot 1.2s ease-in-out ${i * 0.2}s infinite`,
          }} />
        ))}
      </div>
    </div>
    <style>{`
      @keyframes pl-dot {
        0%, 80%, 100% { opacity: 0.2; transform: scale(0.8); }
        40% { opacity: 1; transform: scale(1); }
      }
    `}</style>
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
  const location = useLocation();

  useEffect(() => { AOS.init(AOS_CONFIG); }, []);

  return (
    <SocketProvider>
      <CartProvider>
        <ProgressBar />
        <Toaster
          position="top-right"
          reverseOrder={false}
          gutter={6}
          toastOptions={{
            duration: 3500,
            style: {
              background: '#1A1A1A',
              color: '#F5F5F5',
              border: '1px solid rgba(255,255,255,0.10)',
              borderRadius: '10px',
              fontSize: '13px',
              fontWeight: 500,
              boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
              padding: '11px 15px',
              maxWidth: '360px',
              fontFamily: 'var(--font-sans, Sora, sans-serif)',
              letterSpacing: '-0.01em',
            },
            success: { iconTheme: { primary: '#22C55E', secondary: '#1A1A1A' } },
            error:   { iconTheme: { primary: '#EF4444', secondary: '#1A1A1A' } },
            loading: { iconTheme: { primary: '#8B5CF6', secondary: '#1A1A1A' } },
          }}
        />
        <FitnessAssistant />
        <ErrorBoundary>
        <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
          style={{ minHeight: '100vh' }}
        >
        <Suspense fallback={<PageLoader />}>
          <Routes location={location} key={location.pathname}>
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
        </motion.div>
        </AnimatePresence>
        </ErrorBoundary>
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
