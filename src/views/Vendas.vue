<template>
  <Layout>
    <div class="space-y-4 md:space-y-6 pb-20 md:pb-6">
      <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h2 class="text-2xl md:text-3xl font-bold text-gray-900">Vendas / Pedidos</h2>
        <button @click="showModal = true" class="w-full md:w-auto btn-primary">
          <svg class="w-5 h-5 inline-block mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
          </svg>
          Novo Pedido
        </button>
      </div>

      <div class="card">
        <div class="grid grid-cols-1 md:grid-cols-5 gap-3 md:gap-4">
          <div>
            <label class="label text-sm">Data</label>
            <input v-model="filters.date" type="date" class="input-field text-base" @change="loadSales" />
          </div>
          <div>
            <label class="label text-sm">Tipo de Venda</label>
            <select v-model="filters.saleType" class="input-field text-base" @change="loadSales">
              <option value="">Todos</option>
              <option value="wholesale">🏭 Atacado</option>
              <option value="retail">🛒 Varejo</option>
            </select>
          </div>
          <div>
            <label class="label text-sm">Forma de Pagamento</label>
            <select v-model="filters.payment" class="input-field text-base" @change="loadSales">
              <option value="">Todas</option>
              <option value="cash">💵 Dinheiro</option>
              <option value="pix">📱 PIX</option>
              <option value="boleto">📄 Boleto</option>
              <option value="card">💳 Cartão</option>
              <option value="credito">💰 Crediário</option>
            </select>
          </div>
          <div>
            <label class="label text-sm">Status Pagamento</label>
            <select v-model="filters.status" class="input-field text-base" @change="loadSales">
              <option value="">Todos</option>
              <option value="paid">✅ Pago</option>
              <option value="pending">⏳ Pendente</option>
            </select>
          </div>
          <div>
            <label class="label text-sm">Status Pedido</label>
            <select v-model="filters.orderStatus" class="input-field text-base" @change="loadSales">
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
            class="px-6 py-2 rounded-lg font-semibold transition-colors"
          >
            📦 Por Pedido
          </button>
          <button 
            @click="viewMode = 'clientes'" 
            :class="viewMode === 'clientes' ? 'bg-primary-500 text-white' : 'text-gray-700 hover:bg-gray-100'"
            class="px-6 py-2 rounded-lg font-semibold transition-colors"
          >
            👥 Por Cliente
          </button>
        </div>
      </div>

      <!-- Visualização POR PEDIDOS (original) -->
      <div v-if="viewMode === 'pedidos'" class="hidden md:block card overflow-x-auto">
        <table class="w-full">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-4 py-3 text-left text-sm font-semibold text-gray-600">Data</th>
              <th class="px-4 py-3 text-left text-sm font-semibold text-gray-600">Tipo</th>
              <th class="px-4 py-3 text-left text-sm font-semibold text-gray-600">Cliente</th>
              <th class="px-4 py-3 text-left text-sm font-semibold text-gray-600">Itens</th>
              <th class="px-4 py-3 text-left text-sm font-semibold text-gray-600">Total</th>
              <th class="px-4 py-3 text-left text-sm font-semibold text-gray-600">Pagamento</th>
              <th class="px-4 py-3 text-left text-sm font-semibold text-gray-600">Status Pedido</th>
              <th class="px-4 py-3 text-left text-sm font-semibold text-gray-600">Status Pgto</th>
              <th class="px-4 py-3 text-left text-sm font-semibold text-gray-600">Ações</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="sale in sales" :key="sale.id" class="border-t hover:bg-gray-50">
              <td class="px-4 py-3 text-sm whitespace-nowrap">{{ formatDate(sale.date) }}</td>
              <td class="px-4 py-3 text-sm">
                <span :class="getSaleTypeBadge(sale.sale_type)">{{ getSaleTypeLabel(sale.sale_type) }}</span>
              </td>
              <td class="px-4 py-3 text-sm">{{ sale.clients?.name }}</td>
              <td class="px-4 py-3 text-sm">
                <span class="font-semibold text-primary-600">{{ getTotalItems(sale) }} itens</span>
              </td>
              <td class="px-4 py-3 text-sm font-semibold">{{ formatCurrency(sale.total) }}</td>
              <td class="px-4 py-3 text-sm">
                <span :class="getPaymentBadge(sale.payment_method)">{{ getPaymentLabel(sale.payment_method) }}</span>
              </td>
              <td class="px-4 py-3 text-sm">
                <span :class="getOrderStatusBadge(sale.order_status)">{{ getOrderStatusLabel(sale.order_status) }}</span>
              </td>
              <td class="px-4 py-3 text-sm">
                <span :class="sale.paid ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'" class="px-2 py-1 rounded-full text-xs font-semibold whitespace-nowrap">
                  {{ sale.paid ? '✅ Pago' : '⏳ Pendente' }}
                </span>
              </td>
              <td class="px-4 py-3 text-sm">
                <div class="flex items-center space-x-2">
                  <button @click="viewSaleDetails(sale)" class="p-2 hover:bg-blue-50 rounded-lg transition-colors" title="Ver Detalhes">
                    <span class="text-lg">👁️</span>
                  </button>
                  <button @click="togglePaidStatus(sale)" class="p-2 hover:bg-gray-100 rounded-lg transition-colors" title="Alternar Status Pagamento">
                    <span class="text-lg">{{ sale.paid ? '↩️' : '✅' }}</span>
                  </button>
                  <button @click="generateReceipt(sale)" class="p-2 hover:bg-blue-50 rounded-lg transition-colors" title="Gerar Recibo">
                    <span class="text-lg">📄</span>
                  </button>
                  <button @click="deleteSale(sale.id)" class="p-2 hover:bg-red-50 rounded-lg transition-colors" title="Excluir">
                    <span class="text-lg">🗑️</span>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
        <div v-if="sales.length === 0" class="text-center py-12">
          <div class="text-gray-400 mb-4">
            <svg class="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>
          <p class="text-gray-600 font-medium">Nenhum pedido encontrado</p>
        </div>
      </div>

      <div v-if="viewMode === 'pedidos'" class="md:hidden space-y-3">
        <div v-for="sale in sales" :key="sale.id" class="card p-4 space-y-3">
          <div class="flex justify-between items-start">
            <div class="flex-1 min-w-0">
              <div class="flex items-center space-x-2 mb-1">
                <p class="text-xs text-gray-500">{{ formatDate(sale.date) }}</p>
                <span :class="getSaleTypeBadge(sale.sale_type)" class="text-xs">{{ getSaleTypeLabel(sale.sale_type) }}</span>
              </div>
              <h3 class="font-semibold text-gray-900 text-base truncate">{{ sale.clients?.name }}</h3>
              <p class="text-sm text-primary-600 font-semibold">{{ getTotalItems(sale) }} itens</p>
            </div>
            <div class="flex items-center space-x-2 flex-shrink-0 ml-2">
              <button @click="viewSaleDetails(sale)" class="p-2 hover:bg-blue-50 rounded-lg transition-colors active:bg-blue-100">
                <span class="text-2xl">👁️</span>
              </button>
              <button @click="togglePaidStatus(sale)" class="p-2 hover:bg-gray-100 rounded-lg transition-colors active:bg-gray-200">
                <span class="text-2xl">{{ sale.paid ? '↩️' : '✅' }}</span>
              </button>
              <button @click="generateReceipt(sale)" class="p-2 hover:bg-blue-50 rounded-lg transition-colors active:bg-blue-100">
                <span class="text-2xl">📄</span>
              </button>
              <button @click="deleteSale(sale.id)" class="p-2 hover:bg-red-50 rounded-lg transition-colors active:bg-red-100">
                <span class="text-2xl">🗑️</span>
              </button>
            </div>
          </div>
          <div class="space-y-2 text-sm">
            <div class="flex justify-between items-center">
              <span class="text-gray-600">Total:</span>
              <span class="font-semibold text-lg text-gray-900">{{ formatCurrency(sale.total) }}</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-gray-600">Status Pedido:</span>
              <span :class="getOrderStatusBadge(sale.order_status)" class="text-xs">{{ getOrderStatusLabel(sale.order_status) }}</span>
            </div>
          </div>
          <div class="flex flex-wrap justify-between items-center gap-2 pt-2 border-t">
            <span :class="getPaymentBadge(sale.payment_method)">{{ getPaymentLabel(sale.payment_method) }}</span>
            <span :class="sale.paid ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'" class="px-2 py-1 rounded-full text-xs font-semibold">
              {{ sale.paid ? '✅ Pago' : '⏳ Pendente' }}
            </span>
          </div>
        </div>
        <div v-if="sales.length === 0" class="card text-center py-12">
          <div class="text-gray-400 mb-4">
            <svg class="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>
          <p class="text-gray-600 font-medium">Nenhum pedido encontrado</p>
          <p class="text-gray-500 text-sm mt-2">Ajuste os filtros ou registre um novo pedido</p>
        </div>
      </div>

      <!-- Visualização POR CLIENTES -->
      <div v-if="viewMode === 'clientes'" class="space-y-4">
        <div v-for="cliente in clientesAgrupados" :key="cliente.id" class="card border-l-4 border-primary-500">
          <div class="flex flex-col md:flex-row md:justify-between md:items-start gap-4 mb-4">
            <div class="flex-1">
              <h3 class="font-bold text-xl md:text-2xl text-gray-900">{{ cliente.name }}</h3>
              <div class="flex flex-wrap items-center gap-3 mt-2">
                <p class="text-sm text-gray-600">📞 {{ cliente.phone || 'Sem telefone' }}</p>
                <p class="text-sm text-gray-600">📧 {{ cliente.email || 'Sem email' }}</p>
              </div>
              <div class="flex flex-wrap items-center gap-3 mt-2">
                <span class="text-sm font-semibold text-primary-600">
                  📦 {{ cliente.totalPedidos }} {{ cliente.totalPedidos === 1 ? 'pedido' : 'pedidos' }}
                </span>
                <span class="text-sm font-semibold text-blue-600">
                  📊 {{ cliente.totalItens }} {{ cliente.totalItens === 1 ? 'item' : 'itens' }}
                </span>
              </div>
            </div>
            <div class="text-left md:text-right">
              <p class="text-sm text-gray-600 mb-1">Total Comprado</p>
              <p class="font-bold text-2xl md:text-3xl text-primary-600">{{ formatCurrency(cliente.totalComprado) }}</p>
              <div class="flex flex-wrap gap-2 mt-2 md:justify-end">
                <span v-if="cliente.totalPago > 0" class="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-semibold">
                  ✅ Pago: {{ formatCurrency(cliente.totalPago) }}
                </span>
                <span v-if="cliente.totalPendente > 0" class="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-semibold">
                  ⏳ Pendente: {{ formatCurrency(cliente.totalPendente) }}
                </span>
              </div>
            </div>
          </div>

          <!-- Lista de Pedidos do Cliente -->
          <div class="space-y-2 pt-4 border-t">
            <h4 class="font-semibold text-gray-700 mb-3">Histórico de Pedidos:</h4>
            <div v-for="pedido in cliente.pedidos" :key="pedido.id" class="bg-gray-50 hover:bg-gray-100 p-3 md:p-4 rounded-lg transition-colors">
              <div class="flex flex-col md:flex-row md:justify-between md:items-start gap-3">
                <div class="flex-1">
                  <div class="flex flex-wrap items-center gap-2 mb-2">
                    <p class="text-xs text-gray-500">Pedido #{{ pedido.id.slice(0, 8) }}</p>
                    <span :class="getSaleTypeBadge(pedido.sale_type)" class="text-xs">{{ getSaleTypeLabel(pedido.sale_type) }}</span>
                    <span :class="getOrderStatusBadge(pedido.order_status)" class="text-xs">{{ getOrderStatusLabel(pedido.order_status) }}</span>
                  </div>
                  <div class="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
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
                    <p class="font-bold text-lg md:text-xl text-gray-900">{{ formatCurrency(pedido.total) }}</p>
                    <span :class="pedido.paid ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'" 
                      class="text-xs px-2 py-1 rounded-full font-semibold whitespace-nowrap inline-block">
                      {{ pedido.paid ? '✅ Pago' : '⏳ Pendente' }}
                    </span>
                  </div>
                  <div class="flex items-center gap-1">
                    <button @click="viewSaleDetails(pedido)" class="p-2 hover:bg-blue-50 rounded-lg transition-colors" title="Ver Detalhes">
                      <span class="text-lg">👁️</span>
                    </button>
                    <button @click="generateReceipt(pedido)" class="p-2 hover:bg-blue-50 rounded-lg transition-colors" title="Recibo">
                      <span class="text-lg">📄</span>
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
          <p class="text-gray-500 text-sm mt-2">Ajuste os filtros para ver os clientes</p>
        </div>
      </div>

      <!-- Modal Novo Pedido -->
      <div v-if="showModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-0 md:p-4 z-50 overflow-y-auto">
        <div class="bg-white rounded-none md:rounded-xl w-full h-full md:h-auto md:max-w-3xl max-h-screen md:max-h-[95vh] flex flex-col">
          <div class="sticky top-0 bg-gradient-to-r from-primary-500 to-primary-600 px-4 md:px-6 py-4 flex items-center justify-between z-10">
            <div>
              <h3 class="text-lg md:text-xl font-bold text-white">Novo Pedido</h3>
              <p v-if="form.produtos.length > 0" class="text-sm text-white opacity-90">
                📦 {{ getTotalItemsForm() }} {{ getTotalItemsForm() === 1 ? 'item' : 'itens' }} no pedido
              </p>
            </div>
            <button @click="closeModal" class="text-white hover:bg-primary-700 p-2 rounded-lg transition-colors">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>
          
          <form @submit.prevent="saveSale" class="flex-1 overflow-y-auto">
            <div class="p-4 md:p-6 space-y-4">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="label">Data *</label>
                  <input v-model="form.date" type="date" required class="input-field text-base" />
                </div>
                <div>
                  <label class="label">Tipo de Venda *</label>
                  <select v-model="form.sale_type" required class="input-field text-base">
                    <option value="wholesale">🏭 Atacado</option>
                    <option value="retail">🛒 Varejo</option>
                  </select>
                </div>
              </div>

              <div>
                <label class="label">Cliente *</label>
                <select v-model="form.client_id" required class="input-field text-base">
                  <option value="">Selecione um cliente</option>
                  <option v-for="client in clients" :key="client.id" :value="client.id">{{ client.name }}</option>
                </select>
              </div>

              <!-- PRODUTOS -->
              <div class="border-2 border-dashed border-primary-300 rounded-lg p-4 space-y-4 bg-primary-50">
                <div class="flex justify-between items-center">
                  <label class="label mb-0 text-primary-700 font-bold">📦 Produtos do Pedido</label>
                  <span class="text-sm font-semibold text-primary-600">
                    Total: {{ getTotalItemsForm() }} {{ getTotalItemsForm() === 1 ? 'item' : 'itens' }}
                  </span>
                </div>
                
                <div v-for="(item, index) in form.produtos" :key="index" class="bg-white p-4 rounded-lg shadow-sm space-y-3 border border-gray-200">
                  <div class="flex justify-between items-center">
                    <span class="font-semibold text-sm text-gray-700">Produto {{ index + 1 }}</span>
                    <button v-if="form.produtos.length > 1" type="button" @click="removerProduto(index)" class="text-red-600 hover:text-red-700 font-semibold text-sm flex items-center">
                      <span class="mr-1">🗑️</span> Remover
                    </button>
                  </div>
                  
                  <div>
                    <label class="label text-sm">Produto *</label>
                    <select v-model="item.product_id" required class="input-field" @change="updatePriceItem(index)">
                      <option value="">Selecione um produto</option>
                      <option v-for="product in products" :key="product.id" :value="product.id">
                        {{ product.name }} - {{ formatCurrency(product.price) }}{{ product.sold_by_weight ? ' /kg' : '' }}
                      </option>
                    </select>
                  </div>
                  
                  <div class="grid grid-cols-3 gap-3">
                    <div>
                      <label class="label text-sm">
                        {{ item.is_weight ? 'Peso (kg) *' : 'Quantidade *' }}
                      </label>
                      <input 
                        v-model.number="item.quantity" 
                        type="number" 
                        :step="item.is_weight ? '0.001' : '1'" 
                        :min="item.is_weight ? '0.001' : '1'" 
                        required 
                        class="input-field" 
                        @input="calculateTotalItem(index)" 
                        :inputmode="item.is_weight ? 'decimal' : 'numeric'" 
                      />
                    </div>
                    <div>
                      <label class="label text-sm">Preço Unit. *</label>
                      <input v-model.number="item.unit_price" type="number" step="0.01" required class="input-field" @input="calculateTotalItem(index)" inputmode="decimal" />
                    </div>
                    <div>
                      <label class="label text-sm">Total</label>
                      <input v-model.number="item.total" type="number" step="0.01" readonly class="input-field bg-gray-100 font-bold text-primary-600" />
                    </div>
                  </div>
                </div>

                <!-- BOTÃO ADICIONAR PRODUTO FIXO EMBAIXO -->
                <div class="sticky bottom-0 pt-2">
                  <button type="button" @click="adicionarProduto" class="w-full bg-primary-600 hover:bg-primary-700 text-white py-3 rounded-lg font-semibold transition-colors shadow-md flex items-center justify-center">
                    <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
                    </svg>
                    Adicionar Produto
                  </button>
                </div>

                <!-- TOTAL DO PEDIDO -->
                <div class="bg-gradient-to-r from-primary-600 to-primary-700 p-4 rounded-lg shadow-lg">
                  <div class="flex justify-between items-center text-white">
                    <span class="font-bold text-lg">TOTAL DO PEDIDO:</span>
                    <span class="font-bold text-2xl">{{ formatCurrency(totalPedido) }}</span>
                  </div>
                </div>
              </div>

              <div>
                <label class="label">Forma de Pagamento *</label>
                <select v-model="form.payment_method" required class="input-field text-base">
                  <option value="cash">💵 Dinheiro</option>
                  <option value="pix">📱 PIX</option>
                  <option value="boleto">📄 Boleto</option>
                  <option value="card">💳 Cartão</option>
                  <option value="credito">💰 Crediário</option>
                </select>
              </div>

              <!-- STATUS DO PEDIDO -->
              <div>
                <label class="label">Status do Pedido *</label>
                <select v-model="form.order_status" required class="input-field text-base">
                  <option value="pendente">🕐 Pendente</option>
                  <option value="em_rota">🚚 Em Rota</option>
                  <option value="entregue">✅ Entregue</option>
                  <option value="cancelado">❌ Cancelado</option>
                </select>
              </div>

              <!-- STATUS DE EVENTO -->
              <div class="border-2 border-purple-200 rounded-lg p-4 bg-purple-50">
                <div class="flex items-center space-x-3 mb-3">
                  <input v-model="form.is_event" type="checkbox" id="is-event" class="w-5 h-5 rounded border-gray-300 text-purple-600 focus:ring-purple-500" />
                  <label for="is-event" class="font-medium text-gray-700">🎉 Este pedido é para um evento?</label>
                </div>
                <div v-if="form.is_event">
                  <label class="label text-sm">Nome/Tipo do Evento *</label>
                  <input v-model="form.event_name" type="text" required class="input-field" placeholder="Ex: Casamento, Aniversário, Festa Corporativa" />
                </div>
              </div>

              <!-- TROCA -->
              <div class="border-2 border-yellow-200 rounded-lg p-4 bg-yellow-50">
                <div class="flex items-center space-x-3 mb-3">
                  <input v-model="form.has_exchange" type="checkbox" id="has-exchange" class="w-5 h-5 rounded border-gray-300 text-yellow-600 focus:ring-yellow-500" />
                  <label for="has-exchange" class="font-medium text-gray-700">🔄 Este pedido envolve troca?</label>
                </div>
                <div v-if="form.has_exchange" class="space-y-3">
                  <div>
                    <label class="label text-sm">Produto da Troca *</label>
                    <input v-model="form.exchange_product" type="text" required class="input-field" placeholder="Ex: Caixas de polpa de acerola" />
                  </div>
                  <div class="grid grid-cols-2 gap-3">
                    <div>
                      <label class="label text-sm">Quantidade *</label>
                      <input v-model.number="form.exchange_quantity" type="number" min="1" required class="input-field" />
                    </div>
                    <div>
                      <label class="label text-sm">Valor da Troca *</label>
                      <input v-model.number="form.exchange_value" type="number" step="0.01" required class="input-field" @input="calculateExchangeTotal" />
                    </div>
                  </div>
                  <div>
                    <label class="label text-sm">Total da Troca</label>
                    <input v-model.number="form.exchange_total" type="number" step="0.01" readonly class="input-field bg-gray-100 font-bold text-yellow-700" />
                  </div>
                </div>
              </div>

              <div class="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <input v-model="form.paid" type="checkbox" id="paid-checkbox" class="w-5 h-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
                <label for="paid-checkbox" class="text-sm md:text-base font-medium text-gray-700">✅ Pagamento realizado</label>
              </div>

              <div>
                <label class="label">Observações</label>
                <textarea v-model="form.notes" class="input-field text-base" rows="3" placeholder="Informações adicionais do pedido..."></textarea>
              </div>
            </div>

            <!-- FOOTER FIXO COM BOTÕES -->
            <div class="sticky bottom-0 bg-white border-t-2 border-gray-200 p-4 md:p-6">
              <div class="flex flex-col md:flex-row gap-3">
                <button type="button" @click="closeModal" class="flex-1 btn-outline order-2 md:order-1">Cancelar</button>
                <button type="submit" :disabled="loading" class="flex-1 btn-primary order-1 md:order-2">
                  {{ loading ? 'Salvando...' : 'Salvar Pedido' }}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      <!-- Modal Ver Detalhes -->
      <div v-if="showDetailsModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
        <div class="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div class="sticky top-0 bg-gradient-to-r from-primary-500 to-primary-600 px-6 py-4 flex items-center justify-between z-10">
            <h3 class="text-xl font-bold text-white">Detalhes do Pedido</h3>
            <button @click="closeDetailsModal" class="text-white hover:bg-primary-700 p-2 rounded-lg transition-colors text-2xl">×</button>
          </div>
          
          <div v-if="selectedSale" class="p-6 space-y-4">
            <div class="grid grid-cols-2 gap-4">
              <div class="card bg-gray-50">
                <p class="text-sm text-gray-600">Data</p>
                <p class="font-semibold">{{ formatDate(selectedSale.date) }}</p>
              </div>
              <div class="card bg-gray-50">
                <p class="text-sm text-gray-600">Tipo</p>
                <p class="font-semibold">{{ getSaleTypeLabel(selectedSale.sale_type) }}</p>
              </div>
            </div>

            <div class="card bg-blue-50">
              <h4 class="font-bold mb-2 text-blue-900">👤 Cliente</h4>
              <p class="font-semibold">{{ selectedSale.clients?.name }}</p>
              <p class="text-sm text-gray-600">{{ selectedSale.clients?.phone }}</p>
            </div>

            <div class="card bg-green-50">
              <h4 class="font-bold mb-3 text-green-900">📦 Produtos ({{ getTotalItems(selectedSale) }} itens)</h4>
              <div class="space-y-2">
                <div v-for="(item, index) in parseProducts(selectedSale)" :key="index" class="bg-white p-3 rounded-lg">
                  <div class="flex justify-between items-start">
                    <div class="flex-1">
                      <p class="font-semibold">{{ item.name }}</p>
                      <p class="text-sm text-gray-600">Qtd: {{ item.quantity }} × {{ formatCurrency(item.unit_price) }}</p>
                    </div>
                    <p class="font-bold text-green-700">{{ formatCurrency(item.total) }}</p>
                  </div>
                </div>
              </div>
            </div>

            <div v-if="selectedSale.has_exchange" class="card bg-yellow-50">
              <h4 class="font-bold mb-2 text-yellow-900">🔄 Troca</h4>
              <p class="text-sm"><strong>Produto:</strong> {{ selectedSale.exchange_product }}</p>
              <p class="text-sm"><strong>Quantidade:</strong> {{ selectedSale.exchange_quantity }}</p>
              <p class="text-sm"><strong>Valor:</strong> {{ formatCurrency(selectedSale.exchange_total) }}</p>
            </div>

            <div v-if="selectedSale.is_event" class="card bg-purple-50">
              <h4 class="font-bold mb-2 text-purple-900">🎉 Evento</h4>
              <p class="font-semibold">{{ selectedSale.event_name }}</p>
            </div>

            <div class="card bg-gray-50">
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <p class="text-sm text-gray-600">Forma de Pagamento</p>
                  <p class="font-semibold">{{ getPaymentLabel(selectedSale.payment_method) }}</p>
                </div>
                <div>
                  <p class="text-sm text-gray-600">Status Pedido</p>
                  <p class="font-semibold">{{ getOrderStatusLabel(selectedSale.order_status) }}</p>
                </div>
              </div>
            </div>

            <div class="card bg-primary-50 border-2 border-primary-300">
              <div class="flex justify-between items-center">
                <span class="font-bold text-lg">TOTAL:</span>
                <span class="font-bold text-2xl text-primary-700">{{ formatCurrency(selectedSale.total) }}</span>
              </div>
            </div>

            <button @click="closeDetailsModal" class="w-full btn-outline">Fechar</button>
          </div>
        </div>
      </div>

      <!-- Modal Confirmação Recibo -->
      <div v-if="showReceiptConfirm" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div class="bg-white rounded-2xl max-w-sm w-full p-6 animate-fade-in">
          <div class="text-center mb-6">
            <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
            <h3 class="text-xl font-bold text-gray-900 mb-2">Pedido Registrado!</h3>
            <p class="text-gray-600 text-sm md:text-base">Deseja gerar o recibo agora?</p>
          </div>
          <div class="flex flex-col gap-3">
            <button @click="confirmGenerateReceipt" class="btn-primary">
              <svg class="w-5 h-5 inline-block mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
              </svg>
              Gerar Recibo
            </button>
            <button @click="closeReceiptConfirm" class="btn-outline">Agora Não</button>
          </div>
        </div>
      </div>
    </div>
  </Layout>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { supabase } from '../lib/supabase'
