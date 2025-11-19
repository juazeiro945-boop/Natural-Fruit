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
// LIMPEZA AUTOMÁTICA DE CACHE ANTIGO
// ==========================================

if ('serviceWorker' in navigator && 'caches' in window) {
  window.addEventListener('load', async () => {
    try {
      // Verifica se já fez a limpeza (flag no localStorage)
      const cacheLimpo = localStorage.getItem('nf_cache_v2_limpo')
      
      if (!cacheLimpo) {
        console.log('🧹 Iniciando limpeza de cache antigo...')
        
        // Remove service workers antigos
        const registrations = await navigator.serviceWorker.getRegistrations()
        for (let registration of registrations) {
          await registration.unregister()
          console.log('🗑️ SW antigo removido')
        }
        
        // Limpa todos os caches antigos
        const cacheNames = await caches.keys()
        for (let cacheName of cacheNames) {
          await caches.delete(cacheName)
          console.log('🗑️ Cache removido:', cacheName)
        }
        
        // Marca que a limpeza foi feita
        localStorage.setItem('nf_cache_v2_limpo', 'true')
        localStorage.setItem('nf_cache_v2_data', new Date().toISOString())
        
        console.log('✨ Limpeza concluída! Recarregando...')
        
        // Aguarda 1 segundo e recarrega
        setTimeout(() => {
          window.location.reload()
        }, 1000)
        
        return // Encerra execução aqui para recarregar
      }
      
      // ==========================================
      // SERVICE WORKER COM AUTO-UPDATE
      // ==========================================
      
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
        updateViaCache: 'none'
      })
      
      console.log('✅ Service Worker registrado')
      
      // Verifica atualizações a cada 30 segundos
      setInterval(() => {
        registration.update()
      }, 30000)
      
      // Detecta quando há nova versão disponível
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing
        
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            console.log('🔄 Nova versão detectada')
            
            // Força o novo SW a assumir controle imediatamente
            newWorker.postMessage({ type: 'SKIP_WAITING' })
            
            // Atualiza automaticamente após 2 segundos
            setTimeout(() => {
              console.log('♻️ Atualizando automaticamente...')
              window.location.reload()
            }, 2000)
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
      console.error('❌ Erro:', error)
      // Em caso de erro, limpa flag e tenta novamente no próximo reload
      localStorage.removeItem('nf_cache_v2_limpo')
    }
  })
  
  // Listener para mensagens do Service Worker
  navigator.serviceWorker.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'CACHE_UPDATED') {
      console.log('📦 Cache atualizado')
    }
  })
}
