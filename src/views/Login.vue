<template>
  <div class="min-h-screen bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center p-4">
    <div class="card max-w-md w-full">
      <div class="text-center mb-8">
        <img src="/natural-fruit-logo-512.jpg" alt="Natural Fruit" class="w-32 h-32 mx-auto mb-4 rounded-2xl shadow-lg border-4 border-white">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">Natural Fruit</h1>
        <p class="text-gray-600">Sistema de Gestão de Produção</p>
      </div>

      <form @submit.prevent="handleLogin" class="space-y-4">
        <div>
          <label class="label">E-mail</label>
          <input
            v-model="email"
            type="email"
            required
            class="input-field"
            placeholder="seu@email.com"
          />
        </div>

        <div>
          <label class="label">Senha</label>
          <input
            v-model="password"
            type="password"
            required
            class="input-field"
            placeholder="••••••••"
          />
        </div>

        <div v-if="error" class="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
          {{ error }}
        </div>

        <button
          type="submit"
          :disabled="loading"
          class="w-full btn-primary"
          :class="{ 'opacity-50 cursor-not-allowed': loading }"
        >
          {{ loading ? 'Entrando...' : 'Entrar' }}
        </button>
      </form>

      <div class="mt-6 text-center text-sm text-gray-600">
        <p>Credenciais padrão para teste:</p>
        <p class="font-mono text-xs mt-2">admin@naturalfruit.com / admin123</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const email = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)

const handleLogin = async () => {
  error.value = ''
  loading.value = true

  const result = await authStore.signIn(email.value, password.value)

  if (result.success) {
    router.push('/')
  } else {
    error.value = 'E-mail ou senha inválidos'
  }

  loading.value = false
}
</script>