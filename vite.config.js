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
    //-- ARCHIVOS DONDE SE DEBAN CAMBIAR --
    // * login.vue
    // * teams.vue
    // *
    //  
    
    // ESTA ES LA CLAVE: permitir el host de ngrok explícitamente
    allowedHosts: [
      '02e2-2806-230-4043-c126-650e-8e58-cb04-5c6b.ngrok-free.app'// Cambiar por el host de ngrok se esté usando
    ],
  },
})