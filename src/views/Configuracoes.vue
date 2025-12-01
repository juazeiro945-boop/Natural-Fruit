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

        <!-- Tabela de Usuários Desktop -->
        <div class="hidden md:block overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nome</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Senha</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Horário</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ações</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="usuario in usuarios" :key="usuario.id">
                <td class="px-4 py-3">{{ usuario.name }}</td>
                <td class="px-4 py-3 text-sm">{{ usuario.email }}</td>
                <td class="px-4 py-3">
                  <div class="flex items-center space-x-2">
                    <code class="bg-gray-100 px-2 py-1 rounded text-sm font-mono">
                      {{ senhasVisiveis[usuario.id] ? (usuario.senha_temp || 'Não disponível') : '••••••••' }}
                    </code>
                    <button 
                      @click="toggleSenhaVisivel(usuario.id)" 
                      class="text-gray-600 hover:text-gray-800 p-1"
                      :title="senhasVisiveis[usuario.id] ? 'Ocultar senha' : 'Mostrar senha'"
                    >
                      {{ senhasVisiveis[usuario.id] ? '🙈' : '👁️' }}
                    </button>
                    <button 
                      v-if="usuario.senha_temp"
                      @click="copiarSenha(usuario.senha_temp)" 
                      class="text-blue-600 hover:text-blue-800 p-1"
                      title="Copiar senha"
                    >
                      📋
                    </button>
                  </div>
                </td>
                <td class="px-4 py-3">
                  <span class="badge" :class="getBadgeClass(usuario.tipo_usuario)">
                    {{ getTipoLabel(usuario.tipo_usuario) }}
                  </span>
                </td>
                <td class="px-4 py-3">
                  <span v-if="usuario.horario_restrito" class="text-xs">
                    🕐 {{ usuario.horario_inicio }} - {{ usuario.horario_fim }}
                  </span>
                  <span v-else class="text-xs text-gray-500">Sem restrição</span>
                </td>
                <td class="px-4 py-3">
                  <span class="badge" :class="usuario.ativo ? 'badge-success' : 'badge-danger'">
                    {{ usuario.ativo ? 'Ativo' : 'Inativo' }}
                  </span>
                </td>
                <td class="px-4 py-3">
                  <div class="flex space-x-2">
                    <button @click="gerenciarPermissoes(usuario)" class="text-green-600 hover:text-green-800" title="Gerenciar Permissões">
                      🔐
                    </button>
                    <button @click="editarUsuario(usuario)" class="text-blue-600 hover:text-blue-800" title="Editar">
                      ✏️
                    </button>
                    <button @click="resetarSenha(usuario)" class="text-orange-600 hover:text-orange-800" title="Alterar senha">
                      🔑
                    </button>
                    <button 
                      @click="toggleStatusUsuario(usuario)" 
                      class="text-yellow-600 hover:text-yellow-800"
                      :title="usuario.ativo ? 'Desativar' : 'Ativar'"
                    >
                      {{ usuario.ativo ? '🔒' : '🔓' }}
                    </button>
                    <button 
                      @click="debugUsuario(usuario)" 
                      class="text-gray-600 hover:text-gray-800"
                      title="Debug"
                    >
                      🐛
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Cards Mobile -->
        <div class="md:hidden space-y-4">
          <div v-for="usuario in usuarios" :key="usuario.id" class="bg-white border rounded-lg p-4 shadow-sm">
            <div class="flex justify-between items-start mb-3">
              <div class="flex-1">
                <h4 class="font-bold text-gray-900">{{ usuario.name }}</h4>
                <p class="text-sm text-gray-600">{{ usuario.email }}</p>
              </div>
              <span class="badge" :class="usuario.ativo ? 'badge-success' : 'badge-danger'">
                {{ usuario.ativo ? 'Ativo' : 'Inativo' }}
              </span>
            </div>

            <div class="mb-3">
              <p class="text-xs text-gray-500 mb-1">Tipo:</p>
              <span class="badge" :class="getBadgeClass(usuario.tipo_usuario)">
                {{ getTipoLabel(usuario.tipo_usuario) }}
              </span>
            </div>

            <div v-if="usuario.horario_restrito" class="mb-3">
              <p class="text-xs text-gray-500 mb-1">Horário de Trabalho:</p>
              <p class="text-sm font-semibold">🕐 {{ usuario.horario_inicio }} - {{ usuario.horario_fim }}</p>
            </div>

            <div class="mb-3">
              <p class="text-xs text-gray-500 mb-1">Senha:</p>
              <div class="flex items-center space-x-2">
                <code class="bg-gray-100 px-2 py-1 rounded text-sm font-mono flex-1">
                  {{ senhasVisiveis[usuario.id] ? (usuario.senha_temp || 'Não disponível') : '••••••••' }}
                </code>
                <button 
                  @click="toggleSenhaVisivel(usuario.id)" 
                  class="text-gray-600 hover:text-gray-800 p-2"
                >
                  {{ senhasVisiveis[usuario.id] ? '🙈' : '👁️' }}
                </button>
                <button 
                  v-if="usuario.senha_temp"
                  @click="copiarSenha(usuario.senha_temp)" 
                  class="text-blue-600 hover:text-blue-800 p-2"
                >
                  📋
                </button>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-2 pt-2 border-t">
              <button @click="gerenciarPermissoes(usuario)" class="bg-green-50 text-green-600 py-2 rounded-lg text-sm font-medium">
                🔐 Permissões
              </button>
              <button @click="editarUsuario(usuario)" class="bg-blue-50 text-blue-600 py-2 rounded-lg text-sm font-medium">
                ✏️ Editar
              </button>
              <button @click="resetarSenha(usuario)" class="bg-orange-50 text-orange-600 py-2 rounded-lg text-sm font-medium">
                🔑 Senha
              </button>
              <button 
                @click="toggleStatusUsuario(usuario)" 
                class="py-2 rounded-lg text-sm font-medium"
                :class="usuario.ativo ? 'bg-yellow-50 text-yellow-600' : 'bg-green-50 text-green-600'"
              >
                {{ usuario.ativo ? '🔒 Desativar' : '🔓 Ativar' }}
              </button>
            </div>
          </div>
        </div>

        <div class="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p class="text-sm text-blue-800">
            <strong>ℹ️ Informação:</strong> Clique em "🔐 Permissões" para controlar quais páginas cada usuário pode acessar.
          </p>
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
        <h3 class="text-lg font-bold mb-4">Alterar Minha Senha</h3>
        <form @submit.prevent="changePassword" class="space-y-4">
          <div>
            <label class="label">Nova Senha (mínimo 6 caracteres)</label>
            <input v-model="newPassword" type="password" class="input-field" minlength="6" />
          </div>
          <div>
            <label class="label">Confirmar Nova Senha</label>
            <input v-model="confirmPassword" type="password" class="input-field" minlength="6" />
          </div>
          <button type="submit" class="btn-primary">Alterar Senha</button>
        </form>
      </div>

      <!-- Sobre o Sistema -->
      <div class="card">
        <h3 class="text-lg font-bold mb-4">Sobre o Sistema</h3>
        <div class="space-y-2 text-sm">
          <p><strong>Nome:</strong> Natural Fruit PWA</p>
          <p><strong>Versão:</strong> 3.5.0</p>
          <p><strong>Desenvolvido para:</strong> Natural Fruit - Gestão de Produção</p>
          <p><strong>Seu perfil:</strong> {{ authStore.userType }}</p>
          <p><strong>Sistema:</strong> Permissões personalizadas por página + Controle de horário</p>
        </div>
      </div>
    </div>

    <!-- MODAL: Gerenciar Permissões -->
    <div v-if="showModalPermissoes" class="modal-overlay" @click.self="closeModalPermissoes">
      <div class="modal-content max-w-4xl">
        <div class="flex justify-between items-center mb-4">
          <div>
            <h3 class="text-xl font-bold">🔐 Gerenciar Permissões</h3>
            <p class="text-sm text-gray-600 mt-1">
              Usuário: <strong>{{ usuarioPermissoes?.name }}</strong> ({{ getTipoLabel(usuarioPermissoes?.tipo_usuario) }})
            </p>
          </div>
          <div class="flex space-x-2">
            <button @click="debugPermissoes" class="text-gray-500 hover:text-gray-700 p-2" title="Debug">
              🐛
            </button>
            <button @click="closeModalPermissoes" class="text-gray-500 hover:text-gray-700 text-2xl">×</button>
          </div>
        </div>

        <div class="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p class="text-sm text-yellow-800">
            <strong>💡 Dica:</strong> Marque as páginas que este usuário poderá acessar. As alterações são salvas automaticamente.
          </p>
        </div>

        <div v-if="loadingPermissoes" class="text-center py-8">
          <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          <p class="mt-2 text-gray-600">Carregando permissões...</p>
        </div>

        <div v-else class="space-y-4 max-h-96 overflow-y-auto">
          <div 
            v-for="pagina in paginasDisponiveis" 
            :key="pagina.id"
            class="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <div class="flex items-center space-x-3 flex-1">
              <span class="text-3xl">{{ pagina.icone }}</span>
              <div>
                <p class="font-semibold text-gray-900">{{ pagina.nome }}</p>
                <p class="text-sm text-gray-600">{{ pagina.descricao }}</p>
                <p class="text-xs text-gray-500 mt-1">
                  <strong>Rota:</strong> {{ pagina.rota }}
                  <span v-if="pagina.requer_admin" class="ml-2 text-orange-600">👑 Requer Admin</span>
                </p>
              </div>
            </div>
            <div class="flex items-center space-x-2">
              <label class="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  :checked="temPermissao(pagina.id)"
                  @change="togglePermissao(pagina)"
                  :disabled="pagina.requer_admin && usuarioPermissoes?.tipo_usuario !== 'administrador'"
                  class="sr-only peer"
                />
                <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
              </label>
              <span class="text-sm font-medium" :class="temPermissao(pagina.id) ? 'text-green-600' : 'text-gray-400'">
                {{ temPermissao(pagina.id) ? '✅ Permitido' : '❌ Bloqueado' }}
              </span>
            </div>
          </div>
        </div>

        <div class="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p class="text-sm text-blue-800 mb-2"><strong>ℹ️ Observações:</strong></p>
          <ul class="text-sm text-blue-700 space-y-1 ml-4 list-disc">
            <li>Páginas marcadas com 👑 só podem ser acessadas por administradores</li>
            <li>As alterações são salvas automaticamente ao marcar/desmarcar</li>
            <li>O usuário precisa fazer logout e login novamente para ver as mudanças</li>
          </ul>
        </div>

        <div class="flex justify-end mt-6">
          <button @click="closeModalPermissoes" class="btn-primary">
            Concluir
          </button>
        </div>
      </div>
    </div>

    <!-- Modal Novo/Editar Usuário -->
    <div v-if="showModalUsuario" class="modal-overlay" @click.self="closeModalUsuario">
      <div class="modal-content max-w-2xl">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-xl font-bold">{{ editandoUsuario ? 'Editar Usuário' : 'Novo Usuário' }}</h3>
          <button @click="closeModalUsuario" class="text-gray-500 hover:text-gray-700 text-2xl">×</button>
        </div>

        <form @submit.prevent="salvarUsuario" class="space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                required 
              />
              <p v-if="editandoUsuario" class="text-xs text-orange-600 mt-1">
                ⚠️ Alterar o email afetará o login do usuário
              </p>
            </div>
          </div>

          <div>
            <label class="label">Telefone</label>
            <input v-model="formUsuario.telefone" class="input-field" placeholder="(00) 00000-0000" />
          </div>

          <div v-if="!editandoUsuario">
            <label class="label">Senha * (mínimo 6 caracteres)</label>
            <div class="relative">
              <input v-model="formUsuario.password" type="text" class="input-field pr-10" required minlength="6" />
              <button 
                type="button"
                @click="formUsuario.password = gerarSenhaAleatoria()" 
                class="absolute right-2 top-1/2 -translate-y-1/2 text-blue-600 hover:text-blue-800 text-xl"
                title="Gerar senha aleatória"
              >
                🎲
              </button>
            </div>
            <p class="text-xs text-gray-500 mt-1">💡 Clique no dado para gerar senha aleatória</p>
          </div>

          <div>
            <label class="label">Tipo de Usuário *</label>
            <select v-model="formUsuario.tipo_usuario" class="input-field" required>
              <option value="administrador">👑 Administrador - Acesso Total</option>
              <option value="escritorio">📋 Escritório - Gestão Completa</option>
              <option value="vendedor">🚚 Vendedor - Apenas Entregas</option>
            </select>
          </div>

          <div class="border-2 border-orange-200 rounded-lg p-4 bg-orange-50">
            <div class="flex items-center space-x-3 mb-3">
              <input 
                v-model="formUsuario.horario_restrito" 
                type="checkbox" 
                id="horario-restrito"
                class="w-5 h-5 text-orange-600 rounded focus:ring-orange-500"
              />
              <label for="horario-restrito" class="font-semibold text-gray-900">
                🕐 Restringir Acesso por Horário
              </label>
            </div>

            <div v-if="formUsuario.horario_restrito" class="grid grid-cols-2 gap-4 mt-3">
              <div>
                <label class="label text-sm">Horário Início *</label>
                <input 
                  v-model="formUsuario.horario_inicio" 
                  type="time" 
                  required
                  class="input-field"
                />
              </div>
              <div>
                <label class="label text-sm">Horário Fim *</label>
                <input 
                  v-model="formUsuario.horario_fim" 
                  type="time" 
                  required
                  class="input-field"
                />
              </div>
            </div>

            <p class="text-xs text-orange-700 mt-2">
              ⚠️ O usuário só poderá fazer login e acessar o sistema dentro deste horário
            </p>
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
            <p class="font-semibold text-blue-900 mb-2">Permissões padrão por tipo:</p>
            <ul class="space-y-1 text-blue-800">
              <li><strong>Administrador:</strong> Acesso total a todas as páginas</li>
              <li><strong>Escritório:</strong> Gestão completa incluindo pedidos e estoque</li>
              <li><strong>Vendedor:</strong> Dashboard de pedidos, vendas e trocas</li>
            </ul>
            <p class="mt-2 text-blue-700">
              💡 Você pode personalizar após criar o usuário clicando em "🔐 Permissões"
            </p>
          </div>

          <div class="flex space-x-2">
            <button type="submit" class="btn-primary flex-1" :disabled="loadingSave">
              {{ loadingSave ? 'Salvando...' : (editandoUsuario ? 'Salvar Alterações' : 'Criar Usuário') }}
            </button>
            <button type="button" @click="closeModalUsuario" class="btn-secondary flex-1">
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal Alterar Senha -->
    <div v-if="showModalResetSenha" class="modal-overlay" @click.self="closeModalResetSenha">
      <div class="modal-content max-w-md">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-xl font-bold">🔑 Alterar Senha</h3>
          <button @click="closeModalResetSenha" class="text-gray-500 hover:text-gray-700 text-2xl">×</button>
        </div>

        <div class="mb-4 p-4 bg-gray-50 rounded-lg">
          <p class="text-gray-700 mb-1"><strong>Usuário:</strong> {{ usuarioResetSenha?.name }}</p>
          <p class="text-gray-700"><strong>Email:</strong> {{ usuarioResetSenha?.email }}</p>
        </div>

        <form @submit.prevent="confirmarResetSenha" class="space-y-4">
          <div>
            <label class="label">Nova Senha * (mínimo 6 caracteres)</label>
            <div class="relative">
              <input v-model="novaSenhaReset" type="text" class="input-field pr-10" required minlength="6" />
              <button 
                type="button"
                @click="novaSenhaReset = gerarSenhaAleatoria()" 
                class="absolute right-2 top-1/2 -translate-y-1/2 text-blue-600 hover:text-blue-800 text-xl"
                title="Gerar senha aleatória"
              >
                🎲
              </button>
            </div>
            <p class="text-xs text-gray-500 mt-1">💡 Esta será a senha para fazer login</p>
          </div>

          <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p class="text-sm text-yellow-800">
              <strong>⚠️ Atenção:</strong> A senha de login será alterada. O usuário precisará usar esta nova senha.
            </p>
          </div>

          <div class="flex space-x-2">
            <button type="submit" class="btn-primary flex-1" :disabled="loadingReset">
              {{ loadingReset ? 'Alterando...' : 'Alterar Senha' }}
            </button>
            <button type="button" @click="closeModalResetSenha" class="btn-secondary flex-1">Cancelar</button>
          </div>
        </form>
      </div>
    </div>
  </Layout>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue'
