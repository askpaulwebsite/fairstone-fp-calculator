import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { nodePolyfills } from 'vite-plugin-node-polyfills'

// https://vite.dev/config/
// `base` must match the GitHub Pages sub-path: https://askpaulwebsite.github.io/fairstone-fp-calculator/
// It also drives the font/logo asset URLs used by @react-pdf/renderer, so it must be correct.
export default defineConfig({
  base: '/fairstone-fp-calculator/',
  plugins: [
    react(),
    // @react-pdf/renderer (pdfkit + fontkit) needs Buffer/global/stream/zlib in the browser.
    nodePolyfills({
      globals: { Buffer: true, global: true, process: true },
      protocolImports: true,
    }),
  ],
  // Note: the Advisor Documents tab loads @react-pdf/renderer via dynamic import(),
  // so it is automatically code-split out of the main bundle.
})
