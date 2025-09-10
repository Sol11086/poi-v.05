import { createRouter, createWebHistory } from 'vue-router';
import Home from '@/views/home.vue';
import landPage from '@/views/landPage.vue';
import Login from '@/views/login.vue';
//import Register from './views/register.vue';

const routes = [
  {
    path: '/',
    redirect: '/login', // 👈 Esto redirige automáticamente a login
  },
  {
    path: '/',
    component: Home,
    name: 'home'
  },

  {
    path: '/home',
    component: Home,
    name: 'home-page'
  },

  {
    path: '/landPage',
    component: landPage,
    name: 'land-page'
  },
  {
    path: '/login',
    component: Login,
    name: 'login'
  },
  // {
  //   path: '/register',
  //   component: Register,
  //   name: 'register'
  // },

];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;