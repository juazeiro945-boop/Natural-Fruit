<template>
  <Layout>
    <div class="space-y-4">

      <!-- Header -->
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-xl font-bold text-gray-900">Dashboard</h2>
          <p class="text-gray-500 text-sm">Bem-vindo, {{ authStore.userName }}!</p>
        </div>
        <select v-model="period" @change="loadAllData" class="border border-gray-300 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 bg-white shadow-sm focus:ring-2 focus:ring-primary-500">
          <option value="today">Hoje</option>
          <option value="yesterday">Ontem</option>
          <option value="week">Esta Semana</option>
          <option value="month">Este Mês</option>
        </select>
      </div>

      <!-- Data e Hora -->
      <div class="bg-gradient-to-r from-primary-500 to-primary-600 rounded-xl p-4 text-white flex items-center justify-between">
        <div>
          <p class="text-2xl font-bold">{{ currentTime }}</p>
          <p class="text-sm text-primary-100">{{ currentDate }}</p>
        </div>
        <div class="text-right">
          <p class="text-sm text-primary-100">Período</p>
          <p class="font-bold">{{ periodLabel }}</p>
        </div>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="grid grid-cols-2 gap-3">
        <div v-for="n in 4" :key="n" class="bg-white rounded-xl p-4 animate-pulse">
          <div class="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div class="h-6 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>

      <div v-else class="space-y-4">

        <!-- Cards 2 colunas mobile -->
        <div class="grid grid-cols-2 gap-3">
          <div class="bg-white rounded-xl shadow p-4 border-l-4 border-blue-500">
            <div class="flex items-center gap-2 mb-2">
              <div class="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                </svg>
              </div>
              <p class="text-xs text-gray-500 font-medium">Produzido</p>
            </div>
            <p class="text-2xl font-bold text-gray-900">{{ stats.totalProduced }}</p>
            <p class="text-xs text-blue-600 font-medium mt-1">Efic: {{ efficiency }}%</p>
          </div>

          <div class="bg-white rounded-xl shadow p-4 border-l-4 border-green-500">
            <div class="flex items-center gap-2 mb-2">
              <div class="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </div>
              <p class="text-xs text-gray-500 font-medium">Vendido</p>
            </div>
            <p class="text-lg font-bold text-gray-900">{{ formatCurrency(stats.totalSales) }}</p>
            <p class="text-xs text-green-600 font-medium mt-1">{{ stats.totalSalesCount }} vendas</p>
          </div>

          <div class="bg-white rounded-xl shadow p-4 border-l-4 border-red-500">
            <div class="flex items-center gap-2 mb-2">
              <div class="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6"/>
                </svg>
              </div>
              <p class="text-xs text-gray-500 font-medium">Perdas</p>
            </div>
            <p class="text-2xl font-bold text-gray-900">{{ stats.totalLoss }}</p>
            <p class="text-xs text-red-600 font-medium mt-1">{{ stats.lossPercentage }}% do total</p>
          </div>

          <div class="bg-white rounded-xl shadow p-4 border-l-4 border-amber-500">
            <div class="flex items-center gap-2 mb-2">
              <div class="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"/>
                </svg>
              </div>
              <p class="text-xs text-gray-500 font-medium">Trocas</p>
            </div>
            <p class="text-2xl font-bold text-gray-900">{{ stats.totalExchange }}</p>
            <p class="text-xs text-amber-600 font-medium mt-1">{{ formatCurrency(stats.exchangeValue) }}</p>
          </div>
        </div>

        <!-- Métricas rápidas -->
        <div class="grid grid-cols-3 gap-3">
          <div class="bg-white rounded-xl shadow p-3 text-center">
            <p class="text-xs text-gray-500 mb-1">Ticket Médio</p>
            <p class="text-sm font-bold text-gray-900">{{ formatCurrency(ticketMedio) }}</p>
          </div>
          <div class="bg-white rounded-xl shadow p-3 text-center">
            <p class="text-xs text-gray-500 mb-1">Eficiência</p>
            <p class="text-sm font-bold" :class="efficiency >= 90 ? 'text-green-600' : efficiency >= 80 ? 'text-orange-600' : 'text-red-600'">{{ efficiency }}%</p>
          </div>
          <div class="bg-white rounded-xl shadow p-3 text-center">
            <p class="text-xs text-gray-500 mb-1">Clientes</p>
            <p class="text-sm font-bold text-gray-900">{{ uniqueClients }}</p>
          </div>
        </div>

        <!-- Formas de Pagamento -->
        <div class="bg-white rounded-xl shadow">
          <div class="px-4 py-3 border-b border-gray-100">
            <h3 class="font-bold text-gray-900">💳 Formas de Pagamento</h3>
          </div>
          <div class="p-4 space-y-3">
            <div v-for="payment in paymentMethods" :key="payment.type">
              <div class="flex items-center justify-between mb-1">
                <div class="flex items-center gap-2">
                  <div :class="payment.iconClass" class="w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0">
                    <svg class="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="payment.iconPath"/>
                    </svg>
                  </div>
                  <span class="text-sm font-medium text-gray-700">{{ payment.name }}</span>
                </div>
                <div class="text-right">
                  <span :class="payment.type === 'pending' ? 'text-red-600' : 'text-gray-900'" class="text-sm font-bold">{{ formatCurrency(payment.value) }}</span>
                  <span v-if="payment.type !== 'pending'" class="text-xs text-gray-400 ml-1">{{ payment.percentage }}%</span>
                </div>
              </div>
              <div class="w-full bg-gray-100 rounded-full h-1.5">
                <div :class="payment.barClass" class="h-1.5 rounded-full transition-all duration-500"
                     :style="`width: ${payment.type === 'pending' ? 100 : payment.percentage}%`"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Top Produtos -->
        <div class="bg-white rounded-xl shadow">
          <div class="px-4 py-3 border-b border-gray-100">
            <h3 class="font-bold text-gray-900">🏆 Top Produtos</h3>
          </div>
          <div class="divide-y divide-gray-50">
            <div v-for="(product, index) in stats.topProducts" :key="product.id" class="flex items-center gap-3 px-4 py-3">
              <div :class="getRankColor(index)" class="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 relative">
                <span class="text-white font-bold text-xs">#{{ index + 1 }}</span>
                <span v-if="index === 0" class="absolute -top-1 -right-1 text-xs">👑</span>
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-sm font-semibold text-gray-900 truncate">{{ product.name }}</p>
                <p class="text-xs text-gray-500">{{ product.quantity }} unidades</p>
              </div>
              <p class="text-sm font-bold text-gray-900 flex-shrink-0">{{ formatCurrency(product.total) }}</p>
            </div>
            <div v-if="stats.topProducts.length === 0" class="text-center py-8">
              <p class="text-gray-400 text-sm">Nenhuma venda {{ periodLabel.toLowerCase() }}</p>
            </div>
          </div>
        </div>

        <!-- Pagamentos Pendentes -->
        <div v-if="stats.pendingSales.length > 0" class="bg-white rounded-xl shadow border border-red-100">
          <div class="px-4 py-3 border-b border-red-100 bg-red-50 rounded-t-xl flex items-center justify-between">
            <h3 class="font-bold text-gray-900">⚠️ Pagamentos Pendentes</h3>
            <span class="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">{{ stats.pendingSales.length }}</span>
          </div>
          <div class="divide-y divide-gray-50">
            <div v-for="sale in stats.pendingSales" :key="sale.id" class="px-4 py-3 flex items-center justify-between">
              <div class="flex-1 min-w-0">
                <p class="text-sm font-semibold text-gray-900 truncate">{{ sale.client_name }}</p>
                <p class="text-xs text-gray-500 truncate">{{ sale.product_name }} • {{ formatDate(sale.date) }}</p>
              </div>
              <div class="ml-3 flex-shrink-0 text-right">
                <p class="text-sm font-bold text-red-600">{{ formatCurrency(sale.total) }}</p>
                <span class="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">Pendente</span>
              </div>
            </div>
          </div>
        </div>

      </div>

      <!-- Erro -->
      <div v-if="error" class="fixed bottom-24 right-4 left-4 bg-red-500 text-white p-3 rounded-lg shadow-lg z-40 flex items-center gap-2">
        <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
        <p class="text-sm flex-1">{{ error }}</p>
        <button @click="error = ''" class="text-white font-bold text-lg leading-none">×</button>
      </div>

    </div>
  </Layout>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useAuthStore } from '../stores/auth'
