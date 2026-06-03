import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import logoSvg from "../../assets/logos/aurafit-logo.svg";

/**
 * AppLoader — lightweight splash that fades out once React is ready.
 * Kept short (300ms) so the blank-screen window is minimal.
 */
export default function AppLoader({ children }) {
  const [done, setDone] = useState(false);

  useEffect(() => {
    // Short delay — just enough for fonts to paint before revealing content
    const t = setTimeout(() => setDone(true), 300);
    return () => clearTimeout(t);
  }, []);

  return (
    <>
      {/* Always render children so React tree is ready immediately */}
      <div style={{ visibility: done ? "visible" : "hidden" }}>
        {children}
      </div>

      <AnimatePresence>
        {!done && (
          <motion.div
            key="splash"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 9999,
              background: "#080808",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 20,
            }}
          >
            <img
              src={logoSvg}
              alt="AuraFit"
              style={{ width: 64, height: 64, borderRadius: 14 }}
            />
            <div style={{ display: "flex", gap: 5 }}>
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  animate={{ opacity: [0.2, 0.7, 0.2] }}
                  transition={{
                    duration: 1,
                    delay: i * 0.15,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  style={{
                    width: 3,
                    height: 3,
                    borderRadius: "50%",
                    background: "#5C5C5C",
                  }}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
