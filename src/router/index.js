import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/Login.vue')
  },
  {
    path: '/',
    name: 'Dashboard',
    component: () => import('../views/Dashboard.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/producao',
    name: 'Producao',
    component: () => import('../views/Producao.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/materia-prima',
    name: 'MateriaPrima',
    component: () => import('../views/MateriaPrima.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/vendas',
    name: 'Vendas',
    component: () => import('../views/Vendas.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/clientes',
    name: 'Clientes',
    component: () => import('../views/Clientes.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/produtos',
    name: 'Produtos',
    component: () => import('../views/Produtos.vue'),
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/relatorios',
    name: 'Relatorios',
    component: () => import('../views/Relatorios.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/configuracoes',
    name: 'Configuracoes',
    component: () => import('../views/Configuracoes.vue'),
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()
  await authStore.checkAuth()

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next('/login')
  } else if (to.meta.requiresAdmin && !authStore.isAdmin) {
    next('/')
  } else if (to.path === '/login' && authStore.isAuthenticated) {
    next('/')
  } else {
    next()
  }
})

export default router
