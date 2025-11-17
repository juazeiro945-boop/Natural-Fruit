<template>
  <Layout>
    <div class="space-y-6 pb-20 md:pb-6">
      <h2 class="text-2xl md:text-3xl font-bold text-gray-900">Configurações</h2>

      <!-- Gerenciamento de Usuários (Somente Administrador) -->
      <div v-if="authStore.isAdmin" class="card">
        <div class="flex justify-between items-center mb-6">
          <h3 class="text-lg font-bold">Gerenciamento de Usuários</h3>
          <button @click="openModalNovoUsuario" class="btn-primary">
            ➕ Novo Usuário
          </button>
        </div>

        <!-- Tabela de Usuários -->
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nome</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ações</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="usuario in usuarios" :key="usuario.id">
                <td class="px-4 py-3">{{ usuario.name }}</td>
                <td class="px-4 py-3">{{ usuario.email }}</td>
                <td class="px-4 py-3">
                  <span class="badge" :class="getBadgeClass(usuario.tipo_usuario)">
                    {{ getTipoLabel(usuario.tipo_usuario) }}
                  </span>
                </td>
                <td class="px-4 py-3">
                  <span class="badge" :class="usuario.ativo ? 'badge-success' : 'badge-danger'">
                    {{ usuario.ativo ? 'Ativo' : 'Inativo' }}
                  </span>
                </td>
                <td class="px-4 py-3">
                  <div class="flex space-x-2">
                    <button @click="editarUsuario(usuario)" class="text-blue-600 hover:text-blue-800">
                      ✏️
                    </button>
                    <button 
                      @click="toggleStatusUsuario(usuario)" 
                      class="text-yellow-600 hover:text-yellow-800"
                      :title="usuario.ativo ? 'Desativar' : 'Ativar'"
                    >
                      {{ usuario.ativo ? '🔒' : '🔓' }}
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Perfil do Usuário -->
      <div class="card">
        <h3 class="text-lg font-bold mb-4">Perfil do Usuário</h3>
        <div class="space-y-4">
          <div>
            <label class="label">Nome</label>
            <input v-model="profile.name" class="input-field" />
          </div>
          <div>
            <label class="label">E-mail</label>
            <input v-model="profile.email" type="email" class="input-field" readonly />
          </div>
          <div v-if="authStore.userProfile?.telefone !== undefined">
            <label class="label">Telefone</label>
            <input v-model="profile.telefone" class="input-field" placeholder="(00) 00000-0000" />
          </div>
          <button @click="updateProfile" class="btn-primary">Atualizar Perfil</button>
        </div>
      </div>

      <!-- Alterar Senha -->
      <div class="card">
        <h3 class="text-lg font-bold mb-4">Alterar Senha</h3>
        <form @submit.prevent="changePassword" class="space-y-4">
          <div>
            <label class="label">Nova Senha</label>
            <input v-model="newPassword" type="password" class="input-field" />
          </div>
          <div>
            <label class="label">Confirmar Nova Senha</label>
            <input v-model="confirmPassword" type="password" class="input-field" />
          </div>
          <button type="submit" class="btn-primary">Alterar Senha</button>
        </form>
      </div>

      <!-- Sobre o Sistema -->
      <div class="card">
        <h3 class="text-lg font-bold mb-4">Sobre o Sistema</h3>
        <div class="space-y-2 text-sm">
          <p><strong>Nome:</strong> Natural Fruit PWA</p>
          <p><strong>Versão:</strong> 2.0.0</p>
          <p><strong>Desenvolvido para:</strong> Natural Fruit - Gestão de Produção</p>
          <p><strong>Seu perfil:</strong> {{ authStore.userType }}</p>
        </div>
      </div>
    </div>

    <!-- Modal Novo/Editar Usuário -->
    <div v-if="showModalUsuario" class="modal-overlay" @click.self="closeModalUsuario">
      <div class="modal-content">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-xl font-bold">{{ editandoUsuario ? 'Editar Usuário' : 'Novo Usuário' }}</h3>
          <button @click="closeModalUsuario" class="text-gray-500 hover:text-gray-700 text-2xl">×</button>
        </div>

        <form @submit.prevent="salvarUsuario" class="space-y-4">
          <div>
            <label class="label">Nome Completo *</label>
            <input v-model="formUsuario.name" class="input-field" required />
          </div>

          <div>
            <label class="label">E-mail *</label>
            <input 
              v-model="formUsuario.email" 
              type="email" 
              class="input-field" 
              :readonly="editandoUsuario"
              required 
            />
          </div>

          <div>
            <label class="label">Telefone</label>
            <input v-model="formUsuario.telefone" class="input-field" placeholder="(00) 00000-0000" />
          </div>

          <div v-if="!editandoUsuario">
            <label class="label">Senha *</label>
            <input v-model="formUsuario.password" type="password" class="input-field" required />
          </div>

          <div>
            <label class="label">Tipo de Usuário *</label>
            <select v-model="formUsuario.tipo_usuario" class="input-field" required>
              <option value="administrador">👑 Administrador - Acesso Total</option>
              <option value="escritorio">📋 Escritório - Sem Financeiro</option>
              <option value="vendedor">🚚 Vendedor - Apenas Entregas</option>
            </select>
          </div>

          <div class="flex items-center space-x-2">
            <input 
              v-model="formUsuario.ativo" 
              type="checkbox" 
              id="usuario-ativo"
              class="w-4 h-4 text-primary-600"
            />
            <label for="usuario-ativo" class="text-sm font-medium text-gray-700">
              Usuário Ativo (pode fazer login)
            </label>
          </div>

          <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm">
            <p class="font-semibold text-blue-900 mb-2">Permissões por tipo:</p>
            <ul class="space-y-1 text-blue-800">
              <li><strong>Administrador:</strong> Acesso total incluindo financeiro e relatórios</li>
              <li><strong>Escritório:</strong> Gestão de vendas, estoque e produção (sem financeiro)</li>
              <li><strong>Vendedor:</strong> Apenas visualizar e entregar pedidos</li>
            </ul>
          </div>

          <div class="flex space-x-2">
            <button type="submit" class="btn-primary flex-1">
              {{ editandoUsuario ? 'Salvar Alterações' : 'Criar Usuário' }}
            </button>
            <button type="button" @click="closeModalUsuario" class="btn-secondary flex-1">
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  </Layout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '../stores/auth'
import { supabase } from '../lib/supabase'
import Layout from '../components/Layout.vue'

