<template>
  <Layout>
    <div class="space-y-4 md:space-y-6 pb-20 md:pb-6">
      <!-- Header Responsivo -->
      <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 class="text-2xl md:text-3xl font-bold text-gray-900">Vendas / Pedidos</h2>
          <p class="text-sm md:text-base text-gray-600 mt-1">Gerencie pedidos e vendas</p>
        </div>
        <div class="flex flex-col sm:flex-row gap-2 md:gap-3">
          <button @click="openSearchClientsModal" class="w-full sm:w-auto btn-secondary text-sm md:text-base flex items-center justify-center">
            <svg class="w-5 h-5 inline-block mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
            <span class="hidden xs:inline">Pesquisar</span>
            <span class="xs:hidden">🔍 Clientes</span>
          </button>
          <button @click="openModal" class="w-full sm:w-auto btn-primary text-sm md:text-base flex items-center justify-center">
            <svg class="w-5 h-5 inline-block mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
            </svg>
            <span class="hidden xs:inline">Novo Pedido</span>
            <span class="xs:hidden">➕ Novo</span>
          </button>
        </div>
      </div>

      <!-- Filtros Responsivos -->
      <div class="card">
        <div class="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-5 gap-3 md:gap-4">
          <div class="xs:col-span-2 lg:col-span-1">
            <label class="label text-xs md:text-sm">Data</label>
            <input v-model="filters.date" type="date" class="input-field text-sm md:text-base" @change="loadSales" />
          </div>
          <div>
            <label class="label text-xs md:text-sm">Tipo</label>
            <select v-model="filters.saleType" class="input-field text-sm md:text-base" @change="loadSales">
              <option value="">Todos</option>
              <option value="wholesale">🏭 Atacado</option>
              <option value="retail">🛒 Varejo</option>
            </select>
          </div>
          <div>
            <label class="label text-xs md:text-sm">Pagamento</label>
            <select v-model="filters.payment" class="input-field text-sm md:text-base" @change="loadSales">
              <option value="">Todas</option>
              <option value="cash">💵 Dinheiro</option>
              <option value="pix">📱 PIX</option>
              <option value="boleto">📄 Boleto</option>
              <option value="card">💳 Cartão</option>
            </select>
          </div>
          <div>
            <label class="label text-xs md:text-sm">Status Pgto</label>
            <select v-model="filters.status" class="input-field text-sm md:text-base" @change="loadSales">
              <option value="">Todos</option>
              <option value="paid">✅ Pago</option>
              <option value="pending">⏳ Pendente</option>
            </select>
          </div>
          <div>
            <label class="label text-xs md:text-sm">Status Pedido</label>
            <select v-model="filters.orderStatus" class="input-field text-sm md:text-base" @change="loadSales">
              <option value="">Todos</option>
              <option value="pendente">🕐 Pendente</option>
              <option value="em_rota">🚚 Em Rota</option>
              <option value="entregue">✅ Entregue</option>
              <option value="cancelado">❌ Cancelado</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Botão Alternar Visualização -->
      <div class="flex justify-center">
        <div class="inline-flex rounded-lg border-2 border-primary-200 bg-white p-1">
          <button 
            @click="viewMode = 'pedidos'" 
            :class="viewMode === 'pedidos' ? 'bg-primary-500 text-white' : 'text-gray-700 hover:bg-gray-100'"
            class="px-4 py-2 md:px-6 md:py-2 rounded-lg font-semibold transition-colors text-sm md:text-base"
          >
            <span class="hidden xs:inline">📦 Por Pedido</span>
            <span class="xs:hidden">📦</span>
          </button>
          <button 
            @click="viewMode = 'clientes'" 
            :class="viewMode === 'clientes' ? 'bg-primary-500 text-white' : 'text-gray-700 hover:bg-gray-100'"
            class="px-4 py-2 md:px-6 md:py-2 rounded-lg font-semibold transition-colors text-sm md:text-base"
          >
            <span class="hidden xs:inline">👥 Por Cliente</span>
            <span class="xs:hidden">👥</span>
          </button>
        </div>
      </div>

      <!-- Visualização POR PEDIDOS (Desktop) -->
      <div v-if="viewMode === 'pedidos'" class="hidden md:block card overflow-x-auto">
        <table class="w-full min-w-full">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-4 py-3 text-left text-sm font-semibold text-gray-600 whitespace-nowrap">Data</th>
              <th class="px-4 py-3 text-left text-sm font-semibold text-gray-600 whitespace-nowrap">Tipo</th>
              <th class="px-4 py-3 text-left text-sm font-semibold text-gray-600 whitespace-nowrap">Cliente</th>
              <th class="px-4 py-3 text-left text-sm font-semibold text-gray-600 whitespace-nowrap">Itens</th>
              <th class="px-4 py-3 text-left text-sm font-semibold text-gray-600 whitespace-nowrap">Total</th>
              <th class="px-4 py-3 text-left text-sm font-semibold text-gray-600 whitespace-nowrap">Pagamento</th>
              <th class="px-4 py-3 text-left text-sm font-semibold text-gray-600 whitespace-nowrap">Status Pedido</th>
              <th class="px-4 py-3 text-left text-sm font-semibold text-gray-600 whitespace-nowrap">Status Pgto</th>
              <th class="px-4 py-3 text-left text-sm font-semibold text-gray-600 whitespace-nowrap">Ações</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="sale in paginatedSales" :key="sale.id" class="border-t hover:bg-gray-50">
              <td class="px-4 py-3 text-sm whitespace-nowrap">{{ formatDate(sale.date) }}</td>
              <td class="px-4 py-3 text-sm whitespace-nowrap">
                <span :class="getSaleTypeBadge(sale.sale_type)">{{ getSaleTypeLabel(sale.sale_type) }}</span>
              </td>
              <td class="px-4 py-3 text-sm whitespace-nowrap">{{ sale.clients?.name }}</td>
              <td class="px-4 py-3 text-sm whitespace-nowrap">
                <span class="font-semibold text-primary-600">{{ getTotalItems(sale) }} itens</span>
              </td>
              <td class="px-4 py-3 text-sm font-semibold whitespace-nowrap">{{ formatCurrency(sale.total) }}</td>
              <td class="px-4 py-3 text-sm whitespace-nowrap">
                <span :class="getPaymentBadge(sale.payment_method)">{{ getPaymentLabel(sale.payment_method) }}</span>
              </td>
              <td class="px-4 py-3 text-sm whitespace-nowrap">
                <span :class="getOrderStatusBadge(sale.order_status)">{{ getOrderStatusLabel(sale.order_status) }}</span>
              </td>
              <td class="px-4 py-3 text-sm whitespace-nowrap">
                <span :class="sale.paid ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'" class="px-2 py-1 rounded-full text-xs font-semibold">
                  {{ sale.paid ? '✅ Pago' : '⏳ Pendente' }}
                </span>
              </td>
               <td class="px-4 py-3 text-sm whitespace-nowrap">
                 <div class="flex items-center space-x-1">
                   <button @click="viewSaleDetails(sale)" class="p-2 hover:bg-blue-50 rounded-lg transition-colors" title="Ver Detalhes">
                     <span class="text-lg">👁️</span>
                   </button>
                   <button v-if="authStore.canEditOrders" @click="editSale(sale)" class="p-2 hover:bg-yellow-50 rounded-lg transition-colors" title="Editar Pedido">
                     <span class="text-lg">✏️</span>
                   </button>
                   <button @click="togglePaidStatus(sale)" class="p-2 hover:bg-gray-100 rounded-lg transition-colors" title="Alternar Status Pagamento">
                     <span class="text-lg">{{ sale.paid ? '↩️' : '✅' }}</span>
                   </button>
                   <button v-if="authStore.canGenerateReceipt" @click="generateReceipt(sale)" class="p-2 hover:bg-blue-50 rounded-lg transition-colors" title="Gerar Recibo">
                     <span class="text-lg">📄</span>
                   </button>
                   <button v-if="authStore.canDeleteOrders" @click="confirmDelete(sale)" class="p-2 hover:bg-red-50 rounded-lg transition-colors" title="Excluir Pedido">
                     <span class="text-lg">🗑️</span>
                   </button>
                 </div>
               </td>
            </tr>
          </tbody>
        </table>
        
        <!-- Paginação Desktop -->
        <div v-if="totalPages > 1" class="flex flex-col sm:flex-row justify-between items-center mt-6 pt-4 border-t gap-4">
          <button 
            @click="previousPage" 
            :disabled="currentPage === 1"
            :class="currentPage === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-primary-50'"
            class="flex items-center px-4 py-2 border border-primary-500 rounded-lg text-primary-600 font-semibold transition-colors text-sm w-full sm:w-auto justify-center"
          >
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
            </svg>
            Anterior
          </button>
          
          <div class="flex items-center space-x-2">
            <span class="text-sm text-gray-600">
              Página <span class="font-bold text-primary-600">{{ currentPage }}</span> de <span class="font-bold">{{ totalPages }}</span>
            </span>
            <span class="text-xs text-gray-500">
              ({{ sales.length }} {{ sales.length === 1 ? 'pedido' : 'pedidos' }})
            </span>
          </div>
          
          <button 
            @click="nextPage" 
            :disabled="currentPage === totalPages"
            :class="currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : 'hover:bg-primary-50'"
            class="flex items-center px-4 py-2 border border-primary-500 rounded-lg text-primary-600 font-semibold transition-colors text-sm w-full sm:w-auto justify-center"
          >
            Próximo
            <svg class="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
            </svg>
          </button>
        </div>
        
        <div v-if="sales.length === 0" class="text-center py-12">
          <div class="text-gray-400 mb-4">
            <svg class="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>
          <p class="text-gray-600 font-medium">Nenhum pedido encontrado</p>
        </div>
      </div>

      <!-- Visualização POR PEDIDOS (Mobile) -->
      <div v-if="viewMode === 'pedidos'" class="md:hidden space-y-3">
        <div v-for="sale in paginatedSales" :key="sale.id" class="card p-4 space-y-3">
          <div class="flex justify-between items-start">
            <div class="flex-1 min-w-0">
              <div class="flex flex-wrap items-center gap-2 mb-1">
                <p class="text-xs text-gray-500">{{ formatDate(sale.date) }}</p>
                <span :class="getSaleTypeBadge(sale.sale_type)" class="text-xs">{{ getSaleTypeLabel(sale.sale_type) }}</span>
              </div>
              <h3 class="font-semibold text-gray-900 text-sm truncate">{{ sale.clients?.name }}</h3>
              <p class="text-xs text-primary-600 font-semibold">{{ getTotalItems(sale) }} itens</p>
            </div>
            <div class="flex items-center space-x-1 flex-shrink-0 ml-2">
              <button @click="viewSaleDetails(sale)" class="p-2 hover:bg-blue-50 rounded-lg transition-colors active:bg-blue-100" title="Ver Detalhes">
                <span class="text-lg">👁️</span>
              </button>
              <button v-if="authStore.canEditOrders" @click="editSale(sale)" class="p-2 hover:bg-yellow-50 rounded-lg transition-colors active:bg-yellow-100" title="Editar Pedido">
                <span class="text-lg">✏️</span>
              </button>
              <button @click="togglePaidStatus(sale)" class="p-2 hover:bg-gray-100 rounded-lg transition-colors active:bg-gray-200" title="Alternar Status Pagamento">
                <span class="text-lg">{{ sale.paid ? '↩️' : '✅' }}</span>
              </button>
            </div>
          </div>
          <div class="space-y-2 text-xs">
            <div class="flex justify-between items-center">
              <span class="text-gray-600">Total:</span>
              <span class="font-semibold text-base text-gray-900">{{ formatCurrency(sale.total) }}</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-gray-600">Pagamento:</span>
              <span :class="getPaymentBadge(sale.payment_method)" class="text-xs">{{ getPaymentLabel(sale.payment_method) }}</span>
            </div>
          </div>
          <div class="flex flex-wrap justify-between items-center gap-2 pt-2 border-t">
            <span :class="getOrderStatusBadge(sale.order_status)" class="text-xs">{{ getOrderStatusLabel(sale.order_status) }}</span>
            <span :class="sale.paid ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'" class="px-2 py-1 rounded-full text-xs font-semibold">
              {{ sale.paid ? '✅ Pago' : '⏳ Pendente' }}
            </span>
          </div>
          <div class="flex gap-2 pt-2 border-t">
            <button v-if="authStore.canGenerateReceipt" @click="generateReceipt(sale)" class="flex-1 flex items-center justify-center gap-1 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-xs font-semibold transition-colors active:bg-blue-200">
              <span>📄</span> Gerar Recibo
            </button>
            <button v-if="authStore.canDeleteOrders" @click="confirmDelete(sale)" class="flex-1 flex items-center justify-center gap-1 py-2 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg text-xs font-semibold transition-colors active:bg-red-200">
              <span>🗑️</span> Excluir
            </button>
          </div>
        </div>
        
        <!-- Paginação Mobile -->
        <div v-if="totalPages > 1" class="flex flex-col items-center space-y-3 mt-6 p-4 bg-gray-50 rounded-lg">
          <span class="text-sm text-gray-600">
            Página <span class="font-bold text-primary-600">{{ currentPage }}</span> de <span class="font-bold">{{ totalPages }}</span>
          </span>
          <div class="flex space-x-3 w-full">
            <button 
              @click="previousPage" 
              :disabled="currentPage === 1"
              :class="currentPage === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-primary-600'"
              class="flex-1 flex items-center justify-center px-4 py-3 bg-primary-500 text-white rounded-lg font-semibold transition-colors text-sm"
            >
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
              </svg>
              Anterior
            </button>
            <button 
              @click="nextPage" 
              :disabled="currentPage === totalPages"
              :class="currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : 'hover:bg-primary-600'"
              class="flex-1 flex items-center justify-center px-4 py-3 bg-primary-500 text-white rounded-lg font-semibold transition-colors text-sm"
            >
              Próximo
              <svg class="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
              </svg>
            </button>
          </div>
        </div>
        
        <div v-if="sales.length === 0" class="card text-center py-12">
          <div class="text-gray-400 mb-4">
            <svg class="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>
          <p class="text-gray-600 font-medium">Nenhum pedido encontrado</p>
        </div>
      </div>

      <!-- Visualização POR CLIENTES -->
      <div v-if="viewMode === 'clientes'" class="space-y-4">
        <div v-for="cliente in clientesAgrupados" :key="cliente.id" class="card border-l-4 border-primary-500">
          <div class="flex flex-col md:flex-row md:justify-between md:items-start gap-4 mb-4">
            <div class="flex-1">
              <h3 class="font-bold text-lg md:text-2xl text-gray-900">{{ cliente.name }}</h3>
              <div class="flex flex-col xs:flex-row xs:items-center gap-1 xs:gap-3 mt-2">
                <p class="text-xs md:text-sm text-gray-600">📞 {{ cliente.phone || 'Sem telefone' }}</p>
                <p class="text-xs md:text-sm text-gray-600">📧 {{ cliente.email || 'Sem email' }}</p>
              </div>
              <div class="flex flex-wrap items-center gap-2 md:gap-3 mt-2">
                <span class="text-xs md:text-sm font-semibold text-primary-600">
                  📦 {{ cliente.totalPedidos }} {{ cliente.totalPedidos === 1 ? 'pedido' : 'pedidos' }}
                </span>
                <span class="text-xs md:text-sm font-semibold text-blue-600">
                  📊 {{ cliente.totalItens }} {{ cliente.totalItens === 1 ? 'item' : 'itens' }}
                </span>
              </div>
            </div>
            <div class="text-left md:text-right">
              <p class="text-xs md:text-sm text-gray-600 mb-1">Total Comprado</p>
              <p class="font-bold text-xl md:text-3xl text-primary-600">{{ formatCurrency(cliente.totalComprado) }}</p>
              <div class="flex flex-wrap gap-1 md:gap-2 mt-2 md:justify-end">
                <span v-if="cliente.totalPago > 0" class="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-semibold">
                  ✅ Pago: {{ formatCurrency(cliente.totalPago) }}
                </span>
                <span v-if="cliente.totalPendente > 0" class="bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs font-semibold">
                  ⏳ Pendente: {{ formatCurrency(cliente.totalPendente) }}
                </span>
              </div>
            </div>
          </div>

          <div class="space-y-2 pt-4 border-t">
            <h4 class="font-semibold text-gray-700 mb-3 text-sm md:text-base">Histórico de Pedidos:</h4>
            <div v-for="pedido in cliente.pedidos" :key="pedido.id" class="bg-gray-50 hover:bg-gray-100 p-3 md:p-4 rounded-lg transition-colors">
              <div class="flex flex-col md:flex-row md:justify-between md:items-start gap-3">
                <div class="flex-1">
                  <div class="flex flex-wrap items-center gap-1 md:gap-2 mb-2">
                    <p class="text-xs text-gray-500">Pedido #{{ pedido.id.slice(0, 8) }}</p>
                    <span :class="getSaleTypeBadge(pedido.sale_type)" class="text-xs">{{ getSaleTypeLabel(pedido.sale_type) }}</span>
                    <span :class="getOrderStatusBadge(pedido.order_status)" class="text-xs">{{ getOrderStatusLabel(pedido.order_status) }}</span>
                  </div>
                  <div class="grid grid-cols-1 md:grid-cols-3 gap-1 md:gap-2 text-xs md:text-sm">
                    <p class="text-gray-700">📅 {{ formatDate(pedido.date) }}</p>
                    <p class="text-gray-700">📦 {{ getTotalItems(pedido) }} {{ getTotalItems(pedido) === 1 ? 'item' : 'itens' }}</p>
                    <p class="text-gray-700">💳 {{ getPaymentLabel(pedido.payment_method) }}</p>
                  </div>
                  <div v-if="pedido.is_event" class="mt-2">
                    <span class="bg-purple-100 text-purple-700 px-2 py-1 rounded-full text-xs font-semibold">
                      🎉 Evento: {{ pedido.event_name }}
                    </span>
                  </div>
                </div>
                <div class="flex flex-row md:flex-col items-center md:items-end gap-2">
                  <div class="text-left md:text-right flex-1 md:flex-none">
                    <p class="font-bold text-base md:text-xl text-gray-900">{{ formatCurrency(pedido.total) }}</p>
                    <span :class="pedido.paid ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'" 
                      class="text-xs px-2 py-1 rounded-full font-semibold whitespace-nowrap inline-block">
                      {{ pedido.paid ? '✅ Pago' : '⏳ Pendente' }}
                    </span>
                  </div>
                  <div class="flex items-center gap-1">
                    <button @click="viewSaleDetails(pedido)" class="p-1 md:p-2 hover:bg-blue-50 rounded-lg transition-colors" title="Ver Detalhes">
                      <span class="text-lg md:text-xl">👁️</span>
                    </button>
                    <button v-if="authStore.canGenerateReceipt" @click="generateReceipt(pedido)" class="p-1 md:p-2 hover:bg-blue-50 rounded-lg transition-colors" title="Recibo">
                      <span class="text-lg md:text-xl">📄</span>
                    </button>
                    <button v-if="authStore.canDeleteOrders" @click="confirmDelete(pedido)" class="p-1 md:p-2 hover:bg-red-50 rounded-lg transition-colors" title="Excluir Pedido">
                      <span class="text-lg md:text-xl">🗑️</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div v-if="clientesAgrupados.length === 0" class="card text-center py-12">
          <div class="text-gray-400 mb-4">
            <span class="text-6xl">👥</span>
          </div>
          <p class="text-gray-600 font-medium">Nenhum cliente encontrado</p>
        </div>
      </div>

      <!-- Modal Pesquisar Clientes -->
      <div v-if="showSearchClientsModal" @click="closeSearchClientsModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div @click.stop class="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
          <!-- Header -->
          <div class="sticky top-0 bg-gradient-to-r from-primary-500 to-primary-600 px-6 py-4 flex items-center justify-between z-10">
            <div class="flex items-center space-x-3">
              <button @click="closeSearchClientsModal" class="text-white hover:bg-primary-700 p-1 rounded-lg transition-colors">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
                </svg>
              </button>
              <h3 class="text-lg md:text-xl font-bold text-white">Pesquisar Clientes</h3>
            </div>
            <button @click="closeSearchClientsModal" class="text-white hover:bg-primary-700 p-1 rounded-lg transition-colors text-xl">×</button>
          </div>
          
          <!-- Campo de Busca -->
          <div class="p-4 border-b bg-gray-50">
            <div class="relative">
              <svg style="position:absolute; left:14px; top:50%; transform:translateY(-50%); pointer-events:none; z-index:10;" class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
              </svg>
              <input 
                v-model="searchClientQuery" 
                type="text" 
                style="padding-left: 44px !important;"
                class="input-field" 
                placeholder="Buscar por nome, telefone ou email..."
                autofocus
              />
            </div>
          </div>
          
          <!-- Lista de Clientes -->
          <div class="flex-1 overflow-y-auto p-4 space-y-2">
            <div v-if="filteredClients.length === 0" class="text-center py-8">
              <span class="text-4xl">👥</span>
              <p class="text-gray-600 mt-2">Nenhum cliente encontrado</p>
            </div>
            <div 
              v-for="client in filteredClients" 
              :key="client.id" 
              @click="selectClient(client)"
              class="p-4 border rounded-lg hover:bg-primary-50 hover:border-primary-300 cursor-pointer transition-all"
            >
              <div class="flex justify-between items-start">
                <div class="flex-1 min-w-0">
                  <h4 class="font-bold text-gray-900 truncate">{{ client.name }}</h4>
                  <div class="flex flex-wrap gap-3 mt-1">
                    <p class="text-sm text-gray-600 flex items-center">
                      <span class="mr-1">📞</span> {{ client.phone || 'Sem telefone' }}
                    </p>
                    <p class="text-sm text-gray-600 flex items-center">
                      <span class="mr-1">📧</span> {{ client.email || 'Sem email' }}
                    </p>
                  </div>
                </div>
                <button class="ml-2 px-3 py-1 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors">
                  Selecionar
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Modal Novo/Editar Pedido -->
      <div v-if="showModal" class="modal-overlay-fixed">
        <div class="modal-container-mobile">
          
          <!-- Header Fixo -->
          <div class="modal-header-mobile">
            <div class="flex items-center space-x-3">
              <button @click="closeModal" class="text-white p-1 rounded-lg flex-shrink-0">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
                </svg>
              </button>
              <div>
                <h3 class="text-lg font-bold text-white">
                  {{ editingSale ? 'Editar Pedido' : 'Novo Pedido' }}
                </h3>
                <p v-if="form.produtos.length > 0" class="text-xs text-white opacity-90">
                  📦 {{ getTotalItemsForm() }} {{ getTotalItemsForm() === 1 ? 'item' : 'itens' }}
                </p>
              </div>
            </div>
            <button @click="closeModal" class="text-white p-2 rounded-lg flex-shrink-0 text-xl">
              ×
            </button>
          </div>

          <!-- Formulário Scrollable -->
          <div class="modal-content-mobile">
            <form @submit.prevent="saveSale" class="p-4 space-y-4 pb-32">
              
              <!-- Informações Básicas -->
              <div class="grid grid-cols-1 xs:grid-cols-2 gap-3">
                <div>
                  <label class="label">Data *</label>
                  <input v-model="form.date" type="date" required class="input-field" />
                </div>
                <div>
                  <label class="label">Tipo de Venda *</label>
                  <select v-model="form.sale_type" required class="input-field">
                    <option value="wholesale">🏭 Atacado</option>
                    <option value="retail">🛒 Varejo</option>
                  </select>
                </div>
              </div>

              <div>
                <label class="label">Cliente *</label>
                <select v-model="form.client_id" required class="input-field">
                  <option value="">Selecione um cliente</option>
                  <option v-for="client in clients" :key="client.id" :value="client.id">{{ client.name }}</option>
                </select>
              </div>

              <!-- PRODUTOS -->
              <div class="border-2 border-dashed border-primary-300 rounded-lg p-3 space-y-3 bg-primary-50">
                <div class="flex justify-between items-center">
                  <label class="label mb-0 text-primary-700 font-bold">📦 Produtos do Pedido</label>
                  <span class="text-xs font-semibold text-primary-600">
                    Total: {{ getTotalItemsForm() }} {{ getTotalItemsForm() === 1 ? 'item' : 'itens' }}
                  </span>
                </div>
                
                <div v-for="(item, index) in form.produtos" :key="index" class="bg-white p-3 rounded-lg shadow-sm space-y-2 border border-gray-200">
                  <div class="flex justify-between items-center">
                    <span class="font-semibold text-xs text-gray-700">Produto {{ index + 1 }}</span>
                    <button v-if="form.produtos.length > 1" type="button" @click="removerProduto(index)" class="text-red-600 hover:text-red-700 font-semibold text-xs flex items-center">
                      <span class="mr-1">🗑️</span> Remover
                    </button>
                  </div>
                  
                  <div>
                    <label class="label text-xs">Produto *</label>
                    <select v-model="item.product_id" required class="input-field" @change="updatePriceItem(index)">
                      <option value="">Selecione um produto</option>
                      <option v-for="product in products" :key="product.id" :value="product.id">
                        {{ product.name }} - {{ formatCurrency(product.price) }}
                      </option>
                    </select>
                  </div>
                  
                  <div class="grid grid-cols-1 xs:grid-cols-3 gap-2">
                    <div>
                      <label class="label text-xs">Quantidade *</label>
                      <input 
                        v-model.number="item.quantity" 
                        type="number" 
                        min="1" 
                        required 
                        class="input-field" 
                        @input="calculateTotalItem(index)" 
                      />
                    </div>
                    <div>
                      <label class="label text-xs">Preço Unit. *</label>
                      <input v-model.number="item.unit_price" type="number" step="0.01" required class="input-field" @input="calculateTotalItem(index)" />
                    </div>
                    <div>
                      <label class="label text-xs">Total</label>
                      <input v-model.number="item.total" type="number" step="0.01" readonly class="input-field bg-gray-100 font-bold text-primary-600" />
                    </div>
                  </div>
                </div>

                <button type="button" @click="adicionarProduto" class="w-full bg-primary-600 hover:bg-primary-700 text-white py-3 rounded-lg font-semibold transition-colors shadow-md flex items-center justify-center">
                  <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
                  </svg>
                  Adicionar Produto
                </button>

                <div class="bg-gradient-to-r from-primary-600 to-primary-700 p-4 rounded-lg shadow-lg">
                  <div class="flex justify-between items-center text-white">
                    <span class="font-bold text-sm md:text-lg">TOTAL DO PEDIDO:</span>
                    <span class="font-bold text-lg md:text-2xl">{{ formatCurrency(totalPedido) }}</span>
                  </div>
                </div>
              </div>

              <!-- Forma de Pagamento -->
              <div class="border-2 border-primary-200 rounded-lg p-3 bg-primary-50">
                <label class="label font-bold text-primary-700 mb-3">💳 Forma de Pagamento *</label>
                
                <div class="grid grid-cols-2 gap-2">
                  <div class="flex items-center" v-for="method in paymentMethods" :key="method.value">
                    <input 
                      v-model="form.payment_method" 
                      :value="method.value" 
                      type="radio" 
                      :id="method.value" 
                      class="hidden"
                    />
                    <label 
                      :for="method.value" 
                      :class="form.payment_method === method.value 
                        ? method.selectedClass 
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'"
                      class="w-full p-3 border-2 rounded-lg cursor-pointer transition-all flex items-center justify-center text-sm font-medium"
                    >
                      {{ method.label }}
                    </label>
                  </div>
                </div>
              </div>

              <!-- Status do Pedido -->
              <div class="border-2 border-blue-200 rounded-lg p-3 bg-blue-50">
                <label class="label font-bold text-blue-700 mb-3">📋 Status do Pedido *</label>
                
                <div class="grid grid-cols-2 gap-2">
                  <div class="flex items-center" v-for="status in orderStatuses" :key="status.value">
                    <input 
                      v-model="form.order_status" 
                      :value="status.value" 
                      type="radio" 
                      :id="status.value" 
                      class="hidden"
                    />
                    <label 
                      :for="status.value" 
                      :class="form.order_status === status.value 
                        ? status.selectedClass 
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'"
                      class="w-full p-3 border-2 rounded-lg cursor-pointer transition-all flex items-center justify-center text-sm font-medium"
                    >
                      {{ status.label }}
                    </label>
                  </div>
                </div>
              </div>

              <!-- Evento -->
              <div class="border-2 border-purple-200 rounded-lg p-3 bg-purple-50">
                <div class="flex items-center space-x-3 mb-3">
                  <input v-model="form.is_event" type="checkbox" id="is-event" class="w-5 h-5 rounded border-gray-300 text-purple-600 focus:ring-purple-500" />
                  <label for="is-event" class="font-medium text-gray-700">🎉 Este pedido é para um evento?</label>
                </div>
                <div v-if="form.is_event">
                  <label class="label text-sm">Nome do Evento *</label>
                  <input v-model="form.event_name" type="text" required class="input-field" placeholder="Ex: Casamento, Aniversário" />
                </div>
              </div>

              <!-- Pagamento Realizado -->
              <div class="border-2 border-green-200 rounded-lg p-3 bg-green-50">
                <div class="flex items-center justify-between">
                  <div class="flex items-center space-x-3">
                    <input 
                      v-model="form.paid" 
                      type="checkbox" 
                      id="paid-checkbox" 
                      class="w-6 h-6 rounded border-2 border-gray-300 text-green-600 focus:ring-green-500 focus:ring-2"
                    />
                    <label for="paid-checkbox" class="font-bold text-green-700">
                      ✅ Pagamento realizado
                    </label>
                  </div>
                  
                  <div :class="form.paid ? 'bg-green-500 text-white' : 'bg-red-500 text-white'" 
                       class="px-3 py-1 md:px-4 md:py-2 rounded-full font-bold text-xs md:text-sm transition-colors">
                    {{ form.paid ? 'PAGO' : 'PENDENTE' }}
                  </div>
                </div>
              </div>

              <!-- Observações -->
              <div>
                <label class="label">Observações</label>
                <textarea v-model="form.notes" class="input-field" rows="3" placeholder="Informações adicionais..."></textarea>
              </div>

            </form>
          </div>

          <!-- Footer Fixo Mobile -->
          <div class="fixed-bottom-actions">
            <div class="flex flex-col gap-2">
              <button type="submit" @click="saveSale" :disabled="loading" class="w-full btn-primary py-4 text-lg font-bold">
                {{ loading ? 'Salvando...' : editingSale ? 'Atualizar' : 'Salvar' }}
              </button>
              <button type="button" @click="closeModal" class="w-full btn-outline py-3">
                Cancelar
              </button>
            </div>
          </div>

        </div>
      </div>

      <!-- Modal Ver Detalhes -->
      <div v-if="showDetailsModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 md:p-4 z-50 overflow-y-auto">
        <div class="bg-white rounded-xl max-w-2xl w-full max-h-[95vh] overflow-y-auto">
          <div class="sticky top-0 bg-gradient-to-r from-primary-500 to-primary-600 px-4 md:px-6 py-3 md:py-4 flex items-center justify-between z-10">
            <h3 class="text-lg md:text-xl font-bold text-white">Detalhes do Pedido</h3>
            <button @click="closeDetailsModal" class="text-white hover:bg-primary-700 p-1 md:p-2 rounded-lg transition-colors text-xl md:text-2xl">×</button>
          </div>
          
          <div v-if="selectedSale" class="p-4 md:p-6 space-y-3 md:space-y-4">
            <div class="grid grid-cols-2 gap-3 md:gap-4">
              <div class="card bg-gray-50 p-3 md:p-4">
                <p class="text-xs md:text-sm text-gray-600">Data</p>
                <p class="font-semibold text-sm md:text-base">{{ formatDate(selectedSale.date) }}</p>
              </div>
              <div class="card bg-gray-50 p-3 md:p-4">
                <p class="text-xs md:text-sm text-gray-600">Tipo</p>
                <p class="font-semibold text-sm md:text-base">{{ getSaleTypeLabel(selectedSale.sale_type) }}</p>
              </div>
            </div>

            <div class="card bg-blue-50 p-3 md:p-4">
              <h4 class="font-bold mb-1 md:mb-2 text-blue-900 text-sm md:text-base">👤 Cliente</h4>
              <p class="font-semibold text-sm md:text-base">{{ selectedSale.clients?.name }}</p>
              <p class="text-xs md:text-sm text-gray-600">{{ selectedSale.clients?.phone }}</p>
            </div>

            <div class="card bg-green-50 p-3 md:p-4">
              <h4 class="font-bold mb-2 md:mb-3 text-green-900 text-sm md:text-base">📦 Produtos ({{ getTotalItems(selectedSale) }} itens)</h4>
              <div class="space-y-2">
                <div v-for="(item, index) in parseProducts(selectedSale)" :key="index" class="bg-white p-2 md:p-3 rounded-lg">
                  <div class="flex justify-between items-start">
                    <div class="flex-1">
                      <p class="font-semibold text-sm md:text-base">{{ item.name }}</p>
                      <p class="text-xs md:text-sm text-gray-600">Qtd: {{ item.quantity }} × {{ formatCurrency(item.unit_price) }}</p>
                    </div>
                    <p class="font-bold text-green-700 text-sm md:text-base">{{ formatCurrency(item.total) }}</p>
                  </div>
                </div>
              </div>
            </div>

            <div class="card bg-primary-50 border-2 border-primary-300 p-3 md:p-4">
              <div class="flex justify-between items-center">
                <span class="font-bold text-base md:text-lg">TOTAL:</span>
                <span class="font-bold text-xl md:text-2xl text-primary-700">{{ formatCurrency(selectedSale.total) }}</span>
              </div>
            </div>

            <button @click="closeDetailsModal" class="w-full btn-outline py-3">Fechar</button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Modal Confirmar Exclusão -->
    <div v-if="showDeleteModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div class="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl">
        <div class="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full">
          <span class="text-3xl">🗑️</span>
        </div>
        <h3 class="text-xl font-bold text-gray-900 text-center mb-2">Confirmar Exclusão</h3>
        <p class="text-gray-600 text-center mb-6">
          Tem certeza que deseja excluir o pedido <strong>{{ saleToDelete?.id?.slice(0, 8) }}</strong> de <strong>{{ saleToDelete?.clients?.name }}</strong>?<br>
          <span class="text-red-600 font-semibold">Esta ação não pode ser desfeita.</span>
        </p>
        <div class="flex flex-col sm:flex-row gap-3">
          <button @click="deleteSale" :disabled="loading" class="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg font-semibold transition-colors disabled:opacity-50 flex items-center justify-center">
            <span v-if="loading">⏳ Excluindo...</span>
            <span v-else>🗑️ Sim, Excluir</span>
          </button>
          <button @click="closeDeleteModal" class="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-3 rounded-lg font-semibold transition-colors">
            Cancelar
          </button>
        </div>
      </div>
    </div>
  </Layout>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../stores/auth'
