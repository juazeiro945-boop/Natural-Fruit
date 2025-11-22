<template>
  <Layout>
    <div class="space-y-6 pb-20 md:pb-6">
      <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 class="text-2xl md:text-3xl font-bold text-gray-900">Clientes</h2>
          <p class="text-gray-600 mt-1">Gerencie sua base de clientes</p>
        </div>
        <button @click="showModal = true" class="w-full md:w-auto btn-primary">
          ➕ Novo Cliente
        </button>
      </div>

      <!-- Busca e Filtros -->
      <div class="card">
        <div class="space-y-3">
          <div>
            <label class="label text-sm">🔍 Buscar Cliente</label>
            <input 
              v-model="buscaCliente" 
              type="text" 
              class="input-field" 
              placeholder="Digite o nome, telefone ou documento do cliente..."
              @input="filtrarClientes"
            />
          </div>
          
          <div class="flex gap-2 flex-wrap">
            <button 
              @click="filtroAtivo = 'todos'" 
              :class="filtroAtivo === 'todos' ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-700'"
              class="px-4 py-2 rounded-lg font-semibold transition-colors text-sm"
            >
              📦 Todos ({{ clients.length }})
            </button>
            <button 
              @click="filtroAtivo = true" 
              :class="filtroAtivo === true ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700'"
              class="px-4 py-2 rounded-lg font-semibold transition-colors text-sm"
            >
              ✅ Ativos ({{ clientesAtivos.length }})
            </button>
            <button 
              @click="filtroAtivo = false" 
              :class="filtroAtivo === false ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-700'"
              class="px-4 py-2 rounded-lg font-semibold transition-colors text-sm"
            >
              ❌ Inativos ({{ clientesInativos.length }})
            </button>
          </div>
        </div>
      </div>

      <!-- Informação de Paginação -->
      <div v-if="clientesFiltrados.length > 0" class="card bg-blue-50 border-2 border-blue-200">
        <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div class="text-sm text-gray-700">
            <span class="font-bold">{{ clientesPaginados.length }}</span> de 
            <span class="font-bold">{{ clientesFiltrados.length }}</span> clientes
            <span class="text-gray-500 ml-2">(Página {{ paginaAtual }} de {{ totalPaginas }})</span>
          </div>
          
          <!-- Botões de Paginação -->
          <div class="flex gap-2">
            <button 
              @click="paginaAnterior" 
              :disabled="paginaAtual === 1"
              :class="paginaAtual === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-primary-700'"
              class="flex-1 md:flex-none px-4 py-2 bg-primary-600 text-white rounded-lg font-semibold transition-colors text-sm disabled:hover:bg-primary-600"
            >
              ← Anterior
            </button>
            <button 
              @click="proximaPagina" 
              :disabled="paginaAtual === totalPaginas"
              :class="paginaAtual === totalPaginas ? 'opacity-50 cursor-not-allowed' : 'hover:bg-primary-700'"
              class="flex-1 md:flex-none px-4 py-2 bg-primary-600 text-white rounded-lg font-semibold transition-colors text-sm disabled:hover:bg-primary-600"
            >
              Próxima →
            </button>
          </div>
        </div>
      </div>

      <!-- Lista de Clientes -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div 
          v-for="client in clientesPaginados" 
          :key="client.id" 
          class="card hover:shadow-xl transition-shadow"
          :class="{ 'opacity-60 border-2 border-red-200': !client.ativo }"
        >
          <div class="flex items-start justify-between mb-3">
            <div class="flex-1">
              <div class="flex items-center gap-2 mb-1">
                <h3 class="text-lg font-bold text-gray-900">{{ client.name }}</h3>
                <span 
                  v-if="!client.ativo" 
                  class="px-2 py-1 bg-red-100 text-red-600 text-xs rounded-full font-semibold"
                >
                  Inativo
                </span>
              </div>
              <p class="text-xs text-gray-500">
                {{ client.type === 'pj' ? '🏢 Pessoa Jurídica' : '👤 Pessoa Física' }}
              </p>
            </div>
          </div>

          <div class="space-y-2 text-sm mb-4">
            <div class="flex items-center space-x-2">
              <span class="text-gray-600">📄</span>
              <span class="font-medium">{{ client.document }}</span>
            </div>
            <div v-if="client.phone" class="flex items-center space-x-2">
              <span class="text-gray-600">📞</span>
              <span>{{ client.phone }}</span>
            </div>
            <div v-if="client.email" class="flex items-center space-x-2">
              <span class="text-gray-600">📧</span>
              <span class="text-xs truncate">{{ client.email }}</span>
            </div>
            <div v-if="client.address" class="flex items-start space-x-2">
              <span class="text-gray-600">📍</span>
              <span class="text-xs">{{ client.address }}</span>
            </div>
            <div v-if="client.observacoes" class="flex items-start space-x-2 bg-yellow-50 p-2 rounded">
              <span class="text-gray-600">📝</span>
              <span class="text-xs text-gray-700">{{ client.observacoes }}</span>
            </div>
            <div v-if="client.requires_invoice" class="flex items-center space-x-2">
              <span class="text-blue-600">📋</span>
              <span class="text-xs text-blue-600 font-semibold">Emite nota fiscal</span>
            </div>
          </div>

          <!-- Botões de Ação -->
          <div class="flex gap-2 pt-3 border-t">
            <button 
              @click="editClient(client)" 
              class="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg font-semibold transition-colors text-sm"
            >
              ✏️ Editar
            </button>
            <button 
              v-if="client.ativo"
              @click="toggleClientStatus(client)" 
              class="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white py-2 rounded-lg font-semibold transition-colors text-sm"
            >
              ⏸️ Inativar
            </button>
            <button 
              v-else
              @click="toggleClientStatus(client)" 
              class="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg font-semibold transition-colors text-sm"
            >
              ▶️ Ativar
            </button>
            <button 
              @click="confirmarExclusao(client)" 
              class="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors text-sm"
            >
              🗑️
            </button>
          </div>
        </div>
      </div>

      <!-- Paginação Inferior (Mobile) -->
      <div v-if="clientesFiltrados.length > itensPorPagina" class="flex md:hidden gap-2">
        <button 
          @click="paginaAnterior" 
          :disabled="paginaAtual === 1"
          :class="paginaAtual === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-primary-700'"
          class="flex-1 px-4 py-3 bg-primary-600 text-white rounded-lg font-semibold transition-colors disabled:hover:bg-primary-600"
        >
          ← Anterior
        </button>
        <button 
          @click="proximaPagina" 
          :disabled="paginaAtual === totalPaginas"
          :class="paginaAtual === totalPaginas ? 'opacity-50 cursor-not-allowed' : 'hover:bg-primary-700'"
          class="flex-1 px-4 py-3 bg-primary-600 text-white rounded-lg font-semibold transition-colors disabled:hover:bg-primary-600"
        >
          Próxima →
        </button>
      </div>

      <!-- Estado Vazio -->
      <div v-if="clientesFiltrados.length === 0" class="card text-center py-12">
        <div class="text-gray-400 mb-4">
          <svg class="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
          </svg>
        </div>
        <p class="text-gray-600 font-medium">
          {{ buscaCliente ? 'Nenhum cliente encontrado' : 
             filtroAtivo === 'todos' ? 'Nenhum cliente cadastrado' : 
             filtroAtivo === true ? 'Nenhum cliente ativo' : 'Nenhum cliente inativo' }}
        </p>
        <p class="text-gray-500 text-sm mt-2">
          {{ buscaCliente ? 'Tente buscar por outro termo' : 'Clique em "Novo Cliente" para começar' }}
        </p>
      </div>

      <!-- Modal de Cliente -->
      <div v-if="showModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
        <div class="bg-white rounded-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto my-8">
          <div class="flex items-center justify-between mb-6">
            <h3 class="text-xl font-bold text-gray-900">
              {{ editingClient ? 'Editar Cliente' : 'Novo Cliente' }}
            </h3>
            <button @click="closeModal" class="text-gray-400 hover:text-gray-600 text-2xl">✕</button>
          </div>

          <form @submit.prevent="saveClient" class="space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="label">Tipo de Pessoa *</label>
                <select v-model="form.type" required class="input-field">
                  <option value="pf">👤 Pessoa Física</option>
                  <option value="pj">🏢 Pessoa Jurídica</option>
                </select>
              </div>

              <div>
                <label class="label">{{ form.type === 'pj' ? 'CNPJ *' : 'CPF *' }}</label>
                <input 
                  v-model="form.document" 
                  required 
                  class="input-field" 
                  :placeholder="form.type === 'pj' ? '00.000.000/0000-00' : '000.000.000-00'"
                />
              </div>
            </div>

            <div>
              <label class="label">{{ form.type === 'pj' ? 'Razão Social *' : 'Nome Completo *' }}</label>
              <input 
                v-model="form.name" 
                required 
                class="input-field" 
                placeholder="Digite o nome completo"
              />
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="label">Telefone</label>
                <input 
                  v-model="form.phone" 
                  type="tel" 
                  class="input-field"
                  placeholder="(00) 00000-0000"
                />
              </div>

              <div>
                <label class="label">E-mail</label>
                <input 
                  v-model="form.email" 
                  type="email" 
                  class="input-field"
                  placeholder="email@exemplo.com"
                />
              </div>
            </div>

            <div>
              <label class="label">Endereço Completo</label>
              <textarea 
                v-model="form.address" 
                class="input-field" 
                rows="3"
                placeholder="Rua, número, bairro, cidade - Estado"
              ></textarea>
            </div>

            <div>
              <label class="label">📝 Observações</label>
              <textarea 
                v-model="form.observacoes" 
                class="input-field" 
                rows="3"
                placeholder="Informações adicionais sobre o cliente (preferências, horários, restrições, etc.)"
              ></textarea>
              <p class="text-xs text-gray-500 mt-1">
                Use este campo para anotar informações importantes sobre o cliente
              </p>
            </div>

            <div class="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
              <input 
                v-model="form.requires_invoice" 
                type="checkbox" 
                id="requires-invoice"
                class="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label for="requires-invoice" class="text-sm font-medium text-gray-700">
                📋 Requer emissão de nota fiscal
              </label>
            </div>

            <div v-if="editingClient" class="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <input 
                v-model="form.ativo" 
                type="checkbox" 
                id="cliente-ativo"
                class="w-5 h-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <label for="cliente-ativo" class="text-sm font-medium text-gray-700">
                Cliente ativo
              </label>
            </div>

            <div class="flex gap-3 pt-4">
              <button type="button" @click="closeModal" class="flex-1 btn-outline">
                Cancelar
              </button>
              <button type="submit" :disabled="loading" class="flex-1 btn-primary">
                {{ loading ? 'Salvando...' : 'Salvar Cliente' }}
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
              Tem certeza que deseja <strong>excluir permanentemente</strong> o cliente:
            </p>
            <p class="font-bold text-lg text-gray-900 mt-2">{{ clienteParaExcluir?.name }}</p>
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
              @click="excluirCliente" 
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
import { ref, onMounted, computed, watch } from 'vue'
import { supabase } from '../lib/supabase'
import Layout from '../components/Layout.vue'

