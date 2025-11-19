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
      const cacheVersion = localStorage.getItem('nf_cache_version')
      
      if (cacheVersion !== 'v4') {
        console.log('🧹 Limpando cache antigo...')
        
        // Remove service workers antigos
        const registrations = await navigator.serviceWorker.getRegistrations()
        for (let registration of registrations) {
          await registration.unregister()
          console.log('🗑️ SW antigo removido')
        }
        
        // Limpa caches antigos (mantém apenas v4)
        const cacheNames = await caches.keys()
        for (let cacheName of cacheNames) {
          if (!cacheName.includes('v4')) {
            await caches.delete(cacheName)
            console.log('🗑️ Cache removido:', cacheName)
          }
        }
        
        // Marca a nova versão
        localStorage.setItem('nf_cache_version', 'v4')
        localStorage.setItem('nf_cache_data', new Date().toISOString())
        
        console.log('✨ Cache limpo! Recarregando...')
        
        setTimeout(() => {
          window.location.reload()
        }, 1000)
        
        return
      }
      
      // ==========================================
      // SERVICE WORKER COM AUTO-UPDATE
      // ==========================================
      
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
        updateViaCache: 'none'
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
            
            // Força o novo SW a assumir controle
            newWorker.postMessage({ type: 'SKIP_WAITING' })
            
            // Atualiza automaticamente
            setTimeout(() => {
              console.log('♻️ Atualizando...')
              window.location.reload()
            }, 2000)
          }
        })
      })
      
      // Recarrega quando novo SW assume controle
      let refreshing = false
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (!refreshing) {
          refreshing = true
          console.log('♻️ Aplicando atualização...')
          window.location.reload()
        }
      })
      
    } catch (error) {
      console.error('❌ Erro no Service Worker:', error)
      // Em caso de erro, limpa versão e tenta novamente
      localStorage.removeItem('nf_cache_version')
    }
  })
}
