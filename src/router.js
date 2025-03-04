import { createRouter, createWebHistory } from 'vue-router';
import Home from '@/views/home.vue';
import Login from './views/login.vue';
import LandPage from './views/landPage.vue';

const routes = [
  { path: '/', 
    component: Home, 
    name: 'home' }, 

  { path: '/home', 
    component: Home, 
    name: 'home-page' },

];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;