const clients = ref([])
const showModal = ref(false)
const showDeleteModal = ref(false)
const loading = ref(false)
const editingClient = ref(null)
const clienteParaExcluir = ref(null)
const filtroAtivo = ref('todos')
const buscaCliente = ref('')

// Paginação
const paginaAtual = ref(1)
const itensPorPagina = ref(10)

const form = ref({
  type: 'pf',
  name: '',
  document: '',
  phone: '',
  email: '',
  address: '',
  observacoes: '',
  requires_invoice: false,
  ativo: true
})

// Computed
const clientesAtivos = computed(() => clients.value.filter(c => c.ativo))
const clientesInativos = computed(() => clients.value.filter(c => !c.ativo))

const clientesFiltrados = computed(() => {
  let resultado = clients.value

  // Filtra por status
  if (filtroAtivo.value === true) {
    resultado = clientesAtivos.value
  } else if (filtroAtivo.value === false) {
    resultado = clientesInativos.value
  }

  // Filtra por busca
  if (buscaCliente.value) {
    const busca = buscaCliente.value.toLowerCase()
    resultado = resultado.filter(c => 
      c.name?.toLowerCase().includes(busca) ||
      c.document?.toLowerCase().includes(busca) ||
      c.phone?.toLowerCase().includes(busca) ||
      c.email?.toLowerCase().includes(busca)
    )
  }

  return resultado
})

