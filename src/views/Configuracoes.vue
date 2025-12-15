<template>
  <Layout>
    <div class="space-y-6 pb-20 md:pb-6">
      <h2 class="text-2xl md:text-3xl font-bold text-gray-900">Configurações</h2>

      <!-- Gerenciamento de Usuários (Somente Administrador) -->
      <div v-if="authStore.isAdmin" class="card">
        <div class="flex justify-between items-center mb-6">
          <div>
            <h3 class="text-lg font-bold">Gerenciamento de Usuários</h3>
            <p class="text-sm text-gray-600 mt-1">Total: {{ usuarios.length }} usuários</p>
          </div>
          <button @click="openModalNovoUsuario" class="btn-primary">
            ➕ Novo Usuário
          </button>
        </div>

        <!-- Filtros e Busca -->
        <div class="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label class="label">Buscar</label>
            <input 
              v-model="filtroBusca" 
              type="text" 
              placeholder="Nome ou email..." 
              class="input-field"
            />
          </div>
          <div>
            <label class="label">Tipo</label>
            <select v-model="filtroTipo" class="input-field">
              <option value="">Todos os tipos</option>
              <option value="administrador">Administrador</option>
              <option value="escritorio">Escritório</option>
              <option value="vendedor">Vendedor</option>
            </select>
          </div>
          <div>
            <label class="label">Status</label>
            <select v-model="filtroStatus" class="input-field">
              <option value="">Todos</option>
              <option value="ativo">Ativos</option>
              <option value="inativo">Inativos</option>
            </select>
          </div>
        </div>

        <!-- Tabela de Usuários Desktop -->
        <div class="hidden md:block overflow-x-auto rounded-lg border border-gray-200">
          <table class="w-full">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button @click="ordenarPor('name')" class="flex items-center space-x-1">
                    <span>Nome</span>
                    <span v-if="ordenacao.campo === 'name'">{{ ordenacao.direcao === 'asc' ? '↑' : '↓' }}</span>
                  </button>
                </th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Senha</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Horário</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button @click="ordenarPor('ativo')" class="flex items-center space-x-1">
                    <span>Status</span>
                    <span v-if="ordenacao.campo === 'ativo'">{{ ordenacao.direcao === 'asc' ? '↑' : '↓' }}</span>
                  </button>
                </th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="usuario in usuariosFiltrados" :key="usuario.id">
                <td class="px-4 py-3">
                  <div class="flex items-center">
                    <div class="flex-shrink-0 h-10 w-10 bg-primary-100 rounded-full flex items-center justify-center">
                      <span class="text-primary-600 font-semibold">{{ getIniciais(usuario.name) }}</span>
                    </div>
                    <div class="ml-4">
                      <div class="font-medium text-gray-900">{{ usuario.name }}</div>
                      <div class="text-sm text-gray-500">{{ formatarData(usuario.created_at) }}</div>
                    </div>
                  </div>
                </td>
                <td class="px-4 py-3 text-sm">{{ usuario.email }}</td>
                <td class="px-4 py-3">
                  <div class="flex items-center space-x-2">
                    <code class="bg-gray-100 px-2 py-1 rounded text-sm font-mono">
                      {{ senhasVisiveis[usuario.id] ? (usuario.senha_temp || '••••••••') : '••••••••' }}
                    </code>
                    <div class="flex space-x-1">
                      <button 
                        @click="toggleSenhaVisivel(usuario.id)" 
                        class="text-gray-500 hover:text-gray-700 p-1 rounded hover:bg-gray-100"
                        :title="senhasVisiveis[usuario.id] ? 'Ocultar senha' : 'Mostrar senha'"
                      >
                        <span v-if="senhasVisiveis[usuario.id]">🙈</span>
                        <span v-else>👁️</span>
                      </button>
                      <button 
                        v-if="usuario.senha_temp"
                        @click="copiarSenha(usuario.senha_temp)" 
                        class="text-gray-500 hover:text-blue-600 p-1 rounded hover:bg-blue-50"
                        title="Copiar senha"
                      >
                        📋
                      </button>
                    </div>
                  </div>
                </td>
                <td class="px-4 py-3">
                  <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium" :class="getBadgeClass(usuario.tipo_usuario)">
                    {{ getTipoLabel(usuario.tipo_usuario) }}
                  </span>
                </td>
                <td class="px-4 py-3">
                  <div v-if="usuario.horario_restrito" class="text-xs">
                    <div class="font-medium">🕐 {{ usuario.horario_inicio }} - {{ usuario.horario_fim }}</div>
                    <div class="text-gray-500 mt-1">Acesso restrito</div>
                  </div>
                  <span v-else class="text-xs text-gray-500">Sem restrição</span>
                </td>
                <td class="px-4 py-3">
                  <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium" :class="usuario.ativo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'">
                    <span class="w-2 h-2 rounded-full mr-1.5" :class="usuario.ativo ? 'bg-green-500' : 'bg-red-500'"></span>
                    {{ usuario.ativo ? 'Ativo' : 'Inativo' }}
                  </span>
                </td>
                <td class="px-4 py-3">
                  <div class="flex space-x-1">
                    <button 
                      @click="gerenciarPermissoes(usuario)" 
                      class="action-btn bg-green-50 text-green-600 hover:bg-green-100"
                      title="Gerenciar Permissões"
                    >
                      🔐
                    </button>
                    <button 
                      @click="editarUsuario(usuario)" 
                      class="action-btn bg-blue-50 text-blue-600 hover:bg-blue-100"
                      title="Editar"
                    >
                      ✏️
                    </button>
                    <button 
                      @click="resetarSenha(usuario)" 
                      class="action-btn bg-orange-50 text-orange-600 hover:bg-orange-100"
                      title="Alterar senha"
                    >
                      🔑
                    </button>
                    <button 
                      @click="toggleStatusUsuario(usuario)" 
                      class="action-btn"
                      :class="usuario.ativo ? 'bg-yellow-50 text-yellow-600 hover:bg-yellow-100' : 'bg-green-50 text-green-600 hover:bg-green-100'"
                      :title="usuario.ativo ? 'Desativar' : 'Ativar'"
                    >
                      {{ usuario.ativo ? '🔒' : '🔓' }}
                    </button>
                    <button 
                      @click="excluirUsuario(usuario)" 
                      class="action-btn bg-red-50 text-red-600 hover:bg-red-100"
                      title="Excluir"
                      v-if="usuario.id !== authStore.user?.id"
                    >
                      🗑️
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Cards Mobile -->
        <div class="md:hidden space-y-4">
          <div v-for="usuario in usuariosFiltrados" :key="usuario.id" class="bg-white border border-gray-200 rounded-lg p-4">
            <div class="flex justify-between items-start mb-3">
              <div class="flex items-center">
                <div class="flex-shrink-0 h-10 w-10 bg-primary-100 rounded-full flex items-center justify-center mr-3">
                  <span class="text-primary-600 font-semibold">{{ getIniciais(usuario.name) }}</span>
                </div>
                <div>
                  <h4 class="font-bold text-gray-900">{{ usuario.name }}</h4>
                  <p class="text-sm text-gray-600">{{ usuario.email }}</p>
                  <p class="text-xs text-gray-500 mt-1">{{ formatarData(usuario.created_at) }}</p>
                </div>
              </div>
              <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium" :class="usuario.ativo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'">
                {{ usuario.ativo ? 'Ativo' : 'Inativo' }}
              </span>
            </div>

            <div class="grid grid-cols-2 gap-3 mb-3">
              <div>
                <p class="text-xs text-gray-500 mb-1">Tipo:</p>
                <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium" :class="getBadgeClass(usuario.tipo_usuario)">
                  {{ getTipoLabel(usuario.tipo_usuario) }}
                </span>
              </div>
              
              <div>
                <p class="text-xs text-gray-500 mb-1">Senha:</p>
                <div class="flex items-center space-x-2">
                  <code class="bg-gray-100 px-2 py-1 rounded text-sm font-mono flex-1">
                    {{ senhasVisiveis[usuario.id] ? (usuario.senha_temp || '••••••••') : '••••••••' }}
                  </code>
                  <button 
                    @click="toggleSenhaVisivel(usuario.id)" 
                    class="text-gray-500 hover:text-gray-700 p-1"
                  >
                    {{ senhasVisiveis[usuario.id] ? '🙈' : '👁️' }}
                  </button>
                </div>
              </div>
            </div>

            <div v-if="usuario.horario_restrito" class="mb-3 p-2 bg-gray-50 rounded">
              <p class="text-xs text-gray-500 mb-1">Horário de Trabalho:</p>
              <p class="text-sm font-semibold">🕐 {{ usuario.horario_inicio }} - {{ usuario.horario_fim }}</p>
            </div>

            <div class="grid grid-cols-3 gap-2 pt-3 border-t">
              <button @click="gerenciarPermissoes(usuario)" class="action-btn-mobile bg-green-50 text-green-600">
                🔐
              </button>
              <button @click="editarUsuario(usuario)" class="action-btn-mobile bg-blue-50 text-blue-600">
                ✏️
              </button>
              <button @click="resetarSenha(usuario)" class="action-btn-mobile bg-orange-50 text-orange-600">
                🔑
              </button>
              <button 
                @click="toggleStatusUsuario(usuario)" 
                class="action-btn-mobile"
                :class="usuario.ativo ? 'bg-yellow-50 text-yellow-600' : 'bg-green-50 text-green-600'"
              >
                {{ usuario.ativo ? '🔒' : '🔓' }}
              </button>
              <button 
                v-if="usuario.id !== authStore.user?.id"
                @click="excluirUsuario(usuario)" 
                class="action-btn-mobile bg-red-50 text-red-600 col-span-2"
              >
                🗑️ Excluir
              </button>
            </div>
          </div>
        </div>

        <!-- Paginação -->
        <div v-if="usuariosFiltrados.length === 0" class="text-center py-8">
          <div class="text-gray-400 text-4xl mb-2">👤</div>
          <p class="text-gray-500">Nenhum usuário encontrado</p>
        </div>

        <div class="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div class="flex items-start">
            <div class="flex-shrink-0 mt-0.5">
              <span class="text-blue-500">ℹ️</span>
            </div>
            <div class="ml-3">
              <p class="text-sm text-blue-800">
                <strong>Informação:</strong> Clique em "🔐 Permissões" para controlar quais páginas cada usuário pode acessar.
              </p>
              <p class="text-xs text-blue-700 mt-1">
                • Administradores têm acesso total • Usuários inativos não conseguem fazer login
              </p>
            </div>
          </div>
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
            <button @click="closeModalPermissoes" class="text-gray-500 hover:text-gray-700 text-2xl">×</button>
          </div>
        </div>

        <div class="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div class="flex items-start">
            <div class="flex-shrink-0 mt-0.5">
              <span class="text-yellow-500">💡</span>
            </div>
            <div class="ml-3">
              <p class="text-sm text-yellow-800">
                <strong>Dica:</strong> Marque as páginas que este usuário poderá acessar. As alterações são salvas automaticamente.
              </p>
            </div>
          </div>
        </div>

        <div v-if="loadingPermissoes" class="text-center py-8">
          <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          <p class="mt-2 text-gray-600">Carregando permissões...</p>
        </div>

        <div v-else class="space-y-4 max-h-96 overflow-y-auto pr-2">
          <div 
            v-for="pagina in paginasDisponiveis" 
            :key="pagina.id"
            class="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-150"
          >
            <div class="flex items-center space-x-4 flex-1 min-w-0">
              <span class="text-2xl flex-shrink-0">{{ pagina.icone || '📄' }}</span>
              <div class="min-w-0 flex-1">
                <p class="font-semibold text-gray-900 truncate">{{ pagina.nome }}</p>
                <p class="text-sm text-gray-600 mt-1 line-clamp-2">{{ pagina.descricao }}</p>
                <div class="flex items-center mt-2 space-x-3">
                  <span class="text-xs text-gray-500">
                    <strong>Rota:</strong> {{ pagina.rota }}
                  </span>
                  <span v-if="pagina.requer_admin" class="text-xs bg-orange-100 text-orange-800 px-2 py-0.5 rounded-full">
                    👑 Requer Admin
                  </span>
                </div>
              </div>
            </div>
            <div class="flex items-center space-x-3 ml-4 flex-shrink-0">
              <label class="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  :checked="temPermissao(pagina.id)"
                  @change="togglePermissao(pagina)"
                  :disabled="pagina.requer_admin && usuarioPermissoes?.tipo_usuario !== 'administrador'"
                  class="sr-only peer"
                />
                <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
              </label>
              <span class="text-sm font-medium w-24 text-right" :class="temPermissao(pagina.id) ? 'text-green-600' : 'text-gray-400'">
                {{ temPermissao(pagina.id) ? '✅ Permitido' : '❌ Bloqueado' }}
              </span>
            </div>
          </div>
        </div>

        <div class="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div class="flex items-start">
            <div class="flex-shrink-0 mt-0.5">
              <span class="text-blue-500">ℹ️</span>
            </div>
            <div class="ml-3">
              <p class="text-sm text-blue-800 mb-2"><strong>Observações:</strong></p>
              <ul class="text-sm text-blue-700 space-y-1 ml-4 list-disc">
                <li>Páginas marcadas com 👑 só podem ser acessadas por administradores</li>
                <li>As alterações são salvas automaticamente ao marcar/desmarcar</li>
                <li>O usuário precisa fazer logout e login novamente para ver as mudanças</li>
              </ul>
            </div>
          </div>
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
            <select v-model="formUsuario.tipo_usuario" class="input-field" required @change="handleTipoChange">
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
              class="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
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

          <div class="flex space-x-2 pt-2">
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
            <div class="flex items-start">
              <div class="flex-shrink-0 mt-0.5">
                <span class="text-yellow-500">⚠️</span>
              </div>
              <div class="ml-3">
                <p class="text-sm text-yellow-800">
                  <strong>Atenção:</strong> A senha de login será alterada. O usuário precisará usar esta nova senha.
                </p>
              </div>
            </div>
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
import { ref, onMounted, reactive, computed, watch } from 'vue'
import { useAuthStore } from '../stores/auth'
import { supabase } from '../lib/supabase'
import Layout from '../components/Layout.vue'

