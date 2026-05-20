import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: { port: 3000 },
  build: {
    sourcemap: false,
  },
  // api/ is vercel serverless — keep ioredis out of the browser bundle
  optimizeDeps: {
    exclude: ['ioredis'],
  },
})
