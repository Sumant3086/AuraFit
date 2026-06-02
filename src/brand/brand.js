/**
 * AuraFit Brand System — Single source of truth for visual identity.
 *
 * Brand Position: The AI-powered fitness platform for people who train seriously.
 * Category: Premium fitness technology
 * Promise: Your best self, built systematically.
 *
 * Usage: import { BRAND } from '../../brand/brand';
 */

export const BRAND = {
  /* ── Identity ──────────────────────────────────────────── */
  name: 'AuraFit',
  tagline: 'Train smarter. Live stronger.',
  taglineAlt: 'Your strongest self is waiting.',
  descriptor: 'AI-Powered Fitness Platform',
  mission: 'To make elite fitness accessible, measurable, and genuinely motivating — for everyone.',

  url: 'https://aurafitgymwebsite.onrender.com',
  supportEmail: 'support@aurafit.com',

  /* ── Color palette ─────────────────────────────────────── */
  colors: {
    // Primary brand
    purple:      '#9d00ff',
    purpleDim:   'rgba(157,0,255,0.12)',
    purpleGlow:  'rgba(157,0,255,0.35)',
    cyan:        '#00d4ff',
    cyanDim:     'rgba(0,212,255,0.10)',

    // Gradient (primary brand expression)
    gradient:         'linear-gradient(135deg, #9d00ff 0%, #00d4ff 100%)',
    gradientReverse:  'linear-gradient(135deg, #00d4ff 0%, #9d00ff 100%)',
    gradientText:     'linear-gradient(135deg, #9d00ff 0%, #00d4ff 60%, #9d00ff 100%)',

    // Semantic
    success:  '#10b981',
    warning:  '#f59e0b',  // Brand gold — used for streaks, premium, achievements
    error:    '#ef4444',
    info:     '#3b82f6',

    // Dark surfaces
    bg:         '#050507',
    surface:    '#0a0a0f',
    raised:     '#111118',
    overlay:    '#17171f',

    // Text
    textPrimary:   '#f0f0f6',
    textSecondary: '#8e8ea8',
    textMuted:     '#55556a',
  },

  /* ── Typography ─────────────────────────────────────────── */
  type: {
    fontFamily: "'Sora', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    fontMono:   "'SF Mono', 'Fira Code', 'Consolas', monospace",

    // Scale
    xs:   '11px',
    sm:   '13px',
    base: '15px',
    md:   '16px',
    lg:   '18px',
    xl:   '20px',
    '2xl': '24px',
    '3xl': '28px',
    '4xl': '36px',
    '5xl': '48px',
    hero: 'clamp(38px, 5.5vw, 72px)',

    // Weights
    regular:  400,
    medium:   500,
    semibold: 600,
    bold:     700,
    black:    800,

    // Line heights
    tight:   1.1,
    snug:    1.3,
    normal:  1.6,
    relaxed: 1.75,

    // Letter spacing
    tight_tracking:  '-0.03em',  // Large headings
    default_tracking: '-0.01em', // Body headings
    wide_tracking:   '0.05em',  // Labels, badges
    xwide_tracking:  '0.10em',  // All-caps tags
  },

  /* ── Motion ─────────────────────────────────────────────── */
  motion: {
    fast:   '150ms',
    base:   '250ms',
    slow:   '400ms',
    slower: '600ms',

    easeOut:   'cubic-bezier(0.16, 1, 0.3, 1)',
    easeInOut: 'cubic-bezier(0.45, 0, 0.55, 1)',
    spring:    'cubic-bezier(0.34, 1.56, 0.64, 1)',

    // Framer Motion variants (import and spread)
    fadeUp: {
      hidden: { opacity: 0, y: 20 },
      visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } },
    },
    fadeIn: {
      hidden: { opacity: 0 },
      visible: { opacity: 1, transition: { duration: 0.4 } },
    },
    stagger: { visible: { transition: { staggerChildren: 0.08 } } },
  },

  /* ── Brand Voice ─────────────────────────────────────────── */
  voice: {
    /*
      Tone: Direct, confident, human. We celebrate progress, never preach.
      We use specific numbers when possible. Second-person singular ("you", "your").
      We don't shout. We don't beg. We invite.

      DO:
        "You've earned 140 points this week."
        "Check in to keep your streak alive."
        "Your AI workout is ready."
        "14 members checked in today."

      DON'T:
        "START YOUR JOURNEY TODAY!!!"
        "TRANSFORM YOUR LIFE NOW"
        "You won't regret it."
        "Join the fitness revolution."
    */

    // CTA copy (prefer action-specific over generic)
    ctas: {
      signup:       'Start training',
      login:        'Continue',
      getStarted:   'Get started — it\'s free',
      upgrade:      'Upgrade your membership',
      bookTrainer:  'Book a session',
      viewPlan:     'See your plan',
      checkIn:      'Check in & earn points',
      explore:      'Explore features',
      learnMore:    'Learn more',
      download:     'Download report',
    },

    // Error messages
    errors: {
      network:   'Connection lost. Check your internet and try again.',
      auth:      'Incorrect email or password.',
      session:   'Your session expired. Please sign in again.',
      generic:   'Something went wrong. We\'re looking into it.',
      forbidden: 'You don\'t have permission to do that.',
    },

    // Success messages
    success: {
      login:     'Welcome back.',
      signup:    'Account created. Let\'s personalize your plan.',
      checkIn:   'Checked in. Keep that streak going.',
      saved:     'Saved.',
      copied:    'Copied.',
      password:  'Password updated.',
    },

    // Empty states
    empty: {
      feed:         'Be the first to share something.',
      achievements: 'Start training to earn your first badge.',
      orders:       'No orders yet.',
      sessions:     'No sessions scheduled.',
    },
  },

  /* ── Iconography style ──────────────────────────────────── */
  icons: {
    /*
      Style: Emoji-based for personality in app UI, react-icons/fi for functional UI.
      Size scale: 14px (inline), 18px (button), 22px (action), 28px (feature), 40px (hero)
      Never mix icon styles in the same visual context.
      Emoji are decorative — always pair with text, never standalone for meaning.
    */
    sizes: { inline: 14, button: 18, action: 22, feature: 28, hero: 40 },

    // Brand icon set (emoji personality system)
    brandIcons: {
      streak:       '🔥',
      achievement:  '🏅',
      checkin:      '📍',
      workout:      '💪',
      nutrition:    '🥗',
      community:    '🤝',
      ai:           '🤖',
      premium:      '💎',
      progress:     '📊',
      leaderboard:  '🏆',
      referral:     '🎁',
      levelUp:      '⬆️',
      celebrate:    '🎉',
      trainer:      '📅',
    },
  },

  /* ── Spacing scale ──────────────────────────────────────── */
  space: {
    1: '4px',  2: '8px',  3: '12px', 4: '16px', 5: '20px',
    6: '24px', 8: '32px', 10: '40px', 12: '48px', 16: '64px',
  },

  /* ── Border radius ──────────────────────────────────────── */
  radius: {
    xs: '4px', sm: '8px', md: '12px', lg: '16px',
    xl: '20px', '2xl': '24px', pill: '9999px',
  },

  /* ── Shadow system ──────────────────────────────────────── */
  shadows: {
    card:   '0 1px 0 rgba(255,255,255,0.05) inset, 0 4px 20px rgba(0,0,0,0.4)',
    lg:     '0 8px 32px rgba(0,0,0,0.6), 0 2px 8px rgba(0,0,0,0.4)',
    xl:     '0 20px 60px rgba(0,0,0,0.7), 0 4px 16px rgba(0,0,0,0.5)',
    purple: '0 0 32px rgba(157,0,255,0.25), 0 0 8px rgba(157,0,255,0.15)',
    cyan:   '0 0 32px rgba(0,212,255,0.2), 0 0 8px rgba(0,212,255,0.1)',
  },

  /* ── Marketing messaging ─────────────────────────────────── */
  marketing: {
    headlines: [
      'Your strongest self is waiting.',
      'Train smarter. Live stronger.',
      'The fitness platform built for real results.',
      'Intelligent fitness for serious athletes.',
    ],
    subheadlines: [
      'AI-generated workouts, expert trainers, and gamified habits — in one platform.',
      'From personalized AI plans to community accountability — everything you need to transform.',
      'We combine sports science with behavioral psychology to make fitness stick.',
    ],
    stats: {
      members:       '5,000+',
      transformations: '10,000+',
      trainers:      '35+',
      rating:        '4.9',
      satisfaction:  '98%',
    },
    social_proof: [
      '"Lost 14kg in 4 months. The AI plan finally fit my lifestyle." — Priya S.',
      '"Gained 7kg of lean muscle in 6 months. Best investment in my health." — Arjun P.',
      '"From sedentary to 5× weekly. The streak system is addictive." — Ananya R.',
    ],
  },

  /* ── App icon art direction ──────────────────────────────── */
  appIcon: {
    /*
      Design: Rounded rectangle (Apple-style), gradient bg (#9d00ff → #00d4ff at 135°)
      Mark: Minimalist dumbbell with circuit/data line through the bar — fitness + tech
      At 16px: Just the gradient square — no detail
      At 48px: Dumbbell silhouette appears
      At 192px+: Full mark with subtle texture
      Background color for PWA: #050507 (near-black, matches surface-bg)
    */
    backgroundFill: '#050507',
    markColor: '#ffffff',
    gradientStart: '#9d00ff',
    gradientEnd: '#00d4ff',
    angle: 135,
  },

  /* ── UI illustration direction ──────────────────────────── */
  illustrations: {
    /*
      Style: Data-driven, functional. No decorative illustrations.
      Use CSS-built mockups (like LandingHero) rather than static PNGs.
      Charts and data visualizations are the "illustrations."
      Emoji used contextually as personality, not decoration.
      Avoid: stock fitness photos, overly posed models, generic icons.
      Prefer: real UI, real numbers, real progress charts.
    */
  },

  /* ── Social media visual style ──────────────────────────── */
  social: {
    /*
      Profile: White logo on gradient background (#9d00ff → #00d4ff)
      Post template: Dark background (#0a0a0f), brand gradient accent,
                     Sora typography, stat numbers large, quotes in italic
      Story template: Vertical gradient, large number + context below
      Brand hashtags: #AuraFit #TrainSmarterLiveStronger #AIFitness #FitTech
    */
    brandColor: '#9d00ff',
    accentColor: '#00d4ff',
    bgColor: '#0a0a0f',
    hashtags: ['#AuraFit', '#TrainSmarterLiveStronger', '#AIFitness', '#FitTech'],
  },
};

