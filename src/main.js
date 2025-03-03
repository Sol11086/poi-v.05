import { createApp } from 'vue'
import App from '@/App.vue'
import PrimeVue from 'primevue/config';
import router from '@/router'; 
import appPreset from '@/appPreset';

const app = createApp(App);
app.use(PrimeVue, {
    theme: {
      preset: appPreset,
      options: {
        prefix: 'p',
        darkModeSelector: '.my-app-dark',
        cssLayer: {
          name: 'primevue',
          order: 'tailwind-base, primevue, tailwind-utilities',
        },
      },
    },
  });
createApp(App).use(router).mount('#app')
app.mount('#app')
