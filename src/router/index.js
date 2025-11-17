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
    meta: { requiresAuth: true, roles: ['administrador', 'escritorio'] }
  },
  {
    path: '/vendedor',
    name: 'DashboardVendedor',
    component: () => import('../views/DashboardVendedor.vue'),
    meta: { requiresAuth: true, roles: ['vendedor'] }
  },
  {
    path: '/producao',
    name: 'Producao',
    component: () => import('../views/Producao.vue'),
    meta: { requiresAuth: true, roles: ['administrador', 'escritorio'] }
  },
  {
    path: '/estoque',
    name: 'Estoque',
    component: () => import('../views/Estoque.vue'),
    meta: { requiresAuth: true, roles: ['administrador', 'escritorio'] }
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
    meta: { requiresAuth: true, roles: ['administrador', 'escritorio'] }
  },
  {
    path: '/produtos',
    name: 'Produtos',
    component: () => import('../views/Produtos.vue'),
    meta: { requiresAuth: true, roles: ['administrador'] }
  },
  {
    path: '/despesas',
    name: 'Despesas',
    component: () => import('../views/Despesas.vue'),
    meta: { requiresAuth: true, roles: ['administrador'] }
  },
  {
    path: '/perdas',
    name: 'Perdas',
    component: () => import('../views/Perdas.vue'),
    meta: { requiresAuth: true, roles: ['administrador'] }
  },
  {
    path: '/trocas',
    name: 'Trocas',
    component: () => import('../views/Trocas.vue'),
    meta: { requiresAuth: true, roles: ['administrador', 'escritorio'] }
  },
  {
    path: '/relatorios',
    name: 'Relatorios',
    component: () => import('../views/Relatorios.vue'),
    meta: { requiresAuth: true, roles: ['administrador'] }
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
    
    // Redirecionar vendedor para seu dashboard específico
    if (to.path === '/' && authStore.isVendedor) {
      return next('/vendedor')
    }
    
    // Verificar permissões por tipo de usuário
    if (to.meta.roles && authStore.userProfile) {
      const hasPermission = to.meta.roles.includes(authStore.userProfile.tipo_usuario)
      if (!hasPermission) {
        // Redirecionar vendedor para seu dashboard
        if (authStore.isVendedor) {
          return next('/vendedor')
        }
        return next('/')
      }
    }
    
    if (to.path === '/login' && authStore.isAuthenticated) {
      // Redirecionar vendedor para seu dashboard
      if (authStore.isVendedor) {
        return next('/vendedor')
      }
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