import Layout from '../components/Layout.vue'
import jsPDF from 'jspdf'
import 'jspdf-autotable'

const authStore = useAuthStore()
const sales = ref([])
const clients = ref([])
const products = ref([])
const showModal = ref(false)
const showDetailsModal = ref(false)
const showDeleteModal = ref(false)
const showSearchClientsModal = ref(false)
const selectedSale = ref(null)
const saleToDelete = ref(null)
const loading = ref(false)
const viewMode = ref('pedidos')
const editingSale = ref(null)
const searchClientQuery = ref('')

// PAGINAÇÃO
const currentPage = ref(1)
const itemsPerPage = 15

const filters = ref({
  date: '',
  saleType: '',
  payment: '',
  status: '',
  orderStatus: ''
})

const form = ref({
  date: new Date().toISOString().split('T')[0],
  sale_type: 'wholesale',
  client_id: '',
  produtos: [
    {
      product_id: '',
      quantity: 1,
      unit_price: 0,
      total: 0,
      is_weight: false
    }
  ],
  payment_method: 'cash',
  paid: false,
  notes: '',
  order_status: 'pendente',
  is_event: false,
  event_name: ''
})

const paymentMethods = [
  { value: 'cash', label: '💵 Dinheiro', selectedClass: 'bg-green-500 text-white border-green-600' },
  { value: 'pix', label: '📱 PIX', selectedClass: 'bg-purple-500 text-white border-purple-600' },
  { value: 'card', label: '💳 Cartão', selectedClass: 'bg-pink-500 text-white border-pink-600' },
  { value: 'boleto', label: '📄 Boleto', selectedClass: 'bg-blue-500 text-white border-blue-600' },
  { value: 'crediario', label: '🏦 Crediário', selectedClass: 'bg-orange-500 text-white border-orange-600' },
  { value: 'pending', label: '⏳ Pendente', selectedClass: 'bg-gray-500 text-white border-gray-600' }
]

