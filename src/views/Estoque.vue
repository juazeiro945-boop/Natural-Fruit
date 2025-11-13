<template>
  <Layout>
    <div class="space-y-4 md:space-y-6 pb-20 md:pb-6">
      <!-- Header -->
      <div class="flex flex-col space-y-3 md:space-y-0 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 class="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900">Estoque</h2>
          <p class="text-sm md:text-base text-gray-600 mt-1">Gerencie entradas e saídas de produtos</p>
        </div>
        <button @click="showEntryModal = true" class="btn-primary w-full md:w-auto text-sm md:text-base">
          <svg class="w-4 h-4 md:w-5 md:h-5 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
          </svg>
          Registrar Entrada
        </button>
      </div>

      <!-- Filtros Mobile Friendly -->
      <div class="card">
        <div class="space-y-3 md:space-y-0 md:flex md:gap-4">
          <div class="flex-1">
            <label class="label text-xs md:text-sm">Filtrar por Produto</label>
            <select v-model="filterProduct" @change="loadMovements" class="input-field text-sm">
              <option value="">Todos os produtos</option>
              <option v-for="product in products" :key="product.id" :value="product.id">
                {{ product.name }}
              </option>
            </select>
          </div>
          <div class="flex-1">
            <label class="label text-xs md:text-sm">Tipo</label>
            <select v-model="filterType" @change="loadMovements" class="input-field text-sm">
              <option value="">Todos</option>
              <option value="entry">Entradas</option>
              <option value="sale">Saídas</option>
              <option value="loss">Perdas</option>
              <option value="adjustment">Ajustes</option>
            </select>
          </div>
          <div class="flex-1">
            <label class="label text-xs md:text-sm">Data</label>
            <input v-model="filterDate" type="date" @change="loadMovements" class="input-field text-sm" />
          </div>
        </div>
      </div>

      <!-- Cards de Resumo - Responsivo -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <div class="card bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 p-3 md:p-4">
          <div class="flex flex-col md:flex-row md:items-center md:justify-between">
            <div class="flex-1">
              <p class="text-xs md:text-sm text-blue-600 font-medium">Produtos</p>
              <p class="text-xl md:text-3xl font-bold text-blue-900 mt-1">{{ products.length }}</p>
            </div>
            <div class="hidden md:flex w-12 h-12 bg-blue-500 rounded-xl items-center justify-center">
              <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
              </svg>
            </div>
          </div>
        </div>

        <div class="card bg-gradient-to-br from-green-50 to-green-100 border-green-200 p-3 md:p-4">
          <div class="flex flex-col md:flex-row md:items-center md:justify-between">
            <div class="flex-1">
              <p class="text-xs md:text-sm text-green-600 font-medium">Valor Total</p>
              <p class="text-lg md:text-3xl font-bold text-green-900 mt-1">{{ formatCurrency(totalStockValue, true) }}</p>
            </div>
            <div class="hidden md:flex w-12 h-12 bg-green-500 rounded-xl items-center justify-center">
              <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
          </div>
        </div>

        <div class="card bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200 p-3 md:p-4">
          <div class="flex flex-col md:flex-row md:items-center md:justify-between">
            <div class="flex-1">
              <p class="text-xs md:text-sm text-orange-600 font-medium">Estoque Baixo</p>
              <p class="text-xl md:text-3xl font-bold text-orange-900 mt-1">{{ lowStockProducts }}</p>
            </div>
            <div class="hidden md:flex w-12 h-12 bg-orange-500 rounded-xl items-center justify-center">
              <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
              </svg>
            </div>
          </div>
        </div>

        <div class="card bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 p-3 md:p-4">
          <div class="flex flex-col md:flex-row md:items-center md:justify-between">
            <div class="flex-1">
              <p class="text-xs md:text-sm text-purple-600 font-medium">Hoje</p>
              <p class="text-xl md:text-3xl font-bold text-purple-900 mt-1">{{ todayMovements }}</p>
            </div>
            <div class="hidden md:flex w-12 h-12 bg-purple-500 rounded-xl items-center justify-center">
              <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"/>
              </svg>
            </div>
          </div>
        </div>
      </div>

      <!-- Estoque Atual - Cards no Mobile, Tabela no Desktop -->
      <div class="card">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-base md:text-lg font-bold text-gray-900">Estoque Atual</h3>
          <button @click="loadProducts" class="text-primary-600 hover:text-primary-700">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
            </svg>
          </button>
        </div>

        <!-- Mobile: Cards -->
        <div class="md:hidden space-y-3">
          <div v-for="product in products" :key="product.id" 
               class="p-3 rounded-lg border-2"
               :class="getStockBorderClass(product.stock_quantity)">
            <div class="flex items-center justify-between mb-2">
              <div class="flex-1">
                <div class="font-semibold text-gray-900 text-sm">{{ product.name }}</div>
                <div class="text-xs text-gray-500">{{ product.unit }}</div>
              </div>
              <span :class="getStockBadgeClass(product.stock_quantity)" class="px-2 py-1 rounded-full text-xs font-semibold whitespace-nowrap ml-2">
                {{ getStockStatus(product.stock_quantity) }}
              </span>
            </div>
            <div class="grid grid-cols-3 gap-2 text-center">
              <div>
                <div class="text-xs text-gray-500">Estoque</div>
                <div class="text-base font-bold" :class="getStockColorClass(product.stock_quantity)">
                  {{ product.stock_quantity || 0 }}
                </div>
              </div>
              <div>
                <div class="text-xs text-gray-500">Custo</div>
                <div class="text-xs font-semibold text-gray-700">{{ formatCurrency(product.average_cost || 0, true) }}</div>
              </div>
              <div>
                <div class="text-xs text-gray-500">Total</div>
                <div class="text-xs font-bold text-gray-900">{{ formatCurrency((product.stock_quantity || 0) * (product.average_cost || 0), true) }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Desktop: Tabela -->
        <div class="hidden md:block overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gray-50 border-b-2 border-gray-200">
              <tr>
                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Produto</th>
                <th class="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Estoque</th>
                <th class="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Custo Médio</th>
                <th class="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Valor Total</th>
                <th class="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Status</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
              <tr v-for="product in products" :key="product.id" class="hover:bg-gray-50 transition-colors">
                <td class="px-4 py-3">
                  <div class="font-semibold text-gray-900">{{ product.name }}</div>
                  <div class="text-xs text-gray-500">{{ product.unit }}</div>
                </td>
                <td class="px-4 py-3 text-center">
                  <span class="text-lg font-bold" :class="getStockColorClass(product.stock_quantity)">
                    {{ product.stock_quantity || 0 }}
                  </span>
                </td>
                <td class="px-4 py-3 text-right">
                  <span class="text-sm text-gray-700">{{ formatCurrency(product.average_cost || 0) }}</span>
                </td>
                <td class="px-4 py-3 text-right">
                  <span class="font-bold text-gray-900">{{ formatCurrency((product.stock_quantity || 0) * (product.average_cost || 0)) }}</span>
                </td>
                <td class="px-4 py-3 text-center">
                  <span :class="getStockBadgeClass(product.stock_quantity)" class="px-3 py-1 rounded-full text-xs font-semibold">
                    {{ getStockStatus(product.stock_quantity) }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Histórico de Movimentações -->
      <div class="card">
        <h3 class="text-base md:text-lg font-bold text-gray-900 mb-4">Histórico de Movimentações</h3>
        
        <div v-if="loading" class="text-center py-8">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p class="text-gray-600 mt-4 text-sm">Carregando...</p>
        </div>

        <div v-else class="space-y-3">
          <div
            v-for="movement in movements"
            :key="movement.id"
            class="p-3 md:p-4 rounded-lg border-2 transition-all hover:shadow-md"
            :class="getMovementBorderClass(movement.type)"
          >
            <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div class="flex items-start space-x-3">
                <div :class="getMovementIconClass(movement.type)" class="w-8 h-8 md:w-10 md:h-10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg class="w-4 h-4 md:w-5 md:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="getMovementIconPath(movement.type)"/>
                  </svg>
                </div>
                <div class="flex-1 min-w-0">
                  <div class="flex flex-wrap items-center gap-2">
                    <span class="font-bold text-gray-900 text-sm md:text-base">{{ movement.products?.name }}</span>
                    <span :class="getMovementBadgeClass(movement.type)" class="px-2 py-0.5 rounded text-xs font-semibold">
                      {{ getMovementTypeName(movement.type) }}
                    </span>
                  </div>
                  <div class="text-xs md:text-sm text-gray-600 mt-1">
                    {{ formatDate(movement.date) }}
                    <span v-if="movement.supplier" class="ml-2">• {{ movement.supplier }}</span>
                  </div>
                  <p v-if="movement.notes" class="text-xs text-gray-500 mt-1 line-clamp-2">{{ movement.notes }}</p>
                </div>
              </div>
              
              <div class="flex items-center justify-between md:justify-end space-x-4 md:text-right pl-11 md:pl-0">
                <div>
                  <div class="text-xs text-gray-600">Qtd</div>
                  <div class="text-base md:text-lg font-bold" :class="movement.type === 'entry' ? 'text-green-600' : 'text-red-600'">
                    {{ movement.type === 'entry' ? '+' : '-' }}{{ movement.quantity }}
                  </div>
                </div>
                <div v-if="movement.total_cost">
                  <div class="text-xs text-gray-600">Custo</div>
                  <div class="text-sm md:text-lg font-bold text-gray-900">{{ formatCurrency(movement.total_cost, true) }}</div>
                </div>
              </div>
            </div>
          </div>

          <div v-if="movements.length === 0" class="text-center py-12">
            <div class="text-4xl md:text-6xl mb-4">📦</div>
            <p class="text-gray-600 text-sm md:text-base">Nenhuma movimentação encontrada</p>
          </div>
        </div>
      </div>

      <!-- Modal de Entrada - Mobile Friendly -->
      <div v-if="showEntryModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" @click.self="closeEntryModal">
        <div class="bg-white rounded-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
          <div class="sticky top-0 bg-white border-b px-4 md:px-6 py-4 flex items-center justify-between">
            <h3 class="text-lg md:text-xl font-bold">Registrar Entrada</h3>
            <button @click="closeEntryModal" class="text-gray-400 hover:text-gray-600">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>

          <form @submit.prevent="saveEntry" class="p-4 md:p-6 space-y-4">
            <div>
              <label class="label text-sm">Data</label>
              <input v-model="entryForm.date" type="date" required class="input-field text-sm" />
            </div>

            <div>
              <label class="label text-sm">Produto *</label>
              <select v-model="entryForm.product_id" required class="input-field text-sm">
                <option value="">Selecione</option>
                <option v-for="product in products" :key="product.id" :value="product.id">
                  {{ product.name }} ({{ product.stock_quantity || 0 }} {{ product.unit }})
                </option>
              </select>
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="label text-sm">Quantidade *</label>
                <input
                  v-model.number="entryForm.quantity"
                  type="number"
                  min="0.01"
                  step="0.01"
                  required
                  class="input-field text-sm"
                  @input="calculateEntryTotal"
                />
              </div>

              <div>
                <label class="label text-sm">Custo Unit. *</label>
                <input
                  v-model.number="entryForm.unit_cost"
                  type="number"
                  min="0"
                  step="0.01"
                  required
                  class="input-field text-sm"
                  @input="calculateEntryTotal"
                />
              </div>
            </div>

            <div>
              <label class="label text-sm">Custo Total</label>
              <input
                v-model.number="entryForm.total_cost"
                type="number"
                step="0.01"
                readonly
                class="input-field bg-gray-100 font-bold text-sm"
              />
            </div>

            <div>
              <label class="label text-sm">Fornecedor</label>
              <input v-model="entryForm.supplier" class="input-field text-sm" placeholder="Nome do fornecedor" />
            </div>

            <div>
              <label class="label text-sm">Observações</label>
              <textarea
                v-model="entryForm.notes"
                class="input-field text-sm"
                rows="3"
                placeholder="Notas sobre a entrada..."
              ></textarea>
            </div>

            <div class="flex flex-col-reverse md:flex-row space-y-3 space-y-reverse md:space-y-0 md:space-x-3 pt-4">
              <button type="button" @click="closeEntryModal" class="flex-1 btn-outline text-sm md:text-base">
                Cancelar
              </button>
              <button type="submit" :disabled="loadingEntry" class="flex-1 btn-primary text-sm md:text-base">
                {{ loadingEntry ? 'Salvando...' : 'Salvar' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </Layout>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { supabase } from '../lib/supabase'
import Layout from '../components/Layout.vue'

const products = ref([])
const movements = ref([])
const loading = ref(false)
const loadingEntry = ref(false)
const showEntryModal = ref(false)

const filterProduct = ref('')
const filterType = ref('')
const filterDate = ref('')

const entryForm = ref({
  date: new Date().toISOString().split('T')[0],
  product_id: '',
  quantity: 0,
  unit_cost: 0,
  total_cost: 0,
  supplier: '',
  notes: ''
})

let realtimeChannel = null

// Computed
const totalStockValue = computed(() => {
  return products.value.reduce((sum, p) => {
    return sum + ((p.stock_quantity || 0) * (p.average_cost || 0))
  }, 0)
})

const lowStockProducts = computed(() => {
  return products.value.filter(p => (p.stock_quantity || 0) < 10).length
})

const todayMovements = computed(() => {
  const today = new Date().toISOString().split('T')[0]
  return movements.value.filter(m => m.date === today).length
})

// Funções de utilidade
const formatCurrency = (value, compact = false) => {
  const formatted = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value || 0)
  
  if (compact && window.innerWidth < 768) {
    return formatted.replace('R$', 'R$').replace(',00', '')
  }
  return formatted
}

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('pt-BR')
}

const calculateEntryTotal = () => {
  entryForm.value.total_cost = entryForm.value.quantity * entryForm.value.unit_cost
}

const getStockColorClass = (quantity) => {
  if (quantity <= 0) return 'text-red-600'
  if (quantity < 10) return 'text-orange-600'
  return 'text-green-600'
}

const getStockBadgeClass = (quantity) => {
  if (quantity <= 0) return 'bg-red-100 text-red-700'
  if (quantity < 10) return 'bg-orange-100 text-orange-700'
  return 'bg-green-100 text-green-700'
}

const getStockBorderClass = (quantity) => {
  if (quantity <= 0) return 'border-red-200 bg-red-50'
  if (quantity < 10) return 'border-orange-200 bg-orange-50'
  return 'border-green-200 bg-green-50'
}

const getStockStatus = (quantity) => {
  if (quantity <= 0) return 'Esgotado'
  if (quantity < 10) return 'Baixo'
  return 'OK'
}

const getMovementBorderClass = (type) => {
  const classes = {
    entry: 'border-green-200 bg-green-50',
    sale: 'border-blue-200 bg-blue-50',
    loss: 'border-red-200 bg-red-50',
    adjustment: 'border-purple-200 bg-purple-50'
  }
  return classes[type] || 'border-gray-200'
}

const getMovementIconClass = (type) => {
  const classes = {
    entry: 'bg-green-500',
    sale: 'bg-blue-500',
    loss: 'bg-red-500',
    adjustment: 'bg-purple-500'
  }
  return classes[type] || 'bg-gray-500'
}

const getMovementIconPath = (type) => {
  const paths = {
    entry: 'M7 11l5-5m0 0l5 5m-5-5v12',
    sale: 'M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z',
    loss: 'M19 14l-7 7m0 0l-7-7m7 7V3',
    adjustment: 'M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4'
  }
  return paths[type] || 'M12 6v6m0 0v6m0-6h6m-6 0H6'
}

const getMovementBadgeClass = (type) => {
  const classes = {
    entry: 'bg-green-100 text-green-700',
    sale: 'bg-blue-100 text-blue-700',
    loss: 'bg-red-100 text-red-700',
    adjustment: 'bg-purple-100 text-purple-700'
  }
  return classes[type] || 'bg-gray-100 text-gray-700'
}

const getMovementTypeName = (type) => {
  const names = {
    entry: 'Entrada',
    sale: 'Venda',
    loss: 'Perda',
    adjustment: 'Ajuste'
  }
  return names[type] || type
}

// Carregar dados
const loadProducts = async () => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('active', true)
      .order('name')

    if (error) throw error
    products.value = data || []
  } catch (error) {
    console.error('Erro ao carregar produtos:', error)
  }
}

