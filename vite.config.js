import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Added to support payment gateway proxy
  server: {
    proxy: {
      '/api': process.env.VITE_API_BASE_URL
    }
  }
})
