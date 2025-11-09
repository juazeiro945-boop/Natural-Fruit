<template>
  <Layout>
    <div class="space-y-6 pb-20 md:pb-6">
      <div class="flex flex-col md:flex-row md:items-center md:justify-between">
        <h2 class="text-2xl md:text-3xl font-bold text-gray-900">Produção Diária</h2>
        <button @click="showModal = true" class="mt-4 md:mt-0 btn-primary">
          + Registrar Produção
        </button>
      </div>

      <div class="card">
        <div class="flex items-center space-x-4">
          <label class="label mb-0">Data:</label>
          <input v-model="selectedDate" type="date" class="input-field" @change="loadProduction" />
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div v-for="item in production" :key="item.id" class="card hover:shadow-lg transition-shadow">
          <div class="flex items-start justify-between mb-4">
            <div>
              <h3 class="text-lg font-bold text-gray-900">{{ item.products?.name }}</h3>
              <p class="text-sm text-gray-600">{{ item.products?.unit }}</p>
            </div>
            <div class="flex space-x-2">
              <button @click="registerExchange(item)" class="text-yellow-600 hover:text-yellow-700" title="Registrar Troca">
                🔄
              </button>
              <button @click="editProduction(item)" class="text-primary-600 hover:text-primary-700">
                ✏️
              </button>
            </div>
          </div>

          <div class="space-y-2">
            <div class="flex items-center justify-between">
              <span class="text-sm text-gray-600">Produzido:</span>
              <span class="font-semibold text-green-600">{{ item.quantity }} {{ item.products?.unit }}</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-sm text-gray-600">Perdas:</span>
              <span class="font-semibold text-red-600">{{ item.loss }} {{ item.products?.unit }}</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-sm text-gray-600">Trocas:</span>
              <span class="font-semibold text-yellow-600">{{ item.exchange }} {{ item.products?.unit }}</span>
            </div>
          </div>

          <div class="mt-4 pt-4 border-t space-y-2">
            <div class="flex items-center justify-between text-sm">
              <span class="text-gray-600">Valor Perdas:</span>
              <span class="font-semibold text-red-600">{{ formatCurrency(item.loss_value || 0) }}</span>
            </div>
            <div class="flex items-center justify-between text-sm">
              <span class="text-gray-600">Valor Trocas:</span>
              <span class="font-semibold text-yellow-600">{{ formatCurrency(item.exchange_value || 0) }}</span>
            </div>
            <div class="flex items-center justify-between text-sm border-t pt-2">
              <span class="text-gray-600">% Perda:</span>
              <span class="font-semibold" :class="getLossClass(item)">
                {{ calculatePercentage(item.loss, item.quantity) }}%
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Modal de Registro -->
      <div v-if="showModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div class="bg-white rounded-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
          <div class="flex items-center justify-between mb-6">
            <h3 class="text-xl font-bold">{{ editingItem ? 'Editar' : 'Registrar' }} Produção</h3>
            <button @click="closeModal" class="text-gray-400 hover:text-gray-600">✕</button>
          </div>

          <form @submit.prevent="saveProduction" class="space-y-4">
            <div>
              <label class="label">Data</label>
              <input v-model="form.date" type="date" required class="input-field" />
            </div>

            <div>
              <label class="label">Produto</label>
              <select v-model="form.product_id" required class="input-field">
                <option value="">Selecione um produto</option>
                <option v-for="product in products" :key="product.id" :value="product.id">
                  {{ product.name }}
                </option>
              </select>
            </div>

            <div>
              <label class="label">Quantidade Produzida</label>
              <input
                v-model.number="form.quantity"
                type="number"
                min="0"
                step="0.01"
                required
                class="input-field"
                placeholder="0"
              />
            </div>

            <div>
              <label class="label">Perdas</label>
              <input
                v-model.number="form.loss"
                type="number"
                min="0"
                step="0.01"
                class="input-field"
                placeholder="0"
              />
            </div>

            <div>
              <label class="label">Trocas</label>
              <input
                v-model.number="form.exchange"
                type="number"
                min="0"
                step="0.01"
                class="input-field"
                placeholder="0"
              />
            </div>

            <div>
              <label class="label">Observações</label>
              <textarea
                v-model="form.notes"
                class="input-field"
                rows="3"
                placeholder="Observações opcionais..."
              ></textarea>
            </div>

            <div class="flex space-x-3">
              <button type="button" @click="closeModal" class="flex-1 btn-outline">
                Cancelar
              </button>
              <button type="submit" :disabled="loading" class="flex-1 btn-primary">
                {{ loading ? 'Salvando...' : 'Salvar' }}
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Modal de Troca Rápida -->
      <div v-if="showExchangeModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div class="bg-white rounded-xl max-w-md w-full p-6">
          <div class="flex items-center justify-between mb-6">
            <div>
              <h3 class="text-xl font-bold text-yellow-600">🔄 Registrar Troca</h3>
              <p class="text-sm text-gray-600 mt-1">{{ exchangeItem?.products?.name }}</p>
            </div>
            <button @click="closeExchangeModal" class="text-gray-400 hover:text-gray-600">✕</button>
          </div>

          <div class="bg-yellow-50 border-l-4 border-yellow-500 p-4 mb-4">
            <p class="text-sm text-yellow-800">
              <strong>Situação:</strong> Cliente retornou produtos com defeito/problema
            </p>
          </div>

          <form @submit.prevent="saveExchange" class="space-y-4">
            <div>
              <label class="label">Quantidade de Trocas</label>
              <input
                v-model.number="exchangeForm.quantity"
                type="number"
                min="1"
                step="1"
                required
                class="input-field text-2xl font-bold"
                placeholder="0"
                autofocus
              />
            </div>

            <div>
              <label class="label">Motivo da Troca</label>
              <select v-model="exchangeForm.reason" class="input-field">
                <option value="defeito">Defeito no produto</option>
                <option value="validade">Problema de validade</option>
                <option value="qualidade">Qualidade</option>
                <option value="outro">Outro</option>
              </select>
            </div>

            <div>
              <label class="label">Observações</label>
              <textarea
                v-model="exchangeForm.notes"
                class="input-field"
                rows="2"
                placeholder="Detalhes da troca..."
              ></textarea>
            </div>

            <div class="bg-gray-50 p-3 rounded-lg">
              <p class="text-sm text-gray-600">Valor estimado da troca:</p>
              <p class="text-2xl font-bold text-yellow-600">
                {{ formatCurrency(exchangeForm.quantity * (exchangeItem?.products?.price || 0)) }}
              </p>
            </div>

            <div class="flex space-x-3">
              <button type="button" @click="closeExchangeModal" class="flex-1 btn-outline">
                Cancelar
              </button>
              <button type="submit" :disabled="loading" class="flex-1 btn-primary bg-yellow-500 hover:bg-yellow-600">
                {{ loading ? 'Registrando...' : 'Confirmar Troca' }}
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

