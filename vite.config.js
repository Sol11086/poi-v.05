import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import Components from 'unplugin-vue-components/vite';
import { PrimeVueResolver } from '@primevue/auto-import-resolver';
import path from 'path'; 

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    Components({
      resolvers: [PrimeVueResolver()],
    }),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  server: {
    host: true, // IMPORTANTE: habilita acceso externo
    port: 5173,
    strictPort: true,
    cors: true,
    // ESTA ES LA CLAVE: permitir el host de ngrok explícitamente
    allowedHosts: [
      '230a-2806-230-4043-c126-10bf-8299-9f3a-7272.ngrok-free.app'// Cambiar por el host de ngrok se esté usando
    ],
  },
})