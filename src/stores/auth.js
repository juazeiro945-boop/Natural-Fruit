// Substitua o método signUp por este:
async signUp(email, password, name, tipo_usuario, telefone = '') {
  try {
    console.log('🔵 Iniciando signUp via Edge Function...', { email, name, tipo_usuario })
    
    // 1. Chamar função edge para criar usuário
    const { data, error } = await supabase.functions.invoke('create-user', {
      body: {
        email,
        password,
        name,
        tipo_usuario,
        telefone
      }
    })

    if (error) {
      console.error('❌ Erro na função edge:', error)
      throw error
    }

    if (!data.success) {
      console.error('❌ Erro ao criar usuário:', data.error)
      throw new Error(data.error || 'Erro ao criar usuário')
    }

    console.log('✅ Usuário criado via edge function:', data.userId)
    
    return {
      success: true,
      userId: data.userId,
      user: data.user
    }
    
  } catch (error) {
    console.error('❌ Erro completo no signUp:', error)
    return {
      success: false,
      error: error.message
    }
  }
}
