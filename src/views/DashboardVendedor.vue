<template>
  <Layout>
    <div class="space-y-4 md:space-y-6 pb-20 md:pb-6">
      <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 class="text-2xl md:text-3xl font-bold text-gray-900">Meus Pedidos</h2>
          <p class="text-gray-600 mt-1">Acompanhe seus pedidos de entrega</p>
        </div>
      </div>

      <div class="card">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label class="label text-sm">Data</label>
            <input v-model="filters.date" type="date" class="input-field" @change="loadPedidos" />
          </div>
          <div>
            <label class="label text-sm">Status</label>
            <select v-model="filters.status" class="input-field" @change="loadPedidos">
              <option value="pendente">🕐 Pendentes</option>
              <option value="entregue">✅ Entregues</option>
              <option value="cancelado">❌ Cancelados</option>
              <option value="">Todos</option>
            </select>
          </div>
          <div>
            <label class="label text-sm">Cliente</label>
            <input v-model="filters.cliente" type="text" class="input-field" placeholder="Buscar cliente..." @input="loadPedidos" />
          </div>
        </div>
      </div>

      <div class="grid grid-cols-3 gap-3 md:gap-4">
        <div class="card text-center">
          <div class="text-3xl mb-2">🕐</div>
          <div class="text-2xl font-bold text-yellow-600">{{ stats.pendentes }}</div>
          <div class="text-sm text-gray-600">Pendentes</div>
        </div>
        <div class="card text-center">
          <div class="text-3xl mb-2">✅</div>
          <div class="text-2xl font-bold text-green-600">{{ stats.entregues }}</div>
          <div class="text-sm text-gray-600">Entregues</div>
        </div>
        <div class="card text-center">
          <div class="text-3xl mb-2">❌</div>
          <div class="text-2xl font-bold text-red-600">{{ stats.cancelados }}</div>
          <div class="text-sm text-gray-600">Cancelados</div>
        </div>
      </div>

      <!-- TABELA DESKTOP -->
      <div class="hidden md:block card overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Data</th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Tipo</th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Cliente</th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Itens</th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Total</th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Pagamento</th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status Pedido</th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status Pgto</th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Ações</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
              <tr v-for="pedido in pedidos" :key="pedido.id" class="hover:bg-gray-50">
                <td class="px-4 py-4 text-sm text-gray-900 whitespace-nowrap">
                  {{ formatDate(pedido.date) }}
                </td>
                <td class="px-4 py-4 text-sm">
                  <span class="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                    {{ pedido.sale_type === 'wholesale' ? '🏭 Atacado' : '🛒 Varejo' }}
                  </span>
                </td>
                <td class="px-4 py-4 text-sm text-gray-900">
                  <div class="font-semibold">{{ pedido.clients?.name }}</div>
                  <div class="text-xs text-gray-500">{{ pedido.clients?.address || 'Regional' }}</div>
                </td>
                <td class="px-4 py-4 text-sm">
                  <span class="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                    {{ getItemsCount(pedido) }} {{ getItemsCount(pedido) === 1 ? 'item' : 'itens' }}
                  </span>
                </td>
                <td class="px-4 py-4 text-sm font-bold text-primary-600">
                  {{ formatCurrency(pedido.total) }}
                </td>
                <td class="px-4 py-4 text-sm">
                  <span class="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                    {{ getPaymentMethodLabel(pedido.payment_method) }}
                  </span>
                </td>
                <td class="px-4 py-4 text-sm">
                  <span :class="getStatusBadge(pedido.status_entrega)" class="px-2 py-1 rounded-full text-xs font-medium">
                    {{ getStatusIcon(pedido.status_entrega) }} {{ getStatusLabel(pedido.status_entrega) }}
                  </span>
                </td>
                <td class="px-4 py-4 text-sm">
                  <span :class="pedido.paid ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'" class="px-2 py-1 rounded-full text-xs font-medium">
                    {{ pedido.paid ? '✅ Pago' : '⏳ Pendente' }}
                  </span>
                </td>
                <td class="px-4 py-4">
                  <div class="flex items-center gap-2">
                    <button @click="openDetailModal(pedido)" class="p-2 hover:bg-gray-100 rounded-lg transition-colors" title="Visualizar Detalhes">
                      <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                      </svg>
                    </button>
                    <button 
                      v-if="pedido.status_entrega === 'pendente'" 
                      @click="confirmarEntrega(pedido)" 
                      class="p-2 hover:bg-green-100 rounded-lg transition-colors text-green-600"
                      title="Confirmar Entrega"
                    >
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                      </svg>
                    </button>
                    <button 
                      v-if="pedido.status_entrega === 'pendente'" 
                      @click="abrirModalCancelamento(pedido)" 
                      class="p-2 hover:bg-red-100 rounded-lg transition-colors text-red-600"
                      title="Cancelar Pedido"
                    >
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                      </svg>
                    </button>
                    <button @click="generateReceipt(pedido)" class="p-2 hover:bg-blue-100 rounded-lg transition-colors text-blue-600" title="Gerar Recibo">
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div v-if="pedidos.length === 0" class="text-center py-12">
          <div class="text-gray-400 mb-4">
            <svg class="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"/>
            </svg>
          </div>
          <p class="text-gray-600 font-medium">Nenhum pedido encontrado</p>
          <p class="text-gray-500 text-sm mt-2">Ajuste os filtros ou aguarde novos pedidos</p>
        </div>
      </div>

      <!-- CARDS MOBILE -->
      <div class="md:hidden space-y-4">
        <div v-for="pedido in pedidos" :key="pedido.id" class="card">
          <div class="flex justify-between items-start mb-3">
            <div>
              <p class="text-xs text-gray-500">{{ formatDate(pedido.date) }}</p>
              <p class="font-bold text-gray-900">{{ pedido.clients?.name }}</p>
            </div>
            <span :class="getStatusBadge(pedido.status_entrega)" class="text-xs px-2 py-1 rounded-full font-semibold">
              {{ getStatusLabel(pedido.status_entrega) }}
            </span>
          </div>

          <div class="space-y-2 mb-4">
            <div class="flex justify-between text-sm">
              <span class="text-gray-600">Total:</span>
              <span class="font-bold text-primary-600">{{ formatCurrency(pedido.total) }}</span>
            </div>
            <div class="flex justify-between text-sm">
              <span class="text-gray-600">Pagamento:</span>
              <span class="font-semibold">{{ getPaymentMethodLabel(pedido.payment_method) }}</span>
            </div>
          </div>

          <div class="flex gap-2">
            <button @click="openDetailModal(pedido)" class="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 rounded-lg text-sm font-semibold">
              👁️ Detalhes
            </button>
            <button @click="generateReceipt(pedido)" class="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-sm font-semibold">
              📄 Recibo
            </button>
          </div>
        </div>

        <div v-if="pedidos.length === 0" class="card text-center py-12">
          <div class="text-gray-400 mb-4">
            <svg class="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"/>
            </svg>
          </div>
          <p class="text-gray-600 font-medium">Nenhum pedido encontrado</p>
        </div>
      </div>

      <!-- MODAL DE DETALHES -->
      <div v-if="showDetailModal && pedidoSelecionado" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div class="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl">
          <div class="sticky top-0 bg-gradient-to-r from-primary-500 to-primary-600 px-6 py-4 flex items-center justify-between z-10 rounded-t-2xl">
            <h3 class="text-xl font-bold text-white">Detalhes do Pedido</h3>
            <button @click="closeDetailModal" class="text-white hover:bg-primary-700 p-2 rounded-lg transition-colors">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>

          <div class="p-6 space-y-4">
            <!-- Vendedor -->
            <div class="flex items-start space-x-3 bg-blue-50 p-4 rounded-xl">
              <span class="text-2xl">👤</span>
              <div class="flex-1">
                <p class="text-sm text-gray-600 mb-1">Vendedor</p>
                <p class="font-bold text-blue-700">{{ getVendedorName(pedidoSelecionado.vendedor_id) }}</p>
              </div>
            </div>

            <!-- Produto -->
            <div class="flex items-start space-x-3">
              <span class="text-2xl">📦</span>
              <div class="flex-1">
                <p class="text-sm text-gray-600 mb-1">Produto</p>
                <p class="font-bold text-gray-900">{{ pedidoSelecionado.products?.name }}</p>
                <p class="text-sm text-gray-600 mt-1">Quantidade: {{ pedidoSelecionado.quantity }}</p>
              </div>
            </div>

            <!-- Telefone -->
            <div class="flex items-start space-x-3">
              <span class="text-2xl">📞</span>
              <div class="flex-1">
                <p class="text-sm text-gray-600 mb-1">Telefone</p>
                <p class="font-bold text-gray-900">{{ pedidoSelecionado.clients?.phone || 'Não informado' }}</p>
              </div>
            </div>

            <!-- Endereço -->
            <div class="flex items-start space-x-3">
              <span class="text-2xl">📍</span>
              <div class="flex-1">
                <p class="text-sm text-gray-600 mb-1">Endereço</p>
                <p class="font-bold text-gray-900">{{ pedidoSelecionado.clients?.address || 'Regional' }}</p>
              </div>
            </div>

            <!-- Valor -->
            <div class="flex items-start space-x-3">
              <span class="text-2xl">💰</span>
              <div class="flex-1">
                <p class="text-sm text-gray-600 mb-1">Valor</p>
                <p class="font-bold text-2xl text-primary-600">{{ formatCurrency(pedidoSelecionado.total) }}</p>
              </div>
            </div>

            <!-- Forma de Pagamento -->
            <div class="flex items-start space-x-3">
              <span class="text-2xl">💳</span>
              <div class="flex-1">
                <p class="text-sm text-gray-600 mb-1">Forma de Pagamento</p>
                <p class="font-bold text-gray-900">{{ getPaymentMethodLabel(pedidoSelecionado.payment_method) }}</p>
              </div>
            </div>

            <!-- Data -->
            <div class="flex items-start space-x-3">
              <span class="text-2xl">📅</span>
              <div class="flex-1">
                <p class="text-sm text-gray-600 mb-1">Data do Pedido</p>
                <p class="font-bold text-gray-900">{{ formatDate(pedidoSelecionado.date) }}</p>
              </div>
            </div>

            <!-- Troca -->
            <div v-if="pedidoSelecionado.tem_troca" class="flex items-start space-x-3 bg-yellow-50 p-4 rounded-xl">
              <span class="text-2xl">🔄</span>
              <div class="flex-1">
                <p class="text-sm text-gray-600 mb-1">Troca</p>
                <p class="font-bold text-yellow-700">{{ pedidoSelecionado.observacao_troca }}</p>
              </div>
            </div>

            <!-- Observações -->
            <div v-if="pedidoSelecionado.notes" class="flex items-start space-x-3 bg-gray-50 p-4 rounded-xl">
              <span class="text-2xl">📝</span>
              <div class="flex-1">
                <p class="text-sm text-gray-600 mb-1">Observações</p>
                <p class="text-gray-900">{{ pedidoSelecionado.notes }}</p>
              </div>
            </div>

            <!-- Status de Entrega -->
            <div v-if="pedidoSelecionado.status_entrega !== 'pendente'" class="bg-gray-50 rounded-xl p-4">
              <p class="text-sm text-gray-600 mb-2">
                {{ pedidoSelecionado.status_entrega === 'entregue' ? '✅ Entregue em:' : '❌ Cancelado em:' }}
              </p>
              <p class="font-bold text-gray-900">{{ formatDateTime(pedidoSelecionado.data_entrega) }}</p>
              <p v-if="pedidoSelecionado.motivo_cancelamento" class="text-sm text-gray-600 mt-2">
                <strong>Motivo:</strong> {{ pedidoSelecionado.motivo_cancelamento }}
              </p>
            </div>

            <!-- Botões -->
            <div class="flex flex-col gap-3 pt-4">
              <button 
                v-if="pedidoSelecionado.status_entrega === 'pendente'" 
                @click="confirmarEntrega(pedidoSelecionado)" 
                class="w-full bg-green-500 hover:bg-green-600 text-white py-3 rounded-xl font-bold transition-colors"
              >
                ✅ Entregue
              </button>
              <button 
                v-if="pedidoSelecionado.status_entrega === 'pendente'" 
                @click="abrirModalCancelamento(pedidoSelecionado)" 
                class="w-full bg-red-500 hover:bg-red-600 text-white py-3 rounded-xl font-bold transition-colors"
              >
                ❌ Cancelar
              </button>
              <button 
                @click="generateReceipt(pedidoSelecionado)" 
                class="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-xl font-bold transition-colors"
              >
                📄 Recibo
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Modal Cancelamento -->
      <div v-if="showModalCancelamento" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div class="bg-white rounded-xl max-w-md w-full p-6">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-xl font-bold text-gray-900">Cancelar Pedido</h3>
            <button @click="closeModalCancelamento" class="text-gray-500 hover:text-gray-700 text-2xl">×</button>
          </div>

          <div class="mb-4 p-4 bg-red-50 rounded-lg">
            <p class="text-sm text-gray-700"><strong>Cliente:</strong> {{ pedidoSelecionado?.clients?.name }}</p>
            <p class="text-sm text-gray-700"><strong>Produto:</strong> {{ pedidoSelecionado?.products?.name }}</p>
          </div>

          <form @submit.prevent="confirmarCancelamento" class="space-y-4">
            <div>
              <label class="label">Motivo do Cancelamento *</label>
              <select v-model="formCancelamento.motivo" required class="input-field">
                <option value="">Selecione o motivo</option>
                <option value="Cliente não encontrado">Cliente não encontrado</option>
                <option value="Cliente recusou">Cliente recusou</option>
                <option value="Endereço incorreto">Endereço incorreto</option>
                <option value="Produto indisponível">Produto indisponível</option>
                <option value="Outro">Outro</option>
              </select>
            </div>

            <div>
              <label class="label">Observações</label>
              <textarea v-model="formCancelamento.observacao" class="input-field" rows="3" placeholder="Detalhes adicionais"></textarea>
            </div>

            <div class="flex gap-3">
              <button type="button" @click="closeModalCancelamento" class="flex-1 btn-outline">Voltar</button>
              <button type="submit" class="flex-1 bg-red-500 hover:bg-red-600 text-white py-3 rounded-lg font-semibold">Confirmar</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </Layout>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../stores/auth'
