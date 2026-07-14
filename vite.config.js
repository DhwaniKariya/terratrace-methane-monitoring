import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/terratrace-methane-monitoring/',
  plugins: [react()],
  server: {
    fs: {
      allow: ['.']
    }
  },
  assetsInclude: ['**/*.jpg', '**/*.png'],
})
