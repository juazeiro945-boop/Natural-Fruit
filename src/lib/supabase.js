import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'SUA_URL_SUPABASE'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_KEY || 'SUA_CHAVE_SUPABASE'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
})

// Listener global para erros de autenticação
supabase.auth.onAuthStateChange((event, session) => {
  console.log('Auth state changed:', event)
  
  // Se o token expirou ou falhou ao renovar
  if (event === 'TOKEN_REFRESHED' && !session) {
    console.error('Falha ao renovar token, fazendo logout...')
    handleAuthError()
  }
  
  if (event === 'SIGNED_OUT') {
    // Limpar qualquer dado em cache
    localStorage.clear()
    sessionStorage.clear()
  }
})

// Função para tratar erros de autenticação
async function handleAuthError() {
  try {
    await supabase.auth.signOut()
    localStorage.clear()
    sessionStorage.clear()
    window.location.href = '/login'
  } catch (error) {
    console.error('Erro ao fazer logout forçado:', error)
    // Forçar reload para limpar estado
    localStorage.clear()
    sessionStorage.clear()
    window.location.href = '/login'
  }
}

// Adicionar tratamento global de erros para o Supabase
if (typeof window !== 'undefined') {
  window.addEventListener('unhandledrejection', (event) => {
    if (event.reason?.message) {
      const message = event.reason.message.toLowerCase()
      if (message.includes('jwt') || 
          message.includes('refresh token') || 
          message.includes('invalid token')) {
        console.error('Erro de autenticação detectado:', event.reason.message)
        handleAuthError()
        event.preventDefault()
      }
    }
  })
}
