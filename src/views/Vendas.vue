<template>
  <Layout>
    <div class="space-y-4 md:space-y-6 pb-20 md:pb-6">
      <!-- Header Responsivo -->
      <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h2 class="text-2xl md:text-3xl font-bold text-gray-900">Vendas</h2>
        <button @click="showModal = true" class="w-full md:w-auto btn-primary">
          <svg class="w-5 h-5 inline-block mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
          </svg>
          Nova Venda
        </button>
      </div>

      <!-- Filtros Responsivos -->
      <div class="card">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-3 md:gap-4">
          <div>
            <label class="label text-sm">Data</label>
            <input v-model="filters.date" type="date" class="input-field text-base" @change="loadSales" />
          </div>
          <div>
            <label class="label text-sm">Tipo de Venda</label>
            <select v-model="filters.saleType" class="input-field text-base" @change="loadSales">
              <option value="">Todos</option>
              <option value="wholesale">🏭 Atacado</option>
              <option value="retail">🛒 Varejo</option>
            </select>
          </div>
          <div>
            <label class="label text-sm">Forma de Pagamento</label>
            <select v-model="filters.payment" class="input-field text-base" @change="loadSales">
              <option value="">Todas</option>
              <option value="cash">Dinheiro</option>
              <option value="pix">PIX</option>
              <option value="boleto">Boleto</option>
            </select>
          </div>
          <div>
            <label class="label text-sm">Status</label>
            <select v-model="filters.status" class="input-field text-base" @change="loadSales">
              <option value="">Todos</option>
              <option value="paid">Pago</option>
              <option value="pending">Pendente</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Visualização Desktop - Tabela -->
      <div class="hidden md:block card overflow-x-auto">
        <table class="w-full">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-4 py-3 text-left text-sm font-semibold text-gray-600">Data</th>
              <th class="px-4 py-3 text-left text-sm font-semibold text-gray-600">Tipo</th>
              <th class="px-4 py-3 text-left text-sm font-semibold text-gray-600">Cliente</th>
              <th class="px-4 py-3 text-left text-sm font-semibold text-gray-600">Produto</th>
              <th class="px-4 py-3 text-left text-sm font-semibold text-gray-600">Qtd</th>
              <th class="px-4 py-3 text-left text-sm font-semibold text-gray-600">Total</th>
              <th class="px-4 py-3 text-left text-sm font-semibold text-gray-600">Pagamento</th>
              <th class="px-4 py-3 text-left text-sm font-semibold text-gray-600">Status</th>
              <th class="px-4 py-3 text-left text-sm font-semibold text-gray-600">Ações</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="sale in sales" :key="sale.id" class="border-t hover:bg-gray-50">
              <td class="px-4 py-3 text-sm whitespace-nowrap">{{ formatDate(sale.date) }}</td>
              <td class="px-4 py-3 text-sm">
                <span :class="getSaleTypeBadge(sale.sale_type)">
                  {{ getSaleTypeLabel(sale.sale_type) }}
                </span>
              </td>
              <td class="px-4 py-3 text-sm">{{ sale.clients?.name }}</td>
              <td class="px-4 py-3 text-sm">{{ sale.products?.name }}</td>
              <td class="px-4 py-3 text-sm">{{ sale.quantity }}</td>
              <td class="px-4 py-3 text-sm font-semibold">{{ formatCurrency(sale.total) }}</td>
              <td class="px-4 py-3 text-sm">
                <span :class="getPaymentBadge(sale.payment_method)">
                  {{ getPaymentLabel(sale.payment_method) }}
                </span>
              </td>
              <td class="px-4 py-3 text-sm">
                <span :class="sale.paid ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'" class="px-2 py-1 rounded-full text-xs font-semibold whitespace-nowrap">
                  {{ sale.paid ? 'Pago' : 'Pendente' }}
                </span>
              </td>
              <td class="px-4 py-3 text-sm">
                <div class="flex items-center space-x-2">
                  <button @click="togglePaidStatus(sale)" class="p-2 hover:bg-gray-100 rounded-lg transition-colors" :title="sale.paid ? 'Marcar como pendente' : 'Marcar como pago'">
                    <span class="text-lg">{{ sale.paid ? '↩️' : '✅' }}</span>
                  </button>
                  <button @click="generateReceipt(sale)" class="p-2 hover:bg-blue-50 rounded-lg transition-colors" title="Gerar Recibo">
                    <span class="text-lg">📄</span>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        <div v-if="sales.length === 0" class="text-center py-12">
          <div class="text-gray-400 mb-4">
            <svg class="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>
          <p class="text-gray-600 font-medium">Nenhuma venda encontrada</p>
        </div>
      </div>

      <!-- Visualização Mobile - Cards -->
      <div class="md:hidden space-y-3">
        <div v-for="sale in sales" :key="sale.id" class="card p-4 space-y-3">
          <div class="flex justify-between items-start">
            <div class="flex-1 min-w-0">
              <div class="flex items-center space-x-2 mb-1">
                <p class="text-xs text-gray-500">{{ formatDate(sale.date) }}</p>
                <span :class="getSaleTypeBadge(sale.sale_type)" class="text-xs">
                  {{ getSaleTypeLabel(sale.sale_type) }}
                </span>
              </div>
              <h3 class="font-semibold text-gray-900 text-base truncate">{{ sale.clients?.name }}</h3>
            </div>
            <div class="flex items-center space-x-2 flex-shrink-0 ml-2">
              <button @click="togglePaidStatus(sale)" class="p-2 hover:bg-gray-100 rounded-lg transition-colors active:bg-gray-200">
                <span class="text-2xl">{{ sale.paid ? '↩️' : '✅' }}</span>
              </button>
              <button @click="generateReceipt(sale)" class="p-2 hover:bg-blue-50 rounded-lg transition-colors active:bg-blue-100">
                <span class="text-2xl">📄</span>
              </button>
            </div>
          </div>

          <div class="space-y-2 text-sm">
            <div class="flex justify-between items-center">
              <span class="text-gray-600">Produto:</span>
              <span class="font-medium text-right truncate ml-2">{{ sale.products?.name }}</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-gray-600">Quantidade:</span>
              <span class="font-medium">{{ sale.quantity }}</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-gray-600">Total:</span>
              <span class="font-semibold text-lg text-gray-900">{{ formatCurrency(sale.total) }}</span>
            </div>
          </div>

          <div class="flex flex-wrap justify-between items-center gap-2 pt-2 border-t">
            <span :class="getPaymentBadge(sale.payment_method)">
              {{ getPaymentLabel(sale.payment_method) }}
            </span>
            <span :class="sale.paid ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'" class="px-2 py-1 rounded-full text-xs font-semibold">
              {{ sale.paid ? 'Pago' : 'Pendente' }}
            </span>
          </div>
        </div>

        <div v-if="sales.length === 0" class="card text-center py-12">
          <div class="text-gray-400 mb-4">
            <svg class="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>
          <p class="text-gray-600 font-medium">Nenhuma venda encontrada</p>
          <p class="text-gray-500 text-sm mt-2">Ajuste os filtros ou registre uma nova venda</p>
        </div>
      </div>

      <!-- Modal de Nova Venda - Responsivo -->
      <div v-if="showModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-0 md:p-4 z-50">
        <div class="bg-white rounded-none md:rounded-xl w-full h-full md:h-auto md:max-w-md max-h-screen md:max-h-[90vh] overflow-y-auto">
          <div class="sticky top-0 bg-gradient-to-r from-primary-500 to-primary-600 px-4 md:px-6 py-4 flex items-center justify-between z-10">
            <h3 class="text-lg md:text-xl font-bold text-white">Nova Venda</h3>
            <button @click="closeModal" class="text-white hover:bg-primary-700 p-2 rounded-lg transition-colors">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>

          <form @submit.prevent="saveSale" class="p-4 md:p-6 space-y-4">
            <div>
              <label class="label">Data *</label>
              <input v-model="form.date" type="date" required class="input-field text-base" />
            </div>

            <!-- TIPO DE VENDA - NOVO -->
            <div>
              <label class="label">Tipo de Venda *</label>
              <div class="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  @click="form.sale_type = 'wholesale'"
                  :class="form.sale_type === 'wholesale' ? 'bg-blue-500 text-white border-blue-500' : 'bg-white text-gray-700 border-gray-300'"
                  class="p-4 rounded-lg border-2 transition-all hover:border-blue-400 flex flex-col items-center space-y-2"
                >
                  <span class="text-3xl">🏭</span>
                  <span class="font-semibold text-sm">Atacado</span>
                  <span class="text-xs opacity-80">Grandes volumes</span>
                </button>
                <button
                  type="button"
                  @click="form.sale_type = 'retail'"
                  :class="form.sale_type === 'retail' ? 'bg-green-500 text-white border-green-500' : 'bg-white text-gray-700 border-gray-300'"
                  class="p-4 rounded-lg border-2 transition-all hover:border-green-400 flex flex-col items-center space-y-2"
                >
                  <span class="text-3xl">🛒</span>
                  <span class="font-semibold text-sm">Varejo</span>
                  <span class="text-xs opacity-80">Venda direta</span>
                </button>
              </div>
            </div>

            <div>
              <label class="label">Cliente *</label>
              <select v-model="form.client_id" required class="input-field text-base">
                <option value="">Selecione um cliente</option>
                <option v-for="client in clients" :key="client.id" :value="client.id">
                  {{ client.name }}
                </option>
              </select>
            </div>
            <div>
              <label class="label">Produto *</label>
              <select v-model="form.product_id" required class="input-field text-base" @change="updatePrice">
                <option value="">Selecione um produto</option>
                <option v-for="product in products" :key="product.id" :value="product.id">
                  {{ product.name }} - {{ formatCurrency(product.price) }}
                </option>
              </select>
            </div>
            <div>
              <label class="label">Quantidade *</label>
              <input v-model.number="form.quantity" type="number" min="1" required class="input-field text-base" @input="calculateTotal" inputmode="numeric" />
            </div>
            <div>
              <label class="label">Preço Unitário *</label>
              <input v-model.number="form.unit_price" type="number" step="0.01" required class="input-field text-base" @input="calculateTotal" inputmode="decimal" />
            </div>
            <div>
              <label class="label">Total</label>
              <input v-model.number="form.total" type="number" step="0.01" readonly class="input-field bg-gray-100 text-base font-bold" />
            </div>
            <div>
              <label class="label">Forma de Pagamento *</label>
              <select v-model="form.payment_method" required class="input-field text-base">
                <option value="cash">💵 Dinheiro</option>
                <option value="pix">📱 PIX</option>
                <option value="boleto">📄 Boleto</option>
              </select>
            </div>
            <div class="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <input v-model="form.paid" type="checkbox" id="paid-checkbox" class="w-5 h-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
              <label for="paid-checkbox" class="text-sm md:text-base font-medium text-gray-700">Pagamento realizado</label>
            </div>
            <div>
              <label class="label">Observações</label>
              <textarea v-model="form.notes" class="input-field text-base" rows="3" placeholder="Informações adicionais..."></textarea>
            </div>
            <div class="flex flex-col md:flex-row gap-3 pt-4">
              <button type="button" @click="closeModal" class="flex-1 btn-outline order-2 md:order-1">
                Cancelar
              </button>
              <button type="submit" :disabled="loading" class="flex-1 btn-primary order-1 md:order-2">
                {{ loading ? 'Salvando...' : 'Salvar Venda' }}
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Modal de Confirmação de Recibo - Responsivo -->
      <div v-if="showReceiptConfirm" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div class="bg-white rounded-2xl max-w-sm w-full p-6 animate-fade-in">
          <div class="text-center mb-6">
            <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
            <h3 class="text-xl font-bold text-gray-900 mb-2">Venda Registrada!</h3>
            <p class="text-gray-600 text-sm md:text-base">Deseja gerar o recibo agora?</p>
          </div>
          <div class="flex flex-col gap-3">
            <button @click="confirmGenerateReceipt" class="btn-primary">
              <svg class="w-5 h-5 inline-block mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
              </svg>
              Gerar Recibo
            </button>
            <button @click="closeReceiptConfirm" class="btn-outline">
              Agora Não
            </button>
          </div>
        </div>
      </div>
    </div>
  </Layout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '../lib/supabase'
