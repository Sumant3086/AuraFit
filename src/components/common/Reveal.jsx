import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { fadeUp, staggerContainer } from '../../lib/motion';

/**
 * Reveal — scroll-triggered animation wrapper.
 *
 * Usage:
 *   <Reveal>  <-- single element, fades up on scroll
 *   <Reveal stagger delay={0.1}>  <-- stagger children
 *   <Reveal variant={scaleIn}>  <-- custom variant
 *
 * Automatically respects prefers-reduced-motion via CSS.
 */
export default function Reveal({
  children,
  variant = fadeUp,
  delay = 0,
  stagger = false,
  staggerDelay = 0.07,
  once = true,
  margin = '-50px',
  style,
  className,
  as = 'div',
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once, margin });

  // Build the variant with the optional delay
  const resolvedVariant = delay
    ? {
        hidden: variant.hidden,
        show: {
          ...variant.show,
          transition: {
            ...(variant.show?.transition || {}),
            delay,
          },
        },
      }
    : variant;

  const container = stagger ? staggerContainer(staggerDelay, delay) : resolvedVariant;

  const Component = motion[as] || motion.div;

  return (
    <Component
      ref={ref}
      initial="hidden"
      animate={inView ? 'show' : 'hidden'}
      variants={container}
      style={style}
      className={className}
    >
      {children}
    </Component>
  );
}

/**
 * RevealItem — direct child of a staggered Reveal.
 * Use inside <Reveal stagger> to give each child its own variant.
 */
export function RevealItem({ children, variant = fadeUp, style, className }) {
  return (
    <motion.div variants={variant} style={style} className={className}>
      {children}
    </motion.div>
  );
}
