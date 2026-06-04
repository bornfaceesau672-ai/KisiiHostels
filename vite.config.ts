import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

/**
 * Vite configuration — applying claude-skills:
 *   - performance-optimization: code splitting, chunk strategy, optimizeDeps
 *   - security-baseline: security response headers for dev server
 *   - code-review-web: build reliability, source maps for debugging
 */
export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],

    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },

    // ================================================================
    // SECURITY HEADERS — security-baseline skill applied
    // Layer 2: Response headers (HSTS, X-Frame-Options, Referrer-Policy,
    // X-Content-Type-Options, Permissions-Policy)
    // These apply in dev server; replicate on your production host too.
    // ================================================================
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
      headers: {
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'SAMEORIGIN',
        'Referrer-Policy': 'strict-origin-when-cross-origin',
        'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
        'Cross-Origin-Opener-Policy': 'same-origin-allow-popups',
      },
      proxy: {
        '/api': {
          target: 'http://localhost:3001',
          changeOrigin: true,
          secure: false,
        },
      },
    },

    // ================================================================
    // PERFORMANCE OPTIMISATION — performance-optimization skill applied
    // Bundle size: code-split per logical boundary
    // Targets: initial JS < 170KB compressed; lazy chunks < 100KB each
    // ================================================================
    build: {
      // Source maps for production debugging (code-review-web: reliability)
      sourcemap: false,

      // Raise chunk warning threshold to 600KB before alerting
      chunkSizeWarningLimit: 600,

      rollupOptions: {
        output: {
          // Manual chunk strategy: split vendor from app code
          // Prevents the entire app re-downloading when only app code changes
          manualChunks: {
            // Firebase SDK is large — isolate in its own chunk
            'vendor-firebase': [
              'firebase/app',
              'firebase/auth',
              'firebase/firestore',
            ],
            // React ecosystem — stable, cache longer
            'vendor-react': ['react', 'react-dom'],
            // Lucide icons — tree-shaken but still benefits from isolation
            'vendor-lucide': ['lucide-react'],
          },
        },
      },

      // Split CSS per chunk — improves initial paint (performance-optimization: CLS)
      cssCodeSplit: true,
    },

    // ================================================================
    // OPTIMISE DEPENDENCIES — performance-optimization skill
    // Pre-bundle frequently used deps to speed up cold dev starts
    // ================================================================
    optimizeDeps: {
      include: [
        'react',
        'react-dom',
        'firebase/app',
        'firebase/auth',
        'firebase/firestore',
        'lucide-react',
      ],
    },
  };
});