const selectedDate = ref(new Date().toISOString().split('T')[0])
const production = ref([])
const products = ref([])
const showModal = ref(false)
const showExchangeModal = ref(false)
const loading = ref(false)
const editingItem = ref(null)
const exchangeItem = ref(null)

const form = ref({
  date: new Date().toISOString().split('T')[0],
  product_id: '',
  quantity: 0,
  loss: 0,
  exchange: 0,
  notes: ''
})

const exchangeForm = ref({
  quantity: 0,
  reason: 'defeito',
  notes: ''
})

const formatCurrency = (value) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value || 0)
}

const calculatePercentage = (value, total) => {
  if (!total || total === 0) return '0.0'
  return ((value / total) * 100).toFixed(1)
}

const getLossClass = (item) => {
  const percentage = (item.loss / item.quantity) * 100
  if (percentage > 10) return 'text-red-600'
  if (percentage > 5) return 'text-yellow-600'
  return 'text-green-600'
}

const registerExchange = (item) => {
  exchangeItem.value = item
  exchangeForm.value = {
    quantity: 0,
    reason: 'defeito',
    notes: ''
  }
  showExchangeModal.value = true
}

const closeExchangeModal = () => {
  showExchangeModal.value = false
  exchangeItem.value = null
}

const saveExchange = async () => {
  loading.value = true
  try {
    const newExchange = (exchangeItem.value.exchange || 0) + exchangeForm.value.quantity
    const notes = exchangeItem.value.notes 
      ? `${exchangeItem.value.notes}\n[TROCA] ${exchangeForm.value.reason}: ${exchangeForm.value.notes}`
      : `[TROCA] ${exchangeForm.value.reason}: ${exchangeForm.value.notes}`

    const { error } = await supabase
      .from('production')
      .update({
        exchange: newExchange,
        notes: notes
      })
      .eq('id', exchangeItem.value.id)

    if (error) throw error

    await loadProduction()
    closeExchangeModal()
    alert(`✅ Troca de ${exchangeForm.value.quantity} unidade(s) registrada com sucesso!`)
  } catch (error) {
    console.error('Erro ao registrar troca:', error)
    alert('Erro ao registrar troca. Tente novamente.')
  } finally {
    loading.value = false
  }
}

const loadProduction = async () => {
  try {
    const { data, error } = await supabase
      .from('production')
      .select(`
        *,
        products (name, unit, price)
      `)
      .eq('date', selectedDate.value)
      .order('created_at', { ascending: false })

    if (error) throw error
    production.value = data || []
  } catch (error) {
    console.error('Erro ao carregar produção:', error)
  }
}

const loadProducts = async () => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('name')

    if (error) throw error
    products.value = data || []
  } catch (error) {
    console.error('Erro ao carregar produtos:', error)
  }
}

const editProduction = (item) => {
  editingItem.value = item
  form.value = {
    date: item.date,
    product_id: item.product_id,
    quantity: item.quantity,
    loss: item.loss || 0,
    exchange: item.exchange || 0,
    notes: item.notes || ''
  }
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  editingItem.value = null
  form.value = {
    date: new Date().toISOString().split('T')[0],
    product_id: '',
    quantity: 0,
    loss: 0,
    exchange: 0,
    notes: ''
  }
}

const saveProduction = async () => {
  loading.value = true
  try {
    if (editingItem.value) {
      const { error } = await supabase
        .from('production')
        .update(form.value)
        .eq('id', editingItem.value.id)

      if (error) throw error
    } else {
      const { error } = await supabase
        .from('production')
        .insert([form.value])

      if (error) throw error
    }

    await loadProduction()
    closeModal()
  } catch (error) {
    console.error('Erro ao salvar produção:', error)
    alert('Erro ao salvar produção. Tente novamente.')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadProduction()
  loadProducts()
})
</script>