const orderStatuses = [
  { value: 'pendente', label: '🕐 Pendente', selectedClass: 'bg-yellow-500 text-white border-yellow-600' },
  { value: 'em_rota', label: '🚚 Em Rota', selectedClass: 'bg-blue-500 text-white border-blue-600' },
  { value: 'entregue', label: '✅ Entregue', selectedClass: 'bg-green-500 text-white border-green-600' },
  { value: 'cancelado', label: '❌ Cancelado', selectedClass: 'bg-red-500 text-white border-red-600' }
]

// COMPUTED
const totalPages = computed(() => {
  return Math.ceil(sales.value.length / itemsPerPage)
})

const paginatedSales = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return sales.value.slice(start, end)
})

const totalPedido = computed(() => {
  return form.value.produtos.reduce((sum, item) => sum + (item.total || 0), 0)
})

const clientesAgrupados = computed(() => {
  const clientesMap = {}
  
  sales.value.forEach(sale => {
    if (!clientesMap[sale.client_id]) {
      clientesMap[sale.client_id] = {
        id: sale.client_id,
        name: sale.clients?.name || 'Cliente',
        phone: sale.clients?.phone || '',
        email: sale.clients?.email || '',
        pedidos: [],
        totalPedidos: 0,
        totalItens: 0,
        totalComprado: 0,
        totalPago: 0,
        totalPendente: 0
      }
    }
    
    clientesMap[sale.client_id].pedidos.push(sale)
    clientesMap[sale.client_id].totalPedidos += 1
    clientesMap[sale.client_id].totalItens += getTotalItems(sale)
    clientesMap[sale.client_id].totalComprado += sale.total || 0
    
    if (sale.paid) {
      clientesMap[sale.client_id].totalPago += sale.total || 0
    } else {
      clientesMap[sale.client_id].totalPendente += sale.total || 0
    }
  })
  
  return Object.values(clientesMap).sort((a, b) => b.totalComprado - a.totalComprado)
})

