import { defineStore } from 'pinia'
import { supabase } from '../lib/supabase'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    userProfile: null,
    userPermissions: [],
    loading: false,
    sessionError: false
  }),
  
  getters: {
    isAuthenticated: (state) => !!state.user && !state.sessionError,
    
    // Getters para tipos de usuário
    isAdmin: (state) => state.userProfile?.tipo_usuario === 'administrador',
    isEscritorio: (state) => state.userProfile?.tipo_usuario === 'escritorio',
    isVendedor: (state) => state.userProfile?.tipo_usuario === 'vendedor',
    
    // Permissões de acesso (mantidas para compatibilidade)
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
    },
    
    // Verifica se usuário tem acesso a uma rota específica
    canAccessRoute: (state) => (rota) => {
      // Admin sempre tem acesso
      if (state.userProfile?.tipo_usuario === 'administrador') return true
      
      // Verifica nas permissões do usuário
      const permission = state.userPermissions.find(p => p.rota === rota)
      return permission?.pode_acessar || false
    },
    
    // Retorna páginas permitidas para o menu
    allowedPages: (state) => {
      return state.userPermissions.filter(p => p.pode_acessar)
    }
  },
  
  actions: {
    // NOVO: Verifica se está dentro do horário permitido
    checkHorarioAcesso() {
      // Se não tem restrição de horário, permite acesso
      if (!this.userProfile?.horario_restrito) return true
      
      const agora = new Date()
      const horaAtual = agora.getHours() * 60 + agora.getMinutes() // minutos desde meia-noite
      
      const [horaInicio, minInicio] = this.userProfile.horario_inicio.split(':')
      const [horaFim, minFim] = this.userProfile.horario_fim.split(':')
      
      const minutosInicio = parseInt(horaInicio) * 60 + parseInt(minInicio)
      const minutosFim = parseInt(horaFim) * 60 + parseInt(minFim)
      
      return horaAtual >= minutosInicio && horaAtual <= minutosFim
    },

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
        await this.fetchUserPermissions()
        
        // Verificar se usuário está ativo
        if (!this.userProfile?.ativo) {
          await this.signOut()
          return { success: false, error: 'Usuário inativo. Contate o administrador.' }
        }
        
        // NOVO: Verificar horário de acesso
        if (!this.checkHorarioAcesso()) {
          await this.signOut()
          return { 
            success: false, 
            error: `Acesso permitido apenas entre ${this.userProfile.horario_inicio} e ${this.userProfile.horario_fim}` 
          }
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
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              name: name
            },
            emailRedirectTo: null
          }
        })
        
        if (error) throw error
        
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        const { error: profileError } = await supabase
          .from('profiles')
          .update({ 
            name, 
            email,
            tipo_usuario,
            telefone,
            ativo: true,
            senha_temp: password
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
        this.userPermissions = []
        this.sessionError = false
        localStorage.clear()
        sessionStorage.clear()
      } catch (error) {
        console.error('Erro ao fazer logout:', error)
        this.user = null
        this.userProfile = null
        this.userPermissions = []
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
    
    async fetchUserPermissions() {
      if (!this.user) return
      
      try {
        const { data, error } = await supabase
          .rpc('get_user_permissions', { user_uuid: this.user.id })
        
        if (error) throw error
        
        this.userPermissions = data || []
      } catch (error) {
        console.error('Erro ao buscar permissões:', error)
        this.userPermissions = []
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
          this.userPermissions = []
          return
        }
        
        if (session) {
          this.user = session.user
          await this.fetchUserProfile()
          await this.fetchUserPermissions()
        } else {
          this.user = null
          this.userProfile = null
          this.userPermissions = []
        }
      } catch (error) {
        console.error('Erro ao verificar autenticação:', error)
        this.sessionError = true
        this.user = null
        this.userProfile = null
        this.userPermissions = []
      }
    },
    
    forceLogout() {
      this.user = null
      this.userProfile = null
      this.userPermissions = []
      this.sessionError = false
      localStorage.clear()
      sessionStorage.clear()
    },
    
    async reloadPermissions() {
      await this.fetchUserPermissions()
    }
  }
})
