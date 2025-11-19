<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <header class="bg-gradient-to-r from-primary-500 to-primary-600 shadow-lg">
      <div class="max-w-7xl mx-auto px-4 py-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-3">
            <img src="/natural-fruit-logo-192.jpg" alt="Natural Fruit" class="w-12 h-12 md:w-16 md:h-16 rounded-xl shadow-lg border-2 border-white">
            <div>
              <h1 class="text-xl md:text-2xl font-bold logo-text">
                <span class="text-white">Natural</span> 
                <span class="text-white">fruit</span>
              </h1>
              <p class="text-primary-100 text-xs font-medium">{{ authStore.userType }}</p>
            </div>
          </div>
          
          <!-- Botão Menu + Logout Mobile -->
          <div class="flex items-center gap-2 md:hidden">
            <button @click="handleLogout" class="text-white hover:bg-primary-700 p-2 rounded-lg transition-colors">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
              </svg>
            </button>
            <button @click="toggleMenu" class="text-white hover:bg-primary-700 p-2 rounded-lg transition-colors">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path v-if="!showMenu" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
                <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </header>

    <!-- Mobile Menu Overlay -->
    <transition name="slide-fade">
      <div v-if="showMenu" class="md:hidden fixed inset-0 z-40 bg-black bg-opacity-50" @click="showMenu = false">
        <div class="bg-white w-80 h-full shadow-2xl overflow-y-auto" @click.stop>
          <div class="bg-gradient-to-r from-primary-500 to-primary-600 p-4">
            <div class="flex items-center space-x-3 text-white">
              <img src="/natural-fruit-logo-192.jpg" alt="Natural Fruit" class="w-12 h-12 rounded-xl border-2 border-white">
              <div>
                <p class="font-bold text-lg">{{ authStore.userName }}</p>
                <p class="text-xs text-primary-100">{{ authStore.userType }}</p>
              </div>
            </div>
          </div>
          
          <nav class="p-4">
            <router-link
              v-for="item in allowedMenuItems"
              :key="item.rota"
              :to="item.rota"
              @click="showMenu = false"
              class="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors mb-2"
              :class="{ 'bg-primary-50 text-primary-600 font-semibold': $route.path === item.rota }"
            >
              <span class="text-2xl">{{ item.icone }}</span>
              <span class="font-medium">{{ item.nome }}</span>
            </router-link>

            <div class="pt-4 border-t mt-4">
              <button
                @click="handleLogout"
                class="w-full flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-red-50 text-red-600 transition-colors font-medium"
              >
                <span class="text-2xl">🚪</span>
                <span>Sair</span>
              </button>
            </div>
          </nav>
        </div>
      </div>
    </transition>

    <div class="flex">
      <!-- Sidebar Desktop -->
      <aside class="hidden md:block w-64 bg-white shadow-lg min-h-screen">
        <div class="p-4 border-b bg-gradient-to-r from-primary-50 to-primary-100">
          <p class="font-bold text-gray-800">{{ authStore.userName }}</p>
          <p class="text-xs text-gray-600">{{ authStore.userType }}</p>
        </div>
        
        <nav class="p-4 space-y-2">
          <router-link
            v-for="item in allowedMenuItems"
            :key="item.rota"
            :to="item.rota"
            class="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors"
            :class="{ 'bg-primary-50 text-primary-600 font-semibold': $route.path === item.rota }"
          >
            <span class="text-2xl">{{ item.icone }}</span>
            <span class="font-medium">{{ item.nome }}</span>
          </router-link>

          <div class="pt-4 border-t mt-4">
            <button
              @click="handleLogout"
              class="w-full flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-red-50 text-red-600 transition-colors font-medium"
            >
              <span class="text-2xl">🚪</span>
              <span>Sair</span>
            </button>
          </div>
        </nav>
      </aside>

      <!-- Main Content -->
      <main class="flex-1 p-4 md:p-6 pb-20 md:pb-6">
        <slot />
      </main>
    </div>

    <!-- Bottom Navigation Mobile -->
    <nav class="md:hidden fixed bottom-0 left-0 right-0 bg-white shadow-lg border-t z-30">
      <div class="flex justify-around">
        <router-link
          v-for="item in allowedBottomMenuItems"
          :key="item.rota"
          :to="item.rota"
          class="flex flex-col items-center py-2 px-2 flex-1 transition-colors"
          :class="{ 'text-primary-600': $route.path === item.rota, 'text-gray-600': $route.path !== item.rota }"
        >
          <span class="text-2xl">{{ item.icone }}</span>
          <span class="text-xs mt-1 font-medium">{{ item.nome_curto || item.nome }}</span>
        </router-link>
      </div>
    </nav>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const authStore = useAuthStore()
const showMenu = ref(false)

const toggleMenu = () => {
  showMenu.value = !showMenu.value
}

// NOVO: Menu dinâmico baseado nas permissões do banco de dados
const allowedMenuItems = computed(() => {
  // Pega as permissões que o usuário tem acesso
  return authStore.allowedPages || []
})

// Menu inferior mobile - pega as principais páginas permitidas
const allowedBottomMenuItems = computed(() => {
  const pages = authStore.allowedPages || []
  
  // Define nomes curtos para o menu inferior
  const pagesWithShortNames = pages.map(page => ({
    ...page,
    nome_curto: getShortName(page.nome)
  }))
  
  // Prioriza certas páginas para o menu inferior baseado na rota
  const priority = ['/', '/vendedor', '/vendas', '/trocas', '/configuracoes']
  const priorityPages = pagesWithShortNames.filter(p => priority.includes(p.rota))
  
  // Se não tiver 5 páginas prioritárias, completa com outras
  if (priorityPages.length < 5) {
    const otherPages = pagesWithShortNames.filter(p => !priority.includes(p.rota))
    return [...priorityPages, ...otherPages].slice(0, 5)
  }
  
  return priorityPages.slice(0, 5)
})

// Função auxiliar para nomes curtos no menu inferior
const getShortName = (nome) => {
  const shortNames = {
    'Dashboard Admin': 'Início',
    'Dashboard Vendedor': 'Pedidos',
    'Configurações': 'Config',
    'Relatórios': 'Reports',
    'Produção': 'Produção'
  }
  return shortNames[nome] || nome
}

const handleLogout = async () => {
  if (confirm('Deseja realmente sair do sistema?')) {
    await authStore.signOut()
    router.push('/login')
  }
}

// Recarregar permissões ao montar o componente
onMounted(async () => {
  if (authStore.isAuthenticated && authStore.userPermissions.length === 0) {
    await authStore.reloadPermissions()
  }
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Dancing+Script:wght@600;700&display=swap');

.logo-text {
  font-family: 'Dancing Script', 'Brush Script MT', cursive;
  letter-spacing: 1px;
}

/* Animação do menu mobile */
.slide-fade-enter-active {
  transition: all 0.3s ease-out;
}

.slide-fade-leave-active {
  transition: all 0.3s ease-in;
}

.slide-fade-enter-from {
  opacity: 0;
}

.slide-fade-leave-to {
  opacity: 0;
}

.slide-fade-enter-from > div {
  transform: translateX(-100%);
}

.slide-fade-leave-to > div {
  transform: translateX(-100%);
}
</style>