import { useAuthStore } from '../stores/auth'
import { supabase } from '../lib/supabase'
import Layout from '../components/Layout.vue'

const authStore = useAuthStore()

const profile = ref({ name: '', email: '', telefone: '' })
const newPassword = ref('')
const confirmPassword = ref('')
const usuarios = ref([])
const showModalUsuario = ref(false)
const showModalResetSenha = ref(false)
const showModalPermissoes = ref(false)
const editandoUsuario = ref(false)
const usuarioResetSenha = ref(null)
const usuarioPermissoes = ref(null)
const novaSenhaReset = ref('')
const senhasVisiveis = reactive({})
const loadingReset = ref(false)
const loadingPermissoes = ref(false)
const loadingSave = ref(false)
const paginasDisponiveis = ref([])
const permissoesUsuario = ref([])

const formUsuario = ref({
  name: '',
  email: '',
  telefone: '',
  password: '',
  tipo_usuario: 'escritorio',
  ativo: true,
  horario_restrito: false,
  horario_inicio: '08:00',
  horario_fim: '18:00'
})

// Funções de Debug
const debugPermissoes = () => {
  console.log('🔍 DEBUG Permissões:')
  console.log('Usuário:', usuarioPermissoes.value)
  console.log('Páginas disponíveis:', paginasDisponiveis.value)
  console.log('Permissões atuais:', permissoesUsuario.value)
}

