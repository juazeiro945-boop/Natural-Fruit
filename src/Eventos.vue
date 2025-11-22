<template>
  <Layout>
    <div class="space-y-4 md:space-y-6 pb-20 md:pb-6">
      <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 class="text-2xl md:text-3xl font-bold text-gray-900">🎉 Eventos</h2>
          <p class="text-gray-600 mt-1">Gerencie pedidos para eventos especiais</p>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div class="card text-center">
          <div class="text-4xl mb-2">🎉</div>
          <div class="text-3xl font-bold text-purple-600">{{ stats.total }}</div>
          <div class="text-sm text-gray-600">Total de Eventos</div>
        </div>
        <div class="card text-center">
          <div class="text-4xl mb-2">🕐</div>
          <div class="text-3xl font-bold text-yellow-600">{{ stats.pendentes }}</div>
          <div class="text-sm text-gray-600">Pendentes</div>
        </div>
        <div class="card text-center">
          <div class="text-4xl mb-2">✅</div>
          <div class="text-3xl font-bold text-green-600">{{ stats.concluidos }}</div>
          <div class="text-sm text-gray-600">Concluídos</div>
        </div>
        <div class="card text-center">
          <div class="text-4xl mb-2">💰</div>
          <div class="text-3xl font-bold text-primary-600">{{ formatCurrency(stats.totalValor) }}</div>
          <div class="text-sm text-gray-600">Valor Total</div>
        </div>
      </div>

      <div class="card">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label class="label text-sm">Data</label>
            <input v-model="filters.date" type="date" class="input-field" @change="loadEventos" />
          </div>
          <div>
            <label class="label text-sm">Status</label>
            <select v-model="filters.status" class="input-field" @change="loadEventos">
              <option value="">Todos</option>
              <option value="pendente">🕐 Pendente</option>
              <option value="em_rota">🚚 Em Rota</option>
              <option value="entregue">✅ Entregue</option>
              <option value="cancelado">❌ Cancelado</option>
            </select>
          </div>
          <div>
            <label class="label text-sm">Buscar Evento</label>
            <input v-model="filters.search" type="text" class="input-field" placeholder="Nome do evento..." @input="loadEventos" />
          </div>
        </div>
      </div>

      <!-- Lista de Eventos -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div v-for="evento in eventos" :key="evento.id" class="card hover:shadow-xl transition-shadow border-l-4 border-purple-500">
          <div class="flex justify-between items-start mb-3">
            <div class="flex-1">
              <div class="flex items-center space-x-2 mb-2">
                <span class="text-2xl">🎉</span>
                <h3 class="font-bold text-lg text-purple-700">{{ evento.event_name }}</h3>
              </div>
              <p class="text-sm text-gray-500">Pedido #{{ evento.id.slice(0, 8) }}</p>
            </div>
            <span :class="getStatusBadge(evento.order_status)" class="text-xs px-2 py-1 rounded-full font-semibold">
              {{ getStatusLabel(evento.order_status) }}
            </span>
          </div>

          <div class="space-y-2 mb-4">
            <div class="flex items-center space-x-2">
              <span class="text-lg">👤</span>
              <div class="flex-1">
                <p class="text-sm text-gray-600">Cliente</p>
                <p class="font-semibold">{{ evento.clients?.name }}</p>
              </div>
            </div>

            <div class="flex items-center space-x-2">
              <span class="text-lg">📞</span>
              <div class="flex-1">
                <p class="text-sm text-gray-600">Telefone</p>
                <p class="font-semibold">{{ evento.clients?.phone || 'Não informado' }}</p>
              </div>
            </div>

            <div class="flex items-center space-x-2">
              <span class="text-lg">📅</span>
              <div class="flex-1">
                <p class="text-sm text-gray-600">Data do Evento</p>
                <p class="font-semibold">{{ formatDate(evento.date) }}</p>
              </div>
            </div>

            <div class="flex items-center space-x-2">
              <span class="text-lg">📦</span>
              <div class="flex-1">
                <p class="text-sm text-gray-600">Itens</p>
                <p class="font-semibold text-primary-600">{{ getTotalItems(evento) }} produtos</p>
              </div>
            </div>

            <div class="flex items-center space-x-2">
              <span class="text-lg">💰</span>
              <div class="flex-1">
                <p class="text-sm text-gray-600">Valor Total</p>
                <p class="font-bold text-lg text-primary-600">{{ formatCurrency(evento.total) }}</p>
              </div>
            </div>

            <div class="flex items-center space-x-2">
              <span class="text-lg">💳</span>
              <div class="flex-1">
                <p class="text-sm text-gray-600">Pagamento</p>
                <p class="font-semibold">{{ getPaymentLabel(evento.payment_method) }}</p>
                <span :class="evento.paid ? 'text-green-600' : 'text-red-600'" class="text-xs font-semibold">
                  {{ evento.paid ? '✅ Pago' : '⏳ Pendente' }}
                </span>
              </div>
            </div>

            <div v-if="evento.notes" class="flex items-start space-x-2 bg-gray-50 p-2 rounded">
              <span class="text-lg">📝</span>
              <div class="flex-1">
                <p class="text-sm text-gray-600">Observações</p>
                <p class="text-sm">{{ evento.notes }}</p>
              </div>
            </div>
          </div>

          <div class="flex gap-2">
            <button @click="viewDetails(evento)" class="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg font-semibold transition-colors text-sm">
              👁️ Ver Detalhes
            </button>
            <button @click="generateReceipt(evento)" class="flex-1 bg-primary-500 hover:bg-primary-600 text-white py-2 rounded-lg font-semibold transition-colors text-sm">
              📄 Recibo
            </button>
          </div>
        </div>
      </div>

      <div v-if="eventos.length === 0" class="card text-center py-12">
        <div class="text-gray-400 mb-4">
          <span class="text-6xl">🎉</span>
        </div>
        <p class="text-gray-600 font-medium">Nenhum evento encontrado</p>
        <p class="text-gray-500 text-sm mt-2">Pedidos de eventos aparecerão aqui</p>
      </div>

      <!-- Modal Detalhes -->
      <div v-if="showDetailsModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
        <div class="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div class="sticky top-0 bg-gradient-to-r from-purple-500 to-purple-600 px-6 py-4 flex items-center justify-between z-10">
            <h3 class="text-xl font-bold text-white">🎉 Detalhes do Evento</h3>
            <button @click="closeDetailsModal" class="text-white hover:bg-purple-700 p-2 rounded-lg transition-colors text-2xl">×</button>
          </div>
          
          <div v-if="selectedEvento" class="p-6 space-y-4">
            <div class="card bg-purple-50 border-2 border-purple-200">
              <h4 class="font-bold text-xl text-purple-900 mb-2">{{ selectedEvento.event_name }}</h4>
              <p class="text-sm text-gray-600">Cliente: {{ selectedEvento.clients?.name }}</p>
              <p class="text-sm text-gray-600">Data: {{ formatDate(selectedEvento.date) }}</p>
            </div>

            <div class="card bg-green-50">
              <h5 class="font-bold mb-3 text-green-900">📦 Produtos ({{ getTotalItems(selectedEvento) }} itens)</h5>
              <div class="space-y-2">
                <div v-for="(item, index) in parseProducts(selectedEvento)" :key="index" class="bg-white p-3 rounded-lg">
                  <div class="flex justify-between items-start">
                    <div class="flex-1">
                      <p class="font-semibold">{{ item.name }}</p>
                      <p class="text-sm text-gray-600">Qtd: {{ item.quantity }} × {{ formatCurrency(item.unit_price) }}</p>
                    </div>
                    <p class="font-bold text-green-700">{{ formatCurrency(item.total) }}</p>
                  </div>
                </div>
              </div>
            </div>

            <div class="card bg-primary-50 border-2 border-primary-300">
              <div class="flex justify-between items-center">
                <span class="font-bold text-lg">VALOR TOTAL:</span>
                <span class="font-bold text-2xl text-primary-700">{{ formatCurrency(selectedEvento.total) }}</span>
              </div>
            </div>

            <button @click="closeDetailsModal" class="w-full btn-outline">Fechar</button>
          </div>
        </div>
      </div>
    </div>
  </Layout>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { supabase } from '../lib/supabase'
