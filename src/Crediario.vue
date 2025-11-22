<template>
  <Layout>
    <div class="space-y-4 md:space-y-6 pb-20 md:pb-6">
      <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 class="text-2xl md:text-3xl font-bold text-gray-900">💰 Crediário</h2>
          <p class="text-gray-600 mt-1">Gerencie vendas a prazo e contas a receber</p>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div class="card text-center">
          <div class="text-4xl mb-2">💰</div>
          <div class="text-3xl font-bold text-orange-600">{{ stats.totalCreditos }}</div>
          <div class="text-sm text-gray-600">Total em Crediário</div>
        </div>
        <div class="card text-center">
          <div class="text-4xl mb-2">⏳</div>
          <div class="text-3xl font-bold text-red-600">{{ formatCurrency(stats.totalDevendo) }}</div>
          <div class="text-sm text-gray-600">Total Devendo</div>
        </div>
        <div class="card text-center">
          <div class="text-4xl mb-2">✅</div>
          <div class="text-3xl font-bold text-green-600">{{ formatCurrency(stats.totalPago) }}</div>
          <div class="text-sm text-gray-600">Total Pago</div>
        </div>
        <div class="card text-center">
          <div class="text-4xl mb-2">👥</div>
          <div class="text-3xl font-bold text-primary-600">{{ stats.clientesDevendo }}</div>
          <div class="text-sm text-gray-600">Clientes Devendo</div>
        </div>
      </div>

      <div class="card">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div>
            <label class="label text-sm">Data</label>
            <input v-model="filters.date" type="date" class="input-field" @change="loadCreditos" />
          </div>
          <div>
            <label class="label text-sm">Status</label>
            <select v-model="filters.status" class="input-field" @change="loadCreditos">
              <option value="">Todos</option>
              <option value="pending">⏳ Pendente</option>
              <option value="paid">✅ Pago</option>
            </select>
          </div>
          <div>
            <label class="label text-sm">Buscar Cliente</label>
            <input v-model="filters.search" type="text" class="input-field" placeholder="Nome do cliente..." @input="loadCreditos" />
          </div>
          <div>
            <label class="label text-sm">Agrupar por</label>
            <select v-model="viewMode" class="input-field" @change="loadCreditos">
              <option value="pedidos">📦 Por Pedido</option>
              <option value="clientes">👥 Por Cliente</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Visualização por PEDIDOS -->
      <div v-if="viewMode === 'pedidos'" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div v-for="credito in creditos" :key="credito.id" class="card hover:shadow-xl transition-shadow border-l-4"
          :class="credito.paid ? 'border-green-500' : 'border-red-500'">
          <div class="flex justify-between items-start mb-3">
            <div class="flex-1">
              <p class="text-sm text-gray-500">Pedido #{{ credito.id.slice(0, 8) }}</p>
              <h3 class="font-bold text-lg text-gray-900">{{ credito.clients?.name }}</h3>
            </div>
            <span :class="credito.paid ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'" 
              class="text-xs px-2 py-1 rounded-full font-semibold">
              {{ credito.paid ? '✅ Pago' : '⏳ Devendo' }}
            </span>
          </div>

          <div class="space-y-2 mb-4">
            <div class="flex items-center space-x-2">
              <span class="text-lg">📞</span>
              <div class="flex-1">
                <p class="text-sm text-gray-600">Telefone</p>
                <p class="font-semibold">{{ credito.clients?.phone || 'Não informado' }}</p>
              </div>
            </div>

            <div class="flex items-center space-x-2">
              <span class="text-lg">📅</span>
              <div class="flex-1">
                <p class="text-sm text-gray-600">Data da Compra</p>
                <p class="font-semibold">{{ formatDate(credito.date) }}</p>
              </div>
            </div>

            <div class="flex items-center space-x-2">
              <span class="text-lg">📦</span>
              <div class="flex-1">
                <p class="text-sm text-gray-600">Itens</p>
                <p class="font-semibold text-primary-600">{{ getTotalItems(credito) }} produtos</p>
              </div>
            </div>

            <div class="flex items-center space-x-2">
              <span class="text-lg">💰</span>
              <div class="flex-1">
                <p class="text-sm text-gray-600">Valor</p>
                <p class="font-bold text-xl" :class="credito.paid ? 'text-green-600' : 'text-red-600'">
                  {{ formatCurrency(credito.total) }}
                </p>
              </div>
            </div>

            <div v-if="credito.notes" class="flex items-start space-x-2 bg-gray-50 p-2 rounded">
              <span class="text-lg">📝</span>
              <div class="flex-1">
                <p class="text-sm">{{ credito.notes }}</p>
              </div>
            </div>
          </div>

          <div class="flex gap-2">
            <button 
              v-if="!credito.paid" 
              @click="marcarComoPago(credito)" 
              class="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg font-semibold transition-colors text-sm"
            >
              ✅ Marcar como Pago
            </button>
            <button 
              v-else
              @click="desfazerPagamento(credito)" 
              class="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white py-2 rounded-lg font-semibold transition-colors text-sm"
            >
              ↩️ Desfazer
            </button>
            <button @click="generateReceipt(credito)" class="flex-1 bg-primary-500 hover:bg-primary-600 text-white py-2 rounded-lg font-semibold transition-colors text-sm">
              📄 Recibo
            </button>
          </div>
        </div>
      </div>

      <!-- Visualização por CLIENTES -->
      <div v-if="viewMode === 'clientes'" class="space-y-4">
        <div v-for="cliente in clientesAgrupados" :key="cliente.id" class="card border-l-4"
          :class="cliente.totalDevendo > 0 ? 'border-red-500' : 'border-green-500'">
          <div class="flex justify-between items-start mb-4">
            <div class="flex-1">
              <h3 class="font-bold text-xl text-gray-900">{{ cliente.name }}</h3>
              <p class="text-sm text-gray-600">{{ cliente.phone }}</p>
              <p class="text-sm text-gray-600">{{ cliente.pedidos.length }} {{ cliente.pedidos.length === 1 ? 'pedido' : 'pedidos' }}</p>
            </div>
            <div class="text-right">
              <p class="text-sm text-gray-600">Total</p>
              <p class="font-bold text-2xl text-primary-600">{{ formatCurrency(cliente.totalComprado) }}</p>
              <p v-if="cliente.totalDevendo > 0" class="text-sm font-semibold text-red-600">
                Devendo: {{ formatCurrency(cliente.totalDevendo) }}
              </p>
              <p v-else class="text-sm font-semibold text-green-600">
                ✅ Tudo Pago
              </p>
            </div>
          </div>

          <div class="space-y-2">
            <div v-for="pedido in cliente.pedidos" :key="pedido.id" class="bg-gray-50 p-3 rounded-lg">
              <div class="flex justify-between items-start">
                <div class="flex-1">
                  <p class="text-xs text-gray-500">Pedido #{{ pedido.id.slice(0, 8) }}</p>
                  <p class="text-sm text-gray-700">{{ formatDate(pedido.date) }}</p>
                  <p class="text-sm text-gray-700">{{ getTotalItems(pedido) }} {{ getTotalItems(pedido) === 1 ? 'item' : 'itens' }}</p>
                </div>
                <div class="text-right">
                  <p class="font-bold text-lg" :class="pedido.paid ? 'text-green-600' : 'text-red-600'">
                    {{ formatCurrency(pedido.total) }}
                  </p>
                  <span :class="pedido.paid ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'" 
                    class="text-xs px-2 py-1 rounded-full font-semibold">
                    {{ pedido.paid ? '✅ Pago' : '⏳ Devendo' }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div class="flex gap-2 mt-4 pt-4 border-t">
            <button @click="verDetalheCliente(cliente)" class="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg font-semibold transition-colors text-sm">
              👁️ Ver Detalhes
            </button>
            <button v-if="cliente.totalDevendo > 0" @click="marcarTudoPago(cliente)" class="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg font-semibold transition-colors text-sm">
              ✅ Marcar Tudo Pago
            </button>
          </div>
        </div>
      </div>

      <div v-if="creditos.length === 0 && viewMode === 'pedidos'" class="card text-center py-12">
        <div class="text-gray-400 mb-4">
          <span class="text-6xl">💰</span>
        </div>
        <p class="text-gray-600 font-medium">Nenhuma venda a crédito encontrada</p>
        <p class="text-gray-500 text-sm mt-2">Vendas no crediário aparecerão aqui</p>
      </div>

      <div v-if="clientesAgrupados.length === 0 && viewMode === 'clientes'" class="card text-center py-12">
        <div class="text-gray-400 mb-4">
          <span class="text-6xl">👥</span>
        </div>
        <p class="text-gray-600 font-medium">Nenhum cliente com crediário encontrado</p>
      </div>
    </div>
  </Layout>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { supabase } from '../lib/supabase'
import Layout from '../components/Layout.vue'

const creditos = ref([])
const viewMode = ref('pedidos')

const filters = ref({
  date: '',
  status: '',
  search: ''
})

const stats = computed(() => {
  const totalDevendo = creditos.value.filter(c => !c.paid).reduce((sum, c) => sum + (c.total || 0), 0)
  const totalPago = creditos.value.filter(c => c.paid).reduce((sum, c) => sum + (c.total || 0), 0)
  const clientesDevendo = new Set(creditos.value.filter(c => !c.paid).map(c => c.client_id)).size
  
  return {
    totalCreditos: creditos.value.length,
    totalDevendo,
    totalPago,
    clientesDevendo
  }
})

const clientesAgrupados = computed(() => {
  const clientesMap = {}
  
  creditos.value.forEach(credito => {
    if (!clientesMap[credito.client_id]) {
      clientesMap[credito.client_id] = {
        id: credito.client_id,
        name: credito.clients?.name || 'Cliente',
        phone: credito.clients?.phone || '',
        pedidos: [],
        totalComprado: 0,
        totalDevendo: 0
      }
    }
    
    clientesMap[credito.client_id].pedidos.push(credito)
    clientesMap[credito.client_id].totalComprado += credito.total
    if (!credito.paid) {
      clientesMap[credito.client_id].totalDevendo += credito.total
    }
  })
  
  return Object.values(clientesMap).sort((a, b) => b.totalDevendo - a.totalDevendo)
})

const formatCurrency = (value) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0)
}

