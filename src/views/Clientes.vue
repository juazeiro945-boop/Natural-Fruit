<template>
  <Layout>
    <div class="space-y-6 pb-20 md:pb-6">
      <div class="flex flex-col md:flex-row md:items-center md:justify-between">
        <h2 class="text-2xl md:text-3xl font-bold text-gray-900">Clientes</h2>
        <button @click="showModal = true" class="mt-4 md:mt-0 btn-primary">+ Novo Cliente</button>
      </div>

      <!-- Filtro Ativo/Inativo -->
      <div class="flex gap-2">
        <button 
          @click="filtroAtivo = 'todos'" 
          :class="filtroAtivo === 'todos' ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-700'"
          class="px-4 py-2 rounded-lg font-medium transition-colors"
        >
          Todos ({{ clients.length }})
        </button>
        <button 
          @click="filtroAtivo = true" 
          :class="filtroAtivo === true ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700'"
          class="px-4 py-2 rounded-lg font-medium transition-colors"
        >
          Ativos ({{ clientesAtivos.length }})
        </button>
        <button 
          @click="filtroAtivo = false" 
          :class="filtroAtivo === false ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-700'"
          class="px-4 py-2 rounded-lg font-medium transition-colors"
        >
          Inativos ({{ clientesInativos.length }})
        </button>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div 
          v-for="client in clientesFiltrados" 
          :key="client.id" 
          class="card hover:shadow-lg transition-shadow"
          :class="!client.ativo ? 'opacity-60 bg-gray-50' : ''"
        >
          <div class="flex items-start justify-between mb-3">
            <div class="flex-1">
              <div class="flex items-center gap-2">
                <h3 class="text-lg font-bold text-gray-900">{{ client.name }}</h3>
                <span 
                  v-if="!client.ativo" 
                  class="px-2 py-0.5 bg-red-100 text-red-800 text-xs rounded-full font-semibold"
                >
                  Inativo
                </span>
              </div>
              <p class="text-sm text-gray-600">{{ client.type === 'pj' ? 'Pessoa Jurídica' : 'Pessoa Física' }}</p>
            </div>
            <div class="flex gap-2">
              <button @click="editClient(client)" class="text-blue-600 hover:text-blue-800" title="Editar">
                ✏️
              </button>
              <button 
                @click="toggleClientStatus(client)" 
                :class="client.ativo ? 'text-yellow-600 hover:text-yellow-800' : 'text-green-600 hover:text-green-800'"
                :title="client.ativo ? 'Desativar' : 'Ativar'"
              >
                {{ client.ativo ? '🔒' : '🔓' }}
              </button>
            </div>
          </div>
          <div class="space-y-2 text-sm">
            <p><strong>Documento:</strong> {{ client.document }}</p>
            <p v-if="client.phone"><strong>Telefone:</strong> {{ client.phone }}</p>
            <p v-if="client.email"><strong>E-mail:</strong> {{ client.email }}</p>
            <p v-if="client.requires_invoice" class="text-blue-600 font-semibold">✓ Emite nota fiscal</p>
          </div>
        </div>
      </div>

      <!-- Mensagem quando não há clientes -->
      <div v-if="clientesFiltrados.length === 0" class="text-center py-12">
        <p class="text-gray-500 text-lg">
          {{ filtroAtivo === 'todos' ? 'Nenhum cliente cadastrado' : 
             filtroAtivo === true ? 'Nenhum cliente ativo' : 'Nenhum cliente inativo' }}
        </p>
      </div>

      <!-- Modal -->
      <div v-if="showModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div class="bg-white rounded-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
          <div class="flex items-center justify-between mb-6">
            <h3 class="text-xl font-bold">{{ editingClient ? 'Editar' : 'Novo' }} Cliente</h3>
            <button @click="closeModal" class="text-gray-400 hover:text-gray-600 text-2xl">✕</button>
          </div>
          <form @submit.prevent="saveClient" class="space-y-4">
            <div>
              <label class="label">Tipo</label>
              <select v-model="form.type" required class="input-field">
                <option value="pf">Pessoa Física</option>
                <option value="pj">Pessoa Jurídica</option>
              </select>
            </div>
            <div>
              <label class="label">Nome / Razão Social</label>
              <input v-model="form.name" required class="input-field" />
            </div>
            <div>
              <label class="label">{{ form.type === 'pj' ? 'CNPJ' : 'CPF' }}</label>
              <input v-model="form.document" required class="input-field" />
            </div>
            <div>
              <label class="label">Telefone</label>
              <input v-model="form.phone" type="tel" class="input-field" />
            </div>
            <div>
              <label class="label">E-mail</label>
              <input v-model="form.email" type="email" class="input-field" />
            </div>
            <div>
              <label class="label">Endereço</label>
              <textarea v-model="form.address" class="input-field" rows="2"></textarea>
            </div>
            <div class="flex items-center space-x-2">
              <input v-model="form.requires_invoice" type="checkbox" class="w-4 h-4" />
              <label class="text-sm font-medium">Requer emissão de nota fiscal</label>
            </div>
            <div v-if="editingClient" class="flex items-center space-x-2">
              <input v-model="form.ativo" type="checkbox" class="w-4 h-4" />
              <label class="text-sm font-medium">Cliente ativo</label>
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
import { ref, onMounted, computed } from 'vue'
import { supabase } from '../lib/supabase'
import Layout from '../components/Layout.vue'

const clients = ref([])
const showModal = ref(false)
const loading = ref(false)
const editingClient = ref(null)
const filtroAtivo = ref('todos')

const form = ref({
  type: 'pf',
  name: '',
  document: '',
  phone: '',
  email: '',
  address: '',
  requires_invoice: false,
  ativo: true
})

// Computed
const clientesAtivos = computed(() => clients.value.filter(c => c.ativo))
const clientesInativos = computed(() => clients.value.filter(c => !c.ativo))

const clientesFiltrados = computed(() => {
  if (filtroAtivo.value === 'todos') return clients.value
  if (filtroAtivo.value === true) return clientesAtivos.value
  if (filtroAtivo.value === false) return clientesInativos.value
  return clients.value
})

const loadClients = async () => {
  const { data } = await supabase.from('clients').select('*').order('name')
  clients.value = data || []
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
      await supabase.from('clients').update(form.value).eq('id', editingClient.value.id)
      alert('✅ Cliente atualizado com sucesso!')
    } else {
      await supabase.from('clients').insert([form.value])
      alert('✅ Cliente cadastrado com sucesso!')
    }
    await loadClients()
    closeModal()
  } catch (error) {
    console.error('Erro:', error)
    alert('❌ Erro ao salvar cliente')
  } finally {
    loading.value = false
  }
}

const toggleClientStatus = async (client) => {
  const novoStatus = !client.ativo
  const acao = novoStatus ? 'ativar' : 'desativar'
  
  if (!confirm(`Deseja ${acao} o cliente ${client.name}?`)) {
    return
  }
  
  try {
    const { error } = await supabase
      .from('clients')
      .update({ ativo: novoStatus })
      .eq('id', client.id)
    
    if (error) throw error
    
    alert(`✅ Cliente ${novoStatus ? 'ativado' : 'desativado'} com sucesso!`)
    await loadClients()
  } catch (error) {
    console.error('Erro:', error)
    alert('❌ Erro ao alterar status do cliente')
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
    requires_invoice: false,
    ativo: true 
  }
}

onMounted(loadClients)
</script>
