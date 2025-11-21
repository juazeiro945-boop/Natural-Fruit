<template>
  <Layout>
    <div class="space-y-6 pb-20 md:pb-6">
      <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 class="text-2xl md:text-3xl font-bold text-gray-900">Produtos</h2>
          <p class="text-gray-600 mt-1">Gerencie seu catálogo de produtos</p>
        </div>
        <button @click="showModal = true" class="w-full md:w-auto btn-primary">
          ➕ Novo Produto
        </button>
      </div>

      <!-- Filtros -->
      <div class="card">
        <div class="flex gap-3 flex-wrap">
          <button 
            @click="filtroStatus = 'ativos'" 
            :class="filtroStatus === 'ativos' ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-700'"
            class="px-4 py-2 rounded-lg font-semibold transition-colors"
          >
            ✅ Ativos ({{ produtosAtivos.length }})
          </button>
          <button 
            @click="filtroStatus = 'inativos'" 
            :class="filtroStatus === 'inativos' ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-700'"
            class="px-4 py-2 rounded-lg font-semibold transition-colors"
          >
            ❌ Inativos ({{ produtosInativos.length }})
          </button>
          <button 
            @click="filtroStatus = 'todos'" 
            :class="filtroStatus === 'todos' ? 'bg-primary-500 text-white' : 'bg-gray-200 text-gray-700'"
            class="px-4 py-2 rounded-lg font-semibold transition-colors"
          >
            📦 Todos ({{ products.length }})
          </button>
        </div>
      </div>

      <!-- Lista de Produtos -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div 
          v-for="product in produtosFiltrados" 
          :key="product.id" 
          class="card hover:shadow-xl transition-shadow"
          :class="{ 'opacity-60 border-2 border-red-200': !product.ativo }"
        >
          <div class="flex items-start justify-between mb-3">
            <div class="flex-1">
              <div class="flex items-center gap-2 mb-1">
                <h3 class="text-lg font-bold text-gray-900">{{ product.name }}</h3>
                <span v-if="!product.ativo" class="text-xs bg-red-100 text-red-600 px-2 py-1 rounded-full font-semibold">
                  Inativo
                </span>
              </div>
              <p class="text-xs text-gray-500">{{ product.description }}</p>
            </div>
          </div>

          <div class="space-y-2 mb-4">
            <div class="flex items-center justify-between">
              <span class="text-sm text-gray-600">Preço:</span>
              <span class="text-2xl font-bold text-primary-600">{{ formatCurrency(product.price) }}</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-sm text-gray-600">Unidade:</span>
              <span class="font-semibold text-gray-900">{{ product.unit }}</span>
            </div>
          </div>

          <!-- Botões de Ação -->
          <div class="flex gap-2 pt-3 border-t">
            <button 
              @click="editProduct(product)" 
              class="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg font-semibold transition-colors text-sm"
            >
              ✏️ Editar
            </button>
            <button 
              v-if="product.ativo"
              @click="inativarProduto(product)" 
              class="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white py-2 rounded-lg font-semibold transition-colors text-sm"
            >
              ⏸️ Inativar
            </button>
            <button 
              v-else
              @click="reativarProduto(product)" 
              class="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg font-semibold transition-colors text-sm"
            >
              ▶️ Reativar
            </button>
            <button 
              @click="confirmarExclusao(product)" 
              class="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors text-sm"
            >
              🗑️
            </button>
          </div>
        </div>
      </div>

      <!-- Estado Vazio -->
      <div v-if="produtosFiltrados.length === 0" class="card text-center py-12">
        <div class="text-gray-400 mb-4">
          <svg class="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
          </svg>
        </div>
        <p class="text-gray-600 font-medium">Nenhum produto encontrado</p>
        <p class="text-gray-500 text-sm mt-2">
          {{ filtroStatus === 'inativos' ? 'Não há produtos inativos' : 'Clique em "Novo Produto" para começar' }}
        </p>
      </div>

      <!-- Modal de Produto -->
      <div v-if="showModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div class="bg-white rounded-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
          <div class="flex items-center justify-between mb-6">
            <h3 class="text-xl font-bold text-gray-900">
              {{ editingProduct ? 'Editar Produto' : 'Novo Produto' }}
            </h3>
            <button @click="closeModal" class="text-gray-400 hover:text-gray-600 text-2xl">✕</button>
          </div>

          <form @submit.prevent="saveProduct" class="space-y-4">
            <div>
              <label class="label">Nome do Produto *</label>
              <input 
                v-model="form.name" 
                required 
                class="input-field" 
                placeholder="Ex: Polpa de Acerola"
              />
            </div>

            <div>
              <label class="label">Descrição</label>
              <textarea 
                v-model="form.description" 
                class="input-field" 
                rows="3"
                placeholder="Descrição detalhada do produto"
              ></textarea>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="label">Unidade *</label>
                <select v-model="form.unit" required class="input-field">
                  <option value="">Selecione</option>
                  <option value="kg">Kg (Quilograma)</option>
                  <option value="g">g (Grama)</option>
                  <option value="l">L (Litro)</option>
                  <option value="ml">ml (Mililitro)</option>
                  <option value="und">Unidade</option>
                  <option value="caixa">Caixa</option>
                  <option value="pacote">Pacote</option>
                  <option value="saco">Saco</option>
                </select>
              </div>

              <div>
                <label class="label">Preço (R$) *</label>
                <input 
                  v-model.number="form.price" 
                  type="number" 
                  step="0.01" 
                  min="0"
                  required 
                  class="input-field"
                  placeholder="0,00"
                />
              </div>
            </div>

            <div v-if="editingProduct" class="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <input 
                v-model="form.ativo" 
                type="checkbox" 
                id="produto-ativo" 
                class="w-5 h-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <label for="produto-ativo" class="text-sm font-medium text-gray-700">
                Produto ativo
              </label>
            </div>

            <div class="flex gap-3 pt-4">
              <button type="button" @click="closeModal" class="flex-1 btn-outline">
                Cancelar
              </button>
              <button type="submit" :disabled="loading" class="flex-1 btn-primary">
                {{ loading ? 'Salvando...' : 'Salvar Produto' }}
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Modal de Confirmação de Exclusão -->
      <div v-if="showDeleteModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div class="bg-white rounded-xl max-w-md w-full p-6">
          <div class="text-center mb-6">
            <div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span class="text-4xl">⚠️</span>
            </div>
            <h3 class="text-xl font-bold text-gray-900 mb-2">Confirmar Exclusão</h3>
            <p class="text-gray-600">
              Tem certeza que deseja <strong>excluir permanentemente</strong> o produto:
            </p>
            <p class="font-bold text-lg text-gray-900 mt-2">{{ produtoParaExcluir?.name }}</p>
            <p class="text-sm text-red-600 mt-3">
              ⚠️ Esta ação não pode ser desfeita!
            </p>
          </div>

          <div class="flex gap-3">
            <button 
              @click="showDeleteModal = false" 
              class="flex-1 btn-outline"
            >
              Cancelar
            </button>
            <button 
              @click="excluirProduto" 
              :disabled="loading"
              class="flex-1 bg-red-500 hover:bg-red-600 text-white py-3 rounded-lg font-semibold transition-colors"
            >
              {{ loading ? 'Excluindo...' : '🗑️ Excluir' }}
            </button>
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

