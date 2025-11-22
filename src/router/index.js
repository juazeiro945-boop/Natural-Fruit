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
    meta: { requiresAuth: true, checkPermission: true }
  },
  {
    path: '/vendedor',
    name: 'DashboardVendedor',
    component: () => import('../views/DashboardVendedor.vue'),
    meta: { requiresAuth: true, checkPermission: true }
  },
  {
    path: '/producao',
    name: 'Producao',
    component: () => import('../views/Producao.vue'),
    meta: { requiresAuth: true, checkPermission: true }
  },
  {
    path: '/estoque',
    name: 'Estoque',
    component: () => import('../views/Estoque.vue'),
    meta: { requiresAuth: true, checkPermission: true }
  },
  {
    path: '/vendas',
    name: 'Vendas',
    component: () => import('../views/Vendas.vue'),
    meta: { requiresAuth: true, checkPermission: true }
  },
  {
    path: '/clientes',
    name: 'Clientes',
    component: () => import('../views/Clientes.vue'),
    meta: { requiresAuth: true, checkPermission: true }
  },
  {
    path: '/produtos',
    name: 'Produtos',
    component: () => import('../views/Produtos.vue'),
    meta: { requiresAuth: true, checkPermission: true }
  },
  {
    path: '/despesas',
    name: 'Despesas',
    component: () => import('../views/Despesas.vue'),
    meta: { requiresAuth: true, checkPermission: true }
  },
  {
    path: '/perdas',
    name: 'Perdas',
    component: () => import('../views/Perdas.vue'),
    meta: { requiresAuth: true, checkPermission: true }
  },
  {
    path: '/trocas',
    name: 'Trocas',
    component: () => import('../views/Trocas.vue'),
    meta: { requiresAuth: true, checkPermission: true }
  },
  {
    path: '/relatorios',
    name: 'Relatorios',
    component: () => import('../views/Relatorios.vue'),
    meta: { requiresAuth: true, checkPermission: true }
  },
  {
    path: '/eventos',
    name: 'Eventos',
    component: () => import('../views/Eventos.vue'),
    meta: { requiresAuth: true, checkPermission: true }
  },
  {
    path: '/crediario',
    name: 'Crediario',
    component: () => import('../views/Crediario.vue'),
    meta: { requiresAuth: true, checkPermission: true }
  },
  {
    path: '/configuracoes',
    name: 'Configuracoes',
    component: () => import('../views/Configuracoes.vue'),
    meta: { requiresAuth: true, checkPermission: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()
  
  try {
    // Verificar autenticação
    await authStore.checkAuth()
    
    // Se houver erro de sessão e não está indo para login, redireciona
    if (authStore.sessionError && to.path !== '/login') {
      authStore.forceLogout()
      return next('/login')
    }
    
    // Se requer autenticação e não está autenticado
    if (to.meta.requiresAuth && !authStore.isAuthenticated) {
      return next('/login')
    }
    
    // Se está autenticado e tentando acessar login, redireciona para dashboard apropriado
    if (to.path === '/login' && authStore.isAuthenticated) {
      if (authStore.isVendedor) {
        return next('/vendedor')
      }
      return next('/')
    }
    
    // NOVO: Verificar permissão de acesso à página
    if (to.meta.checkPermission && authStore.isAuthenticated) {
      const hasPermission = authStore.canAccessRoute(to.path)
      
      if (!hasPermission) {
        console.warn('Acesso negado à rota: ' + to.path)
        
        // Redireciona para o dashboard apropriado
        if (authStore.isVendedor) {
          if (to.path !== '/vendedor') {
            return next('/vendedor')
          }
        } else {
          if (to.path !== '/') {
            return next('/')
          }
        }
      }
    }
    
    // Redirecionar usuário vendedor tentando acessar dashboard admin
    if (to.path === '/' && authStore.isVendedor) {
      return next('/vendedor')
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
