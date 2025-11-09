import { defineStore } from 'pinia'
import { supabase } from '../lib/supabase'

export const useProductStore = defineStore('product', {
  state: () => ({
    products: [],
    loading: false
  }),

  actions: {
    async fetchProducts() {
      this.loading = true
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .order('name')
        
        if (error) throw error
        this.products = data
      } catch (error) {
        console.error('Erro ao buscar produtos:', error)
      } finally {
        this.loading = false
      }
    },

    async addProduct(product) {
      try {
        const { data, error } = await supabase
          .from('products')
          .insert([product])
          .select()
        
        if (error) throw error
        this.products.push(data[0])
        return { success: true }
      } catch (error) {
        return { success: false, error: error.message }
      }
    },

    async updateProduct(id, updates) {
      try {
        const { data, error } = await supabase
          .from('products')
          .update(updates)
          .eq('id', id)
          .select()
        
        if (error) throw error
        
        const index = this.products.findIndex(p => p.id === id)
        if (index !== -1) {
          this.products[index] = data[0]
        }
        return { success: true }
      } catch (error) {
        return { success: false, error: error.message }
      }
    },

    async deleteProduct(id) {
      try {
        const { error } = await supabase
          .from('products')
          .delete()
          .eq('id', id)
        
        if (error) throw error
        
        this.products = this.products.filter(p => p.id !== id)
        return { success: true }
      } catch (error) {
        return { success: false, error: error.message }
      }
    }
  }
})