import { supabase } from '../lib/supabase'
import Layout from '../components/Layout.vue'

const authStore = useAuthStore()
const currentTime = ref('')
const currentDate = ref('')
const loading = ref(true)
const error = ref('')
const period = ref('today')
let timeInterval = null
let realtimeChannel = null

const stats = ref({
  totalProduced: 0, totalSales: 0, totalSalesCount: 0,
  totalLoss: 0, totalExchange: 0, lossPercentage: 0,
  exchangePercentage: 0, lossValue: 0, exchangeValue: 0,
  salesByPayment: { cash: 0, pix: 0, boleto: 0, pending: 0 },
  topProducts: [], pendingSales: []
})

const periodLabel = computed(() => ({ today: 'Hoje', yesterday: 'Ontem', week: 'Esta Semana', month: 'Este Mês' })[period.value] || 'Hoje')
const efficiency = computed(() => stats.value.totalProduced === 0 ? 0 : Math.round(((stats.value.totalProduced - stats.value.totalLoss) / stats.value.totalProduced) * 100))
const ticketMedio = computed(() => stats.value.totalSalesCount === 0 ? 0 : stats.value.totalSales / stats.value.totalSalesCount)
const uniqueClients = computed(() => new Set(stats.value.pendingSales.map(s => s.client_id).filter(Boolean)).size)

