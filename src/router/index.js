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
  },<template>
  <Layout>
    <div class="space-y-6 pb-20 md:pb-6">
      <!-- Header -->
      <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 class="text-2xl md:text-3xl font-bold text-gray-900">Pedidos para Entrega</h2>
          <p class="text-gray-600 mt-1">Gerencie suas entregas e novos pedidos</p>
        </div>
        <button @click="showModalNovoPedido = true" class="w-full md:w-auto btn-primary">
          <svg class="w-5 h-5 inline-block mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
          </svg>
          Novo Pedido
        </button>
      </div>

      <!-- Filtros -->
      <div class="card">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label class="label text-sm">Data</label>
            <input v-model="filters.date" type="date" class="input-field" @change="loadPedidos" />
          </div>
          <div>
            <label class="label text-sm">Status</label>
            <select v-model="filters.status" class="input-field" @change="loadPedidos">
              <option value="pendente">🕐 Pendentes</option>
              <option value="entregue">✅ Entregues</option>
              <option value="cancelado">❌ Cancelados</option>
              <option value="">Todos</option>
            </select>
          </div>
          <div>
            <label class="label text-sm">Cliente</label>
            <input v-model="filters.cliente" type="text" class="input-field" placeholder="Buscar cliente..." @input="loadPedidos" />
          </div>
        </div>
      </div>

      <!-- Contador de Pedidos -->
      <div class="grid grid-cols-3 gap-3 md:gap-4">
        <div class="card text-center">
          <div class="text-3xl mb-2">🕐</div>
          <div class="text-2xl font-bold text-yellow-600">{{ stats.pendentes }}</div>
          <div class="text-sm text-gray-600">Pendentes</div>
        </div>
        <div class="card text-center">
          <div class="text-3xl mb-2">✅</div>
          <div class="text-2xl font-bold text-green-600">{{ stats.entregues }}</div>
          <div class="text-sm text-gray-600">Entregues</div>
        </div>
        <div class="card text-center">
          <div class="text-3xl mb-2">❌</div>
          <div class="text-2xl font-bold text-red-600">{{ stats.cancelados }}</div>
          <div class="text-sm text-gray-600">Cancelados</div>
        </div>
      </div>

      <!-- Cards de Pedidos -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div v-for="pedido in pedidos" :key="pedido.id" class="card hover:shadow-xl transition-shadow">
          <!-- Header do Card -->
          <div class="flex justify-between items-start mb-4 pb-3 border-b">
            <div>
              <span class="text-xs text-gray-500">Pedido #{{ pedido.id.slice(-6).toUpperCase() }}</span>
              <p class="font-bold text-lg text-gray-900 mt-1">{{ pedido.clients?.name }}</p>
            </div>
            <span :class="getStatusBadge(pedido.status_entrega)" class="text-xs px-3 py-1 rounded-full font-semibold">
              {{ getStatusLabel(pedido.status_entrega) }}
            </span>
          </div>

          <!-- Informações do Pedido -->
          <div class="space-y-3 mb-4">
            <div class="flex items-start space-x-2">
              <span class="text-lg">📦</span>
              <div class="flex-1">
                <p class="text-sm text-gray-600">Produto</p>
                <p class="font-semibold">{{ pedido.products?.name }}</p>
                <p class="text-sm text-gray-600">Quantidade: {{ pedido.quantity }}</p>
              </div>
            </div>

            <div class="flex items-start space-x-2">
              <span class="text-lg">📞</span>
              <div class="flex-1">
                <p class="text-sm text-gray-600">Telefone</p>
                <p class="font-semibold">{{ pedido.clients?.phone || 'Não informado' }}</p>
              </div>
            </div>

            <div class="flex items-start space-x-2">
              <span class="text-lg">📍</span>
              <div class="flex-1">
                <p class="text-sm text-gray-600">Endereço</p>
                <p class="font-semibold text-sm">{{ pedido.clients?.address || 'Não informado' }}</p>
              </div>
            </div>

            <div class="flex items-start space-x-2">
              <span class="text-lg">💰</span>
              <div class="flex-1">
                <p class="text-sm text-gray-600">Valor</p>
                <p class="font-bold text-lg text-primary-600">{{ formatCurrency(pedido.total) }}</p>
              </div>
            </div>

            <div class="flex items-start space-x-2">
              <span class="text-lg">📅</span>
              <div class="flex-1">
                <p class="text-sm text-gray-600">Data do Pedido</p>
                <p class="font-semibold">{{ formatDate(pedido.date) }}</p>
              </div>
            </div>

            <div v-if="pedido.notes" class="flex items-start space-x-2">
              <span class="text-lg">📝</span>
              <div class="flex-1">
                <p class="text-sm text-gray-600">Observações</p>
                <p class="text-sm">{{ pedido.notes }}</p>
              </div>
            </div>
          </div>

          <!-- Informações de Entrega/Cancelamento -->
          <div v-if="pedido.status_entrega !== 'pendente'" class="bg-gray-50 rounded-lg p-3 mb-4">
            <p class="text-xs text-gray-500 mb-1">
              {{ pedido.status_entrega === 'entregue' ? '✅ Entregue em:' : '❌ Cancelado em:' }}
            </p>
            <p class="text-sm font-semibold">{{ formatDateTime(pedido.data_entrega) }}</p>
            <p v-if="pedido.motivo_cancelamento" class="text-xs text-gray-600 mt-2">
              <strong>Motivo:</strong> {{ pedido.motivo_cancelamento }}
            </p>
            <p v-if="pedido.observacao_entrega" class="text-xs text-gray-600 mt-1">
              <strong>Obs:</strong> {{ pedido.observacao_entrega }}
            </p>
          </div>

          <!-- Botões de Ação -->
          <div v-if="pedido.status_entrega === 'pendente'" class="flex gap-2">
            <button @click="confirmarEntrega(pedido)" class="flex-1 bg-green-500 hover:bg-green-600 text-white py-3 rounded-lg font-semibold transition-colors">
              ✅ Entregue
            </button>
            <button @click="abrirModalCancelamento(pedido)" class="flex-1 bg-red-500 hover:bg-red-600 text-white py-3 rounded-lg font-semibold transition-colors">
              ❌ Cancelar
            </button>
          </div>
        </div>
      </div>

      <!-- Mensagem se não houver pedidos -->
      <div v-if="pedidos.length === 0" class="card text-center py-12">
        <div class="text-gray-400 mb-4">
          <svg class="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"/>
          </svg>
        </div>
        <p class="text-gray-600 font-medium">Nenhum pedido encontrado</p>
        <p class="text-gray-500 text-sm mt-2">Ajuste os filtros ou aguarde novos pedidos</p>
      </div>

      <!-- Modal de Cancelamento -->
      <div v-if="showModalCancelamento" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div class="bg-white rounded-xl max-w-md w-full p-6">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-xl font-bold text-gray-900">Cancelar Pedido</h3>
            <button @click="closeModalCancelamento" class="text-gray-500 hover:text-gray-700">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>

          <div class="mb-4 p-4 bg-red-50 rounded-lg">
            <p class="text-sm text-gray-700"><strong>Cliente:</strong> {{ pedidoSelecionado?.clients?.name }}</p>
            <p class="text-sm text-gray-700"><strong>Produto:</strong> {{ pedidoSelecionado?.products?.name }}</p>
          </div>

          <form @submit.prevent="confirmarCancelamento" class="space-y-4">
            <div>
              <label class="label">Motivo do Cancelamento *</label>
              <select v-model="formCancelamento.motivo" required class="input-field">
                <option value="">Selecione o motivo</option>
                <option value="Cliente não encontrado">Cliente não encontrado</option>
                <option value="Cliente recusou">Cliente recusou</option>
                <option value="Endereço incorreto">Endereço incorreto</option>
                <option value="Produto indisponível">Produto indisponível</option>
                <option value="Outro">Outro</option>
              </select>
            </div>

            <div>
              <label class="label">Observações</label>
              <textarea v-model="formCancelamento.observacao" class="input-field" rows="3" placeholder="Detalhes adicionais..."></textarea>
            </div>

            <div class="flex gap-3">
              <button type="button" @click="closeModalCancelamento" class="flex-1 btn-outline">
                Voltar
              </button>
              <button type="submit" class="flex-1 bg-red-500 hover:bg-red-600 text-white py-3 rounded-lg font-semibold">
                Confirmar Cancelamento
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Modal Novo Pedido -->
      <div v-if="showModalNovoPedido" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-0 md:p-4 z-50">
        <div class="bg-white rounded-none md:rounded-xl w-full h-full md:h-auto md:max-w-md max-h-screen md:max-h-[90vh] overflow-y-auto">
          <div class="sticky top-0 bg-gradient-to-r from-primary-500 to-primary-600 px-4 md:px-6 py-4 flex items-center justify-between z-10">
            <h3 class="text-lg md:text-xl font-bold text-white">Novo Pedido</h3>
            <button @click="closeModalNovoPedido" class="text-white hover:bg-primary-700 p-2 rounded-lg transition-colors">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>
          <form @submit.prevent="salvarNovoPedido" class="p-4 md:p-6 space-y-4">
            <div>
              <label class="label">Data *</label>
              <input v-model="formPedido.date" type="date" required class="input-field" />
            </div>

            <div>
              <label class="label">Cliente *</label>
              <select v-model="formPedido.client_id" required class="input-field">
                <option value="">Selecione um cliente</option>
                <option v-for="client in clientes" :key="client.id" :value="client.id">{{ client.name }}</option>
              </select>
            </div>

            <div>
              <label class="label">Produto *</label>
              <select v-model="formPedido.product_id" required class="input-field" @change="updatePrice">
                <option value="">Selecione um produto</option>
                <option v-for="product in produtos" :key="product.id" :value="product.id">{{ product.name }} - {{ formatCurrency(product.price) }}</option>
              </select>
            </div>

            <div>
              <label class="label">Quantidade *</label>
              <input v-model.number="formPedido.quantity" type="number" min="1" required class="input-field" @input="calculateTotal" />
            </div>

            <div>
              <label class="label">Preço Unitário *</label>
              <input v-model.number="formPedido.unit_price" type="number" step="0.01" required class="input-field" @input="calculateTotal" />
            </div>

            <div>
              <label class="label">Total</label>
              <input v-model.number="formPedido.total" type="number" step="0.01" readonly class="input-field bg-gray-100 font-bold" />
            </div>

            <div>
              <label class="label">Forma de Pagamento *</label>
              <select v-model="formPedido.payment_method" required class="input-field">
                <option value="cash">💵 Dinheiro</option>
                <option value="pix">📱 PIX</option>
                <option value="boleto">📄 Boleto</option>
              </select>
            </div>

            <div>
              <label class="label">Observações</label>
              <textarea v-model="formPedido.notes" class="input-field" rows="3" placeholder="Informações adicionais..."></textarea>
            </div>

            <div class="flex gap-3 pt-4">
              <button type="button" @click="closeModalNovoPedido" class="flex-1 btn-outline">
                Cancelar
              </button>
              <button type="submit" :disabled="loading" class="flex-1 btn-primary">
                {{ loading ? 'Salvando...' : 'Salvar Pedido' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </Layout>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../stores/auth'
import Layout from '../components/Layout.vue'

const authStore = useAuthStore()
const pedidos = ref([])
const clientes = ref([])
const produtos = ref([])
const showModalCancelamento = ref(false)
const showModalNovoPedido = ref(false)
const pedidoSelecionado = ref(null)
const loading = ref(false)

const filters = ref({
  date: new Date().toISOString().split('T')[0],
  status: 'pendente',
  cliente: ''
})

const formCancelamento = ref({
  motivo: '',
  observacao: ''
})

const formPedido = ref({
  date: new Date().toISOString().split('T')[0],
  sale_type: 'retail',
  client_id: '',
  product_id: '',
  quantity: 1,
  unit_price: 0,
  total: 0,
  payment_method: 'cash',
  paid: false,
  notes: '',
  status_entrega: 'pendente'
})

// Estatísticas
const stats = computed(() => {
  return {
    pendentes: pedidos.value.filter(p => p.status_entrega === 'pendente').length,
    entregues: pedidos.value.filter(p => p.status_entrega === 'entregue').length,
    cancelados: pedidos.value.filter(p => p.status_entrega === 'cancelado').length
  }
})

const formatCurrency = (value) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0)
}

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('pt-BR')
}

