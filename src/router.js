import { createRouter, createWebHistory } from 'vue-router';
import Home from '@/views/home.vue';

const routes = [
  { path: '/', component: Home, name: 'home' },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;