const paymentMethods = computed(() => {
  const t = stats.value.salesByPayment.cash + stats.value.salesByPayment.pix + stats.value.salesByPayment.boleto
  return [
    { type: 'cash', name: 'Dinheiro', value: stats.value.salesByPayment.cash, percentage: t > 0 ? ((stats.value.salesByPayment.cash / t) * 100).toFixed(1) : 0, iconPath: 'M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z', iconClass: 'bg-green-500', barClass: 'bg-green-500' },
    { type: 'pix', name: 'PIX', value: stats.value.salesByPayment.pix, percentage: t > 0 ? ((stats.value.salesByPayment.pix / t) * 100).toFixed(1) : 0, iconPath: 'M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z', iconClass: 'bg-purple-500', barClass: 'bg-purple-500' },
    { type: 'boleto', name: 'Boleto', value: stats.value.salesByPayment.boleto, percentage: t > 0 ? ((stats.value.salesByPayment.boleto / t) * 100).toFixed(1) : 0, iconPath: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z', iconClass: 'bg-blue-500', barClass: 'bg-blue-500' },
    { type: 'pending', name: 'A Receber', value: stats.value.salesByPayment.pending, percentage: 100, iconPath: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z', iconClass: 'bg-red-500', barClass: 'bg-red-500 animate-pulse' }
  ]
})

const updateDateTime = () => {
  const now = new Date()
  currentTime.value = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  currentDate.value = now.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

const formatCurrency = (v) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v || 0)
const formatDate = (d) => new Date(d).toLocaleDateString('pt-BR')
const getRankColor = (i) => ['bg-yellow-500','bg-gray-400','bg-orange-600','bg-blue-500','bg-purple-500'][i] || 'bg-gray-500'

const getDateRange = () => {
  const now = new Date(), today = now.toISOString().split('T')[0]
  if (period.value === 'yesterday') { const y = new Date(now); y.setDate(y.getDate()-1); return y.toISOString().split('T')[0] }
  if (period.value === 'week') { const w = new Date(now); w.setDate(w.getDate()-7); return { start: w.toISOString().split('T')[0], end: today } }
  if (period.value === 'month') { const m = new Date(now); m.setMonth(m.getMonth()-1); return { start: m.toISOString().split('T')[0], end: today } }
  return today
}

const loadAllData = async () => {
  loading.value = true; error.value = ''
  try {
    const dr = getDateRange()
    await Promise.all([loadProductionData(dr), loadSalesData(dr)])
  } catch (err) { error.value = err.message || 'Erro ao carregar dados' }
  finally { loading.value = false }
}

const loadProductionData = async (dr) => {
  let q = supabase.from('production').select('*')
  q = typeof dr === 'object' ? q.gte('date', dr.start).lte('date', dr.end) : q.eq('date', dr)
  const { data, error: e } = await q
  if (e) throw new Error(e.message)
  if (data) {
    stats.value.totalProduced = data.reduce((s,p) => s+(p.quantity||0), 0)
    stats.value.totalLoss = data.reduce((s,p) => s+(p.loss||0), 0)
    stats.value.totalExchange = data.reduce((s,p) => s+(p.exchange||0), 0)
    stats.value.lossValue = data.reduce((s,p) => s+(p.loss_value||0), 0)
    stats.value.exchangeValue = data.reduce((s,p) => s+(p.exchange_value||0), 0)
    stats.value.lossPercentage = stats.value.totalProduced > 0 ? ((stats.value.totalLoss/stats.value.totalProduced)*100).toFixed(1) : 0
    stats.value.exchangePercentage = stats.value.totalProduced > 0 ? ((stats.value.totalExchange/stats.value.totalProduced)*100).toFixed(1) : 0
  }
}

const loadSalesData = async (dr) => {
  let q = supabase.from('sales').select('*, clients(id,name), products(id,name)')
  q = typeof dr === 'object' ? q.gte('date', dr.start).lte('date', dr.end) : q.eq('date', dr)
  const { data, error: e } = await q
  if (e) throw new Error(e.message)
  if (data) {
    stats.value.totalSales = data.reduce((s,x) => s+(x.total||0), 0)
    stats.value.totalSalesCount = data.length
    const paid = data.filter(s => s.paid)
    stats.value.salesByPayment = {
      cash: paid.filter(s=>s.payment_method==='cash').reduce((s,x)=>s+(x.total||0),0),
      pix: paid.filter(s=>s.payment_method==='pix').reduce((s,x)=>s+(x.total||0),0),
      boleto: paid.filter(s=>s.payment_method==='boleto').reduce((s,x)=>s+(x.total||0),0),
      pending: data.filter(s=>!s.paid).reduce((s,x)=>s+(x.total||0),0)
    }
    stats.value.pendingSales = data.filter(s=>!s.paid).map(s=>({...s, client_name: s.clients?.name||'Não identificado', product_name: s.products?.name||'Não especificado'}))
    const pm = {}
    data.forEach(item => {
      if (!pm[item.product_id]) pm[item.product_id] = { id: item.product_id, name: item.products?.name||'Produto', quantity: 0, total: 0 }
      pm[item.product_id].quantity += item.quantity||0
      pm[item.product_id].total += item.total||0
    })
    stats.value.topProducts = Object.values(pm).sort((a,b)=>b.total-a.total).slice(0,5)
  }
}

const setupRealtime = () => {
  realtimeChannel = supabase.channel('dashboard-realtime')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'production' }, () => loadAllData())
    .on('postgres_changes', { event: '*', schema: 'public', table: 'sales' }, () => loadAllData())
    .subscribe()
}

onMounted(() => {
  updateDateTime()
  timeInterval = setInterval(updateDateTime, 1000)
  loadAllData()
  setupRealtime()
})

onUnmounted(() => {
  if (timeInterval) clearInterval(timeInterval)
  if (realtimeChannel) supabase.removeChannel(realtimeChannel)
})
</script>