import Layout from '../components/Layout.vue'
import jsPDF from 'jspdf'

const sales = ref([])
const clients = ref([])
const products = ref([])
const showModal = ref(false)
const loading = ref(false)
const showReceiptConfirm = ref(false)
const lastSaleData = ref(null)

const filters = ref({
  date: new Date().toISOString().split('T')[0],
  saleType: '',
  payment: '',
  status: ''
})

const form = ref({
  date: new Date().toISOString().split('T')[0],
  sale_type: 'retail', // NOVO - padrão é varejo
  client_id: '',
  product_id: '',
  quantity: 1,
  unit_price: 0,
  total: 0,
  payment_method: 'cash',
  paid: false,
  notes: ''
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

const getPaymentLabel = (method) => {
  const labels = { cash: 'Dinheiro', pix: 'PIX', boleto: 'Boleto' }
  return labels[method] || method
}

const getPaymentBadge = (method) => {
  const badges = {
    cash: 'bg-green-100 text-green-600',
    pix: 'bg-purple-100 text-purple-600',
    boleto: 'bg-blue-100 text-blue-600'
  }
  return `${badges[method]} px-2 py-1 rounded-full text-xs font-semibold whitespace-nowrap`
}

// NOVO - Funções para tipo de venda
const getSaleTypeLabel = (type) => {
  const labels = { 
    wholesale: '🏭 Atacado', 
    retail: '🛒 Varejo' 
  }
  return labels[type] || type
}

const getSaleTypeBadge = (type) => {
  const badges = {
    wholesale: 'bg-blue-100 text-blue-700',
    retail: 'bg-green-100 text-green-700'
  }
  return `${badges[type]} px-2 py-1 rounded-full text-xs font-semibold whitespace-nowrap`
}

const updatePrice = () => {
  const product = products.value.find(p => p.id === form.value.product_id)
  if (product) {
    form.value.unit_price = product.price
    calculateTotal()
  }
}

const calculateTotal = () => {
  form.value.total = form.value.quantity * form.value.unit_price
}

const loadSales = async () => {
  try {
    let query = supabase
      .from('sales')
      .select(`*, clients(name, phone, email, address), products(name, description)`)
      .order('date', { ascending: false })
    
    if (filters.value.date) query = query.eq('date', filters.value.date)
    if (filters.value.saleType) query = query.eq('sale_type', filters.value.saleType)
    if (filters.value.payment) query = query.eq('payment_method', filters.value.payment)
    if (filters.value.status === 'paid') query = query.eq('paid', true)
    if (filters.value.status === 'pending') query = query.eq('paid', false)
    
    const { data, error } = await query
    if (error) throw error
    sales.value = data || []
  } catch (error) {
    console.error('Erro:', error)
  }
}

const loadClients = async () => {
  const { data } = await supabase.from('clients').select('*').order('name')
  clients.value = data || []
}

const loadProducts = async () => {
  const { data } = await supabase.from('products').select('*').order('name')
  products.value = data || []
}

const saveSale = async () => {
  loading.value = true
  try {
    const { data, error } = await supabase.from('sales').insert([form.value]).select(`
      *,
      clients(name, phone, email, address),
      products(name, description)
    `)
    
    if (error) throw error
    
    await loadSales()
    closeModal()
    
    if (data && data[0]) {
      lastSaleData.value = data[0]
      showReceiptConfirm.value = true
    }
  } catch (error) {
    alert('Erro ao salvar venda: ' + error.message)
  } finally {
    loading.value = false
  }
}

const togglePaidStatus = async (sale) => {
  await supabase.from('sales').update({ paid: !sale.paid }).eq('id', sale.id)
  await loadSales()
}

const generateReceipt = (sale) => {
  const doc = new jsPDF()
  
  const primaryColor = [255, 140, 0]
  const darkGray = [60, 60, 60]
  const lightGray = [150, 150, 150]
  
  doc.setFillColor(...primaryColor)
  doc.rect(0, 0, 210, 35, 'F')
  
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(24)
  doc.setFont('helvetica', 'bold')
  doc.text('Natural Fruit', 15, 15)
  
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text('Gestão de Produção', 15, 22)
  
  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  const receiptNumber = `#${String(sale.id).slice(-8).toUpperCase()}`
  doc.text('RECIBO DE VENDA', 210 - 15, 15, { align: 'right' })
  doc.setFontSize(12)
  doc.text(receiptNumber, 210 - 15, 22, { align: 'right' })
  
  // NOVO - Tipo de venda no recibo
  doc.setFontSize(10)
  const saleTypeText = sale.sale_type === 'wholesale' ? 'ATACADO' : 'VAREJO'
  doc.text(saleTypeText, 210 - 15, 28, { align: 'right' })
  
  doc.setDrawColor(...primaryColor)
  doc.setLineWidth(0.5)
  doc.line(15, 40, 195, 40)
  
  doc.setTextColor(...darkGray)
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.text('DADOS DA EMPRESA', 15, 50)
  
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.text('Natural Fruit - Processamento de Frutas', 15, 57)
  doc.text('Juazeiro, Bahia, Brasil', 15, 62)
  doc.text('Telefone: (74) 99999-9999', 15, 67)
  
  doc.setFont('helvetica', 'bold')
  doc.text('DATA DA VENDA', 210 - 15, 50, { align: 'right' })
  doc.setFont('helvetica', 'normal')
  doc.text(formatDate(sale.date), 210 - 15, 57, { align: 'right' })
  doc.text(formatDateTime(sale.created_at || sale.date), 210 - 15, 62, { align: 'right' })
  
  doc.setFillColor(245, 245, 245)
  doc.rect(15, 75, 180, 35, 'F')
  
  doc.setTextColor(...darkGray)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.text('DADOS DO CLIENTE', 20, 83)
  
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.text(`Nome: ${sale.clients?.name || 'N/A'}`, 20, 90)
  doc.text(`Telefone: ${sale.clients?.phone || 'N/A'}`, 20, 95)
  if (sale.clients?.email) {
    doc.text(`Email: ${sale.clients.email}`, 20, 100)
  }
  if (sale.clients?.address) {
    doc.text(`Endereço: ${sale.clients.address}`, 20, 105)
  }
  
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.text('DETALHES DA VENDA', 15, 125)
  
  doc.setFillColor(...primaryColor)
  doc.rect(15, 130, 180, 10, 'F')
  
  doc.setTextColor(255, 255, 255)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.text('PRODUTO', 20, 136)
  doc.text('QTD', 120, 136)
  doc.text('VALOR UNIT.', 145, 136)
  doc.text('TOTAL', 175, 136, { align: 'right' })
  
  doc.setTextColor(...darkGray)
  doc.setFont('helvetica', 'normal')
  doc.text(sale.products?.name || 'Produto', 20, 146)
  doc.text(String(sale.quantity), 120, 146)
  doc.text(formatCurrency(sale.unit_price || sale.total / sale.quantity), 145, 146)
  doc.text(formatCurrency(sale.total), 190, 146, { align: 'right' })
  
  doc.setDrawColor(...lightGray)
  doc.setLineWidth(0.3)
  doc.line(15, 150, 195, 150)
  
  const yTotal = 160
  
  doc.setFont('helvetica', 'normal')
  doc.text('Subtotal:', 145, yTotal)
  doc.text(formatCurrency(sale.total), 190, yTotal, { align: 'right' })
  
  doc.text('Descontos:', 145, yTotal + 6)
  doc.text(formatCurrency(0), 190, yTotal + 6, { align: 'right' })
  
  doc.setFillColor(...primaryColor)
  doc.rect(140, yTotal + 12, 55, 12, 'F')
  
  doc.setTextColor(255, 255, 255)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.text('TOTAL:', 145, yTotal + 20)
  doc.text(formatCurrency(sale.total), 190, yTotal + 20, { align: 'right' })
  
  doc.setTextColor(...darkGray)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.text('FORMA DE PAGAMENTO', 15, yTotal + 30)
  
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.text(`Método: ${getPaymentLabel(sale.payment_method)}`, 15, yTotal + 37)
  doc.text(`Status: ${sale.paid ? 'PAGO ✓' : 'PENDENTE'}`, 15, yTotal + 44)
  
  if (sale.notes) {
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(10)
    doc.text('OBSERVAÇÕES', 15, yTotal + 55)
    
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    const splitNotes = doc.splitTextToSize(sale.notes, 180)
    doc.text(splitNotes, 15, yTotal + 62)
  }
  
  const footerY = 270
  doc.setDrawColor(...primaryColor)
  doc.setLineWidth(0.5)
  doc.line(15, footerY, 195, footerY)
  
  doc.setTextColor(...lightGray)
  doc.setFontSize(8)
  doc.setFont('helvetica', 'italic')
  doc.text('Obrigado pela preferência!', 105, footerY + 7, { align: 'center' })
  doc.text('Natural Fruit - Qualidade e Frescor Garantidos', 105, footerY + 12, { align: 'center' })
  doc.text(`Recibo gerado em ${formatDateTime(new Date())}`, 105, footerY + 17, { align: 'center' })
  
  const fileName = `recibo-natural-fruit-${receiptNumber}-${Date.now()}.pdf`
  doc.save(fileName)
}

const confirmGenerateReceipt = () => {
  if (lastSaleData.value) {
    generateReceipt(lastSaleData.value)
  }
  closeReceiptConfirm()
}

const closeReceiptConfirm = () => {
  showReceiptConfirm.value = false
  lastSaleData.value = null
}

const closeModal = () => {
  showModal.value = false
  form.value = {
    date: new Date().toISOString().split('T')[0],
    sale_type: 'retail',
    client_id: '',
    product_id: '',
    quantity: 1,
    unit_price: 0,
    total: 0,
    payment_method: 'cash',
    paid: false,
    notes: ''
  }
}

onMounted(() => {
  loadSales()
  loadClients()
  loadProducts()
})
</script>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
</style>