import Layout from '../components/Layout.vue'
import jsPDF from 'jspdf'

const eventos = ref([])
const showDetailsModal = ref(false)
const selectedEvento = ref(null)

const filters = ref({
  date: '',
  status: '',
  search: ''
})

const stats = computed(() => {
  return {
    total: eventos.value.length,
    pendentes: eventos.value.filter(e => e.order_status === 'pendente' || e.order_status === 'em_rota').length,
    concluidos: eventos.value.filter(e => e.order_status === 'entregue').length,
    totalValor: eventos.value.reduce((sum, e) => sum + (e.total || 0), 0)
  }
})

const formatCurrency = (value) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0)
}

const formatDate = (date) => {
  return new Date(date + 'T00:00:00').toLocaleDateString('pt-BR')
}

const formatDateTime = (date) => {
  return new Date(date).toLocaleString('pt-BR')
}

const getStatusLabel = (status) => {
  const labels = {
    'pendente': '🕐 Pendente',
    'em_rota': '🚚 Em Rota',
    'entregue': '✅ Entregue',
    'cancelado': '❌ Cancelado'
  }
  return labels[status] || status
}

const getStatusBadge = (status) => {
  const badges = {
    'pendente': 'bg-yellow-100 text-yellow-700',
    'em_rota': 'bg-blue-100 text-blue-700',
    'entregue': 'bg-green-100 text-green-700',
    'cancelado': 'bg-red-100 text-red-700'
  }
  return badges[status] || 'bg-gray-100 text-gray-700'
}