import Layout from '../components/Layout.vue'
import jsPDF from 'jspdf'

const authStore = useAuthStore()
const pedidos = ref([])
const showDetailModal = ref(false)
const showModalCancelamento = ref(false)
const pedidoSelecionado = ref(null)

const filters = ref({
  date: '',
  status: 'pendente',
  cliente: ''
})

const formCancelamento = ref({
  motivo: '',
  observacao: ''
})

const stats = computed(() => {
  return {
    pendentes: pedidos.value.filter(p => p.status_entrega === 'pendente').length,
    entregues: pedidos.value.filter(p => p.status_entrega === 'entregue').length,
    cancelados: pedidos.value.filter(p => p.status_entrega === 'cancelado').length
  }
})

const getItemsCount = (pedido) => {
  if (pedido.products_data) {
    try {
      const data = JSON.parse(pedido.products_data)
      return data.length
    } catch {
      return 1
    }
  }
  return 1
}

const getVendedorName = (vendedorId) => {
  if (!vendedorId) return 'Não informado'
  return authStore.user.name || 'Vendedor'
}

const formatCurrency = (value) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0)
}

const formatDate = (date) => {
  if (!date) return 'N/A'
  const d = new Date(date + 'T00:00:00')
  return d.toLocaleDateString('pt-BR')
}