const formatDate = (date) => {
  return new Date(date + 'T00:00:00').toLocaleDateString('pt-BR')
}

const getTotalItems = (credito) => {
  if (credito.products_data) {
    try {
      const products = JSON.parse(credito.products_data)
      return products.length
    } catch (e) {
      return 1
    }
  }
  return 1
}

const loadCreditos = async () => {
  try {
    let query = supabase
      .from('sales')
      .select('*, clients(name, phone, email, address), products(name)')
      .eq('payment_method', 'credito')
      .order('date', { ascending: false })
    
    if (filters.value.date) {
      query = query.eq('date', filters.value.date)
    }
    
    if (filters.value.status === 'pending') {
      query = query.eq('paid', false)
    } else if (filters.value.status === 'paid') {
      query = query.eq('paid', true)
    }
    
    const { data, error } = await query
    if (error) throw error
    
    if (filters.value.search) {
      creditos.value = (data || []).filter(c => 
        c.clients?.name?.toLowerCase().includes(filters.value.search.toLowerCase())
      )
    } else {
      creditos.value = data || []
    }
  } catch (error) {
    console.error('Erro ao carregar crediário:', error)
  }
}

const marcarComoPago = async (credito) => {
  if (!confirm('Confirmar que este crediário foi pago?')) return
  
  try {
    const { error } = await supabase
      .from('sales')
      .update({ paid: true })
      .eq('id', credito.id)
    
    if (error) throw error
    
    alert('✅ Crediário marcado como pago!')
    await loadCreditos()
  } catch (error) {
    alert('Erro ao atualizar: ' + error.message)
  }
}