/* ── Helper: gradient text style ─────────────────────────── */
export const gradientTextStyle = {
  background: BRAND.colors.gradient,
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  backgroundClip: 'text',
};

/* ── Helper: brand button styles ─────────────────────────── */
export const buttonStyles = {
  primary: {
    background: BRAND.colors.gradient,
    border: 'none',
    borderRadius: BRAND.radius.md,
    color: '#fff',
    fontWeight: BRAND.type.bold,
    fontSize: BRAND.type.base,
    cursor: 'pointer',
    padding: '13px 24px',
    boxShadow: BRAND.shadows.purple,
    letterSpacing: '0.01em',
  },
  ghost: {
    background: 'transparent',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: BRAND.radius.md,
    color: BRAND.colors.textSecondary,
    fontWeight: BRAND.type.semibold,
    fontSize: BRAND.type.base,
    cursor: 'pointer',
    padding: '12px 24px',
  },
  danger: {
    background: 'rgba(239,68,68,0.12)',
    border: '1px solid rgba(239,68,68,0.35)',
    borderRadius: BRAND.radius.md,
    color: BRAND.colors.error,
    fontWeight: BRAND.type.semibold,
    fontSize: BRAND.type.sm,
    cursor: 'pointer',
    padding: '10px 20px',
  },
};

export default BRAND;
