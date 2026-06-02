import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    svgr(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'robots.txt', 'apple-touch-icon.png'],
      manifest: {
        name: 'AuraFit — Train Smarter. Live Stronger.',
        short_name: 'AuraFit',
        description: 'AI-powered fitness: personalized workouts, smart nutrition, and gamified progress for serious athletes.',
        theme_color: '#9d00ff',
        background_color: '#050507',
        display: 'standalone',
        display_override: ['standalone', 'minimal-ui'],
        orientation: 'portrait',
        scope: '/',
        start_url: '/dashboard',
        id: 'com.aurafit.app',
        icons: [
          { src: '/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
        ],
        categories: ['health', 'fitness', 'sports', 'lifestyle'],
        lang: 'en',
        dir: 'ltr',
        screenshots: [],
        shortcuts: [
          { name: 'Dashboard', url: '/dashboard', icons: [{ src: '/icon-192.png', sizes: '192x192' }] },
          { name: 'Check-In', url: '/checkin', icons: [{ src: '/icon-192.png', sizes: '192x192' }] },
          { name: 'Community', url: '/community', icons: [{ src: '/icon-192.png', sizes: '192x192' }] },
          { name: 'Leaderboard', url: '/leaderboard', icons: [{ src: '/icon-192.png', sizes: '192x192' }] },
        ],
      },
      workbox: {
        maximumFileSizeToCacheInBytes: 4 * 1024 * 1024, // 4 MiB — allows the logo PNG
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: { cacheName: 'google-fonts-cache', expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 } },
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: { cacheName: 'gstatic-fonts-cache', expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 } },
          },
          {
            urlPattern: /\/api\/products/,
            handler: 'StaleWhileRevalidate',
            options: { cacheName: 'api-products-cache', expiration: { maxEntries: 50, maxAgeSeconds: 60 * 5 } },
          },
          {
            urlPattern: /\/api\/classes/,
            handler: 'StaleWhileRevalidate',
            options: { cacheName: 'api-classes-cache', expiration: { maxEntries: 20, maxAgeSeconds: 60 * 5 } },
          },
          {
            urlPattern: /\/api\/announcements/,
            handler: 'StaleWhileRevalidate',
            options: { cacheName: 'api-announcements-cache', expiration: { maxEntries: 10, maxAgeSeconds: 60 * 5 } },
          },
          {
            urlPattern: /\/api\/achievements/,
            handler: 'StaleWhileRevalidate',
            options: { cacheName: 'api-achievements-cache', expiration: { maxEntries: 20, maxAgeSeconds: 60 * 10 } },
          },
        ],
        globPatterns: ['**/*.{js,css,html,ico,png,svg,webp}'],
      },
      devOptions: { enabled: true },
    }),
  ],
  server: {
    port: 3000,
    open: true,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'build',
    sourcemap: false,
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router')) return 'vendor';
            if (id.includes('react-icons')) return 'icons';
            if (id.includes('framer-motion')) return 'motion';
            if (id.includes('recharts') || id.includes('chart.js')) return 'charts';
            return 'libs';
          }
        },
      },
    },
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom'],
  },
});
