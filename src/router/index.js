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
    path: '/estoque',
    name: 'Estoque',
    component: () => import('../views/Estoque.vue'),
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
    path: '/despesas',
    name: 'Despesas',
    component: () => import('../views/Despesas.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/perdas',
    name: 'Perdas',
    component: () => import('../views/Perdas.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/trocas',
    name: 'Trocas',
    component: () => import('../views/Trocas.vue'),
    meta: { requiresAuth: true }
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
  
  try {
    await authStore.checkAuth()
    
    if (authStore.sessionError && to.path !== '/login') {
      authStore.forceLogout()
      return next('/login')
    }
    
    if (to.meta.requiresAuth && !authStore.isAuthenticated) {
      return next('/login')
    }
    
    if (to.meta.requiresAdmin && !authStore.isAdmin) {
      return next('/')
    }
    
    if (to.path === '/login' && authStore.isAuthenticated) {
      return next('/')
    }
    
    next()
  } catch (error) {
    console.error('Erro no router guard:', error)
    authStore.forceLogout()
    if (to.path !== '/login') {
      next('/login')
    } else {
      next()
    }
  }
})

export default router