// FUNÇÕES UTILITÁRIAS
const formatCurrency = (value) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0)
}

const formatDate = (date) => {
  return new Date(date + 'T00:00:00').toLocaleDateString('pt-BR')
}

const formatDateTime = (date) => {
  return new Date(date).toLocaleString('pt-BR')
}

const getPaymentLabel = (method) => {
  const labels = { 
    cash: 'Dinheiro', 
    pix: 'PIX', 
    boleto: 'Boleto',
    card: 'Cartão',
    crediario: 'Crediário',
    pending: 'Pendente'
  }
  return labels[method] || method
}

const getPaymentBadge = (method) => {
  const badges = {
    cash: 'bg-green-100 text-green-600',
    pix: 'bg-purple-100 text-purple-600',
    boleto: 'bg-blue-100 text-blue-600',
    card: 'bg-pink-100 text-pink-600',
    crediario: 'bg-orange-100 text-orange-600',
    pending: 'bg-gray-100 text-gray-600'
  }
  return `${badges[method] || 'bg-gray-100 text-gray-600'} px-2 py-1 rounded-full text-xs font-semibold`
}

const getSaleTypeLabel = (type) => {
  const labels = { wholesale: '🏭 Atacado', retail: '🛒 Varejo' }
  return labels[type] || type
}