const authStore = useAuthStore()

// Estado
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

// Filtros e ordenação
const filtroBusca = ref('')
const filtroTipo = ref('')
const filtroStatus = ref('')
const ordenacao = reactive({
  campo: 'name',
  direcao: 'asc'
})

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

// Computed
const usuariosFiltrados = computed(() => {
  let filtered = [...usuarios.value]

  // Aplicar filtro de busca
  if (filtroBusca.value) {
    const busca = filtroBusca.value.toLowerCase()
    filtered = filtered.filter(usuario => 
      usuario.name.toLowerCase().includes(busca) ||
      usuario.email.toLowerCase().includes(busca)
    )
  }

  // Aplicar filtro de tipo
  if (filtroTipo.value) {
    filtered = filtered.filter(usuario => usuario.tipo_usuario === filtroTipo.value)
  }

  // Aplicar filtro de status
  if (filtroStatus.value) {
    const isAtivo = filtroStatus.value === 'ativo'
    filtered = filtered.filter(usuario => usuario.ativo === isAtivo)
  }

  // Aplicar ordenação
  filtered.sort((a, b) => {
    let aVal = a[ordenacao.campo]
    let bVal = b[ordenacao.campo]

    if (ordenacao.campo === 'name') {
      aVal = aVal.toLowerCase()
      bVal = bVal.toLowerCase()
    }

    if (aVal < bVal) return ordenacao.direcao === 'asc' ? -1 : 1
    if (aVal > bVal) return ordenacao.direcao === 'asc' ? 1 : -1
    return 0
  })

  return filtered
})