import Layout from '../components/Layout.vue'
import jsPDF from 'jspdf'

const sales = ref([])
const clients = ref([])
const products = ref([])
const showModal = ref(false)
const showDetailsModal = ref(false)
const selectedSale = ref(null)
const loading = ref(false)
const showReceiptConfirm = ref(false)
const lastSaleData = ref(null)
const viewMode = ref('pedidos') // 'pedidos' ou 'clientes'

const filters = ref({
  date: '',
  saleType: '',
  payment: '',
  status: '',
  orderStatus: ''
})

const form = ref({
  date: new Date().toISOString().split('T')[0],
  sale_type: 'retail',
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
  event_name: '',
  has_exchange: false,
  exchange_product: '',
  exchange_quantity: 1,
  exchange_value: 0,
  exchange_total: 0
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
  
  // Ordenar por total comprado (maior para menor)
  return Object.values(clientesMap).sort((a, b) => b.totalComprado - a.totalComprado)
})

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
    credito: 'Crediário'
  }
  return labels[method] || method
}

const getPaymentBadge = (method) => {
  const badges = {
    cash: 'bg-green-100 text-green-600',
    pix: 'bg-purple-100 text-purple-600',
    boleto: 'bg-blue-100 text-blue-600',
    card: 'bg-pink-100 text-pink-600',
    credito: 'bg-orange-100 text-orange-600'
  }
  return `${badges[method] || 'bg-gray-100 text-gray-600'} px-2 py-1 rounded-full text-xs font-semibold whitespace-nowrap`
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
  return `${badges[type]} px-2 py-1 rounded-full text-xs font-semibold whitespace-nowrap`
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
  return `${badges[status] || 'bg-gray-100 text-gray-700'} px-2 py-1 rounded-full text-xs font-semibold whitespace-nowrap`
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

const calculateExchangeTotal = () => {
  form.value.exchange_total = form.value.exchange_quantity * form.value.exchange_value
}

const viewSaleDetails = (sale) => {
  selectedSale.value = sale
  showDetailsModal.value = true
}

const closeDetailsModal = () => {
  showDetailsModal.value = false
  selectedSale.value = null
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
    console.error('Erro:', error)
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
      has_exchange: form.value.has_exchange,
      exchange_product: form.value.exchange_product || null,
      exchange_quantity: form.value.exchange_quantity || null,
      exchange_value: form.value.exchange_value || null,
      exchange_total: form.value.exchange_total || null,
      products_data: JSON.stringify(produtosData)
    }

    const { data, error } = await supabase
      .from('sales')
      .insert([saleData])
      .select(`*, clients(name, phone, email, address), products(name, description)`)
    
    if (error) throw error
    
    // DEDUZIR DO ESTOQUE
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
    
    await loadSales()
    closeModal()
    
    if (data && data[0]) {
      lastSaleData.value = data[0]
      showReceiptConfirm.value = true
    }
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

const deleteSale = async (id) => {
  if (!confirm('Tem certeza que deseja excluir este pedido? Esta ação não pode ser desfeita.')) return
  try {
    const { error } = await supabase.from('sales').delete().eq('id', id)
    if (error) throw error
    await loadSales()
    alert('Pedido excluído com sucesso!')
  } catch (error) {
    console.error('Erro ao excluir pedido:', error)
    alert('Erro ao excluir pedido: ' + error.message)
  }
}

const generateReceipt = async (sale) => {
  const doc = new jsPDF()
  const primaryColor = [255, 140, 0]
  const darkGray = [60, 60, 60]
  const lightGray = [150, 150, 150]
  
  doc.setFillColor(...primaryColor)
  doc.rect(0, 0, 210, 40, 'F')
  
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
    doc.addImage(circularImage, 'PNG', 85, 5, 30, 30)
  } catch (error) {
    console.error('Erro ao carregar logo:', error)
  }
  
  doc.setTextColor(...darkGray)
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.text('NATURAL FRUIT', 15, 50)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.text('CNPJ: 60.127.371/0001-60', 15, 56)
  doc.text('Juazeiro, Bahia, Brasil', 15, 61)
  doc.text('Telefone: (87) 98864-1590', 15, 66)
  
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  const receiptNumber = `#${String(sale.id).slice(0, 8).toUpperCase()}`
  doc.text(receiptNumber, 210 - 15, 50, { align: 'right' })
  doc.setFontSize(10)
  const saleTypeText = sale.sale_type === 'wholesale' ? 'ATACADO' : 'VAREJO'
  doc.text(saleTypeText, 210 - 15, 57, { align: 'right' })
  
  doc.setDrawColor(...primaryColor)
  doc.setLineWidth(0.5)
  doc.line(15, 72, 195, 72)
  
  doc.setTextColor(...darkGray)
  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  doc.text('RECIBO DE PEDIDO', 105, 82, { align: 'center' })
  
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.text('DATA', 15, 92)
  doc.text('STATUS', 100, 92)
  
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.text(formatDate(sale.date), 15, 99)
  doc.text(getOrderStatusLabel(sale.order_status), 100, 99)
  
  if (sale.is_event) {
    doc.setFont('helvetica', 'bold')
    doc.text('EVENTO', 150, 92)
    doc.setFont('helvetica', 'normal')
    doc.text(sale.event_name || '', 150, 99)
  }
  
  doc.setFillColor(245, 245, 245)
  doc.rect(15, 105, 180, 30, 'F')
  doc.setTextColor(...darkGray)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.text('DADOS DO CLIENTE', 20, 113)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.text(`Nome: ${sale.clients?.name || 'N/A'}`, 20, 120)
  doc.text(`Telefone: ${sale.clients?.phone || 'N/A'}`, 20, 125)
  if (sale.clients?.address) {
    doc.text(`Endereco: ${sale.clients.address.substring(0, 70)}`, 20, 130)
  }
  
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.text('PRODUTOS DO PEDIDO', 15, 145)
  
  doc.setFillColor(...primaryColor)
  doc.rect(15, 150, 180, 10, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.text('PRODUTO', 20, 156)
  doc.text('QTD', 120, 156)
  doc.text('VALOR UNIT.', 145, 156)
  doc.text('TOTAL', 190, 156, { align: 'right' })
  
  let yPos = 166
  const produtos = parseProducts(sale)
  
  produtos.forEach((item, index) => {
    doc.setTextColor(...darkGray)
    doc.setFont('helvetica', 'normal')
    const nomeProduto = item.name.substring(0, 35)
    doc.text(nomeProduto, 20, yPos)
    doc.text(String(item.quantity), 120, yPos)
    doc.text(formatCurrency(item.unit_price), 145, yPos)
    doc.text(formatCurrency(item.total), 190, yPos, { align: 'right' })
    yPos += 6
  })
  
  doc.setDrawColor(...lightGray)
  doc.setLineWidth(0.3)
  doc.line(15, yPos, 195, yPos)
  
  yPos += 10
  
  if (sale.has_exchange) {
    doc.setFillColor(255, 250, 205)
    doc.rect(15, yPos, 180, 20, 'F')
    doc.setTextColor(...darkGray)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(9)
    doc.text('TROCA:', 20, yPos + 7)
    doc.setFont('helvetica', 'normal')
    doc.text(`${sale.exchange_product} - Qtd: ${sale.exchange_quantity}`, 20, yPos + 13)
    doc.text(`Valor: ${formatCurrency(sale.exchange_total)}`, 145, yPos + 13)
    yPos += 25
  }
  
  doc.setFillColor(...primaryColor)
  doc.rect(140, yPos, 55, 12, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.text('TOTAL:', 145, yPos + 8)
  doc.text(formatCurrency(sale.total), 190, yPos + 8, { align: 'right' })
  
  yPos += 20
  doc.setTextColor(...darkGray)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.text('FORMA DE PAGAMENTO', 15, yPos)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.text(`Metodo: ${getPaymentLabel(sale.payment_method)}`, 15, yPos + 7)
  doc.text(`Status: ${sale.paid ? 'PAGO' : 'PENDENTE'}`, 15, yPos + 14)
  
  if (sale.notes) {
    yPos += 25
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(10)
    doc.text('OBSERVACOES', 15, yPos)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    const splitNotes = doc.splitTextToSize(sale.notes, 180)
    doc.text(splitNotes, 15, yPos + 7)
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
}

const confirmGenerateReceipt = () => {
  if (lastSaleData.value) {
    generateReceipt(lastSaleData.value)
  }
  closeReceiptConfirm()
}

const closeReceiptConfirm = () => {
  showReceiptConfirm.value = false
  lastSaleData.value = null
}

const closeModal = () => {
  showModal.value = false
  form.value = {
    date: new Date().toISOString().split('T')[0],
    sale_type: 'retail',
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
    event_name: '',
    has_exchange: false,
    exchange_product: '',
    exchange_quantity: 1,
    exchange_value: 0,
    exchange_total: 0
  }
}

onMounted(() => {
  loadSales()
  loadClients()
  loadProducts()
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
}

.btn-primary {
  @apply px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium shadow-md;
}

.btn-outline {
  @apply px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium;
}

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
</style>