const products = ref([])
const showModal = ref(false)
const showDeleteModal = ref(false)
const loading = ref(false)
const editingProduct = ref(null)
const produtoParaExcluir = ref(null)
const filtroStatus = ref('ativos')

const form = ref({
  name: '',
  description: '',
  unit: '',
  price: 0,
  ativo: true
})

const produtosAtivos = computed(() => {
  return products.value.filter(p => p.ativo)
})

const produtosInativos = computed(() => {
  return products.value.filter(p => !p.ativo)
})

const produtosFiltrados = computed(() => {
  if (filtroStatus.value === 'ativos') return produtosAtivos.value
  if (filtroStatus.value === 'inativos') return produtosInativos.value
  return products.value
})

const formatCurrency = (value) => {
  return new Intl.NumberFormat('pt-BR', { 
    style: 'currency', 
    currency: 'BRL' 
  }).format(value || 0)
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
    alert('Erro ao carregar produtos')
  }
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
      const { error } = await supabase
        .from('products')
        .update(form.value)
        .eq('id', editingProduct.value.id)

      if (error) throw error
      alert('✅ Produto atualizado com sucesso!')
    } else {
      const { error } = await supabase
        .from('products')
        .insert([{ ...form.value, ativo: true }])

      if (error) throw error
      alert('✅ Produto criado com sucesso!')
    }

    await loadProducts()
    closeModal()
  } catch (error) {
    console.error('Erro ao salvar produto:', error)
    alert('Erro ao salvar produto: ' + error.message)
  } finally {
    loading.value = false
  }
}

const inativarProduto = async (product) => {
  if (!confirm(`Deseja inativar o produto "${product.name}"? Ele não aparecerá mais nas vendas.`)) return

  try {
    const { error } = await supabase
      .from('products')
      .update({ ativo: false })
      .eq('id', product.id)

    if (error) throw error
    alert('✅ Produto inativado com sucesso!')
    await loadProducts()
  } catch (error) {
    console.error('Erro ao inativar produto:', error)
    alert('Erro ao inativar produto: ' + error.message)
  }
}

const reativarProduto = async (product) => {
  if (!confirm(`Deseja reativar o produto "${product.name}"?`)) return

  try {
    const { error } = await supabase
      .from('products')
      .update({ ativo: true })
      .eq('id', product.id)

    if (error) throw error
    alert('✅ Produto reativado com sucesso!')
    await loadProducts()
  } catch (error) {
    console.error('Erro ao reativar produto:', error)
    alert('Erro ao reativar produto: ' + error.message)
  }
}

const confirmarExclusao = (product) => {
  produtoParaExcluir.value = product
  showDeleteModal.value = true
}

const excluirProduto = async () => {
  loading.value = true
  try {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', produtoParaExcluir.value.id)

    if (error) throw error

    alert('🗑️ Produto excluído permanentemente!')
    showDeleteModal.value = false
    produtoParaExcluir.value = null
    await loadProducts()
  } catch (error) {
    console.error('Erro ao excluir produto:', error)
    
    // Verifica se é erro de relacionamento (produto usado em vendas)
    if (error.code === '23503') {
      alert('❌ Não é possível excluir este produto pois ele está vinculado a vendas/pedidos. Você pode inativá-lo ao invés de excluir.')
    } else {
      alert('Erro ao excluir produto: ' + error.message)
    }
  } finally {
    loading.value = false
  }
}

const closeModal = () => {
  showModal.value = false
  editingProduct.value = null
  form.value = {
    name: '',
    description: '',
    unit: '',
    price: 0,
    ativo: true
  }
}

onMounted(loadProducts)
</script>

<style scoped>
.card {
  @apply bg-white rounded-xl shadow-lg p-4 md:p-6;
}

.label {
  @apply block text-sm font-medium text-gray-700 mb-2;
}

.input-field {
  @apply w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all;
}

.btn-primary {
  @apply px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium shadow-md;
}

.btn-outline {
  @apply px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium;
}
</style>
