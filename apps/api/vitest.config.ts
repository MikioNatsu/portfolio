import swc from 'unplugin-swc';
import { defineConfig } from 'vitest/config';

/**
 * NestJS relies on `emitDecoratorMetadata` for dependency injection, which
 * esbuild (Vitest's default transformer) does not produce. SWC does — so the
 * e2e suite can boot the real module graph instead of mocking the container.
 */
export default defineConfig({
  plugins: [
    swc.vite({
      module: { type: 'es6' },
      jsc: {
        target: 'es2022',
        parser: { syntax: 'typescript', decorators: true },
        transform: { legacyDecorator: true, decoratorMetadata: true },
        keepClassNames: true,
      },
    }),
  ],
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.spec.ts', 'test/**/*.e2e-spec.ts'],
    exclude: ['node_modules', 'dist'],
    testTimeout: 20000,
  },
});
