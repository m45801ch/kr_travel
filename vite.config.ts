import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), VitePWA({ registerType: 'prompt', includeAssets: ['icons/icon.svg'], manifest: { name: '韓國旅遊', short_name: '韓國旅遊', description: '規劃你的韓國旅程', theme_color: '#ef8490', background_color: '#fffaf0', display: 'standalone', start_url: '/itinerary', icons: [{ src: '/icons/icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any maskable' }] } })],
  test: {
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
  },
})