const formatDateTime = (date) => {
  return new Date(date).toLocaleString('pt-BR')
}

const getStatusLabel = (status) => {
  const labels = {
    'pendente': 'Pendente',
    'em_rota': 'Em Rota',
    'entregue': 'Entregue',
    'cancelado': 'Cancelado'
  }
  return labels[status] || status
}

const getStatusIcon = (status) => {
  const icons = {
    'pendente': '🕐',
    'em_rota': '🚚',
    'entregue': '✅',
    'cancelado': '❌'
  }
  return icons[status] || ''
}

const getStatusBadge = (status) => {
  const badges = {
    'pendente': 'bg-yellow-100 text-yellow-700',
    'em_rota': 'bg-blue-100 text-blue-700',
    'entregue': 'bg-green-100 text-green-700',
    'cancelado': 'bg-red-100 text-red-700'
  }
  return badges[status] || 'bg-gray-100 text-gray-700'
}

const getPaymentMethodLabel = (method) => {
  const labels = {
    'pendente': 'Pendente',
    'cash': 'Dinheiro',
    'pix': 'PIX',
    'boleto': 'Boleto',
    'card': 'Cartão',
    'credito': 'Crediário'
  }
  return labels[method] || method
}

const openDetailModal = (pedido) => {
  pedidoSelecionado.value = pedido
  showDetailModal.value = true
}

