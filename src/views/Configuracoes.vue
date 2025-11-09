<template>
  <Layout>
    <div class="space-y-6 pb-20 md:pb-6">
      <h2 class="text-2xl md:text-3xl font-bold text-gray-900">Configurações</h2>

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
          <button @click="updateProfile" class="btn-primary">Atualizar Perfil</button>
        </div>
      </div>

      <div class="card">
        <h3 class="text-lg font-bold mb-4">Alterar Senha</h3>
        <form @submit.prevent="changePassword" class="space-y-4">
          <div>
            <label class="label">Nova Senha</label>
            <input v-model="newPassword" type="password" class="input-field" />
          </div>
          <div>
            <label class="label">Confirmar Nova Senha</label>
            <input v-model="confirmPassword" type="password" class="input-field" />
          </div>
          <button type="submit" class="btn-primary">Alterar Senha</button>
        </form>
      </div>

      <div class="card">
        <h3 class="text-lg font-bold mb-4">Sobre o Sistema</h3>
        <div class="space-y-2 text-sm">
          <p><strong>Nome:</strong> Natural Fruit PWA</p>
          <p><strong>Versão:</strong> 1.0.0</p>
          <p><strong>Desenvolvido para:</strong> Natural Fruit - Gestão de Produção</p>
        </div>
      </div>
    </div>
  </Layout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '../stores/auth'
import { supabase } from '../lib/supabase'
import Layout from '../components/Layout.vue'

const authStore = useAuthStore()
const profile = ref({ name: '', email: '' })
const newPassword = ref('')
const confirmPassword = ref('')

const loadProfile = () => {
  profile.value = {
    name: authStore.userProfile?.name || '',
    email: authStore.user?.email || ''
  }
}

const updateProfile = async () => {
  try {
    await supabase
      .from('profiles')
      .update({ name: profile.value.name })
      .eq('id', authStore.user.id)
    
    await authStore.fetchUserProfile()
    alert('Perfil atualizado com sucesso!')
  } catch (error) {
    alert('Erro ao atualizar perfil')
  }
}

const changePassword = async () => {
  if (newPassword.value !== confirmPassword.value) {
    alert('As senhas não coincidem')
    return
  }
  
  try {
    await supabase.auth.updateUser({ password: newPassword.value })
    alert('Senha alterada com sucesso!')
    newPassword.value = ''
    confirmPassword.value = ''
  } catch (error) {
    alert('Erro ao alterar senha')
  }
}

onMounted(loadProfile)
</script>