const formatDateTime = (date) => {
  return new Date(date).toLocaleString('pt-BR')
}

const getStatusLabel = (status) => {
  const labels = {
    'pendente': '🕐 Pendente',
    'entregue': '✅ Entregue',
    'cancelado': '❌ Cancelado'
  }
  return labels[status] || status
}

const getStatusBadge = (status) => {
  const badges = {
    'pendente': 'bg-yellow-100 text-yellow-700',
    'entregue': 'bg-green-100 text-green-700',
    'cancelado': 'bg-red-100 text-red-700'
  }
  return badges[status] || 'bg-gray-100 text-gray-700'
}

const loadPedidos = async () => {
  try {
    let query = supabase
      .from('sales')
      .select(`*, clients(name, phone, email, address), products(name, description)`)
      .order('date', { ascending: false })

    if (filters.value.date) {
      query = query.eq('date', filters.value.date)
    }

    if (filters.value.status) {
      query = query.eq('status_entrega', filters.value.status)
    }

    if (filters.value.cliente) {
      query = query.ilike('clients.name', `%${filters.value.cliente}%`)
    }

    const { data, error } = await query

    if (error) throw error

    pedidos.value = data || []
  } catch (error) {
    console.error('Erro ao carregar pedidos:', error)
    alert('Erro ao carregar pedidos: ' + error.message)
  }
}

