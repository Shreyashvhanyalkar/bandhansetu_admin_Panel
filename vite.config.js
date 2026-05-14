import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    proxy: {
      '/api': {
        target: 'http://bandhan-setu-prod.eba-am6hwsad.ap-south-1.elasticbeanstalk.com',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})