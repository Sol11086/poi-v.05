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
    proxy: {
      '/api': { // Cualquier petición que comience con /api
        target: 'http://localhost:3000', // Dirígela a tu servidor Express
        changeOrigin: true, // Necesario para virtual hosted sites
        secure: false, // Si tu backend no usa HTTPS en desarrollo
        // Puedes añadir rewrite si necesitas quitar /api del path antes de enviarlo al backend
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    },
    //-- ARCHIVOS DONDE SE DEBAN CAMBIAR --
    // * login.vue
    // * teams.vue
    // * GeneralTeams.vue
    // * homeworks.vue
    // * socket.js
    
    // ESTA ES LA CLAVE: permitir el host de ngrok explícitamente
    allowedHosts: [
      '4196-2806-230-4043-c126-1da5-c2d8-792a-508d.ngrok-free.app'// Cambiar por el host de ngrok se esté usando
    ],
  },
})