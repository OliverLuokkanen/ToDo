// Esimerkkikonfiguraatio ESM-muodossa (käytä tätä jos package.json:ssa on "type": "module" tai nimeä tiedosto vite.config.mjs)
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist'
  },
  server: {
    host: '0.0.0.0',
    port: 8080
  }
})