const getPaymentLabel = (method) => {
  const labels = { 
    cash: 'Dinheiro', 
    pix: 'PIX', 
    boleto: 'Boleto',
    card: 'Cartão',
    credito: 'Crediário'
  }
  return labels[method] || method
}

const getTotalItems = (evento) => {
  if (evento.products_data) {
    try {
      const products = JSON.parse(evento.products_data)
      return products.length
    } catch (e) {
      return 1
    }
  }
  return 1
}

const parseProducts = (evento) => {
  if (evento.products_data) {
    try {
      return JSON.parse(evento.products_data)
    } catch (e) {
      return [{
        name: evento.products?.name || 'Produto',
        quantity: evento.quantity,
        unit_price: evento.unit_price || (evento.total / evento.quantity),
        total: evento.total
      }]
    }
  }
  return [{
    name: evento.products?.name || 'Produto',
    quantity: evento.quantity,
    unit_price: evento.unit_price || (evento.total / evento.quantity),
    total: evento.total
  }]
}

const loadEventos = async () => {
  try {
    let query = supabase
      .from('sales')
      .select('*, clients(name, phone, email, address), products(name)')
      .eq('is_event', true)
      .order('date', { ascending: false })
    
    if (filters.value.date) {
      query = query.eq('date', filters.value.date)
    }
    
    if (filters.value.status) {
      query = query.eq('order_status', filters.value.status)
    }
    
    const { data, error } = await query
    if (error) throw error
    
    if (filters.value.search) {
      eventos.value = (data || []).filter(e => 
        e.event_name?.toLowerCase().includes(filters.value.search.toLowerCase())
      )
    } else {
      eventos.value = data || []
    }
  } catch (error) {
    console.error('Erro ao carregar eventos:', error)
  }
}

const viewDetails = (evento) => {
  selectedEvento.value = evento
  showDetailsModal.value = true
}

const closeDetailsModal = () => {
  showDetailsModal.value = false
  selectedEvento.value = null
}

const generateReceipt = async (evento) => {
  // Mesmo código de geração de PDF da tela de vendas
  alert('Recibo gerado! (implementar geração de PDF)')
}

onMounted(() => {
  loadEventos()
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

.btn-outline {
  @apply px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium;
}
</style>