const loadClientes = async () => {
  const { data } = await supabase.from('clients').select('*').order('name')
  clientes.value = data || []
}

const loadProdutos = async () => {
  const { data } = await supabase.from('products').select('*').order('name')
  produtos.value = data || []
}

const updatePrice = () => {
  const product = produtos.value.find(p => p.id === formPedido.value.product_id)
  if (product) {
    formPedido.value.unit_price = product.price
    calculateTotal()
  }
}

const calculateTotal = () => {
  formPedido.value.total = formPedido.value.quantity * formPedido.value.unit_price
}

const confirmarEntrega = async (pedido) => {
  if (!confirm(`Confirmar entrega do pedido para ${pedido.clients?.name}?`)) return

  try {
    const { error } = await supabase
      .from('sales')
      .update({
        status_entrega: 'entregue',
        data_entrega: new Date().toISOString(),
        vendedor_id: authStore.user.id
      })
      .eq('id', pedido.id)

    if (error) throw error

    alert('✅ Pedido marcado como entregue!')
    await loadPedidos()
  } catch (error) {
    console.error('Erro ao confirmar entrega:', error)
    alert('Erro ao confirmar entrega: ' + error.message)
  }
}

const abrirModalCancelamento = (pedido) => {
  pedidoSelecionado.value = pedido
  formCancelamento.value = {
    motivo: '',
    observacao: ''
  }
  showModalCancelamento.value = true
}