const debugUsuario = (usuario) => {
  console.log('🔍 DEBUG Usuário:', usuario)
}

const loadProfile = () => {
  profile.value = {
    name: authStore.userProfile?.name || '',
    email: authStore.user?.email || '',
    telefone: authStore.userProfile?.telefone || ''
  }
}

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
    alert('✅ Perfil atualizado!')
  } catch (error) {
    console.error('Erro:', error)
    alert('❌ Erro ao atualizar perfil')
  }
}

const changePassword = async () => {
  if (newPassword.value !== confirmPassword.value) {
    alert('❌ As senhas não coincidem')
    return
  }
  
  if (newPassword.value.length < 6) {
    alert('❌ A senha deve ter no mínimo 6 caracteres')
    return
  }
  
  try {
    const { error } = await supabase.auth.updateUser({ password: newPassword.value })
    
    if (error) throw error

    await supabase
      .from('profiles')
      .update({ senha_temp: newPassword.value })
      .eq('id', authStore.user.id)
    
    alert('✅ Senha alterada!')
    newPassword.value = ''
    confirmPassword.value = ''
  } catch (error) {
    console.error('Erro:', error)
    alert('❌ Erro ao alterar senha')
  }
}

const carregarUsuarios = async () => {
  if (!authStore.isAdmin) return
  
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    
    console.log('✅ Usuários carregados:', data?.length)
    usuarios.value = data || []
  } catch (error) {
    console.error('Erro:', error)
    alert('❌ Erro ao carregar usuários')
  }
}