const authStore = useAuthStore()

// Estados
const profile = ref({ name: '', email: '', telefone: '' })
const newPassword = ref('')
const confirmPassword = ref('')
const usuarios = ref([])
const showModalUsuario = ref(false)
const editandoUsuario = ref(false)
const formUsuario = ref({
  name: '',
  email: '',
  telefone: '',
  password: '',
  tipo_usuario: 'escritorio',
  ativo: true
})

// Carregar perfil do usuário logado
const loadProfile = () => {
  profile.value = {
    name: authStore.userProfile?.name || '',
    email: authStore.user?.email || '',
    telefone: authStore.userProfile?.telefone || ''
  }
}

// Atualizar perfil
const updateProfile = async () => {
  try {
    const { error } = await supabase
      .from('profiles')
      .update({ 
        name: profile.value.name,
        telefone: profile.value.telefone 
      })
      .eq('id', authStore.user.id)
    
    if (error) throw error
    
    await authStore.fetchUserProfile()
    alert('Perfil atualizado com sucesso!')
  } catch (error) {
    console.error('Erro ao atualizar perfil:', error)
    alert('Erro ao atualizar perfil: ' + error.message)
  }
}

// Alterar senha
const changePassword = async () => {
  if (newPassword.value !== confirmPassword.value) {
    alert('As senhas não coincidem')
    return
  }
  
  if (newPassword.value.length < 6) {
    alert('A senha deve ter no mínimo 6 caracteres')
    return
  }
  
  try {
    const { error } = await supabase.auth.updateUser({ password: newPassword.value })
    
    if (error) throw error
    
    alert('Senha alterada com sucesso!')
    newPassword.value = ''
    confirmPassword.value = ''
  } catch (error) {
    console.error('Erro ao alterar senha:', error)
    alert('Erro ao alterar senha: ' + error.message)
  }
}