const loadMovements = async () => {
  loading.value = true
  try {
    let query = supabase
      .from('stock_movements')
      .select(`
        *,
        products (name, unit)
      `)
      .order('created_at', { ascending: false })
      .limit(50)

    if (filterProduct.value) {
      query = query.eq('product_id', filterProduct.value)
    }

    if (filterType.value) {
      query = query.eq('type', filterType.value)
    }

    if (filterDate.value) {
      query = query.eq('date', filterDate.value)
    }

    const { data, error } = await query

    if (error) throw error
    movements.value = data || []
  } catch (error) {
    console.error('Erro ao carregar movimentações:', error)
  } finally {
    loading.value = false
  }
}

const closeEntryModal = () => {
  showEntryModal.value = false
  entryForm.value = {
    date: new Date().toISOString().split('T')[0],
    product_id: '',
    quantity: 0,
    unit_cost: 0,
    total_cost: 0,
    supplier: '',
    notes: ''
  }
}

const saveEntry = async () => {
  loadingEntry.value = true
  try {
    const { error } = await supabase
      .from('stock_movements')
      .insert([{
        product_id: entryForm.value.product_id,
        type: 'entry',
        quantity: entryForm.value.quantity,
        unit_cost: entryForm.value.unit_cost,
        total_cost: entryForm.value.total_cost,
        supplier: entryForm.value.supplier,
        notes: entryForm.value.notes,
        date: entryForm.value.date
      }])

    if (error) throw error

    await Promise.all([loadProducts(), loadMovements()])
    closeEntryModal()
  } catch (error) {
    console.error('Erro ao salvar entrada:', error)
    alert('Erro ao salvar entrada: ' + error.message)
  } finally {
    loadingEntry.value = false
  }
}

// Realtime
const setupRealtime = () => {
  realtimeChannel = supabase
    .channel('stock-realtime')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'stock_movements' },
      () => {
        loadProducts()
        loadMovements()
      }
    )
    .on(
      'postgres_changes',
      { event: 'UPDATE', schema: 'public', table: 'products' },
      () => {
        loadProducts()
      }
    )
    .subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        console.log('✅ Realtime de estoque conectado!')
      }
    })
}

onMounted(() => {
  loadProducts()
  loadMovements()
  setupRealtime()
})

onUnmounted(() => {
  if (realtimeChannel) {
    supabase.removeChannel(realtimeChannel)
  }
})
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
