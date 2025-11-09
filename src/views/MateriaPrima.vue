<template>
  <Layout>
    <div class="space-y-6 pb-20 md:pb-6">
      <div class="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h2 class="text-2xl md:text-3xl font-bold text-gray-900">Entrada de Matéria-Prima</h2>
          <p class="text-gray-600 mt-1">Registre a chegada de frutas e insumos</p>
        </div>
        <button @click="showModal = true" class="mt-4 md:mt-0 btn-primary">
          + Registrar Entrada
        </button>
      </div>

      <div class="card">
        <div class="flex items-center space-x-4">
          <label class="label mb-0">Data:</label>
          <input
            v-model="selectedDate"
            type="date"
            class="input-field"
            @change="loadEntries"
          />
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div
          v-for="entry in entries"
          :key="entry.id"
          class="card hover:shadow-lg transition-shadow"
        >
          <div class="flex items-start justify-between mb-4">
            <div>
              <h3 class="text-lg font-bold text-gray-900">{{ entry.products?.name }}</h3>
              <p class="text-sm text-gray-600">{{ entry.supplier || 'Sem fornecedor' }}</p>
            </div>
            <button @click="editEntry(entry)" class="text-primary-600 hover:text-primary-700">
              ✏️
            </button>
          </div>

          <div class="space-y-2">
            <div class="flex items-center justify-between">
              <span class="text-sm text-gray-600">Quantidade Recebida:</span>
              <span class="font-semibold text-green-600">{{ entry.quantity_received }} {{ entry.products?.unit }}</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-sm text-gray-600">Preço Unitário:</span>
              <span class="font-semibold">{{ formatCurrency(entry.unit_price) }}</span>
            </div>
            <div class="flex items-center justify-between border-t pt-2">
              <span class="text-sm font-bold text-gray-900">Custo Total:</span>
              <span class="font-bold text-lg text-primary-600">{{ formatCurrency(entry.total_cost) }}</span>
            </div>
          </div>

          <div v-if="entry.notes" class="mt-3 pt-3 border-t">
            <p class="text-xs text-gray-500">{{ entry.notes }}</p>
          </div>
        </div>
      </div>

      <div v-if="entries.length === 0" class="card text-center py-12">
        <div class="text-6xl mb-4">📦</div>
        <p class="text-gray-600">Nenhuma entrada registrada nesta data</p>
        <button @click="showModal = true" class="mt-4 btn-primary">
          Registrar Primeira Entrada
        </button>
      </div>

      <!-- Modal -->
      <div v-if="showModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div class="bg-white rounded-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
          <div class="flex items-center justify-between mb-6">
            <h3 class="text-xl font-bold">{{ editingEntry ? 'Editar' : 'Registrar' }} Entrada</h3>
            <button @click="closeModal" class="text-gray-400 hover:text-gray-600">✕</button>
          </div>

          <form @submit.prevent="saveEntry" class="space-y-4">
            <div>
              <label class="label">Data</label>
              <input v-model="form.date" type="date" required class="input-field" />
            </div>

            <div>
              <label class="label">Produto</label>
              <select v-model="form.product_id" required class="input-field" @change="updatePrice">
                <option value="">Selecione um produto</option>
                <option v-for="product in products" :key="product.id" :value="product.id">
                  {{ product.name }}
                </option>
              </select>
            </div>

            <div>
              <label class="label">Quantidade Recebida</label>
              <input
                v-model.number="form.quantity_received"
                type="number"
                min="0"
                step="0.01"
                required
                class="input-field"
                @input="calculateTotal"
              />
            </div>

            <div>
              <label class="label">Preço Unitário (custo)</label>
              <input
                v-model.number="form.unit_price"
                type="number"
                min="0"
                step="0.01"
                required
                class="input-field"
                @input="calculateTotal"
              />
            </div>

            <div>
              <label class="label">Custo Total</label>
              <input
                v-model.number="form.total_cost"
                type="number"
                step="0.01"
                readonly
                class="input-field bg-gray-50"
              />
            </div>

            <div>
              <label class="label">Fornecedor</label>
              <input v-model="form.supplier" class="input-field" placeholder="Nome do fornecedor" />
            </div>

            <div>
              <label class="label">Observações</label>
              <textarea
                v-model="form.notes"
                class="input-field"
                rows="3"
                placeholder="Notas sobre a entrada..."
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
import Layout from '../components/Layout.vue'

const selectedDate = ref(new Date().toISOString().split('T')[0])
const entries = ref([])
const products = ref([])
const showModal = ref(false)
const loading = ref(false)
const editingEntry = ref(null)

const form = ref({
  date: new Date().toISOString().split('T')[0],
  product_id: '',
  quantity_received: 0,
  unit_price: 0,
  total_cost: 0,
  supplier: '',
  notes: ''
})

const formatCurrency = (value) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value || 0)
}

const calculateTotal = () => {
  form.value.total_cost = form.value.quantity_received * form.value.unit_price
}

const updatePrice = () => {
  const product = products.value.find(p => p.id === form.value.product_id)
  if (product) {
    form.value.unit_price = product.price * 0.5
    calculateTotal()
  }
}

const loadEntries = async () => {
  try {
    const { data, error } = await supabase
      .from('raw_material_entries')
      .select(`
        *,
        products (name, unit)
      `)
      .eq('date', selectedDate.value)
      .order('created_at', { ascending: false })

    if (error) throw error
    entries.value = data || []
  } catch (error) {
    console.error('Erro ao carregar entradas:', error)
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

const editEntry = (entry) => {
  editingEntry.value = entry
  form.value = {
    date: entry.date,
    product_id: entry.product_id,
    quantity_received: entry.quantity_received,
    unit_price: entry.unit_price,
    total_cost: entry.total_cost,
    supplier: entry.supplier || '',
    notes: entry.notes || ''
  }
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  editingEntry.value = null
  form.value = {
    date: new Date().toISOString().split('T')[0],
    product_id: '',
    quantity_received: 0,
    unit_price: 0,
    total_cost: 0,
    supplier: '',
    notes: ''
  }
}

const saveEntry = async () => {
  loading.value = true
  try {
    if (editingEntry.value) {
      const { error } = await supabase
        .from('raw_material_entries')
        .update(form.value)
        .eq('id', editingEntry.value.id)

      if (error) throw error
    } else {
      const { error } = await supabase
        .from('raw_material_entries')
        .insert([form.value])

      if (error) throw error
    }

    await loadEntries()
    closeModal()
  } catch (error) {
    console.error('Erro ao salvar entrada:', error)
    alert('Erro ao salvar entrada. Tente novamente.')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadEntries()
  loadProducts()
})
</script>
