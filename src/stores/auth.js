import { defineStore } from 'pinia'
import { supabase } from '../lib/supabase'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    userProfile: null,
    loading: false
  }),

  getters: {
    isAuthenticated: (state) => !!state.user,
    isAdmin: (state) => state.userProfile?.role === 'admin',
    userName: (state) => state.userProfile?.name || state.user?.email
  },

  actions: {
    async signIn(email, password) {
      this.loading = true
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password
        })
        
        if (error) throw error
        
        this.user = data.user
        await this.fetchUserProfile()
        return { success: true }
      } catch (error) {
        return { success: false, error: error.message }
      } finally {
        this.loading = false
      }
    },

    async signUp(email, password, name, role = 'user') {
      this.loading = true
      try {
        const { data, error } = await supabase.auth.signUp({
          email,
          password
        })
        
        if (error) throw error
        
        // Criar perfil do usuário
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([
            { id: data.user.id, name, role }
          ])
        
        if (profileError) throw profileError
        
        return { success: true }
      } catch (error) {
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
      } catch (error) {
        console.error('Erro ao fazer logout:', error)
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
        
        if (error) throw error
        this.userProfile = data
      } catch (error) {
        console.error('Erro ao buscar perfil:', error)
      }
    },

    async checkAuth() {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        this.user = session.user
        await this.fetchUserProfile()
      }
    }
  }
})
