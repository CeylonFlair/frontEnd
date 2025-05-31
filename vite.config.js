import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],

  //added to payment gateway
    server: {
    proxy: {
      '/api': process.env.VITE_API_BASE_URL
    }
  }})