const desfazerPagamento = async (credito) => {
  if (!confirm('Desfazer pagamento deste crediário?')) return
  
  try {
    const { error } = await supabase
      .from('sales')
      .update({ paid: false })
      .eq('id', credito.id)
    
    if (error) throw error
    
    alert('↩️ Pagamento desfeito!')
    await loadCreditos()
  } catch (error) {
    alert('Erro ao atualizar: ' + error.message)
  }
}

const marcarTudoPago = async (cliente) => {
  if (!confirm(`Marcar todos os ${cliente.pedidos.filter(p => !p.paid).length} crediários de ${cliente.name} como pagos?`)) return
  
  try {
    const pedidosNaoPagos = cliente.pedidos.filter(p => !p.paid)
    
    for (const pedido of pedidosNaoPagos) {
      await supabase
        .from('sales')
        .update({ paid: true })
        .eq('id', pedido.id)
    }
    
    alert('✅ Todos os crediários foram marcados como pagos!')
    await loadCreditos()
  } catch (error) {
    alert('Erro ao atualizar: ' + error.message)
  }
}

const verDetalheCliente = (cliente) => {
  alert(`Detalhes de ${cliente.name}\n\nTotal comprado: ${formatCurrency(cliente.totalComprado)}\nDevendo: ${formatCurrency(cliente.totalDevendo)}`)
}

const generateReceipt = (credito) => {
  alert('Recibo gerado! (implementar geração de PDF)')
}

onMounted(() => {
  loadCreditos()
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
</style>