const carregarPermissoesUsuario = async (usuarioId) => {
  try {
    const { data: permissoes, error } = await supabase
      .from('user_page_permissions')
      .select('*')
      .eq('user_id', usuarioId)
    
    if (error) throw error
    
    console.log('✅ Permissões carregadas:', permissoes)
    return permissoes || []
  } catch (error) {
    console.error('❌ Erro ao carregar permissões:', error)
    return []
  }
}

const gerenciarPermissoes = async (usuario) => {
  usuarioPermissoes.value = usuario
  showModalPermissoes.value = true
  loadingPermissoes.value = true
  
  try {
    const { data: paginas, error: errorPaginas } = await supabase
      .from('system_pages')
      .select('*')
      .eq('ativo', true)
      .order('ordem')
    
    if (errorPaginas) throw errorPaginas
    
    paginasDisponiveis.value = paginas || []
    
    permissoesUsuario.value = await carregarPermissoesUsuario(usuario.id)
    
  } catch (error) {
    console.error('Erro:', error)
    alert('❌ Erro ao carregar permissões')
  } finally {
    loadingPermissoes.value = false
  }
}

const temPermissao = (paginaId) => {
  const permissao = permissoesUsuario.value.find(p => p.page_id === paginaId)
  return permissao?.pode_acessar || false
}

