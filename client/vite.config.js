import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': 'http://localhost:8080',
    },
  },
  build: {
    rollupOptions: {
      plugins: [
        {
          name: 'rename-redirects',
          closeBundle() {
            const from = path.resolve(__dirname, 'dist/__redirects')
            const to = path.resolve(__dirname, 'dist/_redirects')
            if (fs.existsSync(from)) {
              fs.renameSync(from, to)
              console.log('✅ Renamed __redirects to _redirects for Render SPA routing')
            } else {
              console.warn('⚠️ __redirects file not found in dist/')
            }
          }
        }
      ]
    }
  }
})

