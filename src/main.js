import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './style.css'

const pinia = createPinia()
const app = createApp(App)

app.use(pinia)
app.use(router)
app.mount('#app')

// ==========================================
// SERVICE WORKER COM AUTO-UPDATE
// ==========================================

if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      })
      
      console.log('✅ Service Worker registrado')
      
      // Verifica atualizações a cada 60 segundos
      setInterval(() => {
        registration.update()
      }, 60000)
      
      // Detecta quando há nova versão disponível
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing
        
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            console.log('🔄 Nova versão detectada')
            
            // Força o novo SW a assumir controle imediatamente
            newWorker.postMessage({ type: 'SKIP_WAITING' })
            
            // Notifica usuário sobre atualização
            setTimeout(() => {
              const atualizar = confirm('🍊 Nova versão do Natural Fruit disponível!\n\nDeseja atualizar agora?')
              if (atualizar) {
                window.location.reload()
              }
            }, 500)
          }
        })
      })
      
      // Recarrega página quando novo SW assume controle
      let refreshing = false
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (!refreshing) {
          refreshing = true
          console.log('♻️ Aplicando atualização...')
          window.location.reload()
        }
      })
      
    } catch (error) {
      console.error('❌ Erro ao registrar Service Worker:', error)
    }
  })
  
  // Listener para mensagens do Service Worker
  navigator.serviceWorker.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'CACHE_UPDATED') {
      console.log('📦 Cache atualizado')
    }
  })
}

// ==========================================
// LIMPEZA DE CACHE ANTIGO (EXECUTAR UMA VEZ)
// ==========================================

// Descomente as linhas abaixo APENAS para o PRIMEIRO deploy após essa correção
// Depois de todos os usuários atualizarem, comente novamente

/*
if ('serviceWorker' in navigator && 'caches' in window) {
  window.addEventListener('load', async () => {
    try {
      // Remove service workers antigos
      const registrations = await navigator.serviceWorker.getRegistrations()
      for (let registration of registrations) {
        const wasUnregistered = await registration.unregister()
        if (wasUnregistered) {
          console.log('🗑️ SW antigo removido')
        }
      }
      
      // Limpa caches antigos
      const cacheNames = await caches.keys()
      for (let cacheName of cacheNames) {
        if (!cacheName.includes('v2')) {
          await caches.delete(cacheName)
          console.log('🗑️ Cache antigo removido:', cacheName)
        }
      }
      
      console.log('✨ Limpeza concluída - recarregando...')
      setTimeout(() => {
        window.location.reload()
      }, 1000)
      
    } catch (error) {
      console.error('Erro na limpeza:', error)
    }
  })
}
*/
