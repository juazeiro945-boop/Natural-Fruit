<template>
  <Layout>
    <div class="space-y-6 pb-20 md:pb-6">
      <div class="flex flex-col md:flex-row md:items-center md:justify-between">
        <h2 class="text-2xl md:text-3xl font-bold text-gray-900">Produtos</h2>
        <button @click="showModal = true" class="mt-4 md:mt-0 btn-primary">+ Novo Produto</button>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div v-for="product in products" :key="product.id" class="card hover:shadow-lg transition-shadow">
          <div class="flex items-start justify-between mb-3">
            <h3 class="text-lg font-bold text-gray-900">{{ product.name }}</h3>
            <button @click="editProduct(product)" class="text-primary-600">✏️</button>
          </div>
          <div class="space-y-2">
            <p class="text-2xl font-bold text-primary-600">{{ formatCurrency(product.price) }}</p>
            <p class="text-sm text-gray-600">Unidade: {{ product.unit }}</p>
            <p class="text-xs text-gray-500">{{ product.description }}</p>
          </div>
        </div>
      </div>

      <div v-if="showModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div class="bg-white rounded-xl max-w-md w-full p-6">
          <div class="flex items-center justify-between mb-6">
            <h3 class="text-xl font-bold">{{ editingProduct ? 'Editar' : 'Novo' }} Produto</h3>
            <button @click="closeModal" class="text-gray-400">✕</button>
          </div>
          <form @submit.prevent="saveProduct" class="space-y-4">
            <div>
              <label class="label">Nome</label>
              <input v-model="form.name" required class="input-field" />
            </div>
            <div>
              <label class="label">Descrição</label>
              <textarea v-model="form.description" class="input-field" rows="2"></textarea>
            </div>
            <div>
              <label class="label">Unidade</label>
              <input v-model="form.unit" required class="input-field" placeholder="kg, und, caixa" />
            </div>
            <div>
              <label class="label">Preço</label>
              <input v-model.number="form.price" type="number" step="0.01" required class="input-field" />
            </div>
            <div class="flex space-x-3">
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

const products = ref([])
const showModal = ref(false)
const loading = ref(false)
const editingProduct = ref(null)

const form = ref({ name: '', description: '', unit: '', price: 0 })

const formatCurrency = (value) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0)
}

const loadProducts = async () => {
  const { data } = await supabase.from('products').select('*').order('name')
  products.value = data || []
}

const editProduct = (product) => {
  editingProduct.value = product
  form.value = { ...product }
  showModal.value = true
}

const saveProduct = async () => {
  loading.value = true
  try {
    if (editingProduct.value) {
      await supabase.from('products').update(form.value).eq('id', editingProduct.value.id)
    } else {
      await supabase.from('products').insert([form.value])
    }
    await loadProducts()
    closeModal()
  } catch (error) {
    alert('Erro ao salvar produto')
  } finally {
    loading.value = false
  }
}

const closeModal = () => {
  showModal.value = false
  editingProduct.value = null
  form.value = { name: '', description: '', unit: '', price: 0 }
}

onMounted(loadProducts)
</script>
