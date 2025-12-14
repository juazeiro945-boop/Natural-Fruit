import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '../lib/supabase'

export const useAuthStore = defineStore('auth', () => {
  // Estado
  const user = ref(null)
  const userProfile = ref(null)
  const userType = ref('')
  const isAdmin = computed(() => userType.value === 'administrador')
  
  // Métodos
  const signUp = async (email, password, name, tipo_usuario, telefone = '') => {
    try {
      console.log('🔵 Iniciando signUp via Edge Function...', { email, name, tipo_usuario })
      
      const { data, error } = await supabase.functions.invoke('create-user', {
        body: { email, password, name, tipo_usuario, telefone }
      })

      if (error) {
        console.error('❌ Erro na Edge Function:', error)
        return { success: false, error: error.message }
      }

      if (!data.success) {
        return { success: false, error: data.error || 'Erro desconhecido' }
      }

      console.log('✅ Usuário criado via Edge Function:', data.userId)
      
      return {
        success: true,
        userId: data.userId,
        message: 'Usuário criado com sucesso'
      }

    } catch (error) {
      console.error('❌ Erro completo no signUp:', error)
      return {
        success: false,
        error: error.message || 'Erro interno ao criar usuário'
      }
    }
  }

  const signIn = async (email, password) => {
    // Sua lógica de login...
  }

  const signOut = async () => {
    // Sua lógica de logout...
  }

  const fetchUserProfile = async () => {
    // Sua lógica para buscar perfil...
  }

  // Retornar tudo
  return {
    user,
    userProfile,
    userType,
    isAdmin,
    signUp,
    signIn,
    signOut,
    fetchUserProfile
  }
})