// Métodos
const ordenarPor = (campo) => {
  if (ordenacao.campo === campo) {
    ordenacao.direcao = ordenacao.direcao === 'asc' ? 'desc' : 'asc'
  } else {
    ordenacao.campo = campo
    ordenacao.direcao = 'asc'
  }
}

const getIniciais = (nome) => {
  if (!nome) return '??'
  return nome
    .split(' ')
    .map(palavra => palavra[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

const formatarData = (data) => {
  if (!data) return ''
  const date = new Date(data)
  return date.toLocaleDateString('pt-BR')
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
    showToast('success', 'Perfil atualizado!')
  } catch (error) {
    console.error('Erro:', error)
    showToast('error', 'Erro ao atualizar perfil')
  }
}

const changePassword = async () => {
  if (newPassword.value !== confirmPassword.value) {
    showToast('error', 'As senhas não coincidem')
    return
  }
  
  if (newPassword.value.length < 6) {
    showToast('error', 'A senha deve ter no mínimo 6 caracteres')
    return
  }
  
  try {
    const { error } = await supabase.auth.updateUser({ password: newPassword.value })
    
    if (error) throw error

    await supabase
      .from('profiles')
      .update({ senha_temp: newPassword.value })
      .eq('id', authStore.user.id)
    
    showToast('success', 'Senha alterada!')
    newPassword.value = ''
    confirmPassword.value = ''
  } catch (error) {
    console.error('Erro:', error)
    showToast('error', 'Erro ao alterar senha')
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
    showToast('error', 'Erro ao carregar usuários')
  }
}

const carregarPermissoesUsuario = async (usuarioId) => {
  try {
    const { data: permissoes, error } = await supabase
      .from('user_page_permissions')
      .select('*')
      .eq('user_id', usuarioId)
    
    if (error) throw error
    
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
    showToast('error', 'Erro ao carregar permissões')
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
    
    if (pagina.requer_admin && usuarioPermissoes.value?.tipo_usuario !== 'administrador') {
      showToast('error', 'Esta página só pode ser acessada por administradores')
      return
    }
    
    if (permissaoAtual) {
      // Remove permissão
      const { error } = await supabase
        .from('user_page_permissions')
        .delete()
        .eq('user_id', usuarioPermissoes.value.id)
        .eq('page_id', pagina.id)
      
      if (error) throw error
      
      const index = permissoesUsuario.value.findIndex(p => p.page_id === pagina.id)
      if (index >= 0) {
        permissoesUsuario.value.splice(index, 1)
      }
    } else {
      // Adiciona permissão
      const { error } = await supabase
        .from('user_page_permissions')
        .upsert({
          user_id: usuarioPermissoes.value.id,
          page_id: pagina.id,
          pode_acessar: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,page_id'
        })
      
      if (error) throw error
      
      permissoesUsuario.value.push({
        user_id: usuarioPermissoes.value.id,
        page_id: pagina.id,
        pode_acessar: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
    }
    
    showToast('success', 'Permissão atualizada')
    
  } catch (error) {
    console.error('❌ Erro ao alterar permissão:', error)
    showToast('error', 'Erro ao alterar permissão')
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
    showToast('success', 'Senha copiada!')
  } catch (error) {
    console.error('Erro:', error)
    showToast('error', 'Erro ao copiar')
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
    // Usando função edge para resetar senha
    const { data, error } = await supabase.functions.invoke('reset-user-password', {
      body: {
        userId: usuarioResetSenha.value.id,
        newPassword: novaSenhaReset.value
      }
    })

    if (error) throw error
    if (!data?.success) throw new Error(data?.error || 'Erro desconhecido')

    await supabase
      .from('profiles')
      .update({ 
        senha_temp: novaSenhaReset.value,
        updated_at: new Date().toISOString()
      })
      .eq('id', usuarioResetSenha.value.id)
    
    await navigator.clipboard.writeText(novaSenhaReset.value)
    
    showToast('success', `Senha alterada para: ${novaSenhaReset.value}\n(Copiada para a área de transferência)`)
    
    closeModalResetSenha()
    await carregarUsuarios()
    
  } catch (error) {
    console.error('Erro:', error)
    showToast('error', error.message)
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

const handleTipoChange = () => {
  if (formUsuario.value.tipo_usuario === 'administrador') {
    formUsuario.value.horario_restrito = false
  }
}

const salvarUsuario = async () => {
  loadingSave.value = true
  try {
    if (editandoUsuario.value) {
      // ... (código de edição permanece igual) ...
    } else {
      console.log('🔵 Criando novo usuário via Edge Function...')
      
      // Chamar a Edge Function em vez de signUp direto
      const { data, error } = await supabase.functions.invoke('create-user', {
        body: {
          email: formUsuario.value.email,
          password: formUsuario.value.password,
          name: formUsuario.value.name,
          tipo_usuario: formUsuario.value.tipo_usuario,
          telefone: formUsuario.value.telefone
        }
      })
      
      if (error) throw error
      if (!data?.success) throw new Error(data?.error || 'Erro ao criar usuário')
      
      console.log('🔵 Resultado da Edge Function:', data)
      
      // Atualizar horário se necessário
      await supabase
        .from('profiles')
        .update({
          horario_restrito: formUsuario.value.horario_restrito,
          horario_inicio: formUsuario.value.horario_restrito ? formUsuario.value.horario_inicio : null,
          horario_fim: formUsuario.value.horario_restrito ? formUsuario.value.horario_fim : null,
          updated_at: new Date().toISOString()
        })
        .eq('id', data.userId)
      
      await navigator.clipboard.writeText(formUsuario.value.password)
      
      showToast('success', `Usuário criado!\\nSenha: ${formUsuario.value.password}\\n(Copiada para a área de transferência)`)
    }
    
    closeModalUsuario()
    await new Promise(resolve => setTimeout(resolve, 1000))
    await carregarUsuarios()
    
  } catch (error) {
    console.error('❌ Erro completo:', error)
    showToast('error', error.message)
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
    
    showToast('success', `Usuário ${novoStatus ? 'ativado' : 'desativado'} com sucesso!`)
    await carregarUsuarios()
  } catch (error) {
    console.error('Erro:', error)
    showToast('error', 'Erro ao alterar status')
  }
}

const excluirUsuario = async (usuario) => {
  if (usuario.id === authStore.user?.id) {
    showToast('error', 'Você não pode excluir seu próprio usuário!')
    return
  }
  
  if (!confirm(`⚠️ ATENÇÃO!\n\nDeseja excluir permanentemente o usuário "${usuario.name}"?\n\nEsta ação não pode ser desfeita!`)) {
    return
  }
  
  try {
    console.log('🔵 Iniciando exclusão do usuário:', usuario.id)
    
    // ✅ PASSO 1: Chamar Edge Function para deletar do Auth primeiro
    const { data, error: edgeError } = await supabase.functions.invoke('delete-user', {
      body: { userId: usuario.id }
    })
    
    console.log('🔵 Resposta da Edge Function:', { data, edgeError })
    
    // ✅ Verificar se houve erro na Edge Function
    if (edgeError) {
      console.error('❌ Erro na Edge Function:', edgeError)
      throw new Error(`Erro ao deletar usuário: ${edgeError.message}`)
    }
    
    // ✅ Verificar resposta da função
    if (data && !data.success) {
      console.error('❌ Edge Function retornou erro:', data.error)
      throw new Error(data.error || 'Erro desconhecido ao deletar usuário')
    }
    
    // ✅ Verificar se há warning (sucesso parcial)
    if (data && data.warning) {
      console.warn('⚠️ Aviso da Edge Function:', data.warning)
      showToast('warning', `${data.warning}\nMas o usuário foi removido do banco de dados.`)
    } else {
      console.log('✅ Usuário deletado completamente!')
      showToast('success', '✅ Usuário excluído completamente do sistema!')
    }
    
    // ✅ PASSO 2: Recarregar lista de usuários
    await carregarUsuarios()
    
  } catch (error) {
    console.error('❌ Erro ao excluir usuário:', error)
    
    // ✅ Mensagem de erro mais clara
    let mensagemErro = 'Erro ao excluir usuário'
    
    if (error.message.includes('CORS')) {
      mensagemErro = 'Erro de comunicação com o servidor. Verifique as configurações da Edge Function.'
    } else if (error.message.includes('fetch')) {
      mensagemErro = 'Não foi possível conectar com o servidor. Verifique sua conexão.'
    } else {
      mensagemErro = error.message
    }
    
    showToast('error', `❌ ${mensagemErro}`)
  }
}
const closeModalUsuario = () => {
  showModalUsuario.value = false
  editandoUsuario.value = false
  formUsuario.value = {
    name: '',
    email: '',
    telefone: '',
    password: '',
    tipo_usuario: 'escritorio',
    ativo: true,
    horario_restrito: false,
    horario_inicio: '08:00',
    horario_fim: '18:00'
  }
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

const showToast = (type, message) => {
  // Implementação básica - você pode substituir por seu sistema de notificações
  const emoji = {
    success: '✅',
    error: '❌',
    warning: '⚠️',
    info: 'ℹ️'
  }[type] || '💡'
  
  alert(`${emoji} ${message}`)
}

// Watchers
watch(filtroBusca, () => {
  // Filtro automático já implementado no computed
})

watch(filtroTipo, () => {
  // Filtro automático já implementado no computed
})

watch(filtroStatus, () => {
  // Filtro automático já implementado no computed
})

onMounted(() => {
  loadProfile()
  if (authStore.isAdmin) {
    carregarUsuarios()
  }
})
</script>

<style scoped>
.card {
  background: white;
  border-radius: 0.75rem;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
  padding: 1.5rem;
}

@media (min-width: 768px) {
  .card {
    padding: 1.5rem;
  }
}

.label {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
  margin-bottom: 0.5rem;
}

.input-field {
  width: 100%;
  padding: 0.625rem 0.875rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  transition: all 0.2s;
}

.input-field:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.btn-primary {
  padding: 0.625rem 1.25rem;
  background-color: #3b82f6;
  color: white;
  border-radius: 0.5rem;
  font-weight: 500;
  font-size: 0.875rem;
  transition: background-color 0.2s;
  border: none;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.btn-primary:hover:not(:disabled) {
  background-color: #2563eb;
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-secondary {
  padding: 0.625rem 1.25rem;
  background-color: #f3f4f6;
  color: #374151;
  border-radius: 0.5rem;
  font-weight: 500;
  font-size: 0.875rem;
  transition: background-color 0.2s;
  border: none;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.btn-secondary:hover {
  background-color: #e5e7eb;
}

.action-btn {
  padding: 0.375rem;
  border-radius: 0.375rem;
  border: none;
  cursor: pointer;
  transition: background-color 0.2s;
  font-size: 1rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.action-btn-mobile {
  padding: 0.5rem;
  border-radius: 0.375rem;
  border: none;
  cursor: pointer;
  transition: background-color 0.2s;
  font-size: 1rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  z-index: 50;
  animation: fadeIn 0.2s ease-out;
}

.modal-content {
  background: white;
  border-radius: 0.75rem;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  padding: 1.5rem;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  animation: slideUp 0.3s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from { 
    opacity: 0;
    transform: translateY(10px);
  }
  to { 
    opacity: 1;
    transform: translateY(0);
  }
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
