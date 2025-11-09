<template>
  <div class="min-h-screen bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center p-4">
    <div class="card max-w-md w-full">
      <div class="text-center mb-8">
        <div class="w-32 h-32 mx-auto mb-4 rounded-2xl shadow-lg border-4 border-white bg-white flex items-center justify-center overflow-hidden">
          <svg viewBox="0 0 200 200" class="w-full h-full">
            <!-- Círculo laranja -->
            <circle cx="100" cy="100" r="90" fill="none" stroke="#e65100" stroke-width="6"/>
            
            <!-- Laranja estilizada -->
            <g transform="translate(100, 80)">
              <ellipse cx="0" cy="0" rx="25" ry="30" fill="#ff6f00" transform="rotate(-20)"/>
              <ellipse cx="5" cy="-5" rx="22" ry="28" fill="#ff8f00" transform="rotate(-20)"/>
              <path d="M -8,-25 Q -5,-32 0,-30 Q 5,-32 8,-25" fill="none" stroke="#2e7d32" stroke-width="2.5" stroke-linecap="round"/>
              <ellipse cx="-3" cy="-28" rx="8" ry="4" fill="#2e7d32" transform="rotate(-25)"/>
              <ellipse cx="5" cy="-28" rx="8" ry="4" fill="#388e3c" transform="rotate(15)"/>
              <line x1="-2" y1="-30" x2="-2" y2="-35" stroke="#c62828" stroke-width="2" stroke-linecap="round"/>
            </g>
            
            <!-- Texto Natural -->
            <text x="100" y="140" font-family="'Brush Script MT', cursive" font-size="32" fill="#2e7d32" text-anchor="middle" font-style="italic" font-weight="bold">Natural</text>
            
            <!-- Texto fruit -->
            <text x="100" y="165" font-family="Georgia, serif" font-size="28" fill="#e65100" text-anchor="middle" font-weight="bold">fruit</text>
          </svg>
        </div>
        <h1 class="text-3xl font-bold text-gray-900 mb-2">
          <span style="font-family: 'Brush Script MT', cursive; font-style: italic; color: #2e7d32;">Natural</span>
          <span style="font-family: Georgia, serif; color: #e65100;"> fruit</span>
        </h1>
        <p class="text-gray-600">Sistema de Gestão de Produção</p>
      </div>

      <form @submit.prevent="handleLogin" class="space-y-4">
        <div>
          <label for="email" class="label">E-mail</label>
          <input
            id="email"
            v-model="email"
            type="email"
            required
            class="input-field"
            :class="{ 'border-red-500': emailError }"
            placeholder="seu@email.com"
            autocomplete="email"
            @blur="validateEmail"
          />
          <p v-if="emailError" class="mt-1 text-sm text-red-600">{{ emailError }}</p>
        </div>

        <div>
          <label for="password" class="label">Senha</label>
          <div class="relative">
            <input
              id="password"
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              required
              class="input-field pr-10"
              placeholder="••••••••"
              autocomplete="current-password"
            />
            <button
              type="button"
              @click="showPassword = !showPassword"
              class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition"
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
          class="w-full btn-primary"
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

      <div class="mt-6 pt-6 border-t border-gray-200 text-center text-sm text-gray-600">
        <p class="mb-2">Credenciais padrão para teste:</p>
        <div class="bg-gray-50 rounded-lg p-3 font-mono text-xs">
          <p class="text-gray-700">admin@naturalfruit.com</p>
          <p class="text-gray-700">admin123</p>
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
/* Adicione aqui estilos personalizados se necessário */
</style>