const getSaleTypeBadge = (type) => {
  const badges = {
    wholesale: 'bg-blue-100 text-blue-700',
    retail: 'bg-green-100 text-green-700'
  }
  return `${badges[type]} px-2 py-1 rounded-full text-xs font-semibold`
}

const getOrderStatusLabel = (status) => {
  const labels = {
    pendente: '🕐 Pendente',
    em_rota: '🚚 Em Rota',
    entregue: '✅ Entregue',
    cancelado: '❌ Cancelado'
  }
  return labels[status] || status
}

const getOrderStatusBadge = (status) => {
  const badges = {
    pendente: 'bg-yellow-100 text-yellow-700',
    em_rota: 'bg-blue-100 text-blue-700',
    entregue: 'bg-green-100 text-green-700',
    cancelado: 'bg-red-100 text-red-700'
  }
  return `${badges[status] || 'bg-gray-100 text-gray-700'} px-2 py-1 rounded-full text-xs font-semibold`
}

const getTotalItems = (sale) => {
  if (sale.products_data) {
    try {
      const products = JSON.parse(sale.products_data)
      return products.length
    } catch (e) {
      return 1
    }
  }
  return 1
}

const getTotalItemsForm = () => {
  return form.value.produtos.length
}

const parseProducts = (sale) => {
  if (sale.products_data) {
    try {
      return JSON.parse(sale.products_data)
    } catch (e) {
      return [{
        name: sale.products?.name || 'Produto',
        quantity: sale.quantity,
        unit_price: sale.unit_price || (sale.total / sale.quantity),
        total: sale.total
      }]
    }
  }
  return [{
    name: sale.products?.name || 'Produto',
    quantity: sale.quantity,
    unit_price: sale.unit_price || (sale.total / sale.quantity),
    total: sale.total
  }]
}

