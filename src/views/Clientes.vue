<template>
  <Layout>
    <div class="space-y-6 pb-20 md:pb-6">
      <div class="flex flex-col md:flex-row md:items-center md:justify-between">
        <h2 class="text-2xl md:text-3xl font-bold text-gray-900">Clientes</h2>
        <button @click="showModal = true" class="mt-4 md:mt-0 btn-primary">+ Novo Cliente</button>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div v-for="client in clients" :key="client.id" class="card hover:shadow-lg transition-shadow">
          <div class="flex items-start justify-between mb-3">
            <div>
              <h3 class="text-lg font-bold text-gray-900">{{ client.name }}</h3>
              <p class="text-sm text-gray-600">{{ client.type === 'pj' ? 'Pessoa Jurídica' : 'Pessoa Física' }}</p>
            </div>
            <button @click="editClient(client)" class="text-primary-600">✏️</button>
          </div>
          <div class="space-y-2 text-sm">
            <p><strong>Documento:</strong> {{ client.document }}</p>
            <p><strong>Telefone:</strong> {{ client.phone }}</p>
            <p><strong>E-mail:</strong> {{ client.email }}</p>
            <p v-if="client.requires_invoice" class="text-blue-600 font-semibold">✓ Emite nota fiscal</p>
          </div>
        </div>
      </div>

      <div v-if="showModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div class="bg-white rounded-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
          <div class="flex items-center justify-between mb-6">
            <h3 class="text-xl font-bold">{{ editingClient ? 'Editar' : 'Novo' }} Cliente</h3>
            <button @click="closeModal" class="text-gray-400">✕</button>
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

const clients = ref([])
const showModal = ref(false)
const loading = ref(false)
const editingClient = ref(null)

const form = ref({
  type: 'pf',
  name: '',
  document: '',
  phone: '',
  email: '',
  address: '',
  requires_invoice: false
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
    } else {
      await supabase.from('clients').insert([form.value])
    }
    await loadClients()
    closeModal()
  } catch (error) {
    alert('Erro ao salvar cliente')
  } finally {
    loading.value = false
  }
}

const closeModal = () => {
  showModal.value = false
  editingClient.value = null
  form.value = { type: 'pf', name: '', document: '', phone: '', email: '', address: '', requires_invoice: false }
}

onMounted(loadClients)
</script>
