<template>
  <Layout>
    <div class="space-y-6 pb-20 md:pb-6">
      <!-- Header -->
      <div class="flex flex-col md:flex-row md:items-center md:justify-between">
        <h2 class="text-2xl md:text-3xl font-bold text-gray-900">Produção Diária</h2>
        <button @click="showModal = true" class="mt-4 md:mt-0 btn-primary">
          + Registrar Produção
        </button>
      </div>

      <!-- Filtro de Data -->
      <div class="card">
        <div class="flex items-center space-x-4">
          <label class="label mb-0">Data:</label>
          <input
            v-model="selectedDate"
            type="date"
            class="input-field"
            @change="loadProduction"
          />
        </div>
      </div>

      <!-- Lista de Produção -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div
          v-for="item in production"
          :key="item.id"
          class="card hover:shadow-lg transition-shadow"
        >
          <div class="flex items-start justify-between mb-4">
            <div>
              <h3 class="text-lg font-bold text-gray-900">{{ item.products?.name }}</h3>
              <p class="text-sm text-gray-600">{{ item.products?.unit }}</p>
            </div>
            <button
              @click="editProduction(item)"
              class="text-primary-600 hover:text-primary-700"
            >
              ✏️
            </button>
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

          <div class="mt-4 pt-4 border-t">
            <div class="flex items-center justify-between text-sm">
              <span class="text-gray-600">Perda:</span>
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
              <input
                v-model="form.date"
                type="date"
                required
                class="input-field"
              />
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
    </div>
  </Layout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '../lib/supabase'
import { useProductStore } from '../stores/product'
import Layout from '../components/Layout.vue'

const productStore = useProductStore()
const selectedDate = ref(new Date().toISOString().split('T')[0])
const production = ref([])
const products = ref([])
const showModal = ref(false)
const loading = ref(false)
const editingItem = ref(null)

const form = ref({
  date: new Date().toISOString().split('T')[0],
  product_id: '',
  quantity: 0,
  loss: 0,
  exchange: 0,
  notes: ''
})

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

const loadProduction = async () => {
  try {
    const { data, error } = await supabase
      .from('production')
      .select(`
        *,
        products (name, unit)
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