// FUNÇÕES DO FORMULÁRIO
const adicionarProduto = () => {
  form.value.produtos.push({
    product_id: '',
    quantity: 1,
    unit_price: 0,
    total: 0,
    is_weight: false
  })
}

const removerProduto = (index) => {
  if (form.value.produtos.length > 1) {
    form.value.produtos.splice(index, 1)
  }
}

const updatePriceItem = (index) => {
  const product = products.value.find(p => p.id === form.value.produtos[index].product_id)
  if (product) {
    form.value.produtos[index].unit_price = product.price
    form.value.produtos[index].is_weight = product.sold_by_weight || false
    calculateTotalItem(index)
  }
}

const calculateTotalItem = (index) => {
  const item = form.value.produtos[index]
  item.total = item.quantity * item.unit_price
}

// FUNÇÕES DE NAVEGAÇÃO
const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
  }
}

const previousPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--
  }
}

// FUNÇÕES DE MODAIS
const viewSaleDetails = (sale) => {
  selectedSale.value = sale
  showDetailsModal.value = true
}

const closeDetailsModal = () => {
  showDetailsModal.value = false
  selectedSale.value = null
}

const openSearchClientsModal = () => {
  showSearchClientsModal.value = true
  searchClientQuery.value = ''
  document.body.classList.add('modal-open')
}

const closeSearchClientsModal = () => {
  showSearchClientsModal.value = false
  searchClientQuery.value = ''
  document.body.classList.remove('modal-open')
}

const selectClient = (client) => {
  form.value.client_id = client.id
  closeSearchClientsModal()
}

const filteredClients = computed(() => {
  if (!searchClientQuery.value) return clients.value
  const query = searchClientQuery.value.toLowerCase()
  return clients.value.filter(client => 
    client.name?.toLowerCase().includes(query) ||
    client.phone?.toLowerCase().includes(query) ||
    client.email?.toLowerCase().includes(query)
  )
})

const openModal = () => {
  showModal.value = true
  document.body.classList.add('modal-open')
}

const closeModal = () => {
  showModal.value = false
  editingSale.value = null
  document.body.classList.remove('modal-open')
  
  form.value = {
    date: new Date().toISOString().split('T')[0],
    sale_type: 'wholesale',
    client_id: '',
    produtos: [
      {
        product_id: '',
        quantity: 1,
        unit_price: 0,
        total: 0,
        is_weight: false
      }
    ],
    payment_method: 'cash',
    paid: false,
    notes: '',
    order_status: 'pendente',
    is_event: false,
    event_name: ''
  }
}

// MODAL DE CONFIRMAÇÃO DE EXCLUSÃO
const confirmDelete = (sale) => {
  saleToDelete.value = sale
  showDeleteModal.value = true
}

const closeDeleteModal = () => {
  showDeleteModal.value = false
  saleToDelete.value = null
}

const deleteSale = async () => {
  if (!saleToDelete.value) return
  
  loading.value = true
  try {
    const { error } = await supabase
      .from('sales')
      .delete()
      .eq('id', saleToDelete.value.id)
    
    if (error) throw error
    
    await loadSales()
    closeDeleteModal()
    
  } catch (error) {
    alert('Erro ao excluir pedido: ' + error.message)
  } finally {
    loading.value = false
  }
}

// FUNÇÕES CRUD
const editSale = (sale) => {
  editingSale.value = sale
  
  let produtos = []
  if (sale.products_data) {
    try {
      const parsedProducts = JSON.parse(sale.products_data)
      produtos = parsedProducts.map(p => ({
        product_id: p.id,
        quantity: p.quantity,
        unit_price: p.unit_price,
        total: p.total,
        is_weight: false
      }))
    } catch (e) {
      produtos = [{
        product_id: sale.product_id,
        quantity: sale.quantity,
        unit_price: sale.unit_price,
        total: sale.total,
        is_weight: false
      }]
    }
  } else {
    produtos = [{
      product_id: sale.product_id,
      quantity: sale.quantity,
      unit_price: sale.unit_price,
      total: sale.total,
      is_weight: false
    }]
  }
  
  form.value = {
    date: sale.date,
    sale_type: sale.sale_type,
    client_id: sale.client_id,
    produtos: produtos,
    payment_method: sale.payment_method,
    paid: sale.paid,
    notes: sale.notes || '',
    order_status: sale.order_status,
    is_event: sale.is_event || false,
    event_name: sale.event_name || ''
  }
  
  openModal()
}

