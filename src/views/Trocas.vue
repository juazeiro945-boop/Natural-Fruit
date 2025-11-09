<template>
  <Layout>
    <div class="space-y-6 pb-20 md:pb-6">
      <!-- Header Responsivo -->
      <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 class="text-2xl md:text-3xl font-bold text-gray-900">Trocas</h2>
          <p class="text-gray-600 mt-1 text-sm md:text-base">Registre trocas de produtos</p>
        </div>
        <button @click="showForm = true" class="btn-primary w-full md:w-auto">
          <svg class="w-5 h-5 inline-block mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
          </svg>
          Registrar Troca
        </button>
      </div>

      <!-- Modal de Registro - Responsivo -->
      <div v-if="showForm" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-0 md:p-4">
        <div class="bg-white rounded-none md:rounded-2xl shadow-2xl w-full h-full md:h-auto md:max-w-3xl md:max-h-[90vh] overflow-y-auto">
          <div class="sticky top-0 bg-gradient-to-r from-amber-500 to-amber-600 px-4 md:px-6 py-4 flex items-center justify-between z-10">
            <h3 class="text-lg md:text-xl font-bold text-white">Registrar Troca</h3>
            <button @click="closeForm" class="text-white hover:bg-amber-700 p-2 rounded-lg transition-colors">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>

          <form @submit.prevent="submitForm" class="p-4 md:p-6 space-y-4 md:space-y-6">
            <!-- Cliente -->
            <div>
              <label class="label">Cliente *</label>
              <select v-model="form.client_id" required class="input-field text-base">
                <option value="">Selecione o cliente</option>
                <option v-for="client in clients" :key="client.id" :value="client.id">
                  {{ client.name }}
                </option>
              </select>
            </div>

            <!-- Produto Devolvido -->
            <div class="bg-red-50 p-3 md:p-4 rounded-xl border-2 border-red-200">
              <h4 class="font-bold text-red-900 mb-3 flex items-center text-sm md:text-base">
                <svg class="w-4 h-4 md:w-5 md:h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                Produto Devolvido
              </h4>
              
              <div class="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                <div>
                  <label class="label text-sm">Produto *</label>
                  <select v-model="form.old_product_id" required class="input-field text-base">
                    <option value="">Selecione</option>
                    <option v-for="product in products" :key="product.id" :value="product.id">
                      {{ product.name }}
                    </option>
                  </select>
                </div>

                <div>
                  <label class="label text-sm">Quantidade *</label>
                  <input v-model.number="form.old_quantity" type="number" min="1" required class="input-field text-base" placeholder="Ex: 5" inputmode="numeric">
                </div>
              </div>

              <div class="mt-3 p-3 bg-white rounded-lg">
                <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1">
                  <span class="text-xs md:text-sm text-gray-600">Valor devolvido:</span>
                  <span class="text-base md:text-lg font-bold text-red-600">{{ formatCurrency(oldProductValue) }}</span>
                </div>
              </div>
            </div>

            <!-- Produto Novo -->
            <div class="bg-green-50 p-3 md:p-4 rounded-xl border-2 border-green-200">
              <h4 class="font-bold text-green-900 mb-3 flex items-center text-sm md:text-base">
                <svg class="w-4 h-4 md:w-5 md:h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                Produto Novo
              </h4>
              
              <div class="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                <div>
                  <label class="label text-sm">Produto *</label>
                  <select v-model="form.new_product_id" required class="input-field text-base">
                    <option value="">Selecione</option>
                    <option v-for="product in products" :key="product.id" :value="product.id">
                      {{ product.name }}
                    </option>
                  </select>
                </div>

                <div>
                  <label class="label text-sm">Quantidade *</label>
                  <input v-model.number="form.new_quantity" type="number" min="1" required class="input-field text-base" placeholder="Ex: 5" inputmode="numeric">
                </div>
              </div>

              <div class="mt-3 p-3 bg-white rounded-lg">
                <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1">
                  <span class="text-xs md:text-sm text-gray-600">Valor novo produto:</span>
                  <span class="text-base md:text-lg font-bold text-green-600">{{ formatCurrency(newProductValue) }}</span>
                </div>
              </div>
            </div>

            <!-- Diferença de Valor -->
            <div v-if="valueDifference !== 0" class="p-3 md:p-4 rounded-xl" :class="valueDifference > 0 ? 'bg-blue-50 border-2 border-blue-200' : 'bg-orange-50 border-2 border-orange-200'">
              <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                <span class="text-sm md:text-base font-medium" :class="valueDifference > 0 ? 'text-blue-900' : 'text-orange-900'">
                  {{ valueDifference > 0 ? '💰 Cliente deve pagar:' : '💵 Devolver ao cliente:' }}
                </span>
                <span class="text-xl md:text-2xl font-bold" :class="valueDifference > 0 ? 'text-blue-600' : 'text-orange-600'">
                  {{ formatCurrency(Math.abs(valueDifference)) }}
                </span>
              </div>
            </div>

            <div v-else class="p-3 md:p-4 rounded-xl bg-green-50 border-2 border-green-200">
              <div class="flex items-center justify-center text-green-700 font-medium text-sm md:text-base">
                <svg class="w-4 h-4 md:w-5 md:h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                ✓ Troca sem diferença de valor
              </div>
            </div>

            <!-- Motivo -->
            <div>
              <label class="label">Motivo da Troca *</label>
              <select v-model="form.reason" required class="input-field text-base">
                <option value="">Selecione o motivo</option>
                <option value="Defeito">🔧 Defeito no produto</option>
                <option value="Vencido">⏰ Produto vencido</option>
                <option value="Não gostou">😕 Cliente não gostou</option>
                <option value="Tamanho errado">📏 Tamanho/quantidade errada</option>
                <option value="Outro">📝 Outro motivo</option>
              </select>
            </div>

            <!-- Observações -->
            <div>
              <label class="label">Observações</label>
              <textarea v-model="form.notes" class="input-field text-base" rows="3" placeholder="Detalhes adicionais sobre a troca..."></textarea>
            </div>

            <div class="flex flex-col md:flex-row gap-3 pt-4">
              <button type="button" @click="closeForm" class="btn-outline flex-1 order-2 md:order-1">
                Cancelar
              </button>
              <button type="submit" :disabled="loading" class="btn-primary flex-1 order-1 md:order-2">
                {{ loading ? 'Salvando...' : 'Salvar Troca' }}
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Cards de Resumo - Responsivo -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        <div class="card">
          <div class="flex items-center space-x-3 md:space-x-4">
            <div class="w-12 h-12 md:w-14 md:h-14 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <span class="text-2xl md:text-3xl">🔄</span>
            </div>
            <div class="min-w-0">
              <p class="text-gray-600 text-xs md:text-sm truncate">Total de Trocas (Mês)</p>
              <p class="text-xl md:text-2xl font-bold text-gray-900">{{ exchanges.length }}</p>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="flex items-center space-x-3 md:space-x-4">
            <div class="w-12 h-12 md:w-14 md:h-14 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <span class="text-2xl md:text-3xl">📦</span>
            </div>
            <div class="min-w-0">
              <p class="text-gray-600 text-xs md:text-sm truncate">Produtos Devolvidos</p>
              <p class="text-xl md:text-2xl font-bold text-amber-600">{{ summary.totalOldQuantity }}</p>
            </div>
          </div>
        </div>

        <div class="card sm:col-span-2 lg:col-span-1">
          <div class="flex items-center space-x-3 md:space-x-4">
            <div class="w-12 h-12 md:w-14 md:h-14 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <span class="text-2xl md:text-3xl">✨</span>
            </div>
            <div class="min-w-0">
              <p class="text-gray-600 text-xs md:text-sm truncate">Produtos Novos</p>
              <p class="text-xl md:text-2xl font-bold text-green-600">{{ summary.totalNewQuantity }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Tabela Desktop / Cards Mobile -->
      <div class="card overflow-hidden">
        <!-- Versão Desktop (Tabela) -->
        <div class="hidden md:block overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Data</th>
                <th class="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Cliente</th>
                <th class="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Produto Devolvido</th>
                <th class="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Produto Novo</th>
                <th class="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Motivo</th>
                <th class="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Ações</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
              <tr v-for="exchange in exchanges" :key="exchange.id" class="hover:bg-gray-50">
                <td class="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">
                  {{ formatDate(exchange.date) }}
                </td>
                <td class="px-6 py-4 text-sm text-gray-900">
                  {{ exchange.clients?.name }}
                </td>
                <td class="px-6 py-4 text-sm">
                  <div class="flex items-center space-x-2">
                    <span class="text-red-600">❌</span>
                    <div>
                      <p class="font-medium text-gray-900">{{ exchange.old_products?.name }}</p>
                      <p class="text-xs text-gray-500">Qtd: {{ exchange.old_quantity }}</p>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 text-sm">
                  <div class="flex items-center space-x-2">
                    <span class="text-green-600">✓</span>
                    <div>
                      <p class="font-medium text-gray-900">{{ exchange.new_products?.name }}</p>
                      <p class="text-xs text-gray-500">Qtd: {{ exchange.new_quantity }}</p>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 text-sm">
                  <span class="px-2 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-medium whitespace-nowrap">
                    {{ exchange.reason }}
                  </span>
                </td>
                <td class="px-6 py-4">
                  <button @click="deleteExchange(exchange.id)" class="text-red-600 hover:text-red-800 p-2 hover:bg-red-50 rounded-lg transition-colors">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                    </svg>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Versão Mobile (Cards) -->
        <div class="md:hidden divide-y divide-gray-200">
          <div v-for="exchange in exchanges" :key="exchange.id" class="p-4 hover:bg-gray-50 active:bg-gray-100 transition-colors">
            <div class="flex items-start justify-between mb-3">
              <div class="flex-1 min-w-0">
                <h4 class="font-semibold text-gray-900 text-base truncate">{{ exchange.clients?.name }}</h4>
                <p class="text-xs text-gray-500 mt-1">{{ formatDate(exchange.date) }}</p>
              </div>
              <button @click="deleteExchange(exchange.id)" class="ml-2 text-red-600 hover:text-red-800 p-2 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                </svg>
              </button>
            </div>

            <!-- Produto Devolvido -->
            <div class="bg-red-50 border-l-4 border-red-400 p-3 rounded mb-2">
              <p class="text-xs text-red-700 font-medium mb-1 flex items-center">
                <span class="mr-1">❌</span> Devolvido
              </p>
              <p class="font-semibold text-gray-900 text-sm">{{ exchange.old_products?.name }}</p>
              <p class="text-xs text-gray-600 mt-1">Quantidade: {{ exchange.old_quantity }}</p>
            </div>

            <!-- Produto Novo -->
            <div class="bg-green-50 border-l-4 border-green-400 p-3 rounded mb-2">
              <p class="text-xs text-green-700 font-medium mb-1 flex items-center">
                <span class="mr-1">✓</span> Novo
              </p>
              <p class="font-semibold text-gray-900 text-sm">{{ exchange.new_products?.name }}</p>
              <p class="text-xs text-gray-600 mt-1">Quantidade: {{ exchange.new_quantity }}</p>
            </div>

            <!-- Motivo -->
            <div class="mt-3">
              <span class="inline-flex items-center px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-medium">
                {{ exchange.reason }}
              </span>
            </div>

            <!-- Observações -->
            <div v-if="exchange.notes" class="mt-3 p-3 bg-gray-50 rounded-lg">
              <p class="text-xs text-gray-600">{{ exchange.notes }}</p>
            </div>
          </div>

          <div v-if="exchanges.length === 0" class="text-center py-12 px-4">
            <div class="text-gray-400 mb-4">
              <svg class="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"/>
              </svg>
            </div>
            <p class="text-gray-600 font-medium text-base">Nenhuma troca registrada</p>
            <p class="text-gray-500 text-sm mt-2">As trocas aparecerão aqui</p>
          </div>
        </div>

        <!-- Empty State Desktop -->
        <div v-if="exchanges.length === 0" class="hidden md:block text-center py-12">
          <div class="text-gray-400 mb-4">
            <svg class="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"/>
            </svg>
          </div>
          <p class="text-gray-600 font-medium">Nenhuma troca registrada</p>
          <p class="text-gray-500 text-sm mt-2">As trocas aparecerão aqui</p>
        </div>
      </div>
    </div>
  </Layout>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { supabase } from '../lib/supabase'
import Layout from '../components/Layout.vue'

const showForm = ref(false)
const loading = ref(false)
const products = ref([])
const clients = ref([])
const exchanges = ref([])

const form = ref({
  client_id: '',
  old_product_id: '',
  old_quantity: null,
  new_product_id: '',
  new_quantity: null,
  reason: '',
  notes: ''
})

const summary = computed(() => {
  return {
    totalOldQuantity: exchanges.value.reduce((sum, ex) => sum + ex.old_quantity, 0),
    totalNewQuantity: exchanges.value.reduce((sum, ex) => sum + ex.new_quantity, 0)
  }
})

const oldProductValue = computed(() => {
  const product = products.value.find(p => p.id === form.value.old_product_id)
  if (product && form.value.old_quantity) {
    return product.price * form.value.old_quantity
  }
  return 0
})

const newProductValue = computed(() => {
  const product = products.value.find(p => p.id === form.value.new_product_id)
  if (product && form.value.new_quantity) {
    return product.price * form.value.new_quantity
  }
  return 0
})

const valueDifference = computed(() => {
  return newProductValue.value - oldProductValue.value
})

const formatCurrency = (value) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value || 0)
}

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('pt-BR')
}

