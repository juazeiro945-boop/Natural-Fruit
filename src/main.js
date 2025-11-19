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
// LIMPEZA E REGISTRO DO SERVICE WORKER
// ==========================================

if ('serviceWorker' in navigator && 'caches' in window) {
  window.addEventListener('load', async () => {
    try {
      const cacheVersion = localStorage.getItem('nf_cache_version')
      
      if (cacheVersion !== 'v5') {
        console.log('🧹 Limpando cache antigo...')
        
        const registrations = await navigator.serviceWorker.getRegistrations()
        for (let registration of registrations) {
          await registration.unregister()
          console.log('🗑️ SW removido')
        }
        
        const cacheNames = await caches.keys()
        for (let cacheName of cacheNames) {
          await caches.delete(cacheName)
          console.log('🗑️ Cache removido:', cacheName)
        }
        
        localStorage.setItem('nf_cache_version', 'v5')
        localStorage.setItem('nf_cache_data', new Date().toISOString())
        
        console.log('✨ Cache limpo! Recarregando...')
        
        setTimeout(() => {
          window.location.reload()
        }, 1000)
        
        return
      }
      
      console.log('✅ Cache já está atualizado')
      
    } catch (error) {
      console.error('❌ Erro:', error)
      localStorage.removeItem('nf_cache_version')
    }
  })
}
