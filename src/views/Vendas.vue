<template>
  <Layout>
    <div class="space-y-4 md:space-y-6 pb-20 md:pb-6 px-4 md:px-0">
      <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h2 class="text-2xl md:text-3xl font-bold text-gray-900">Vendas</h2>
        <button @click="showModal = true" class="w-full md:w-auto btn-primary">
          + Nova Venda
        </button>
      </div>

      <div class="card">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
          <div>
            <label class="label">Data</label>
            <input v-model="filters.date" type="date" class="input-field" @change="loadSales" />
          </div>
          <div>
            <label class="label">Forma de Pagamento</label>
            <select v-model="filters.payment" class="input-field" @change="loadSales">
              <option value="">Todas</option>
              <option value="cash">Dinheiro</option>
              <option value="pix">PIX</option>
              <option value="boleto">Boleto</option>
            </select>
          </div>
          <div>
            <label class="label">Status</label>
            <select v-model="filters.status" class="input-field" @change="loadSales">
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
              <td class="px-4 py-3 text-sm">{{ formatDate(sale.date) }}</td>
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
                <span :class="sale.paid ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'" class="px-2 py-1 rounded-full text-xs font-semibold">
                  {{ sale.paid ? 'Pago' : 'Pendente' }}
                </span>
              </td>
              <td class="px-4 py-3 text-sm">
                <button @click="togglePaidStatus(sale)" class="text-primary-600 hover:text-primary-700 text-lg">
                  {{ sale.paid ? '↩️' : '✅' }}
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Visualização Mobile - Cards -->
      <div class="md:hidden space-y-3">
        <div v-for="sale in sales" :key="sale.id" class="card p-4 space-y-3">
          <div class="flex justify-between items-start">
            <div>
              <p class="text-xs text-gray-500">{{ formatDate(sale.date) }}</p>
              <h3 class="font-semibold text-gray-900">{{ sale.clients?.name }}</h3>
            </div>
            <button @click="togglePaidStatus(sale)" class="text-2xl">
              {{ sale.paid ? '↩️' : '✅' }}
            </button>
          </div>

          <div class="space-y-2 text-sm">
            <div class="flex justify-between">
              <span class="text-gray-600">Produto:</span>
              <span class="font-medium">{{ sale.products?.name }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600">Quantidade:</span>
              <span class="font-medium">{{ sale.quantity }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600">Total:</span>
              <span class="font-semibold text-lg text-gray-900">{{ formatCurrency(sale.total) }}</span>
            </div>
          </div>

          <div class="flex justify-between items-center pt-2 border-t">
            <span :class="getPaymentBadge(sale.payment_method)">
              {{ getPaymentLabel(sale.payment_method) }}
            </span>
            <span :class="sale.paid ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'" class="px-2 py-1 rounded-full text-xs font-semibold">
              {{ sale.paid ? 'Pago' : 'Pendente' }}
            </span>
          </div>
        </div>
      </div>

      <!-- Modal -->
      <div v-if="showModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div class="bg-white rounded-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
          <div class="flex items-center justify-between mb-6">
            <h3 class="text-xl font-bold">Nova Venda</h3>
            <button @click="closeModal" class="text-gray-400 hover:text-gray-600 text-2xl leading-none">✕</button>
          </div>

          <form @submit.prevent="saveSale" class="space-y-4">
            <div>
              <label class="label">Data</label>
              <input v-model="form.date" type="date" required class="input-field" />
            </div>
            <div>
              <label class="label">Cliente</label>
              <select v-model="form.client_id" required class="input-field">
                <option value="">Selecione um cliente</option>
                <option v-for="client in clients" :key="client.id" :value="client.id">
                  {{ client.name }}
                </option>
              </select>
            </div>
            <div>
              <label class="label">Produto</label>
              <select v-model="form.product_id" required class="input-field" @change="updatePrice">
                <option value="">Selecione um produto</option>
                <option v-for="product in products" :key="product.id" :value="product.id">
                  {{ product.name }} - {{ formatCurrency(product.price) }}
                </option>
              </select>
            </div>
            <div>
              <label class="label">Quantidade</label>
              <input v-model.number="form.quantity" type="number" min="1" required class="input-field" @input="calculateTotal" />
            </div>
            <div>
              <label class="label">Preço Unitário</label>
              <input v-model.number="form.unit_price" type="number" step="0.01" required class="input-field" @input="calculateTotal" />
            </div>
            <div>
              <label class="label">Total</label>
              <input v-model.number="form.total" type="number" step="0.01" readonly class="input-field bg-gray-50" />
            </div>
            <div>
              <label class="label">Forma de Pagamento</label>
              <select v-model="form.payment_method" required class="input-field">
                <option value="cash">Dinheiro</option>
                <option value="pix">PIX</option>
                <option value="boleto">Boleto</option>
              </select>
            </div>
            <div class="flex items-center space-x-2">
              <input v-model="form.paid" type="checkbox" id="paid-checkbox" class="w-4 h-4 rounded border-gray-300" />
              <label for="paid-checkbox" class="text-sm font-medium text-gray-700">Pagamento realizado</label>
            </div>
            <div>
              <label class="label">Observações</label>
              <textarea v-model="form.notes" class="input-field" rows="2"></textarea>
            </div>
            <div class="flex flex-col md:flex-row gap-3">
              <button type="button" @click="closeModal" class="flex-1 btn-outline">Cancelar</button>
              <button type="submit" :disabled="loading" class="flex-1 btn-primary">
                {{ loading ? 'Salvando...' : 'Salvar' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </Layout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '../lib/supabase'
import Layout from '../components/Layout.vue'

const sales = ref([])
const clients = ref([])
const products = ref([])
const showModal = ref(false)
const loading = ref(false)

const filters = ref({
  date: new Date().toISOString().split('T')[0],
  payment: '',
  status: ''
})

const form = ref({
  date: new Date().toISOString().split('T')[0],
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
  return `${badges[method]} px-2 py-1 rounded-full text-xs font-semibold`
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
      .select(`*, clients(name), products(name)`)
      .order('date', { ascending: false })
    
    if (filters.value.date) query = query.eq('date', filters.value.date)
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
    const { error } = await supabase.from('sales').insert([form.value])
    if (error) throw error
    await loadSales()
    closeModal()
  } catch (error) {
    alert('Erro ao salvar venda')
  } finally {
    loading.value = false
  }
}

const togglePaidStatus = async (sale) => {
  await supabase.from('sales').update({ paid: !sale.paid }).eq('id', sale.id)
  await loadSales()
}

const closeModal = () => {
  showModal.value = false
  form.value = {
    date: new Date().toISOString().split('T')[0],
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
