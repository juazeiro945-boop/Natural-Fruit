<template>
  <Layout>
    <div class="space-y-6 pb-20 md:pb-6">
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-2xl md:text-3xl font-bold text-gray-900">Trocas</h2>
          <p class="text-gray-600 mt-1">Registre trocas de produtos</p>
        </div>
        <button @click="showForm = true" class="btn-primary">
          + Registrar Troca
        </button>
      </div>

      <!-- Modal de Registro -->
      <div v-if="showForm" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div class="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
          <div class="sticky top-0 bg-gradient-to-r from-amber-500 to-amber-600 px-6 py-4 flex items-center justify-between">
            <h3 class="text-xl font-bold text-white">Registrar Troca</h3>
            <button @click="closeForm" class="text-white hover:bg-amber-700 p-2 rounded-lg transition-colors">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>

          <form @submit.prevent="submitForm" class="p-6 space-y-6">
            <!-- Cliente -->
            <div>
              <label class="label">Cliente *</label>
              <select v-model="form.client_id" required class="input-field">
                <option value="">Selecione o cliente</option>
                <option v-for="client in clients" :key="client.id" :value="client.id">
                  {{ client.name }}
                </option>
              </select>
            </div>

            <!-- Produto Devolvido -->
            <div class="bg-red-50 p-4 rounded-xl border-2 border-red-200">
              <h4 class="font-bold text-red-900 mb-3 flex items-center">
                <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                Produto Devolvido
              </h4>
              
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="label">Produto *</label>
                  <select v-model="form.old_product_id" required class="input-field">
                    <option value="">Selecione o produto</option>
                    <option v-for="product in products" :key="product.id" :value="product.id">
                      {{ product.name }}
                    </option>
                  </select>
                </div>

                <div>
                  <label class="label">Quantidade *</label>
                  <input v-model.number="form.old_quantity" type="number" min="1" required class="input-field" placeholder="Ex: 5">
                </div>
              </div>

              <div class="mt-3 p-3 bg-white rounded-lg">
                <div class="flex justify-between items-center">
                  <span class="text-sm text-gray-600">Valor devolvido:</span>
                  <span class="text-lg font-bold text-red-600">{{ formatCurrency(oldProductValue) }}</span>
                </div>
              </div>
            </div>

            <!-- Produto Novo -->
            <div class="bg-green-50 p-4 rounded-xl border-2 border-green-200">
              <h4 class="font-bold text-green-900 mb-3 flex items-center">
                <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                Produto Novo
              </h4>
              
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="label">Produto *</label>
                  <select v-model="form.new_product_id" required class="input-field">
                    <option value="">Selecione o produto</option>
                    <option v-for="product in products" :key="product.id" :value="product.id">
                      {{ product.name }}
                    </option>
                  </select>
                </div>

                <div>
                  <label class="label">Quantidade *</label>
                  <input v-model.number="form.new_quantity" type="number" min="1" required class="input-field" placeholder="Ex: 5">
                </div>
              </div>

              <div class="mt-3 p-3 bg-white rounded-lg">
                <div class="flex justify-between items-center">
                  <span class="text-sm text-gray-600">Valor novo produto:</span>
                  <span class="text-lg font-bold text-green-600">{{ formatCurrency(newProductValue) }}</span>
                </div>
              </div>
            </div>

            <!-- Diferença de Valor -->
            <div v-if="valueDifference !== 0" class="p-4 rounded-xl" :class="valueDifference > 0 ? 'bg-blue-50 border-2 border-blue-200' : 'bg-orange-50 border-2 border-orange-200'">
              <div class="flex justify-between items-center">
                <span class="font-medium" :class="valueDifference > 0 ? 'text-blue-900' : 'text-orange-900'">
                  {{ valueDifference > 0 ? '💰 Cliente deve pagar:' : '💵 Devolver ao cliente:' }}
                </span>
                <span class="text-2xl font-bold" :class="valueDifference > 0 ? 'text-blue-600' : 'text-orange-600'">
                  {{ formatCurrency(Math.abs(valueDifference)) }}
                </span>
              </div>
            </div>

            <div v-else class="p-4 rounded-xl bg-green-50 border-2 border-green-200">
              <div class="flex items-center justify-center text-green-700 font-medium">
                <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                ✓ Troca sem diferença de valor
              </div>
            </div>

            <!-- Motivo -->
            <div>
              <label class="label">Motivo da Troca *</label>
              <select v-model="form.reason" required class="input-field">
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
              <textarea v-model="form.notes" class="input-field" rows="3" placeholder="Detalhes adicionais sobre a troca..."></textarea>
            </div>

            <div class="flex space-x-3 pt-4">
              <button type="button" @click="closeForm" class="btn-outline flex-1">
                Cancelar
              </button>
              <button type="submit" :disabled="loading" class="btn-primary flex-1">
                {{ loading ? 'Salvando...' : 'Salvar Troca' }}
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Resumo -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="card">
          <div class="flex items-center space-x-4">
            <div class="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
              <span class="text-2xl">🔄</span>
            </div>
            <div>
              <p class="text-gray-600 text-sm">Total de Trocas (Mês)</p>
              <p class="text-2xl font-bold text-gray-900">{{ exchanges.length }}</p>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="flex items-center space-x-4">
            <div class="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
              <span class="text-2xl">📦</span>
            </div>
            <div>
              <p class="text-gray-600 text-sm">Produtos Devolvidos</p>
              <p class="text-2xl font-bold text-amber-600">{{ summary.totalOldQuantity }}</p>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="flex items-center space-x-4">
            <div class="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
              <span class="text-2xl">✨</span>
            </div>
            <div>
              <p class="text-gray-600 text-sm">Produtos Novos</p>
              <p class="text-2xl font-bold text-green-600">{{ summary.totalNewQuantity }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Tabela -->
      <div class="card overflow-hidden">
        <div class="overflow-x-auto">
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
                <td class="px-6 py-4 text-sm text-gray-900">
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
                  <span class="px-2 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-medium">
                    {{ exchange.reason }}
                  </span>
                </td>
                <td class="px-6 py-4">
                  <button @click="deleteExchange(exchange.id)" class="text-red-600 hover:text-red-800">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                    </svg>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>

          <div v-if="exchanges.length === 0" class="text-center py-12">
            <div class="text-gray-400 mb-4">
              <svg class="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"/>
              </svg>
            </div>
            <p class="text-gray-600 font-medium">Nenhuma troca registrada</p>
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