const closeDetailModal = () => {
  showDetailModal.value = false
  pedidoSelecionado.value = null
}

const abrirModalCancelamento = (pedido) => {
  pedidoSelecionado.value = pedido
  closeDetailModal()
  formCancelamento.value = {
    motivo: '',
    observacao: ''
  }
  showModalCancelamento.value = true
}

const closeModalCancelamento = () => {
  showModalCancelamento.value = false
  pedidoSelecionado.value = null
}

const confirmarCancelamento = async () => {
  try {
    const { error } = await supabase
      .from('sales')
      .update({
        status_entrega: 'cancelado',
        data_entrega: new Date().toISOString(),
        motivo_cancelamento: formCancelamento.value.motivo,
        observacao_entrega: formCancelamento.value.observacao
      })
      .eq('id', pedidoSelecionado.value.id)

    if (error) throw error

    alert('❌ Pedido cancelado!')
    closeModalCancelamento()
    await loadPedidos()
  } catch (error) {
    console.error('Erro:', error)
    alert('Erro ao cancelar pedido: ' + error.message)
  }
}

const confirmarEntrega = async (pedido) => {
  if (!confirm('Confirmar entrega do pedido?')) return

  try {
    const { error } = await supabase
      .from('sales')
      .update({
        status_entrega: 'entregue',
        data_entrega: new Date().toISOString(),
        paid: true
      })
      .eq('id', pedido.id)

    if (error) throw error

    alert('✅ Pedido entregue!')
    closeDetailModal()
    await loadPedidos()
  } catch (error) {
    console.error('Erro:', error)
    alert('Erro ao confirmar entrega: ' + error.message)
  }
}

