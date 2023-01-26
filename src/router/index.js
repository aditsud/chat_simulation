import { createRouter, createWebHashHistory, createWebHistory } from 'vue-router'
import { getStorage } from '../config/storage';

let notLogin = async (to, from, next) => {
  let profil = await getStorage('profil');
  if(profil === undefined || profil === ''){
    next('/home')
    return
  }else{
    next()
  }
}

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '',
      redirect: '/home'
    },
    {
      path: '/home',
      name: 'Beranda',
      component: () => import('../views/HomeView.vue')
    },
    {
      path: '/chat/:channel',
      name: 'Chat',
      component: () => import('../views/PublisherView.vue'),
      beforeEnter: notLogin,
    },
    {
      path: '/inbox',
      name: 'Kotak Masuk',
      component: () => import('../views/ConsumerView.vue'),
      beforeEnter: notLogin,
    }
  ]
})

export default router