const confirmarCancelamento = async () => {
  try {
    const { error } = await supabase
      .from('sales')
      .update({
        status_entrega: 'cancelado',
        data_entrega: new Date().toISOString(),
        motivo_cancelamento: formCancelamento.value.motivo,
        observacao_entrega: formCancelamento.value.observacao,
        vendedor_id: authStore.user.id
      })
      .eq('id', pedidoSelecionado.value.id)

    if (error) throw error

    alert('❌ Pedido cancelado!')
    closeModalCancelamento()
    await loadPedidos()
  } catch (error) {
    console.error('Erro ao cancelar pedido:', error)
    alert('Erro ao cancelar pedido: ' + error.message)
  }
}

const closeModalCancelamento = () => {
  showModalCancelamento.value = false
  pedidoSelecionado.value = null
}

const salvarNovoPedido = async () => {
  loading.value = true
  try {
    const { error } = await supabase.from('sales').insert([formPedido.value])

    if (error) throw error

    alert('✅ Pedido criado com sucesso!')
    closeModalNovoPedido()
    await loadPedidos()
  } catch (error) {
    console.error('Erro ao salvar pedido:', error)
    alert('Erro ao salvar pedido: ' + error.message)
  } finally {
    loading.value = false
  }
}

const closeModalNovoPedido = () => {
  showModalNovoPedido.value = false
  formPedido.value = {
    date: new Date().toISOString().split('T')[0],
    sale_type: 'retail',
    client_id: '',
    product_id: '',
    quantity: 1,
    unit_price: 0,
    total: 0,
    payment_method: 'cash',
    paid: false,
    notes: '',
    status_entrega: 'pendente'
  }
}

onMounted(() => {
  loadPedidos()
  loadClientes()
  loadProdutos()

  // Auto-refresh a cada 30 segundos
  setInterval(() => {
    loadPedidos()
  }, 30000)
})
</script>

<style scoped>
.card {
  @apply bg-white rounded-xl shadow-lg p-4 md:p-6;
}

.label {
  @apply block text-sm font-medium text-gray-700 mb-2;
}

.input-field {
  @apply w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all;
}

.btn-primary {
  @apply px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium;
}

.btn-outline {
  @apply px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium;
}
</style>
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
    
    // Verificar permissões por tipo de usuário
    if (to.meta.roles && authStore.userProfile) {
      const hasPermission = to.meta.roles.includes(authStore.userProfile.tipo_usuario)
      if (!hasPermission) {
        return next('/')
      }
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
