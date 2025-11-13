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

// Interceptar erros de API do Supabase
const originalFrom = supabase.from.bind(supabase)
supabase.from = function(...args) {
  const query = originalFrom(...args)
  const originalThen = query.then.bind(query)
  
  query.then = function(onFulfilled, onRejected) {
    return originalThen(
      (result) => {
        // Se houver erro de autenticação
        if (result.error && result.error.message && 
            (result.error.message.includes('JWT') || 
             result.error.message.includes('token') ||
             result.error.message.includes('refresh'))) {
          handleAuthError()
          return result
        }
        return onFulfilled ? onFulfilled(result) : result
      },
      onRejected
    )
  }
  
  return query
}
