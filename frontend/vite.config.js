import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    // allow local subdomain hosts used in development
    allowedHosts: ['admin.lvh.me', 'guest.lvh.me', 'lvh.me'],
  },
})
