import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  sourcemap: true,
  clean: true,
  target: 'es2019',
  // The editor talks to the DOM, so the component is client-only.
  // The directive keeps it working out of the box in React Server
  // Components environments (e.g. Next.js App Router).
  banner: { js: "'use client';" },
});
