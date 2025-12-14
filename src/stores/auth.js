import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '../lib/supabase'

export const useAuthStore = defineStore('auth', () => {
  // ========== ESTADO ==========
  const user = ref(null)
  const userProfile = ref(null)
  const userPermissions = ref([])
  const loading = ref(false)
  const sessionError = ref(false)

  // ========== COMPUTED (GETTERS) ==========
  const isAuthenticated = computed(() => !!user.value && !sessionError.value)
  
  // Tipos de usuário
  const isAdmin = computed(() => userProfile.value?.tipo_usuario === 'administrador')
  const isEscritorio = computed(() => userProfile.value?.tipo_usuario === 'escritorio')
  const isVendedor = computed(() => userProfile.value?.tipo_usuario === 'vendedor')
  const isGestor = computed(() => userProfile.value?.tipo_usuario === 'gestor')
  
  // Permissões de acesso (baseadas no tipo)
  const canViewFinanceiro = computed(() => isAdmin.value)
  const canViewEstoque = computed(() => ['administrador', 'escritorio', 'gestor'].includes(userProfile.value?.tipo_usuario))
  const canViewVendas = computed(() => ['administrador', 'escritorio', 'vendedor', 'gestor'].includes(userProfile.value?.tipo_usuario))
  const canViewClientes = computed(() => ['administrador', 'escritorio', 'gestor'].includes(userProfile.value?.tipo_usuario))
  const canGenerateReceipt = computed(() => ['administrador', 'gestor'].includes(userProfile.value?.tipo_usuario))
  const canEditOrders = computed(() => ['administrador', 'escritorio', 'gestor'].includes(userProfile.value?.tipo_usuario))
  const canDeleteOrders = computed(() => isAdmin.value)
  const canManageUsers = computed(() => isAdmin.value)
  const canManageProducts = computed(() => isAdmin.value)
  const canZeroStock = computed(() => isAdmin.value)
  
  const userName = computed(() => userProfile.value?.name || user.value?.email || 'Usuário')
  
  const userType = computed(() => {
    const tipos = {
      'administrador': 'Administrador',
      'escritorio': 'Escritório',
      'vendedor': 'Vendedor',
      'gestor': 'Gestor'
    }
    return tipos[userProfile.value?.tipo_usuario] || 'Usuário'
  })
  
  // Verifica acesso a uma rota específica
  const canAccessRoute = (rota) => {
    if (!user.value) return false
    if (isAdmin.value) return true
    
    const permission = userPermissions.value.find(p => p.rota === rota)
    return permission?.pode_acessar || false
  }
  
  // Páginas permitidas para o menu
  const allowedPages = computed(() => {
    return userPermissions.value.filter(p => p.pode_acessar)
  })

  // ========== AÇÕES (METHODS) ==========
  
  // Verifica se está dentro do horário permitido
  const checkHorarioAcesso = () => {
    if (!userProfile.value?.horario_restrito) return true
    
    const agora = new Date()
    const horaAtual = agora.getHours() * 60 + agora.getMinutes()
    
    const [horaInicio, minInicio] = userProfile.value.horario_inicio?.split(':') || ['08', '00']
    const [horaFim, minFim] = userProfile.value.horario_fim?.split(':') || ['18', '00']
    
    const minutosInicio = parseInt(horaInicio) * 60 + parseInt(minInicio)
    const minutosFim = parseInt(horaFim) * 60 + parseInt(minFim)
    
    return horaAtual >= minutosInicio && horaAtual <= minutosFim
  }

  // ========== AUTHENTICATION ==========
  
  // Login
  const signIn = async (email, password) => {
    loading.value = true
    sessionError.value = false
    
    try {
      console.log('🔵 Tentando login:', email)
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      
      if (error) {
        console.error('❌ Erro no login:', error)
        throw error
      }
      
      if (!data.user) {
        throw new Error('Credenciais inválidas')
      }
      
      user.value = data.user
      console.log('✅ Usuário autenticado:', data.user.id)
      
      // Buscar perfil do usuário
      await fetchUserProfile()
      
      // Verificar se usuário está ativo
      if (!userProfile.value?.ativo) {
        await signOut()
        throw new Error('Usuário inativo. Contate o administrador.')
      }
      
      // Verificar horário de acesso
      if (!checkHorarioAcesso()) {
        await signOut()
        throw new Error(`Acesso permitido apenas entre ${userProfile.value.horario_inicio} e ${userProfile.value.horario_fim}`)
      }
      
      // Buscar permissões
      await fetchUserPermissions()
      
      console.log('✅ Login completo bem-sucedido')
      return { success: true, user: data.user }
      
    } catch (error) {
      console.error('❌ Erro completo no login:', error)
      sessionError.value = true
      return { success: false, error: error.message }
    } finally {
      loading.value = false
    }
  }
  
  // Criar usuário SEM confirmação de email
  const signUp = async (email, password, name, tipo_usuario = 'escritorio', telefone = '') => {
    loading.value = true
    
    try {
      console.log('🔵 Criando usuário:', { email, name, tipo_usuario })
      
      // 1. Criar usuário usando admin API (sem confirmação de email)
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true, // NÃO requer confirmação
        user_metadata: {
          name,
          tipo_usuario,
          telefone: telefone || ''
        }
      })
      
      if (authError) {
        console.error('❌ Erro ao criar usuário no Auth:', authError)
        throw authError
      }
      
      console.log('✅ Usuário criado no Auth:', authData.user.id)
      
      // 2. Criar perfil na tabela profiles
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: authData.user.id,
          name,
          email,
          tipo_usuario,
          telefone: telefone || null,
          ativo: true,
          senha_temp: password,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'id'
        })
      
      if (profileError) {
        console.error('❌ Erro ao criar perfil:', profileError)
        
        // Se erro ao criar perfil, deleta o usuário do auth
        await supabase.auth.admin.deleteUser(authData.user.id)
        throw profileError
      }
      
      console.log('✅ Perfil criado com sucesso!')
      
      // 3. Criar permissões padrão baseadas no tipo de usuário
      await createDefaultPermissions(authData.user.id, tipo_usuario)
      
      return { 
        success: true, 
        userId: authData.user.id,
        email: authData.user.email 
      }
      
    } catch (error) {
      console.error('❌ Erro completo ao criar usuário:', error)
      return { success: false, error: error.message }
    } finally {
      loading.value = false
    }
  }
  
  // Criar permissões padrão
  const createDefaultPermissions = async (userId, tipoUsuario) => {
    try {
      console.log(`🔵 Criando permissões padrão para ${tipoUsuario}...`)
      
      // Buscar todas as páginas do sistema
      const { data: pages, error } = await supabase
        .from('system_pages')
        .select('*')
        .eq('ativo', true)
      
      if (error) throw error
      
      // Definir quais páginas cada tipo pode acessar por padrão
      const defaultPermissions = {
        administrador: pages.map(p => ({ page_id: p.id, pode_acessar: true })),
        escritorio: pages.filter(p => !p.requer_admin).map(p => ({ page_id: p.id, pode_acessar: true })),
        vendedor: pages.filter(p => ['dashboard', 'vendas', 'pedidos'].includes(p.id)).map(p => ({ page_id: p.id, pode_acessar: true })),
        gestor: pages.filter(p => !p.id.includes('configuracoes')).map(p => ({ page_id: p.id, pode_acessar: true }))
      }
      
      const permissionsToInsert = defaultPermissions[tipoUsuario] || []
      
      if (permissionsToInsert.length > 0) {
        const permissionsWithUserId = permissionsToInsert.map(p => ({
          user_id: userId,
          page_id: p.page_id,
          pode_acessar: p.pode_acessar,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }))
        
        const { error: insertError } = await supabase
          .from('user_page_permissions')
          .insert(permissionsWithUserId)
        
        if (insertError) {
          console.warn('⚠️ Erro ao criar permissões padrão:', insertError)
          return
        }
      }
      
      console.log(`✅ Permissões padrão criadas para ${tipoUsuario}`)
      
    } catch (error) {
      console.warn('⚠️ Erro ao criar permissões padrão:', error)
    }
  }
  
  // Alterar senha do próprio usuário
  const changePassword = async (newPassword) => {
    try {
      console.log('🔵 Alterando senha...')
      
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      })
      
      if (error) throw error
      
      // Atualizar senha temporária no perfil
      if (user.value?.id) {
        await supabase
          .from('profiles')
          .update({ 
            senha_temp: newPassword,
            updated_at: new Date().toISOString()
          })
          .eq('id', user.value.id)
      }
      
      console.log('✅ Senha alterada com sucesso!')
      return { success: true }
      
    } catch (error) {
      console.error('❌ Erro ao alterar senha:', error)
      return { success: false, error: error.message }
    }
  }
  
  // Resetar senha de outro usuário (apenas admin)
  const resetUserPassword = async (userId, newPassword) => {
    if (!isAdmin.value) {
      return { success: false, error: 'Apenas administradores podem resetar senhas' }
    }
    
    try {
      console.log(`🔵 Resetando senha do usuário ${userId}...`)
      
      const { error } = await supabase.auth.admin.updateUserById(
        userId,
        { 
          password: newPassword,
          email_confirm: true
        }
      )
      
      if (error) throw error
      
      // Atualizar senha temporária no perfil
      await supabase
        .from('profiles')
        .update({ 
          senha_temp: newPassword,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)
      
      console.log('✅ Senha resetada com sucesso!')
      return { success: true }
      
    } catch (error) {
      console.error('❌ Erro ao resetar senha:', error)
      return { success: false, error: error.message }
    }
  }
  
  // Excluir usuário (apenas admin)
  const deleteUser = async (userId) => {
    if (!isAdmin.value) {
      return { success: false, error: 'Apenas administradores podem excluir usuários' }
    }
    
    try {
      console.log(`🔵 Excluindo usuário ${userId}...`)
      
      // 1. Deletar do Auth
      const { error: authError } = await supabase.auth.admin.deleteUser(userId)
      if (authError) throw authError
      
      console.log('✅ Usuário excluído do Auth')
      
      // 2. Deletar permissões
      const { error: permError } = await supabase
        .from('user_page_permissions')
        .delete()
        .eq('user_id', userId)
      
      if (permError) console.warn('⚠️ Erro ao deletar permissões:', permError)
      
      // 3. Deletar perfil
      const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId)
      
      if (profileError) throw profileError
      
      console.log('✅ Usuário excluído completamente!')
      return { success: true }
      
    } catch (error) {
      console.error('❌ Erro ao excluir usuário:', error)
      return { success: false, error: error.message }
    }
  }
  
  // Logout
  const signOut = async () => {
    try {
      console.log('🔵 Fazendo logout...')
      await supabase.auth.signOut()
      clearAuthData()
      console.log('✅ Logout completo')
      
    } catch (error) {
      console.error('❌ Erro ao fazer logout:', error)
      clearAuthData() // Limpa mesmo se der erro
    }
  }
  
  // Limpar dados de auth
  const clearAuthData = () => {
    user.value = null
    userProfile.value = null
    userPermissions.value = []
    sessionError.value = false
    localStorage.clear()
    sessionStorage.clear()
  }
  
  // ========== USER PROFILE ==========
  
  // Buscar perfil do usuário
  const fetchUserProfile = async () => {
    if (!user.value) {
      console.log('⚠️ Sem usuário, não busca perfil')
      return
    }
    
    try {
      console.log('🔵 Buscando perfil do usuário:', user.value.id)
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.value.id)
        .single()
      
      if (error) {
        console.error('❌ Erro ao buscar perfil:', error)
        
        if (error.message.includes('JWT') || error.message.includes('token')) {
          sessionError.value = true
          await signOut()
        }
        return
      }
      
      userProfile.value = data
      console.log('✅ Perfil carregado:', data.name)
      
    } catch (error) {
      console.error('❌ Erro ao buscar perfil:', error)
      sessionError.value = true
    }
  }
  
  // Atualizar perfil
  const updateProfile = async (updates) => {
    try {
      if (!user.value) throw new Error('Usuário não autenticado')
      
      const { error } = await supabase
        .from('profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.value.id)
      
      if (error) throw error
      
      // Recarregar perfil
      await fetchUserProfile()
      
      return { success: true }
      
    } catch (error) {
      console.error('❌ Erro ao atualizar perfil:', error)
      return { success: false, error: error.message }
    }
  }
  
  // ========== PERMISSIONS ==========
  
  // Buscar permissões do usuário
  const fetchUserPermissions = async () => {
    if (!user.value) {
      console.log('⚠️ Sem usuário logado, não carrega permissões')
      return
    }
    
    try {
      console.log('🔵 Buscando permissões para:', user.value.id)
      
      // Se for admin, retorna todas as páginas ativas
      if (isAdmin.value) {
        const { data: pages, error } = await supabase
          .from('system_pages')
          .select('*')
          .eq('ativo', true)
          .order('ordem')
        
        if (error) throw error
        
        userPermissions.value = pages.map(p => ({ ...p, pode_acessar: true }))
        console.log('✅ Admin: todas as páginas permitidas')
        return
      }
      
      // Para outros usuários, busca permissões específicas
      const { data: pages, error: pagesError } = await supabase
        .from('system_pages')
        .select('*')
        .eq('ativo', true)
        .order('ordem')
      
      if (pagesError) throw pagesError
      
      const { data: permissions, error: permError } = await supabase
        .from('user_page_permissions')
        .select('*')
        .eq('user_id', user.value.id)
      
      if (permError) throw permError
      
      // Combinar páginas com permissões
      userPermissions.value = pages.map(page => {
        const perm = permissions?.find(p => p.page_id === page.id)
        return {
          ...page,
          pode_acessar: perm?.pode_acessar || false
        }
      })
      
      console.log('✅ Permissões carregadas:', userPermissions.value.length)
      
    } catch (error) {
      console.error('❌ Erro ao buscar permissões:', error)
      userPermissions.value = []
    }
  }
  
  // Atualizar permissão de um usuário (apenas admin)
  const updateUserPermission = async (userId, pageId, pode_acessar) => {
    if (!isAdmin.value) {
      return { success: false, error: 'Apenas administradores podem gerenciar permissões' }
    }
    
    try {
      console.log(`🔵 Atualizando permissão: ${userId} - ${pageId} = ${pode_acessar}`)
      
      // Remove primeiro qualquer permissão existente
      const { error: deleteError } = await supabase
        .from('user_page_permissions')
        .delete()
        .eq('user_id', userId)
        .eq('page_id', pageId)
      
      if (deleteError) throw deleteError
      
      // Se a permissão for true, insere
      if (pode_acessar) {
        const { error: insertError } = await supabase
          .from('user_page_permissions')
          .insert({
            user_id: userId,
            page_id: pageId,
            pode_acessar: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
        
        if (insertError) throw insertError
      }
      
      console.log('✅ Permissão atualizada!')
      return { success: true }
      
    } catch (error) {
      console.error('❌ Erro ao atualizar permissão:', error)
      return { success: false, error: error.message }
    }
  }
  
  // ========== SESSION MANAGEMENT ==========
  
  // Verificar sessão
  const checkAuth = async () => {
    try {
      console.log('🔵 Verificando sessão...')
      
      const { data: { session }, error } = await supabase.auth.getSession()
      
      if (error) {
        console.error('❌ Erro ao verificar sessão:', error)
        clearAuthData()
        return
      }
      
      if (session) {
        user.value = session.user
        console.log('✅ Sessão encontrada:', session.user.email)
        
        await fetchUserProfile()
        await fetchUserPermissions()
        
        // Verificar horário de acesso
        if (!checkHorarioAcesso()) {
          console.log('❌ Fora do horário permitido, fazendo logout...')
          await signOut()
          return
        }
      } else {
        console.log('ℹ️ Nenhuma sessão ativa')
        clearAuthData()
      }
      
    } catch (error) {
      console.error('❌ Erro ao verificar autenticação:', error)
      clearAuthData()
    }
  }
  
  // Force logout (para erros)
  const forceLogout = () => {
    console.log('🔴 Forçando logout...')
    clearAuthData()
  }
  
  // Recarregar permissões
  const reloadPermissions = async () => {
    console.log('🔄 Recarregando permissões...')
    await fetchUserPermissions()
  }
  
  // ========== LISTENER PARA MUDANÇAS DE AUTH ==========
  
  // Setup auth state change listener
  const setupAuthListener = () => {
    supabase.auth.onAuthStateChange((event, session) => {
      console.log('🔐 Auth state changed:', event)
      
      switch (event) {
        case 'SIGNED_IN':
          user.value = session.user
          checkAuth()
          break
        
        case 'SIGNED_OUT':
          clearAuthData()
          break
        
        case 'TOKEN_REFRESHED':
          console.log('Token refreshed')
          break
        
        case 'USER_UPDATED':
          console.log('User updated')
          if (session?.user) {
            user.value = session.user
          }
          break
      }
    })
  }
  
  // Inicializar
  const init = async () => {
    console.log('🚀 Inicializando auth store...')
    setupAuthListener()
    await checkAuth()
  }
  
  // ========== RETORNO ==========
  return {
    // Estado
    user,
    userProfile,
    userPermissions,
    loading,
    sessionError,
    
    // Computed
    isAuthenticated,
    isAdmin,
    isEscritorio,
    isVendedor,
    isGestor,
    canViewFinanceiro,
    canViewEstoque,
    canViewVendas,
    canViewClientes,
    canGenerateReceipt,
    canEditOrders,
    canDeleteOrders,
    canManageUsers,
    canManageProducts,
    canZeroStock,
    userName,
    userType,
    canAccessRoute,
    allowedPages,
    
    // Métodos
    signIn,
    signUp,
    signOut,
    changePassword,
    resetUserPassword,
    deleteUser,
    updateProfile,
    updateUserPermission,
    checkAuth,
    forceLogout,
    reloadPermissions,
    init,
    checkHorarioAcesso
  }
})
