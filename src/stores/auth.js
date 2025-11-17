import { defineStore } from 'pinia'
import { supabase } from '../lib/supabase'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    userProfile: null,
    loading: false,
    sessionError: false
  }),
  
  getters: {
    isAuthenticated: (state) => !!state.user && !state.sessionError,
    
    // Getters para tipos de usuário
    isAdmin: (state) => state.userProfile?.tipo_usuario === 'administrador',
    isEscritorio: (state) => state.userProfile?.tipo_usuario === 'escritorio',
    isVendedor: (state) => state.userProfile?.tipo_usuario === 'vendedor',
    
    // Permissões de acesso
    canViewFinanceiro: (state) => state.userProfile?.tipo_usuario === 'administrador',
    canViewEstoque: (state) => ['administrador', 'escritorio'].includes(state.userProfile?.tipo_usuario),
    canViewVendas: (state) => ['administrador', 'escritorio', 'vendedor'].includes(state.userProfile?.tipo_usuario),
    canManageUsers: (state) => state.userProfile?.tipo_usuario === 'administrador',
    canManageProducts: (state) => state.userProfile?.tipo_usuario === 'administrador',
    
    userName: (state) => state.userProfile?.name || state.user?.email,
    userType: (state) => {
      const tipos = {
        'administrador': 'Administrador',
        'escritorio': 'Escritório',
        'vendedor': 'Vendedor'
      }
      return tipos[state.userProfile?.tipo_usuario] || 'Usuário'
    }
  },
  
  actions: {
    async signIn(email, password) {
      this.loading = true
      this.sessionError = false
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password
        })
        
        if (error) throw error
        
        this.user = data.user
        await this.fetchUserProfile()
        
        // Verificar se usuário está ativo
        if (!this.userProfile?.ativo) {
          await this.signOut()
          return { success: false, error: 'Usuário inativo. Contate o administrador.' }
        }
        
        return { success: true }
      } catch (error) {
        console.error('Erro no login:', error)
        return { success: false, error: error.message }
      } finally {
        this.loading = false
      }
    },
    
    async signUp(email, password, name, tipo_usuario = 'escritorio', telefone = '') {
      this.loading = true
      try {
        // IMPORTANTE: options com emailRedirectTo null desabilita confirmação
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              name: name
            },
            emailRedirectTo: null // Desabilita email de confirmação
          }
        })
        
        if (error) throw error
        
        // Aguardar um pouco para garantir que o trigger criou o perfil
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        // Atualizar o perfil criado automaticamente pelo trigger
        const { error: profileError } = await supabase
          .from('profiles')
          .update({ 
            name, 
            email,
            tipo_usuario,
            telefone,
            ativo: true
          })
          .eq('id', data.user.id)
        
        if (profileError) throw profileError
        
        return { success: true, userId: data.user.id }
      } catch (error) {
        console.error('Erro no cadastro:', error)
        return { success: false, error: error.message }
      } finally {
        this.loading = false
      }
    },
    
    async signOut() {
      try {
        await supabase.auth.signOut()
        this.user = null
        this.userProfile = null
        this.sessionError = false
        localStorage.clear()
        sessionStorage.clear()
      } catch (error) {
        console.error('Erro ao fazer logout:', error)
        this.user = null
        this.userProfile = null
        this.sessionError = false
        localStorage.clear()
        sessionStorage.clear()
      }
    },
    
    async fetchUserProfile() {
      if (!this.user) return
      
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', this.user.id)
          .single()
        
        if (error) {
          if (error.message.includes('JWT') || error.message.includes('token')) {
            this.sessionError = true
            await this.signOut()
            return
          }
          throw error
        }
        
        this.userProfile = data
      } catch (error) {
        console.error('Erro ao buscar perfil:', error)
        this.sessionError = true
      }
    },
    
    async checkAuth() {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Erro ao verificar sessão:', error)
          this.sessionError = true
          this.user = null
          this.userProfile = null
          return
        }
        
        if (session) {
          this.user = session.user
          await this.fetchUserProfile()
        } else {
          this.user = null
          this.userProfile = null
        }
      } catch (error) {
        console.error('Erro ao verificar autenticação:', error)
        this.sessionError = true
        this.user = null
        this.userProfile = null
      }
    },
    
    forceLogout() {
      this.user = null
      this.userProfile = null
      this.sessionError = false
      localStorage.clear()
      sessionStorage.clear()
    }
  }
})