const togglePermissao = async (pagina) => {
  try {
    const permissaoAtual = temPermissao(pagina.id)
    const novaPermissao = !permissaoAtual
    
    // Verifica se é uma página que requer admin
    if (pagina.requer_admin && usuarioPermissoes.value?.tipo_usuario !== 'administrador') {
      alert('❌ Esta página só pode ser acessada por administradores')
      return
    }
    
    console.log('🔵 Alterando permissão:', {
      usuario: usuarioPermissoes.value?.name,
      pagina: pagina.nome,
      novaPermissao: novaPermissao
    })
    
    // Remove primeiro qualquer permissão existente
    const { error: deleteError } = await supabase
      .from('user_page_permissions')
      .delete()
      .eq('user_id', usuarioPermissoes.value.id)
      .eq('page_id', pagina.id)
    
    if (deleteError) {
      console.error('❌ Erro ao remover permissão:', deleteError)
      throw deleteError
    }
    
    // Se a nova permissão for true, insere
    if (novaPermissao) {
      const { error: insertError } = await supabase
        .from('user_page_permissions')
        .insert({
          user_id: usuarioPermissoes.value.id,
          page_id: pagina.id,
          pode_acessar: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
      
      if (insertError) {
        console.error('❌ Erro ao inserir permissão:', insertError)
        throw insertError
      }
    }
    
    // Atualiza a lista local de permissões
    const index = permissoesUsuario.value.findIndex(p => p.page_id === pagina.id)
    if (index >= 0) {
      if (novaPermissao) {
        permissoesUsuario.value[index].pode_acessar = true
      } else {
        permissoesUsuario.value.splice(index, 1)
      }
    } else if (novaPermissao) {
      permissoesUsuario.value.push({
        user_id: usuarioPermissoes.value.id,
        page_id: pagina.id,
        pode_acessar: true
      })
    }
    
    console.log('✅ Permissão atualizada com sucesso')
    
  } catch (error) {
    console.error('❌ Erro completo ao alterar permissão:', error)
    alert('❌ Erro ao alterar permissão: ' + error.message)
  }
}

const closeModalPermissoes = () => {
  showModalPermissoes.value = false
  usuarioPermissoes.value = null
  paginasDisponiveis.value = []
  permissoesUsuario.value = []
}

const toggleSenhaVisivel = (usuarioId) => {
  senhasVisiveis[usuarioId] = !senhasVisiveis[usuarioId]
}

const copiarSenha = async (senha) => {
  try {
    await navigator.clipboard.writeText(senha)
    alert('✅ Senha copiada!')
  } catch (error) {
    console.error('Erro:', error)
    alert('❌ Erro ao copiar')
  }
}

const resetarSenha = (usuario) => {
  usuarioResetSenha.value = usuario
  novaSenhaReset.value = gerarSenhaAleatoria()
  showModalResetSenha.value = true
}

const gerarSenhaAleatoria = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789'
  let senha = ''
  for (let i = 0; i < 8; i++) {
    senha += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return senha
}

const confirmarResetSenha = async () => {
  if (!confirm(`⚠️ Alterar senha de ${usuarioResetSenha.value.name}?\n\nNova senha: ${novaSenhaReset.value}\n\nConfirma?`)) {
    return
  }

  loadingReset.value = true
  
  try {
    const { data, error } = await supabase.functions.invoke('reset-user-password', {
      body: {
        userId: usuarioResetSenha.value.id,
        newPassword: novaSenhaReset.value
      }
    })

    if (error) throw error
    if (!data.success) throw new Error(data.error)

    await supabase
      .from('profiles')
      .update({ senha_temp: novaSenhaReset.value })
      .eq('id', usuarioResetSenha.value.id)
    
    await navigator.clipboard.writeText(novaSenhaReset.value)
    
    alert(`✅ SENHA ALTERADA!\n\nNova senha: ${novaSenhaReset.value}\n\n📋 Copiada!`)
    
    closeModalResetSenha()
    await carregarUsuarios()
    
  } catch (error) {
    console.error('Erro:', error)
    alert('❌ Erro: ' + error.message)
  } finally {
    loadingReset.value = false
  }
}

const closeModalResetSenha = () => {
  showModalResetSenha.value = false
  usuarioResetSenha.value = null
  novaSenhaReset.value = ''
}

const openModalNovoUsuario = () => {
  editandoUsuario.value = false
  formUsuario.value = {
    name: '',
    email: '',
    telefone: '',
    password: gerarSenhaAleatoria(),
    tipo_usuario: 'escritorio',
    ativo: true,
    horario_restrito: false,
    horario_inicio: '08:00',
    horario_fim: '18:00'
  }
  showModalUsuario.value = true
}

const editarUsuario = (usuario) => {
  editandoUsuario.value = true
  formUsuario.value = {
    id: usuario.id,
    name: usuario.name,
    email: usuario.email,
    telefone: usuario.telefone || '',
    tipo_usuario: usuario.tipo_usuario,
    ativo: usuario.ativo,
    horario_restrito: usuario.horario_restrito || false,
    horario_inicio: usuario.horario_inicio || '08:00',
    horario_fim: usuario.horario_fim || '18:00',
    password: ''
  }
  showModalUsuario.value = true
}

const salvarUsuario = async () => {
  loadingSave.value = true
  try {
    if (editandoUsuario.value) {
      console.log('🔵 Editando usuário:', formUsuario.value)

      // Primeiro, atualiza o perfil
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          name: formUsuario.value.name,
          email: formUsuario.value.email,
          telefone: formUsuario.value.telefone,
          tipo_usuario: formUsuario.value.tipo_usuario,
          ativo: formUsuario.value.ativo,
          horario_restrito: formUsuario.value.horario_restrito,
          horario_inicio: formUsuario.value.horario_restrito ? formUsuario.value.horario_inicio : null,
          horario_fim: formUsuario.value.horario_restrito ? formUsuario.value.horario_fim : null,
          updated_at: new Date().toISOString()
        })
        .eq('id', formUsuario.value.id)
      
      if (profileError) throw profileError

      // Verifica se o email foi alterado
      const usuarioOriginal = usuarios.value.find(u => u.id === formUsuario.value.id)
      if (usuarioOriginal && usuarioOriginal.email !== formUsuario.value.email) {
        console.log('🔵 Atualizando email do usuário...')
        
        // Atualiza o email no Auth usando admin API
        const { error: authError } = await supabase.auth.admin.updateUserById(
          formUsuario.value.id,
          { email: formUsuario.value.email }
        )
        
        if (authError) {
          console.error('❌ Erro ao atualizar email:', authError)
          throw new Error('Erro ao atualizar email: ' + authError.message)
        }
      }
      
      alert('✅ Usuário atualizado!')
    } else {
      console.log('🔵 Criando usuário...')
      
      const result = await authStore.signUp(
        formUsuario.value.email,
        formUsuario.value.password,
        formUsuario.value.name,
        formUsuario.value.tipo_usuario,
        formUsuario.value.telefone
      )
      
      console.log('🔵 Resultado:', result)
      
      if (!result.success) throw new Error(result.error)

      await supabase
        .from('profiles')
        .update({
          horario_restrito: formUsuario.value.horario_restrito,
          horario_inicio: formUsuario.value.horario_restrito ? formUsuario.value.horario_inicio : null,
          horario_fim: formUsuario.value.horario_restrito ? formUsuario.value.horario_fim : null,
          senha_temp: formUsuario.value.password
        })
        .eq('id', result.userId)
      
      await navigator.clipboard.writeText(formUsuario.value.password)
      
      alert(`✅ Usuário criado!\n\nSenha: ${formUsuario.value.password}\n\n📋 Copiada!`)
    }
    
    closeModalUsuario()
    
    // Aguarda um pouco e recarrega
    console.log('🔵 Aguardando para recarregar...')
    setTimeout(async () => {
      console.log('🔵 Recarregando usuários...')
      await carregarUsuarios()
    }, 1000)
    
  } catch (error) {
    console.error('❌ Erro completo:', error)
    alert('❌ Erro: ' + error.message)
  } finally {
    loadingSave.value = false
  }
}

const toggleStatusUsuario = async (usuario) => {
  const novoStatus = !usuario.ativo
  const acao = novoStatus ? 'ativar' : 'desativar'
  
  if (!confirm(`Deseja ${acao} ${usuario.name}?`)) return
  
  try {
    const { error } = await supabase
      .from('profiles')
      .update({ 
        ativo: novoStatus,
        updated_at: new Date().toISOString()
      })
      .eq('id', usuario.id)
    
    if (error) throw error
    
    alert(`✅ Usuário ${novoStatus ? 'ativado' : 'desativado'}!`)
    await carregarUsuarios()
  } catch (error) {
    console.error('Erro:', error)
    alert('❌ Erro ao alterar status')
  }
}

const closeModalUsuario = () => {
  showModalUsuario.value = false
  editandoUsuario.value = false
}

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
  @apply bg-white rounded-xl shadow-lg p-4 md:p-6;
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
