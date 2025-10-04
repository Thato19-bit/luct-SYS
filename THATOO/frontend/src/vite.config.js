import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  root: 'src',  // Point Vite to where index.html lives
  plugins: [react()],
  build: {
    outDir: '../dist' // Output to project root's dist folder
  }
})
