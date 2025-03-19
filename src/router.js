import { createRouter, createWebHistory } from 'vue-router';
import Home from '@/views/home.vue';
import landPage from '@/views/landPage.vue';
import Login from './views/login.vue';

const routes = [
  { path: '/', 
    component: Home, 
    name: 'home' }, 

  { path: '/home', 
    component: Home, 
    name: 'home-page' },
    
  { path: '/landPage', 
    component: landPage, 
    name: 'land-page' },

];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;