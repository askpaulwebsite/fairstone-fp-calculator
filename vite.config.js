import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
// `base` must match the GitHub Pages sub-path: https://askpaulwebsite.github.io/fairstone-fp-calculator/
export default defineConfig({
  base: '/fairstone-fp-calculator/',
  plugins: [react()],
})
