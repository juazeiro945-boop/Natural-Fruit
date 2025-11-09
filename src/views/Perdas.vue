<template>
  <Layout>
    <div class="space-y-6 pb-20 md:pb-6">
      <!-- Header Responsivo -->
      <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 class="text-2xl md:text-3xl font-bold text-gray-900">Perdas</h2>
          <p class="text-gray-600 mt-1 text-sm md:text-base">Registre perdas fora da produção</p>
        </div>
        <button @click="showForm = true" class="btn-primary w-full md:w-auto">
          <svg class="w-5 h-5 inline-block mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
          </svg>
          Registrar Perda
        </button>
      </div>

      <!-- Modal de Registro - Responsivo -->
      <div v-if="showForm" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-0 md:p-4">
        <div class="bg-white rounded-none md:rounded-2xl shadow-2xl w-full h-full md:h-auto md:max-w-2xl md:max-h-[90vh] overflow-y-auto">
          <div class="sticky top-0 bg-gradient-to-r from-red-500 to-red-600 px-4 md:px-6 py-4 flex items-center justify-between z-10">
            <h3 class="text-lg md:text-xl font-bold text-white">Registrar Perda</h3>
            <button @click="closeForm" class="text-white hover:bg-red-700 p-2 rounded-lg transition-colors">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>

          <form @submit.prevent="submitForm" class="p-4 md:p-6 space-y-4">
            <div>
              <label class="label">Produto *</label>
              <select v-model="form.product_id" required class="input-field text-base">
                <option value="">Selecione o produto</option>
                <option v-for="product in products" :key="product.id" :value="product.id">
                  {{ product.name }}
                </option>
              </select>
            </div>

            <div>
              <label class="label">Quantidade *</label>
              <input v-model.number="form.quantity" type="number" min="1" required class="input-field text-base" placeholder="Ex: 10" inputmode="numeric">
            </div>

            <div>
              <label class="label">Motivo *</label>
              <select v-model="form.reason" required class="input-field text-base">
                <option value="">Selecione o motivo</option>
                <option value="Transporte">🚚 Transporte</option>
                <option value="Armazenamento">📦 Armazenamento</option>
                <option value="Vencimento">⏰ Vencimento</option>
                <option value="Quebra">💔 Quebra</option>
                <option value="Outro">📝 Outro</option>
              </select>
            </div>

            <div>
              <label class="label">Observações</label>
              <textarea v-model="form.notes" class="input-field text-base" rows="3" placeholder="Detalhes adicionais..."></textarea>
            </div>

            <div class="bg-gradient-to-r from-red-50 to-red-100 p-4 rounded-xl border-2 border-red-200">
              <div class="flex flex-col md:flex-row md:justify-between md:items-center gap-2">
                <span class="text-gray-700 font-medium text-sm md:text-base">Valor da Perda:</span>
                <span class="text-2xl md:text-3xl font-bold text-red-600">{{ formatCurrency(calculatedValue) }}</span>
              </div>
            </div>

            <div class="flex flex-col md:flex-row gap-3 pt-4">
              <button type="button" @click="closeForm" class="btn-outline flex-1 order-2 md:order-1">
                Cancelar
              </button>
              <button type="submit" :disabled="loading" class="btn-primary flex-1 order-1 md:order-2">
                {{ loading ? 'Salvando...' : 'Salvar Perda' }}
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Cards de Resumo - Responsivo -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        <div class="card">
          <div class="flex items-center space-x-3 md:space-x-4">
            <div class="w-12 h-12 md:w-14 md:h-14 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <span class="text-2xl md:text-3xl">📉</span>
            </div>
            <div class="min-w-0">
              <p class="text-gray-600 text-xs md:text-sm truncate">Total de Perdas (Mês)</p>
              <p class="text-xl md:text-2xl font-bold text-gray-900">{{ summary.totalQuantity }}</p>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="flex items-center space-x-3 md:space-x-4">
            <div class="w-12 h-12 md:w-14 md:h-14 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <span class="text-2xl md:text-3xl">💰</span>
            </div>
            <div class="min-w-0">
              <p class="text-gray-600 text-xs md:text-sm truncate">Valor Total (Mês)</p>
              <p class="text-lg md:text-2xl font-bold text-red-600 truncate">{{ formatCurrency(summary.totalValue) }}</p>
            </div>
          </div>
        </div>

        <div class="card sm:col-span-2 lg:col-span-1">
          <div class="flex items-center space-x-3 md:space-x-4">
            <div class="w-12 h-12 md:w-14 md:h-14 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <span class="text-2xl md:text-3xl">📊</span>
            </div>
            <div class="min-w-0">
              <p class="text-gray-600 text-xs md:text-sm truncate">Registros (Mês)</p>
              <p class="text-xl md:text-2xl font-bold text-gray-900">{{ losses.length }}</p>
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
                <th class="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Produto</th>
                <th class="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Quantidade</th>
                <th class="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Motivo</th>
                <th class="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Valor</th>
                <th class="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Ações</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
              <tr v-for="loss in losses" :key="loss.id" class="hover:bg-gray-50">
                <td class="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">
                  {{ formatDate(loss.date) }}
                </td>
                <td class="px-6 py-4 text-sm text-gray-900">
                  {{ loss.products?.name }}
                </td>
                <td class="px-6 py-4 text-sm text-gray-900">
                  {{ loss.quantity }}
                </td>
                <td class="px-6 py-4 text-sm">
                  <span class="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium whitespace-nowrap">
                    {{ loss.reason }}
                  </span>
                </td>
                <td class="px-6 py-4 text-sm font-bold text-red-600 whitespace-nowrap">
                  {{ formatCurrency(loss.value) }}
                </td>
                <td class="px-6 py-4">
                  <button @click="deleteLoss(loss.id)" class="text-red-600 hover:text-red-800 p-2 hover:bg-red-50 rounded-lg transition-colors">
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
          <div v-for="loss in losses" :key="loss.id" class="p-4 hover:bg-gray-50 active:bg-gray-100 transition-colors">
            <div class="flex items-start justify-between mb-3">
              <div class="flex-1 min-w-0">
                <h4 class="font-semibold text-gray-900 text-base truncate">{{ loss.products?.name }}</h4>
                <p class="text-xs text-gray-500 mt-1">{{ formatDate(loss.date) }}</p>
              </div>
              <button @click="deleteLoss(loss.id)" class="ml-2 text-red-600 hover:text-red-800 p-2 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                </svg>
              </button>
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <p class="text-xs text-gray-500 mb-1">Quantidade</p>
                <p class="text-base font-semibold text-gray-900">{{ loss.quantity }}</p>
              </div>
              <div>
                <p class="text-xs text-gray-500 mb-1">Valor</p>
                <p class="text-base font-bold text-red-600">{{ formatCurrency(loss.value) }}</p>
              </div>
            </div>

            <div class="mt-3">
              <span class="inline-flex items-center px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">
                {{ loss.reason }}
              </span>
            </div>

            <div v-if="loss.notes" class="mt-3 p-3 bg-gray-50 rounded-lg">
              <p class="text-xs text-gray-600">{{ loss.notes }}</p>
            </div>
          </div>

          <div v-if="losses.length === 0" class="text-center py-12 px-4">
            <div class="text-gray-400 mb-4">
              <svg class="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
              </svg>
            </div>
            <p class="text-gray-600 font-medium text-base">Nenhuma perda registrada</p>
            <p class="text-gray-500 text-sm mt-2">As perdas aparecerão aqui</p>
          </div>
        </div>

        <!-- Empty State Desktop -->
        <div v-if="losses.length === 0" class="hidden md:block text-center py-12">
          <div class="text-gray-400 mb-4">
            <svg class="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
            </svg>
          </div>
          <p class="text-gray-600 font-medium">Nenhuma perda registrada</p>
          <p class="text-gray-500 text-sm mt-2">As perdas aparecerão aqui</p>
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
const losses = ref([])

