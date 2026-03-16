import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// remplace TON-REPO par le nom de ton repo GitHub
export default defineConfig({
  plugins: [react()],
  base: '/Arabiti-/' // <-- si ton repo GitHub s'appelle "Arabi"
})


