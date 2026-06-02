import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLocation } from 'react-router-dom';

const PAGE_VARIANTS = {
  initial: { opacity: 0, y: 8 },
  enter:   { opacity: 1, y: 0 },
  exit:    { opacity: 0, y: -4 },
};

const PAGE_TRANSITION = {
  duration: 0.22,
  ease: [0.16, 1, 0.3, 1],
};

/**
 * PageWrapper — wraps every page with:
 *   1. Smooth fade+slide entrance animation
 *   2. Scroll-to-top on route change
 *   3. Consistent min-height and background
 *   4. Optional title for accessibility
 *
 * Usage:
 *   <PageWrapper title="Dashboard">
 *     <YourPage />
 *   </PageWrapper>
 */
export default function PageWrapper({ children, title, className = '' }) {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    if (title) document.title = `${title} · AuraFit`;
  }, [pathname, title]);

  return (
    <motion.div
      key={pathname}
      variants={PAGE_VARIANTS}
      initial="initial"
      animate="enter"
      exit="exit"
      transition={PAGE_TRANSITION}
      style={{
        minHeight: '100vh',
        background: 'var(--surface-bg, #050507)',
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