const loadPedidos = async () => {
  try {
    let query = supabase
      .from('sales')
      .select('*, clients(name, phone, email, address), products(name, description)')
      .eq('vendedor_id', authStore.user.id)
      .order('date', { ascending: false })

    if (filters.value.date) {
      query = query.eq('date', filters.value.date)
    }

    if (filters.value.status) {
      query = query.eq('status_entrega', filters.value.status)
    }

    const { data, error } = await query

    if (error) throw error

    if (filters.value.cliente) {
      pedidos.value = (data || []).filter(p => 
        p.clients?.name?.toLowerCase().includes(filters.value.cliente.toLowerCase())
      )
    } else {
      pedidos.value = data || []
    }
  } catch (error) {
    console.error('Erro ao carregar pedidos:', error)
    alert('Erro ao carregar pedidos')
  }
}

const generateReceipt = async (pedido) => {
  const doc = new jsPDF()
  const primaryColor = [255, 140, 0]
  const darkGray = [60, 60, 60]
  const lightGray = [150, 150, 150]
  
  doc.setFillColor(...primaryColor)
  doc.rect(0, 0, 210, 35, 'F')
  
  try {
    const img = new Image()
    img.crossOrigin = 'Anonymous'
    img.src = '/natural-fruit-logo-192.jpg'
    
    await new Promise((resolve, reject) => {
      img.onload = resolve
      img.onerror = reject
    })
    
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const size = 120
    
    canvas.width = size
    canvas.height = size
    
    ctx.beginPath()
    ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2)
    ctx.closePath()
    ctx.clip()
    ctx.drawImage(img, 0, 0, size, size)
    
    const circularImage = canvas.toDataURL('image/png')
    doc.addImage(circularImage, 'PNG', 15, 5, 25, 25)
  } catch (error) {
    console.error('Erro ao carregar logo:', error)
  }
  
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.text('NATURAL FRUIT', 45, 12)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.text('CNPJ: 60.127.371/0001-60', 45, 18)
  doc.text('Juazeiro, Bahia, Brasil', 45, 23)
  doc.text('Tel: (87) 98864-1590', 45, 28)
  
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  const receiptNumber = `#${String(pedido.id).slice(0, 8).toUpperCase()}`
  doc.text(receiptNumber, 195, 12, { align: 'right' })
  doc.setFontSize(9)
  const saleTypeText = pedido.sale_type === 'wholesale' ? 'ATACADO' : 'VAREJO'
  doc.text(saleTypeText, 195, 18, { align: 'right' })
  
  doc.setTextColor(...darkGray)
  doc.setDrawColor(...primaryColor)
  doc.setLineWidth(0.5)
  doc.line(15, 40, 195, 40)
  
  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  doc.text('RECIBO DE PEDIDO', 105, 50, { align: 'center' })
  
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.text('DATA DO PEDIDO', 15, 60)
  doc.text('VENDEDOR', 90, 60)
  doc.text('STATUS', 150, 60)
  
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.text(formatDate(pedido.date), 15, 67)
  doc.text(getVendedorName(pedido.vendedor_id), 90, 67)
  doc.text(getStatusLabel(pedido.status_entrega), 150, 67)
  
  doc.setFillColor(245, 245, 245)
  doc.rect(15, 73, 180, 30, 'F')
  doc.setTextColor(...darkGray)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.text('DADOS DO CLIENTE', 20, 81)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.text(`Nome: ${pedido.clients?.name || 'N/A'}`, 20, 88)
  doc.text(`Telefone: ${pedido.clients?.phone || 'N/A'}`, 20, 93)
  if (pedido.clients?.address) {
    const endereco = pedido.clients.address.substring(0, 70)
    doc.text(`Endereco: ${endereco}`, 20, 98)
  }
  
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.text('DETALHES DO PEDIDO', 15, 113)
  
  doc.setFillColor(...primaryColor)
  doc.rect(15, 118, 180, 10, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.text('PRODUTO', 20, 124)
  doc.text('QTD', 120, 124)
  doc.text('VALOR UNIT.', 145, 124)
  doc.text('TOTAL', 190, 124, { align: 'right' })
  
  doc.setTextColor(...darkGray)
  doc.setFont('helvetica', 'normal')
  const nomeProduto = (pedido.products?.name || 'Produto').substring(0, 40)
  doc.text(nomeProduto, 20, 134)
  doc.text(String(pedido.quantity), 120, 134)
  doc.text(formatCurrency(pedido.unit_price || pedido.total / pedido.quantity), 145, 134)
  doc.text(formatCurrency(pedido.total), 190, 134, { align: 'right' })
  
  doc.setDrawColor(...lightGray)
  doc.setLineWidth(0.3)
  doc.line(15, 138, 195, 138)
  
  const yTotal = 148
  doc.setFillColor(...primaryColor)
  doc.rect(140, yTotal, 55, 12, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.text('TOTAL:', 145, yTotal + 8)
  doc.text(formatCurrency(pedido.total), 190, yTotal + 8, { align: 'right' })
  
  doc.setTextColor(...darkGray)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.text('FORMA DE PAGAMENTO', 15, yTotal + 20)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.text(`Metodo: ${getPaymentMethodLabel(pedido.payment_method)}`, 15, yTotal + 27)
  
  let yPos = yTotal + 35
  
  if (pedido.tem_troca) {
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(10)
    doc.text('TROCA', 15, yPos)
    yPos += 7
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    const splitTroca = doc.splitTextToSize(pedido.observacao_troca || '', 180)
    doc.text(splitTroca, 15, yPos)
    yPos += splitTroca.length * 5 + 5
  }
  
  if (pedido.notes) {
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(10)
    doc.text('OBSERVACOES', 15, yPos)
    yPos += 7
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    const splitNotes = doc.splitTextToSize(pedido.notes, 180)
    doc.text(splitNotes, 15, yPos)
  }
  
  const footerY = 270
  doc.setDrawColor(...primaryColor)
  doc.setLineWidth(0.5)
  doc.line(15, footerY, 195, footerY)
  doc.setTextColor(...lightGray)
  doc.setFontSize(8)
  doc.setFont('helvetica', 'italic')
  doc.text('Obrigado pela preferencia!', 105, footerY + 7, { align: 'center' })
  doc.text('Natural Fruit - Qualidade e Frescor Garantidos', 105, footerY + 12, { align: 'center' })
  doc.text(`Recibo gerado em ${formatDateTime(new Date())}`, 105, footerY + 17, { align: 'center' })
  
  const fileName = `pedido-natural-fruit-${receiptNumber}-${Date.now()}.pdf`
  doc.save(fileName)
  
  closeDetailModal()
}

onMounted(() => {
  loadPedidos()
  setInterval(() => loadPedidos(), 30000)
})
</script>

<style scoped>
.card {
  @apply bg-white rounded-xl shadow-lg p-4 md:p-6;
}

.label {
  @apply block text-sm font-medium text-gray-700 mb-2;
}

.input-field {
  @apply w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all;
  font-size: 16px !important;
}

.btn-primary {
  @apply px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium shadow-md;
}

.btn-outline {
  @apply px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium;
}
</style>