const loadSales = async () => {
  try {
    let query = supabase
      .from('sales')
      .select(`*, clients(name, phone, email, address), products(name, description)`)
      .order('date', { ascending: false })
    
    if (filters.value.date) query = query.eq('date', filters.value.date)
    if (filters.value.saleType) query = query.eq('sale_type', filters.value.saleType)
    if (filters.value.payment) query = query.eq('payment_method', filters.value.payment)
    if (filters.value.status === 'paid') query = query.eq('paid', true)
    if (filters.value.status === 'pending') query = query.eq('paid', false)
    if (filters.value.orderStatus) query = query.eq('order_status', filters.value.orderStatus)
    
    const { data, error } = await query
    if (error) throw error
    
    sales.value = data || []
    
  } catch (error) {
    console.error('Erro ao carregar vendas:', error)
  }
}

const loadClients = async () => {
  const { data } = await supabase.from('clients').select('*').eq('ativo', true).order('name')
  clients.value = data || []
}

const loadProducts = async () => {
  const { data } = await supabase.from('products').select('*').eq('active', true).order('name')
  products.value = data || []
}

const saveSale = async () => {
  loading.value = true
  try {
    if (form.value.produtos.length === 0) {
      alert('Adicione pelo menos um produto ao pedido')
      loading.value = false
      return
    }

    const produtosData = form.value.produtos.map(item => {
      const product = products.value.find(p => p.id === item.product_id)
      return {
        id: item.product_id,
        name: product?.name || '',
        quantity: item.quantity,
        unit_price: item.unit_price,
        total: item.total
      }
    })

    const primeiroProduto = form.value.produtos[0]
    
    const saleData = {
      date: form.value.date,
      sale_type: form.value.sale_type,
      client_id: form.value.client_id,
      product_id: primeiroProduto.product_id,
      quantity: primeiroProduto.quantity,
      unit_price: primeiroProduto.unit_price,
      total: totalPedido.value,
      payment_method: form.value.payment_method,
      paid: form.value.paid,
      notes: form.value.notes,
      order_status: form.value.order_status,
      is_event: form.value.is_event,
      event_name: form.value.event_name || null,
      products_data: JSON.stringify(produtosData)
    }

    if (editingSale.value) {
      const { error } = await supabase
        .from('sales')
        .update(saleData)
        .eq('id', editingSale.value.id)
      
      if (error) throw error
    } else {
      const { error } = await supabase
        .from('sales')
        .insert([saleData])
      
      if (error) throw error
      
      // Atualizar estoque dos produtos
      for (const item of form.value.produtos) {
        const { data: productData } = await supabase
          .from('products')
          .select('stock_quantity')
          .eq('id', item.product_id)
          .single()
        
        if (productData) {
          const newStock = (productData.stock_quantity || 0) - item.quantity
          await supabase
            .from('products')
            .update({ stock_quantity: newStock })
            .eq('id', item.product_id)
        }
      }
    }
    
    await loadSales()
    closeModal()
    
  } catch (error) {
    alert('Erro ao salvar pedido: ' + error.message)
  } finally {
    loading.value = false
  }
}

const togglePaidStatus = async (sale) => {
  await supabase.from('sales').update({ paid: !sale.paid }).eq('id', sale.id)
  await loadSales()
}

const generateReceipt = async (sale) => {
  try {
    const doc = new jsPDF()
    const primaryColor = [255, 140, 0]
    const darkGray = [60, 60, 60]
    const lightGray = [150, 150, 150]
    
    // Cabeçalho com fundo laranja
    doc.setFillColor(...primaryColor)
    doc.rect(0, 0, 210, 35, 'F')
    
    // Logo circular
    try {
      const img = new Image()
      img.src = '/natural-fruit-logo-512.jpg'
      
      await new Promise((resolve, reject) => {
        img.onload = resolve
        img.onerror = reject
      })
      
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      const size = 200 // canvas grande para alta resolução
      canvas.width = size
      canvas.height = size
      ctx.beginPath()
      ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2)
      ctx.closePath()
      ctx.clip()
      ctx.drawImage(img, 0, 0, size, size)
      const circularImage = canvas.toDataURL('image/png', 1.0)
      doc.addImage(circularImage, 'PNG', 15, 5, 25, 25) // exibe 25mm no PDF mas com alta resolução
    } catch (error) {
      console.error('Erro ao carregar logo:', error)
    }
    
    // Texto do cabeçalho
    doc.setFont('helvetica')
    doc.setFontSize(12)
    doc.setTextColor(255, 255, 255)
    doc.text('NATURAL FRUIT', 45, 12)
    
    doc.setFontSize(8)
    doc.text('CNPJ: 60.127.371/0001-60', 45, 18)
    doc.text('Juazeiro, Bahia, Brasil', 45, 23)
    doc.text('Tel: (87) 98864-1590', 45, 28)
    
    // Número do pedido e tipo
    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    const receiptNumber = `#${String(sale.id).slice(0, 8).toUpperCase()}`
    doc.text(receiptNumber, 195, 12, { align: 'right' })
    doc.setFontSize(9)
    const saleTypeText = sale.sale_type === 'wholesale' ? 'ATACADO' : 'VAREJO'
    doc.text(saleTypeText, 195, 18, { align: 'right' })
    
    // Linha separadora
    doc.setTextColor(...darkGray)
    doc.setDrawColor(...primaryColor)
    doc.setLineWidth(0.5)
    doc.line(15, 40, 195, 40)
    
    // Título do Recibo
    doc.setFontSize(16)
    doc.setFont('helvetica', 'bold')
    doc.text('RECIBO DE PEDIDO', 105, 50, { align: 'center' })
    
    // Dados do pedido
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(10)
    doc.text('DATA DO PEDIDO', 15, 60)
    doc.text('STATUS', 100, 60)
    doc.text('PAGAMENTO', 170, 60)
    
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    doc.text(formatDate(sale.date), 15, 67)
    
    const statusLabels = {
      pendente: 'Pendente',
      em_rota: 'Em Rota',
      entregue: 'Entregue',
      cancelado: 'Cancelado'
    }
    doc.text(statusLabels[sale.order_status] || sale.order_status, 100, 67)
    doc.text(sale.paid ? 'PAGO' : 'PENDENTE', 170, 67)
    
    // Dados do cliente
    doc.setFillColor(245, 245, 245)
    doc.rect(15, 73, 180, 30, 'F')
    doc.setTextColor(...darkGray)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(10)
    doc.text('DADOS DO CLIENTE', 20, 81)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    doc.text(`Nome: ${sale.clients?.name || 'N/A'}`, 20, 88)
    doc.text(`Telefone: ${sale.clients?.phone || 'N/A'}`, 20, 93)
    if (sale.clients?.address) {
      const endereco = sale.clients.address.substring(0, 60)
      doc.text(`Endereco: ${endereco}`, 20, 98)
    }
    
    // Tabela de produtos
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
    
    // Lista de produtos
    doc.setTextColor(...darkGray)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    
    let yProduto = 133
    const produtos = parseProducts(sale)
    let totalRealPedido = 0
    
    if (produtos && produtos.length > 0) {
      for (const prod of produtos) {
        const nomeProduto = (prod.name || 'Produto').substring(0, 35)
        
        if (yProduto > 250) {
          doc.addPage()
          yProduto = 20
          
          doc.setFillColor(...primaryColor)
          doc.rect(15, yProduto - 10, 180, 10, 'F')
          doc.setTextColor(255, 255, 255)
          doc.setFont('helvetica', 'bold')
          doc.setFontSize(9)
          doc.text('PRODUTO', 20, yProduto - 4)
          doc.text('QTD', 120, yProduto - 4)
          doc.text('VALOR UNIT.', 145, yProduto - 4)
          doc.text('TOTAL', 190, yProduto - 4, { align: 'right' })
          
          doc.setTextColor(...darkGray)
          doc.setFont('helvetica', 'normal')
          yProduto += 10
        }
        
        doc.text(nomeProduto, 20, yProduto)
        doc.text(String(prod.quantity), 120, yProduto)
        doc.text(formatCurrency(prod.unit_price), 145, yProduto)
        doc.text(formatCurrency(prod.total), 190, yProduto, { align: 'right' })
        
        totalRealPedido += prod.total
        yProduto += 6
      }
    } else {
      const nomeProduto = (sale.products?.name || 'Produto').substring(0, 35)
      doc.text(nomeProduto, 20, yProduto)
      doc.text(String(sale.quantity || 1), 120, yProduto)
      const unitPrice = sale.unit_price || (sale.total / (sale.quantity || 1))
      doc.text(formatCurrency(unitPrice), 145, yProduto)
      doc.text(formatCurrency(sale.total), 190, yProduto, { align: 'right' })
      totalRealPedido = sale.total
      yProduto += 6
    }
    
    // Linha total
    doc.setDrawColor(...lightGray)
    doc.setLineWidth(0.3)
    doc.line(15, yProduto + 2, 195, yProduto + 2)
    
    const yTotal = yProduto + 10
    const totalFinal = totalRealPedido > 0 ? totalRealPedido : sale.total
    
    // Box do total
    doc.setFillColor(...primaryColor)
    doc.rect(140, yTotal, 55, 12, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(11)
    doc.text('TOTAL:', 145, yTotal + 8)
    doc.text(formatCurrency(totalFinal), 190, yTotal + 8, { align: 'right' })
    
    // Forma de pagamento
    doc.setTextColor(...darkGray)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(10)
    doc.text('FORMA DE PAGAMENTO', 15, yTotal + 20)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    const paymentLabels = {
      cash: 'Dinheiro',
      pix: 'PIX',
      boleto: 'Boleto',
      card: 'Cartao',
      crediario: 'Crediario',
      pending: 'Pendente'
    }
    doc.text(`Metodo: ${paymentLabels[sale.payment_method] || sale.payment_method}`, 15, yTotal + 27)
    
    // Observações
    let yPos = yTotal + 35
    if (sale.notes) {
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(10)
      doc.text('OBSERVACOES', 15, yPos)
      yPos += 7
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(9)
      const lines = doc.splitTextToSize(sale.notes, 180)
      doc.text(lines, 15, yPos)
      yPos += (lines.length * 5)
    }
    
    // Evento
    if (sale.is_event && sale.event_name) {
      yPos += 5
      doc.setFillColor(128, 0, 128)
      doc.rect(15, yPos, 180, 8, 'F')
      doc.setTextColor(255, 255, 255)
      doc.setFontSize(9)
      doc.text(`EVENTO: ${sale.event_name}`, 20, yPos + 5)
    }
    
    // Rodapé
    const yFooter = yPos > yTotal + 35 ? yPos + 15 : yTotal + 40
    doc.setTextColor(100, 100, 100)
    doc.setFontSize(8)
    doc.text('Natural Fruit - Sistema de Gestao', 105, yFooter, { align: 'center' })
    doc.text(`Emitido em: ${new Date().toLocaleString('pt-BR')}`, 105, yFooter + 5, { align: 'center' })
    
    // Salvar PDF
    doc.save(`recibo-pedido-${sale.id}.pdf`)
    
  } catch (error) {
    console.error('Erro ao gerar recibo:', error)
    alert('Erro ao gerar recibo')
  }
}

