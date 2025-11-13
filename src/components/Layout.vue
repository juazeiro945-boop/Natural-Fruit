<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <header class="bg-gradient-to-r from-primary-500 to-primary-600 shadow-lg">
      <div class="max-w-7xl mx-auto px-4 py-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-3">
            <img src="/natural-fruit-logo-192.jpg" alt="Natural Fruit" class="w-12 h-12 rounded-xl shadow-lg border-2 border-white">
            <div>
              <h1 class="text-2xl font-bold logo-text">
                <span class="text-natural-green">Natural</span> 
                <span class="text-white">fruit</span>
              </h1>
              <p class="text-primary-100 text-xs font-medium">Gestão de Produção</p>
            </div>
          </div>
          <button @click="toggleMenu" class="text-white p-2 md:hidden">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
            </svg>
          </button>
        </div>
      </div>
    </header>

    <!-- Mobile Menu -->
    <div v-if="showMenu" class="md:hidden bg-white shadow-lg">
      <nav class="px-4 py-2">
        <router-link
          v-for="item in menuItems"
          :key="item.path"
          :to="item.path"
          @click="showMenu = false"
          class="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors"
          :class="{ 'bg-primary-50 text-primary-600': $route.path === item.path }"
        >
          <span class="text-2xl">{{ item.icon }}</span>
          <span class="font-medium">{{ item.name }}</span>
        </router-link>
      </nav>
    </div>

    <div class="flex">
      <!-- Sidebar Desktop -->
      <aside class="hidden md:block w-64 bg-white shadow-lg min-h-screen">
        <nav class="p-4 space-y-2">
          <router-link
            v-for="item in menuItems"
            :key="item.path"
            :to="item.path"
            class="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors"
            :class="{ 'bg-primary-50 text-primary-600': $route.path === item.path }"
          >
            <span class="text-2xl">{{ item.icon }}</span>
            <span class="font-medium">{{ item.name }}</span>
          </router-link>

          <div class="pt-4 border-t mt-4">
            <button
              @click="handleLogout"
              class="w-full flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-red-50 text-red-600 transition-colors"
            >
              <span class="text-2xl">🚪</span>
              <span class="font-medium">Sair</span>
            </button>
          </div>
        </nav>
      </aside>

      <!-- Main Content -->
      <main class="flex-1 p-4 md:p-6">
        <slot />
      </main>
    </div>

    <!-- Bottom Navigation Mobile -->
    <nav class="md:hidden fixed bottom-0 left-0 right-0 bg-white shadow-lg border-t">
      <div class="flex justify-around">
        <router-link
          v-for="item in bottomMenuItems"
          :key="item.path"
          :to="item.path"
          class="flex flex-col items-center py-2 px-3 flex-1"
          :class="{ 'text-primary-600': $route.path === item.path }"
        >
          <span class="text-2xl">{{ item.icon }}</span>
          <span class="text-xs mt-1">{{ item.name }}</span>
        </router-link>
      </div>
    </nav>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const authStore = useAuthStore()
const showMenu = ref(false)

const toggleMenu = () => {
  showMenu.value = !showMenu.value
}

const menuItems = computed(() => {
  const items = [
    { path: '/', name: 'Dashboard', icon: '📊' },
    { path: '/materia-prima', name: 'Matéria-Prima', icon: '📦' },
    { path: '/producao', name: 'Produção', icon: '🏭' },
    { path: '/vendas', name: 'Vendas', icon: '💰' },
    { path: '/clientes', name: 'Clientes', icon: '👥' },
    { path: '/despesas', name: 'Despesas', icon: '💸' }, // ✨ NOVO - ADICIONADO
    { path: '/perdas', name: 'Perdas', icon: '📉' },
    { path: '/trocas', name: 'Trocas', icon: '🔄' },
    { path: '/relatorios', name: 'Relatórios', icon: '📈' },
    { path: '/configuracoes', name: 'Configurações', icon: '⚙️' }
  ]

  if (authStore.isAdmin) {
    items.splice(5, 0, { path: '/produtos', name: 'Produtos', icon: '🍎' })
  }

  return items
})

const bottomMenuItems = computed(() => [
  { path: '/', name: 'Início', icon: '📊' },
  { path: '/producao', name: 'Produção', icon: '🏭' },
  { path: '/vendas', name: 'Vendas', icon: '💰' },
  { path: '/despesas', name: 'Despesas', icon: '💸' } // ✨ NOVO - ADICIONADO
])

const handleLogout = async () => {
  await authStore.signOut()
  router.push('/login')
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Dancing+Script:wght@600;700&display=swap');

.logo-text {
  font-family: 'Dancing Script', 'Brush Script MT', cursive;
  letter-spacing: 1px;
}

.text-natural-green {
  color: #4CAF50;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
}
</style>
