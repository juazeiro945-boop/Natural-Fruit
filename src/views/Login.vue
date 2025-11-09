<template>
  <div class="min-h-screen bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center p-4 overflow-hidden">
    <div class="flex max-w-6xl w-full bg-white rounded-3xl shadow-2xl overflow-hidden" style="max-height: 95vh;">
      
      <!-- Lado Esquerdo - Formulário de Login -->
      <div class="w-full lg:w-1/2 p-8 lg:p-12 overflow-y-auto">
        <div class="max-w-md mx-auto">
          <!-- Logo em cima do formulário -->
          <div class="text-center mb-8">
            <img src="/natural-fruit-logo-512.jpg" alt="Natural Fruit" class="w-24 h-24 mx-auto mb-4 rounded-2xl shadow-lg border-4 border-orange-500">
            <h2 class="text-2xl font-bold text-gray-900 mb-2">Bem-vindo de volta!</h2>
            <p class="text-gray-600">Faça login para continuar</p>
          </div>

          <form @submit.prevent="handleLogin" class="space-y-5">
            <div>
              <label for="email" class="block text-sm font-medium text-gray-700 mb-2">E-mail</label>
              <input
                id="email"
                v-model="email"
                type="email"
                required
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition"
                :class="{ 'border-red-500': emailError }"
                placeholder="seu@email.com"
                autocomplete="email"
                @blur="validateEmail"
              />
              <p v-if="emailError" class="mt-1 text-sm text-red-600">{{ emailError }}</p>
            </div>

            <div>
              <label for="password" class="block text-sm font-medium text-gray-700 mb-2">Senha</label>
              <div class="relative">
                <input
                  id="password"
                  v-model="password"
                  :type="showPassword ? 'text' : 'password'"
                  required
                  class="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition"
                  placeholder="••••••••"
                  autocomplete="current-password"
                />
                <button
                  type="button"
                  @click="showPassword = !showPassword"
                  class="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition"
                >
                  <svg v-if="!showPassword" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                  </svg>
                  <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/>
                  </svg>
                </button>
              </div>
            </div>

            <div v-if="error" role="alert" class="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
              <svg class="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
              </svg>
              <span>{{ error }}</span>
            </div>

            <button
              type="submit"
              :disabled="loading"
              class="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold py-3 px-4 rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all duration-200 shadow-lg hover:shadow-xl"
              :class="{ 'opacity-50 cursor-not-allowed': loading }"
            >
              <span v-if="loading" class="flex items-center justify-center gap-2">
                <svg class="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"/>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                </svg>
                Entrando...
              </span>
              <span v-else>Entrar</span>
            </button>

            <div class="text-center">
              <a href="#" class="text-sm text-orange-600 hover:text-orange-700 transition">
                Esqueceu sua senha?
              </a>
            </div>
          </form>
        </div>
      </div>

      <!-- Lado Direito - Branding -->
      <div class="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-green-700 to-orange-600 items-center justify-center p-12 relative overflow-hidden">
        <!-- Padrão de fundo decorativo -->
        <div class="absolute inset-0 opacity-10">
          <svg class="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <circle cx="20" cy="20" r="30" fill="white"/>
            <circle cx="80" cy="80" r="40" fill="white"/>
            <circle cx="70" cy="30" r="25" fill="white"/>
          </svg>
        </div>

        <div class="relative z-10 text-center">
          <!-- Nome da marca com fontes especiais -->
          <div class="mb-8">
            <h1 class="text-7xl mb-2" style="font-family: 'Brush Script MT', cursive; font-style: italic; color: white; text-shadow: 3px 3px 6px rgba(0,0,0,0.3); line-height: 1.2;">
              Natural
            </h1>
            <h1 class="text-6xl" style="font-family: Georgia, serif; color: #ff6f00; text-shadow: 2px 2px 4px rgba(0,0,0,0.3); font-weight: bold;">
              fruit
            </h1>
          </div>

          <div class="w-32 h-1 bg-white mx-auto mb-8 rounded-full"></div>

          <p class="text-white text-xl font-light mb-4" style="text-shadow: 1px 1px 2px rgba(0,0,0,0.3);">
            Sistema de Gestão de Produção
          </p>

          <p class="text-white/90 text-base max-w-md mx-auto" style="text-shadow: 1px 1px 2px rgba(0,0,0,0.2);">
            Gerencie sua produção de frutas naturais com eficiência e qualidade
          </p>

          <!-- Ícones decorativos -->
          <div class="mt-12 flex justify-center gap-6">
            <div class="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
              <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
            <div class="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
              <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
              </svg>
            </div>
            <div class="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
              <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
          </div>
        </div>
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
const showPassword = ref(false)
const error = ref('')
const emailError = ref('')
const loading = ref(false)

const validateEmail = () => {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!email.value) {
    emailError.value = 'E-mail é obrigatório'
    return false
  } else if (!emailPattern.test(email.value)) {
    emailError.value = 'E-mail inválido'
    return false
  } else {
    emailError.value = ''
    return true
  }
}

const handleLogin = async () => {
  error.value = ''
  
  if (!validateEmail() || !password.value) {
    error.value = 'Preencha todos os campos corretamente'
    return
  }

  try {
    loading.value = true

    const result = await authStore.signIn(email.value, password.value)

    if (result.success) {
      await router.push('/')
    } else {
      error.value = result.message || 'E-mail ou senha inválidos'
    }
  } catch (err) {
    error.value = 'Erro ao conectar. Verifique sua conexão.'
    console.error('Login error:', err)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
/* Garantir que as fontes sejam carregadas */
@import url('https://fonts.googleapis.com/css2?family=Dancing+Script:wght@700&display=swap');

/* Remove scrollbar se necessário */
::-webkit-scrollbar {
  width: 6px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 10px;
}

::-webkit-scrollbar-thumb {
  background: #ff8f00;
  border-radius: 10px;
}

::-webkit-scrollbar-thumb:hover {
  background: #e65100;
}
</style>
