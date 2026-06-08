import { motion } from 'framer-motion';

/**
 * Unified section heading used across every public page.
 * Keeps typography hierarchy consistent platform-wide.
 */
export default function SectionHeading({
  label,       // Small uppercase label above the title
  title,       // Main heading
  desc,        // Optional description paragraph
  align = 'center', // 'center' | 'left'
  titleSize = 'normal', // 'normal' | 'hero'
  className = '',
}) {
  return (
    <div className={`section-heading section-heading--${align} ${className}`}>
      {label && (
        <motion.div
          className="section-label"
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        >
          {label}
        </motion.div>
      )}
      <motion.h2
        className={titleSize === 'hero' ? 'section-title-hero' : 'section-title'}
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: label ? 0.07 : 0 }}
      >
        {title}
      </motion.h2>
      {desc && (
        <motion.p
          className="section-desc"
          style={{ marginTop: 14 }}
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1], delay: 0.12 }}
        >
          {desc}
        </motion.p>
      )}
    </div>
  );
}
