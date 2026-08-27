import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { nodePolyfills } from 'vite-plugin-node-polyfills'

// Build variant for the standalone single-file HTML (npm run build:single).
// Everything — JS, CSS, fonts, images — is inlined so the app runs from one
// file opened via file://, no server needed. scripts/build-singlefile.mjs
// stitches the emitted bundle into the final .html.
export default defineConfig({
  base: './',
  plugins: [
    react(),
    nodePolyfills({
      globals: { Buffer: true, global: true, process: true },
      protocolImports: true,
    }),
  ],
  build: {
    outDir: 'dist-singlefile',
    assetsInlineLimit: 100_000_000, // inline every asset as a data: URI
    chunkSizeWarningLimit: 100_000_000,
    rollupOptions: {
      // The Advisor Documents tab lazy-loads @react-pdf/renderer; a single
      // file cannot fetch extra chunks, so fold dynamic imports into one bundle.
      output: { inlineDynamicImports: true },
    },
  },
})