// Carregar usuários (somente admin)
const carregarUsuarios = async () => {
  if (!authStore.isAdmin) return
  
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    
    usuarios.value = data || []
  } catch (error) {
    console.error('Erro ao carregar usuários:', error)
    alert('Erro ao carregar usuários: ' + error.message)
  }
}

// Abrir modal novo usuário
const openModalNovoUsuario = () => {
  editandoUsuario.value = false
  formUsuario.value = {
    name: '',
    email: '',
    telefone: '',
    password: '',
    tipo_usuario: 'escritorio',
    ativo: true
  }
  showModalUsuario.value = true
}

// Editar usuário
const editarUsuario = (usuario) => {
  editandoUsuario.value = true
  formUsuario.value = {
    id: usuario.id,
    name: usuario.name,
    email: usuario.email,
    telefone: usuario.telefone || '',
    tipo_usuario: usuario.tipo_usuario,
    ativo: usuario.ativo,
    password: ''
  }
  showModalUsuario.value = true
}

// Salvar usuário (criar ou editar)
const salvarUsuario = async () => {
  try {
    if (editandoUsuario.value) {
      // Atualizar usuário existente
      const { error } = await supabase
        .from('profiles')
        .update({
          name: formUsuario.value.name,
          telefone: formUsuario.value.telefone,
          tipo_usuario: formUsuario.value.tipo_usuario,
          ativo: formUsuario.value.ativo
        })
        .eq('id', formUsuario.value.id)
      
      if (error) throw error
      
      alert('Usuário atualizado com sucesso!')
    } else {
      // Criar novo usuário
      const result = await authStore.signUp(
        formUsuario.value.email,
        formUsuario.value.password,
        formUsuario.value.name,
        formUsuario.value.tipo_usuario,
        formUsuario.value.telefone
      )
      
      if (!result.success) {
        throw new Error(result.error)
      }
      
      alert('Usuário criado com sucesso! Um email de confirmação foi enviado.')
    }
    
    closeModalUsuario()
    await carregarUsuarios()
  } catch (error) {
    console.error('Erro ao salvar usuário:', error)
    alert('Erro ao salvar usuário: ' + error.message)
  }
}

// Ativar/Desativar usuário
const toggleStatusUsuario = async (usuario) => {
  const novoStatus = !usuario.ativo
  const acao = novoStatus ? 'ativar' : 'desativar'
  
  if (!confirm(`Deseja ${acao} o usuário ${usuario.name}?`)) {
    return
  }
  
  try {
    const { error } = await supabase
      .from('profiles')
      .update({ ativo: novoStatus })
      .eq('id', usuario.id)
    
    if (error) throw error
    
    alert(`Usuário ${novoStatus ? 'ativado' : 'desativado'} com sucesso!`)
    await carregarUsuarios()
  } catch (error) {
    console.error('Erro ao alterar status:', error)
    alert('Erro ao alterar status: ' + error.message)
  }
}

// Fechar modal
const closeModalUsuario = () => {
  showModalUsuario.value = false
  editandoUsuario.value = false
}

// Funções auxiliares
const getTipoLabel = (tipo) => {
  const tipos = {
    'administrador': 'Administrador',
    'escritorio': 'Escritório',
    'vendedor': 'Vendedor'
  }
  return tipos[tipo] || tipo
}

const getBadgeClass = (tipo) => {
  const classes = {
    'administrador': 'bg-purple-100 text-purple-800',
    'escritorio': 'bg-blue-100 text-blue-800',
    'vendedor': 'bg-green-100 text-green-800'
  }
  return classes[tipo] || 'bg-gray-100 text-gray-800'
}

onMounted(() => {
  loadProfile()
  if (authStore.isAdmin) {
    carregarUsuarios()
  }
})
</script>

<style scoped>
.card {
  @apply bg-white rounded-xl shadow-lg p-6;
}

.label {
  @apply block text-sm font-medium text-gray-700 mb-2;
}

.input-field {
  @apply w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all;
}

.btn-primary {
  @apply px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium;
}

.btn-secondary {
  @apply px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium;
}

.badge {
  @apply inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium;
}

.badge-success {
  @apply bg-green-100 text-green-800;
}

.badge-danger {
  @apply bg-red-100 text-red-800;
}

.modal-overlay {
  @apply fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50;
}

.modal-content {
  @apply bg-white rounded-xl shadow-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto;
}
</style>