const form = ref({
  product_id: '',
  quantity: null,
  reason: '',
  notes: ''
})

const summary = computed(() => {
  return {
    totalQuantity: losses.value.reduce((sum, loss) => sum + loss.quantity, 0),
    totalValue: losses.value.reduce((sum, loss) => sum + parseFloat(loss.value), 0)
  }
})

const calculatedValue = computed(() => {
  const product = products.value.find(p => p.id === form.value.product_id)
  if (product && form.value.quantity) {
    return product.price * form.value.quantity
  }
  return 0
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

const loadLosses = async () => {
  const startOfMonth = new Date()
  startOfMonth.setDate(1)
  
  const { data } = await supabase
    .from('losses')
    .select(`
      *,
      products (name)
    `)
    .gte('date', startOfMonth.toISOString().split('T')[0])
    .order('date', { ascending: false })
  
  if (data) losses.value = data
}

const submitForm = async () => {
  loading.value = true
  
  const { error } = await supabase.from('losses').insert({
    product_id: form.value.product_id,
    quantity: form.value.quantity,
    reason: form.value.reason,
    notes: form.value.notes,
    value: calculatedValue.value
  })

  loading.value = false

  if (error) {
    alert('Erro ao registrar perda: ' + error.message)
    return
  }

  alert('Perda registrada com sucesso!')
  closeForm()
  loadLosses()
}

const deleteLoss = async (id) => {
  if (!confirm('Tem certeza que deseja excluir esta perda?')) return

  const { error } = await supabase
    .from('losses')
    .delete()
    .eq('id', id)

  if (error) {
    alert('Erro ao excluir: ' + error.message)
    return
  }

  loadLosses()
}

const closeForm = () => {
  showForm.value = false
  form.value = {
    product_id: '',
    quantity: null,
    reason: '',
    notes: ''
  }
}

onMounted(() => {
  loadProducts()
  loadLosses()
})
</script>