// Paginação
const totalPaginas = computed(() => {
  return Math.ceil(clientesFiltrados.value.length / itensPorPagina.value)
})

const clientesPaginados = computed(() => {
  const inicio = (paginaAtual.value - 1) * itensPorPagina.value
  const fim = inicio + itensPorPagina.value
  return clientesFiltrados.value.slice(inicio, fim)
})

const proximaPagina = () => {
  if (paginaAtual.value < totalPaginas.value) {
    paginaAtual.value++
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

const paginaAnterior = () => {
  if (paginaAtual.value > 1) {
    paginaAtual.value--
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

// Watch para resetar página quando filtros mudam
watch([filtroAtivo, buscaCliente], () => {
  paginaAtual.value = 1
})

const loadClients = async () => {
  try {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .order('name')

    if (error) throw error
    clients.value = data || []
  } catch (error) {
    console.error('Erro ao carregar clientes:', error)
    alert('Erro ao carregar clientes')
  }
}

const filtrarClientes = () => {
  // A filtragem é feita automaticamente pelo computed clientesFiltrados
}

const editClient = (client) => {
  editingClient.value = client
  form.value = { ...client }
  showModal.value = true
}

const saveClient = async () => {
  loading.value = true
  try {
    if (editingClient.value) {
      const { error } = await supabase
        .from('clients')
        .update(form.value)
        .eq('id', editingClient.value.id)

      if (error) throw error
      alert('✅ Cliente atualizado com sucesso!')
    } else {
      const { error } = await supabase
        .from('clients')
        .insert([{ ...form.value, ativo: true }])

      if (error) throw error
      alert('✅ Cliente cadastrado com sucesso!')
    }

    await loadClients()
    closeModal()
  } catch (error) {
    console.error('Erro:', error)
    alert('❌ Erro ao salvar cliente: ' + error.message)
  } finally {
    loading.value = false
  }
}

const toggleClientStatus = async (client) => {
  const novoStatus = !client.ativo
  const acao = novoStatus ? 'ativar' : 'inativar'
  
  if (!confirm(`Deseja ${acao} o cliente "${client.name}"?`)) {
    return
  }
  
  try {
    const { error } = await supabase
      .from('clients')
      .update({ ativo: novoStatus })
      .eq('id', client.id)
    
    if (error) throw error
    
    alert(`✅ Cliente ${novoStatus ? 'ativado' : 'inativado'} com sucesso!`)
    await loadClients()
  } catch (error) {
    console.error('Erro:', error)
    alert('❌ Erro ao alterar status do cliente: ' + error.message)
  }
}

const confirmarExclusao = (client) => {
  clienteParaExcluir.value = client
  showDeleteModal.value = true
}

const excluirCliente = async () => {
  loading.value = true
  try {
    const { error } = await supabase
      .from('clients')
      .delete()
      .eq('id', clienteParaExcluir.value.id)

    if (error) throw error

    alert('🗑️ Cliente excluído permanentemente!')
    showDeleteModal.value = false
    clienteParaExcluir.value = null
    await loadClients()
  } catch (error) {
    console.error('Erro ao excluir cliente:', error)
    
    if (error.code === '23503') {
      alert('❌ Não é possível excluir este cliente pois ele possui vendas/pedidos registrados. Você pode inativá-lo ao invés de excluir.')
    } else {
      alert('Erro ao excluir cliente: ' + error.message)
    }
  } finally {
    loading.value = false
  }
}

const closeModal = () => {
  showModal.value = false
  editingClient.value = null
  form.value = { 
    type: 'pf', 
    name: '', 
    document: '', 
    phone: '', 
    email: '', 
    address: '',
    observacoes: '',
    requires_invoice: false,
    ativo: true 
  }
}

onMounted(loadClients)
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