const loadProducts = async () => {
  const { data } = await supabase
    .from('products')
    .select('*')
    .order('name')
  
  if (data) products.value = data
}

const loadClients = async () => {
  const { data } = await supabase
    .from('clients')
    .select('*')
    .order('name')
  
  if (data) clients.value = data
}

const loadExchanges = async () => {
  const startOfMonth = new Date()
  startOfMonth.setDate(1)
  
  const { data } = await supabase
    .from('exchanges')
    .select(`
      *,
      clients (name),
      old_products:old_product_id (name),
      new_products:new_product_id (name)
    `)
    .gte('date', startOfMonth.toISOString().split('T')[0])
    .order('date', { ascending: false })
  
  if (data) exchanges.value = data
}

const submitForm = async () => {
  loading.value = true
  
  const { error } = await supabase.from('exchanges').insert({
    client_id: form.value.client_id,
    old_product_id: form.value.old_product_id,
    old_quantity: form.value.old_quantity,
    new_product_id: form.value.new_product_id,
    new_quantity: form.value.new_quantity,
    reason: form.value.reason,
    notes: form.value.notes
  })

  loading.value = false

  if (error) {
    alert('Erro ao registrar troca: ' + error.message)
    return
  }

  alert('Troca registrada com sucesso!')
  closeForm()
  loadExchanges()
}

const deleteExchange = async (id) => {
  if (!confirm('Tem certeza que deseja excluir esta troca?')) return

  const { error } = await supabase
    .from('exchanges')
    .delete()
    .eq('id', id)

  if (error) {
    alert('Erro ao excluir: ' + error.message)
    return
  }

  loadExchanges()
}

const closeForm = () => {
  showForm.value = false
  form.value = {
    client_id: '',
    old_product_id: '',
    old_quantity: null,
    new_product_id: '',
    new_quantity: null,
    reason: '',
    notes: ''
  }
}

onMounted(() => {
  loadProducts()
  loadClients()
  loadExchanges()
})
</script>
