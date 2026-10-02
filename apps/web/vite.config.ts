import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

/**
 * React Testing Library requires React's development build (it uses `act`).
 * If the host shell exports NODE_ENV=production, Vitest would otherwise pull in
 * the production bundle and every render would throw — so pin it for test runs
 * only. Production builds are untouched.
 */
if (process.env.VITEST && process.env.NODE_ENV === 'production') {
  process.env.NODE_ENV = 'test';
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, path.resolve(__dirname, '../../'), '');
  const apiTarget = env.VITE_API_URL || 'http://localhost:4000';

  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
        '@natsu/types': path.resolve(__dirname, '../../packages/types/src/index.ts'),
      },
    },
    server: {
      port: 5173,
      strictPort: false,
      proxy: {
        '/api': { target: apiTarget, changeOrigin: true },
        '/uploads': { target: apiTarget, changeOrigin: true },
      },
    },
    build: {
      outDir: 'dist',
      sourcemap: false,
      chunkSizeWarningLimit: 900,
      rollupOptions: {
        output: {
          manualChunks: {
            react: ['react', 'react-dom', 'react-router-dom'],
            motion: ['framer-motion'],
            query: ['@tanstack/react-query'],
          },
        },
      },
    },
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: ['./src/test/setup.ts'],
      css: false,
      include: ['src/**/*.{test,spec}.{ts,tsx}'],
    },
  };
});