// WATCHERS
watch(filters, () => {
  currentPage.value = 1
  loadSales()
}, { deep: true })

// MOUNTED
onMounted(() => {
  loadSales()
  loadClients()
  loadProducts()
})
</script>

<style scoped>
/* Estilos Base */
.card {
  @apply bg-white rounded-xl shadow-lg p-4 md:p-6;
}

.label {
  @apply block text-sm font-medium text-gray-700 mb-2;
}

.input-field {
  @apply w-full px-3 md:px-4 py-2 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all;
  font-size: 16px !important;
  min-height: 44px !important;
}

.btn-primary {
  @apply px-4 md:px-6 py-2 md:py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium shadow-md;
  min-height: 48px !important;
  font-size: 16px !important;
}

.btn-secondary {
  @apply px-4 md:px-6 py-2 md:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-md;
  min-height: 48px !important;
  font-size: 16px !important;
}

.btn-outline {
  @apply px-4 md:px-6 py-2 md:py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium;
  min-height: 48px !important;
  font-size: 16px !important;
}

/* Modal Responsivo */
body.modal-open {
  overflow: hidden !important;
  position: fixed !important;
  width: 100% !important;
  height: 100% !important;
}

.modal-overlay-fixed {
  position: fixed !important;
  top: 0 !important;
  left: 0 !important;
  right: 0 !important;
  bottom: 0 !important;
  background: rgba(0, 0, 0, 0.8) !important;
  z-index: 9999 !important;
  display: flex !important;
  flex-direction: column !important;
}

.modal-container-mobile {
  background: white;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
}

.modal-header-mobile {
  background: linear-gradient(135deg, #f97316, #ea580c);
  padding: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-shrink: 0;
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.modal-content-mobile {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  -webkit-overflow-scrolling: touch;
  background: #f8fafc;
  scroll-behavior: smooth;
}

.fixed-bottom-actions {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: white;
  border-top: 2px solid #e5e7eb;
  padding: 1rem;
  box-shadow: 0 -4px 6px -1px rgba(0, 0, 0, 0.1);
  z-index: 100;
}

/* Animações */
.animate-fade-in {
  animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes slideUp {
  from {
    transform: translateY(100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.modal-container-mobile {
  animation: slideUp 0.3s ease-out;
}

@media (min-width: 768px) {
  .modal-overlay-fixed {
    padding: 2rem;
    align-items: center;
    justify-content: center;
  }
  
  .modal-container-mobile {
    max-width: 48rem;
    max-height: 90vh;
    height: auto;
    border-radius: 1rem;
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
    animation: scaleIn 0.3s ease-out;
  }
  
  .modal-header-mobile {
    border-top-left-radius: 1rem;
    border-top-right-radius: 1rem;
  }
  
  .fixed-bottom-actions {
    position: static;
    border-top: 1px solid #e5e7eb;
    box-shadow: none;
    padding: 1.5rem;
  }
  
  .modal-content-mobile {
    padding-bottom: 0;
  }
  
  @keyframes scaleIn {
    from {
      transform: scale(0.9);
      opacity: 0;
    }
    to {
      transform: scale(1);
      opacity: 1;
    }
  }
}

/* Breakpoints Personalizados */
@media (max-width: 480px) {
  .xs\:grid-cols-2 {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  
  .xs\:inline {
    display: inline;
  }
  
  .xs\:hidden {
    display: none;
  }
  
  .xs\:flex-row {
    flex-direction: row;
  }
  
  .xs\:items-center {
    align-items: center;
  }
}

@media (max-width: 640px) {
  .card {
    @apply p-3;
  }
  
  .input-field,
  select.input-field,
  textarea.input-field {
    font-size: 16px !important;
  }
  
  .label {
    @apply text-sm font-semibold;
  }
}

/* Transições e Estados */
.transition-all {
  transition: all 0.3s ease;
}

.radio-option {
  transition: all 0.2s ease-in-out;
}

.radio-option:active {
  transform: scale(0.95);
}

.disabled\:opacity-50:disabled {
  opacity: 0.5;
}

.disabled\:cursor-not-allowed:disabled {
  cursor: not-allowed;
}

/* Utilitários */
.whitespace-nowrap {
  white-space: nowrap;
}

.truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.min-w-0 {
  min-width: 0;
}

.flex-shrink-0 {
  flex-shrink: 0;
}

/* Responsividade para tabelas */
@media (max-width: 767px) {
  table {
    display: block;
    overflow-x: auto;
    white-space: nowrap;
  }
}

/* Melhorias para toque em mobile */
@media (hover: none) and (pointer: coarse) {
  button,
  .btn-primary,
  .btn-secondary,
  .btn-outline {
    min-height: 44px !important;
  }
  
  .input-field {
    min-height: 44px !important;
  }
}
</style>
