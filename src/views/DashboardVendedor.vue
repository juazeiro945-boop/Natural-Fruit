<template>
  <Layout>
    <div class="space-y-4 md:space-y-6 pb-20 md:pb-6">
      <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 class="text-2xl md:text-3xl font-bold text-gray-900">Pedidos para Entrega</h2>
          <p class="text-gray-600 mt-1">Gerencie suas entregas e novos pedidos</p>
        </div>
        <div class="flex gap-2">
          <button v-if="authStore.isAdmin" @click="showModalConsultaCliente = true" class="flex-1 md:flex-none btn-secondary">
            🔍 Consultar Cliente
          </button>
          <button @click="showModalNovoPedido = true" class="flex-1 md:flex-none btn-primary">
            ➕ Novo Pedido
          </button>
        </div>
      </div>

      <div class="card">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-3">
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
          <div v-if="authStore.isAdmin">
            <label class="label text-sm">Vendedor</label>
            <select v-model="filters.vendedor" class="input-field" @change="loadPedidos">
              <option value="">Todos</option>
              <option v-for="vendedor in vendedores" :key="vendedor.id" :value="vendedor.id">
                {{ vendedor.name }}
              </option>
            </select>
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

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div v-for="pedido in pedidos" :key="pedido.id" class="card hover:shadow-xl transition-shadow">
          <div class="flex justify-between items-start mb-4 pb-3 border-b">
            <div>
              <span class="text-xs text-gray-500">Pedido #{{ pedido.id.slice(0, 8) }}</span>
              <p class="font-bold text-lg text-gray-900 mt-1">{{ pedido.clients?.name }}</p>
            </div>
            <span :class="getStatusBadge(pedido.status_entrega)" class="text-xs px-3 py-1 rounded-full font-semibold">
              {{ getStatusLabel(pedido.status_entrega) }}
            </span>
          </div>

          <div class="space-y-3 mb-4">
            <div v-if="pedido.vendedor_id" class="flex items-start space-x-2 bg-blue-50 p-2 rounded">
              <span class="text-lg">👤</span>
              <div class="flex-1">
                <p class="text-sm text-gray-600">Vendedor</p>
                <p class="font-semibold text-blue-700">{{ getVendedorName(pedido.vendedor_id) }}</p>
              </div>
            </div>

            <div class="flex items-start space-x-2">
              <span class="text-lg">📦</span>
              <div class="flex-1">
                <p class="text-sm text-gray-600">Produto</p>
                <p class="font-semibold">{{ pedido.products?.name }}</p>
                <p class="text-sm text-gray-600">Quantidade: {{ pedido.quantity }}</p>
              </div>
            </div>

            <div class="flex items-start space-x-2">
              <span class="text-lg">📞</span>
              <div class="flex-1">
                <p class="text-sm text-gray-600">Telefone</p>
                <p class="font-semibold">{{ pedido.clients?.phone || 'Não informado' }}</p>
              </div>
            </div>

            <div class="flex items-start space-x-2">
              <span class="text-lg">📍</span>
              <div class="flex-1">
                <p class="text-sm text-gray-600">Endereço</p>
                <p class="font-semibold text-sm">{{ pedido.clients?.address || 'Não informado' }}</p>
              </div>
            </div>

            <div class="flex items-start space-x-2">
              <span class="text-lg">💰</span>
              <div class="flex-1">
                <p class="text-sm text-gray-600">Valor</p>
                <p class="font-bold text-lg text-primary-600">{{ formatCurrency(pedido.total) }}</p>
              </div>
            </div>

            <div class="flex items-start space-x-2">
              <span class="text-lg">💳</span>
              <div class="flex-1">
                <p class="text-sm text-gray-600">Forma de Pagamento</p>
                <p class="font-semibold">{{ getPaymentMethodLabel(pedido.payment_method) }}</p>
                <button 
                  v-if="authStore.isAdmin && pedido.status_entrega !== 'cancelado'" 
                  @click="alterarFormaPagamento(pedido)"
                  class="text-xs text-primary-600 hover:underline mt-1"
                >
                  Alterar
                </button>
              </div>
            </div>

            <div class="flex items-start space-x-2">
              <span class="text-lg">📅</span>
              <div class="flex-1">
                <p class="text-sm text-gray-600">Data do Pedido</p>
                <p class="font-semibold">{{ formatDate(pedido.date) }}</p>
              </div>
            </div>

            <div v-if="pedido.tem_troca" class="flex items-start space-x-2 bg-yellow-50 p-2 rounded">
              <span class="text-lg">🔄</span>
              <div class="flex-1">
                <p class="text-sm text-gray-600">Troca</p>
                <p class="text-sm font-semibold text-yellow-700">{{ pedido.observacao_troca }}</p>
              </div>
            </div>

            <div v-if="pedido.notes" class="flex items-start space-x-2">
              <span class="text-lg">📝</span>
              <div class="flex-1">
                <p class="text-sm text-gray-600">Observações</p>
                <p class="text-sm">{{ pedido.notes }}</p>
              </div>
            </div>
          </div>

          <div v-if="pedido.status_entrega !== 'pendente'" class="bg-gray-50 rounded-lg p-3 mb-4">
            <p class="text-xs text-gray-500 mb-1">
              {{ pedido.status_entrega === 'entregue' ? '✅ Entregue em:' : '❌ Cancelado em:' }}
            </p>
            <p class="text-sm font-semibold">{{ formatDateTime(pedido.data_entrega) }}</p>
            <p v-if="pedido.motivo_cancelamento" class="text-xs text-gray-600 mt-2">
              <strong>Motivo:</strong> {{ pedido.motivo_cancelamento }}
            </p>
            <p v-if="pedido.observacao_entrega" class="text-xs text-gray-600 mt-1">
              <strong>Obs:</strong> {{ pedido.observacao_entrega }}
            </p>
            <button 
              v-if="authStore.isAdmin && pedido.status_entrega === 'entregue'" 
              @click="desfazerEntrega(pedido)"
              class="mt-2 text-xs text-red-600 hover:underline font-semibold"
            >
              ↩️ Desfazer Entrega
            </button>
          </div>

          <div class="flex gap-2 flex-wrap">
            <button 
              v-if="pedido.status_entrega === 'pendente'" 
              @click="confirmarEntrega(pedido)" 
              class="flex-1 bg-green-500 hover:bg-green-600 text-white py-3 rounded-lg font-semibold transition-colors"
            >
              ✅ Entregue
            </button>
            <button 
              v-if="pedido.status_entrega === 'pendente'" 
              @click="abrirModalCancelamento(pedido)" 
              class="flex-1 bg-red-500 hover:bg-red-600 text-white py-3 rounded-lg font-semibold transition-colors"
            >
              ❌ Cancelar
            </button>
            <button 
              @click="generateReceipt(pedido)" 
              class="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-lg font-semibold transition-colors"
            >
              📄 Recibo
            </button>
          </div>
        </div>
      </div>

      <div v-if="pedidos.length === 0" class="card text-center py-12">
        <div class="text-gray-400 mb-4">
          <svg class="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"/>
          </svg>
        </div>
        <p class="text-gray-600 font-medium">Nenhum pedido encontrado</p>
        <p class="text-gray-500 text-sm mt-2">Ajuste os filtros ou aguarde novos pedidos</p>
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

      <!-- ✅ MODAL NOVO PEDIDO COMPLETO -->
      <div v-if="showModalNovoPedido" class="modal-overlay-fixed">
        <div class="modal-container-mobile">
          
          <!-- Header Fixo -->
          <div class="modal-header-mobile">
            <div class="flex items-center space-x-3">
              <button @click="closeModalNovoPedido" class="text-white p-1 rounded-lg flex-shrink-0">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
                </svg>
              </button>
              <div>
                <h3 class="text-lg font-bold text-white">Novo Pedido</h3>
                <p v-if="formPedido.produtos.length > 0" class="text-xs text-white opacity-90">
                  📦 {{ getTotalItemsForm() }} {{ getTotalItemsForm() === 1 ? 'item' : 'itens' }}
                </p>
              </div>
            </div>
            <button @click="closeModalNovoPedido" class="text-white p-2 rounded-lg flex-shrink-0 text-xl">
              ×
            </button>
          </div>

          <!-- Formulário Scrollable -->
          <div class="modal-content-mobile">
            <form @submit.prevent="salvarNovoPedido" class="p-4 space-y-4 pb-32">
              
              <!-- Informações Básicas -->
              <div class="grid grid-cols-1 gap-3">
                <div>
                  <label class="label">Data *</label>
                  <input v-model="formPedido.date" type="date" required class="input-field" />
                </div>
                <div>
                  <label class="label">Tipo de Venda *</label>
                  <select v-model="formPedido.sale_type" required class="input-field">
                    <option value="wholesale">🏭 Atacado</option>
                    <option value="retail">🛒 Varejo</option>
                  </select>
                </div>
              </div>

              <div>
                <label class="label">Vendedor Responsável *</label>
                <select v-model="formPedido.vendedor_id" required class="input-field">
                  <option value="">Selecione o vendedor</option>
                  <option v-for="vendedor in vendedores" :key="vendedor.id" :value="vendedor.id">
                    {{ vendedor.name }}
                  </option>
                </select>
              </div>

              <div>
                <label class="label">Cliente *</label>
                <select v-model="formPedido.client_id" required class="input-field">
                  <option value="">Selecione um cliente</option>
                  <option v-for="client in clientes" :key="client.id" :value="client.id">{{ client.name }}</option>
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
                
                <div v-for="(item, index) in formPedido.produtos" :key="index" class="bg-white p-3 rounded-lg shadow-sm space-y-2 border border-gray-200">
                  <div class="flex justify-between items-center">
                    <span class="font-semibold text-xs text-gray-700">Produto {{ index + 1 }}</span>
                    <button v-if="formPedido.produtos.length > 1" type="button" @click="removerProduto(index)" class="text-red-600 hover:text-red-700 font-semibold text-xs flex items-center">
                      <span class="mr-1">🗑️</span> Remover
                    </button>
                  </div>
                  
                  <div>
                    <label class="label text-xs">Produto *</label>
                    <select v-model="item.product_id" required class="input-field" @change="updatePriceItem(index)">
                      <option value="">Selecione um produto</option>
                      <option v-for="product in produtos" :key="product.id" :value="product.id">
                        {{ product.name }} - {{ formatCurrency(product.price) }}{{ product.sold_by_weight ? ' /kg' : '' }}
                      </option>
                    </select>
                  </div>
                  
                  <div class="grid grid-cols-1 gap-2">
                    <div>
                      <label class="label text-xs">
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
                    <span class="font-bold text-lg">TOTAL DO PEDIDO:</span>
                    <span class="font-bold text-2xl">{{ formatCurrency(totalPedido) }}</span>
                  </div>
                </div>
              </div>

              <!-- Forma de Pagamento -->
              <div class="border-2 border-primary-200 rounded-lg p-3 bg-primary-50">
                <label class="label font-bold text-primary-700 mb-3">💳 Forma de Pagamento *</label>
                
                <div class="grid grid-cols-2 gap-2">
                  <div class="flex items-center" v-for="method in paymentMethods" :key="method.value">
                    <input 
                      v-model="formPedido.payment_method" 
                      :value="method.value" 
                      type="radio" 
                      :id="method.value" 
                      class="hidden"
                    />
                    <label 
                      :for="method.value" 
                      :class="formPedido.payment_method === method.value 
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
                      v-model="formPedido.order_status" 
                      :value="status.value" 
                      type="radio" 
                      :id="status.value" 
                      class="hidden"
                    />
                    <label 
                      :for="status.value" 
                      :class="formPedido.order_status === status.value 
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
                  <input v-model="formPedido.is_event" type="checkbox" id="is-event" class="w-5 h-5 rounded border-gray-300 text-purple-600 focus:ring-purple-500" />
                  <label for="is-event" class="font-medium text-gray-700">🎉 Este pedido é para um evento?</label>
                </div>
                <div v-if="formPedido.is_event">
                  <label class="label text-sm">Nome/Tipo do Evento *</label>
                  <input v-model="formPedido.event_name" type="text" required class="input-field" placeholder="Ex: Casamento, Aniversário, Festa Corporativa" />
                </div>
              </div>

              <!-- Troca COMPLETA -->
              <div class="border-2 border-yellow-200 rounded-lg p-3 bg-yellow-50">
                <div class="flex items-center space-x-3 mb-3">
                  <input v-model="formPedido.has_exchange" type="checkbox" id="has-exchange" class="w-5 h-5 rounded border-gray-300 text-yellow-600 focus:ring-yellow-500" />
                  <label for="has-exchange" class="font-medium text-gray-700">🔄 Este pedido envolve troca?</label>
                </div>
                <div v-if="formPedido.has_exchange" class="space-y-3">
                  <div>
                    <label class="label text-sm">Produto da Troca *</label>
                    <input v-model="formPedido.exchange_product" type="text" required class="input-field" placeholder="Ex: Caixas de polpa de acerola" />
                  </div>
                  <div class="grid grid-cols-2 gap-3">
                    <div>
                      <label class="label text-sm">Quantidade *</label>
                      <input v-model.number="formPedido.exchange_quantity" type="number" min="1" required class="input-field" />
                    </div>
                    <div>
                      <label class="label text-sm">Valor da Troca *</label>
                      <input v-model.number="formPedido.exchange_value" type="number" step="0.01" required class="input-field" @input="calculateExchangeTotal" />
                    </div>
                  </div>
                  <div>
                    <label class="label text-sm">Total da Troca</label>
                    <input v-model.number="formPedido.exchange_total" type="number" step="0.01" readonly class="input-field bg-gray-100 font-bold text-yellow-700" />
                  </div>
                </div>
              </div>

              <!-- Pagamento Realizado -->
              <div class="border-2 border-green-200 rounded-lg p-3 bg-green-50">
                <div class="flex items-center justify-between">
                  <div class="flex items-center space-x-3">
                    <input 
                      v-model="formPedido.paid" 
                      type="checkbox" 
                      id="paid-checkbox" 
                      class="w-6 h-6 rounded border-2 border-gray-300 text-green-600 focus:ring-green-500 focus:ring-2"
                    />
                    <label for="paid-checkbox" class="font-bold text-green-700">
                      ✅ Pagamento realizado
                    </label>
                  </div>
                  
                  <!-- Status visual -->
                  <div :class="formPedido.paid ? 'bg-green-500 text-white' : 'bg-red-500 text-white'" 
                       class="px-4 py-2 rounded-full font-bold text-sm transition-colors">
                    {{ formPedido.paid ? 'PAGO' : 'PENDENTE' }}
                  </div>
                </div>
                
                <!-- Valor total quando pago -->
                <div v-if="formPedido.paid" class="mt-3 p-3 bg-white rounded-lg border-2 border-green-300">
                  <div class="flex justify-between items-center">
                    <span class="font-semibold text-gray-700">Valor a receber:</span>
                    <span class="font-bold text-green-600">{{ formatCurrency(totalPedido) }}</span>
                  </div>
                </div>
              </div>

              <!-- Observações -->
              <div>
                <label class="label">Observações</label>
                <textarea v-model="formPedido.notes" class="input-field" rows="3" placeholder="Informações adicionais do pedido..."></textarea>
              </div>

            </form>
          </div>

          <!-- Footer Fixo Mobile -->
          <div class="fixed-bottom-actions">
            <div class="flex flex-col gap-2">
              <button type="submit" @click="salvarNovoPedido" :disabled="loading" class="w-full btn-primary py-4 text-lg font-bold">
                {{ loading ? 'Salvando...' : 'Salvar Pedido' }}
              </button>
              <button type="button" @click="closeModalNovoPedido" class="w-full btn-outline py-3">
                Cancelar
              </button>
            </div>
          </div>

        </div>
      </div>

      <!-- Modal Alterar Forma de Pagamento -->
      <div v-if="showModalAlterarPagamento" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div class="bg-white rounded-xl max-w-md w-full p-6">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-xl font-bold text-gray-900">Alterar Forma de Pagamento</h3>
            <button @click="showModalAlterarPagamento = false" class="text-gray-500 hover:text-gray-700 text-2xl">×</button>
          </div>

          <div class="mb-4 p-4 bg-blue-50 rounded-lg">
            <p class="text-sm text-gray-700"><strong>Cliente:</strong> {{ pedidoSelecionado?.clients?.name }}</p>
            <p class="text-sm text-gray-700"><strong>Atual:</strong> {{ getPaymentMethodLabel(pedidoSelecionado?.payment_method) }}</p>
          </div>

          <form @submit.prevent="confirmarAlteracaoPagamento" class="space-y-4">
            <div>
              <label class="label">Nova Forma de Pagamento *</label>
              <select v-model="novaFormaPagamento" required class="input-field">
                <option value="pendente">⏳ Pendente</option>
                <option value="cash">💵 Dinheiro</option>
                <option value="pix">📱 PIX</option>
                <option value="boleto">📄 Boleto</option>
                <option value="credito">💳 Crediário</option>
              </select>
            </div>

            <div class="flex gap-3">
              <button type="button" @click="showModalAlterarPagamento = false" class="flex-1 btn-outline">Cancelar</button>
              <button type="submit" class="flex-1 btn-primary">Confirmar</button>
            </div>
          </form>
        </div>
      </div>

      <!-- Modal Consulta Cliente -->
      <div v-if="showModalConsultaCliente && authStore.isAdmin" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
        <div class="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div class="sticky top-0 bg-gradient-to-r from-primary-500 to-primary-600 px-6 py-4 flex items-center justify-between z-10">
            <h3 class="text-xl font-bold text-white">Consultar Cliente</h3>
            <button @click="closeModalConsultaCliente" class="text-white hover:bg-primary-700 p-2 rounded-lg transition-colors text-2xl">×</button>
          </div>
          
          <div class="p-6 space-y-4">
            <div>
              <label class="label">Buscar Cliente</label>
              <input v-model="buscaCliente" type="text" class="input-field" placeholder="Digite o nome do cliente" @input="buscarCliente" />
            </div>

            <div v-if="clienteSelecionadoConsulta" class="space-y-4">
              <div class="bg-gradient-to-r from-primary-50 to-primary-100 p-4 rounded-lg">
                <h4 class="font-bold text-lg text-gray-900">{{ clienteSelecionadoConsulta.name }}</h4>
                <p class="text-sm text-gray-600">{{ clienteSelecionadoConsulta.phone }}</p>
                <p class="text-sm text-gray-600">{{ clienteSelecionadoConsulta.address }}</p>
              </div>

              <div class="grid grid-cols-2 gap-4">
                <div class="card text-center">
                  <div class="text-3xl mb-2">💰</div>
                  <div class="text-2xl font-bold text-green-600">{{ formatCurrency(estatisticasCliente.totalComprado) }}</div>
                  <div class="text-sm text-gray-600">Total Comprado</div>
                </div>
                <div class="card text-center">
                  <div class="text-3xl mb-2">⏳</div>
                  <div class="text-2xl font-bold text-red-600">{{ formatCurrency(estatisticasCliente.totalDevido) }}</div>
                  <div class="text-sm text-gray-600">Total Devido</div>
                </div>
              </div>

              <div class="card">
                <h5 class="font-bold mb-3">Histórico de Pedidos</h5>
                <div class="space-y-2 max-h-60 overflow-y-auto">
                  <div v-for="pedido in historicoPedidosCliente" :key="pedido.id" class="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div class="flex-1">
                      <p class="font-semibold text-sm">{{ pedido.products?.name }}</p>
                      <p class="text-xs text-gray-600">{{ formatDate(pedido.date) }} - {{ getStatusLabel(pedido.status_entrega) }}</p>
                    </div>
                    <div class="text-right">
                      <p class="font-bold text-primary-600">{{ formatCurrency(pedido.total) }}</p>
                      <p class="text-xs text-gray-600">{{ getPaymentMethodLabel(pedido.payment_method) }}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div v-else-if="buscaCliente && clientesEncontrados.length > 0" class="space-y-2">
              <p class="text-sm text-gray-600 font-medium">Selecione um cliente:</p>
              <div v-for="cliente in clientesEncontrados" :key="cliente.id" @click="selecionarClienteConsulta(cliente)" class="p-4 bg-gray-50 hover:bg-gray-100 rounded-lg cursor-pointer transition-colors">
                <p class="font-semibold">{{ cliente.name }}</p>
                <p class="text-sm text-gray-600">{{ cliente.phone }}</p>
              </div>
            </div>

            <div v-else-if="buscaCliente && clientesEncontrados.length === 0" class="text-center py-8 text-gray-500">
              Nenhum cliente encontrado
            </div>

            <button @click="closeModalConsultaCliente" class="w-full btn-outline mt-4">Fechar</button>
          </div>
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
const clientes = ref([])
const produtos = ref([])
const vendedores = ref([])
const showModalCancelamento = ref(false)
const showModalNovoPedido = ref(false)
const showModalAlterarPagamento = ref(false)
const showModalConsultaCliente = ref(false)
const pedidoSelecionado = ref(null)
const novaFormaPagamento = ref('')
const loading = ref(false)
const buscaCliente = ref('')
const clientesEncontrados = ref([])
const clienteSelecionadoConsulta = ref(null)
const historicoPedidosCliente = ref([])
const estatisticasCliente = ref({ totalComprado: 0, totalDevido: 0 })

const filters = ref({
  date: '',
  status: 'pendente',
  cliente: '',
  vendedor: ''
})

const formCancelamento = ref({
  motivo: '',
  observacao: ''
})

const formPedido = ref({
  date: new Date().toISOString().split('T')[0],
  sale_type: 'retail',
  client_id: '',
  vendedor_id: '',
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

// CONSTANTES PARA OS RADIO BUTTONS
const paymentMethods = [
  { value: 'cash', label: '💵 Dinheiro', selectedClass: 'bg-green-500 text-white border-green-600' },
  { value: 'pix', label: '📱 PIX', selectedClass: 'bg-purple-500 text-white border-purple-600' },
  { value: 'card', label: '💳 Cartão', selectedClass: 'bg-pink-500 text-white border-pink-600' },
  { value: 'boleto', label: '📄 Boleto', selectedClass: 'bg-blue-500 text-white border-blue-600' },
  { value: 'credito', label: '💰 Crediário', selectedClass: 'bg-orange-500 text-white border-orange-600' }
]

const orderStatuses = [
  { value: 'pendente', label: '🕐 Pendente', selectedClass: 'bg-yellow-500 text-white border-yellow-600' },
  { value: 'em_rota', label: '🚚 Em Rota', selectedClass: 'bg-blue-500 text-white border-blue-600' },
  { value: 'entregue', label: '✅ Entregue', selectedClass: 'bg-green-500 text-white border-green-600' },
  { value: 'cancelado', label: '❌ Cancelado', selectedClass: 'bg-red-500 text-white border-red-600' }
]

const stats = computed(() => {
  return {
    pendentes: pedidos.value.filter(p => p.status_entrega === 'pendente').length,
    entregues: pedidos.value.filter(p => p.status_entrega === 'entregue').length,
    cancelados: pedidos.value.filter(p => p.status_entrega === 'cancelado').length
  }
})

const totalPedido = computed(() => {
  return formPedido.value.produtos.reduce((sum, item) => sum + (item.total || 0), 0)
})

const getTotalItemsForm = () => {
  return formPedido.value.produtos.length
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
    'entregue': 'Entregue',
    'cancelado': 'Cancelado'
  }
  return labels[status] || status
}

const getStatusBadge = (status) => {
  const badges = {
    'pendente': 'bg-yellow-100 text-yellow-700',
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
    'credito': 'Crediario'
  }
  return labels[method] || method
}

const getVendedorName = (vendedorId) => {
  if (!vendedorId) return 'Não informado'
  const vendedor = vendedores.value.find(v => v.id === vendedorId)
  return vendedor?.name || 'Não informado'
}

const adicionarProduto = () => {
  formPedido.value.produtos.push({
    product_id: '',
    quantity: 1,
    unit_price: 0,
    total: 0,
    is_weight: false
  })
}

const removerProduto = (index) => {
  if (formPedido.value.produtos.length > 1) {
    formPedido.value.produtos.splice(index, 1)
  }
}

const updatePriceItem = (index) => {
  const product = produtos.value.find(p => p.id === formPedido.value.produtos[index].product_id)
  if (product) {
    formPedido.value.produtos[index].unit_price = product.price
    formPedido.value.produtos[index].is_weight = product.sold_by_weight || false
    calculateTotalItem(index)
  }
}

const calculateTotalItem = (index) => {
  const item = formPedido.value.produtos[index]
  item.total = item.quantity * item.unit_price
}

const calculateExchangeTotal = () => {
  formPedido.value.exchange_total = formPedido.value.exchange_quantity * formPedido.value.exchange_value
}

const loadPedidos = async () => {
  try {
    let query = supabase
      .from('sales')
      .select('*, clients(name, phone, email, address), products(name, description), profiles!sales_vendedor_id_fkey(name)')
      .order('date', { ascending: false })

    if (filters.value.date) {
      query = query.eq('date', filters.value.date)
    }

    if (filters.value.status) {
      query = query.eq('status_entrega', filters.value.status)
    }

    if (filters.value.vendedor) {
      query = query.eq('vendedor_id', filters.value.vendedor)
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

const loadClientes = async () => {
  const { data } = await supabase.from('clients').select('*').eq('ativo', true).order('name')
  clientes.value = data || []
}

const loadProdutos = async () => {
  const { data } = await supabase.from('products').select('*').eq('active', true).order('name')
  produtos.value = data || []
}

const loadVendedores = async () => {
  const { data } = await supabase.from('profiles').select('*').eq('ativo', true).order('name')
  vendedores.value = data || []
}

const confirmarEntrega = async (pedido) => {
  if (!confirm('Confirmar entrega do pedido? Ele será automaticamente registrado em VENDAS.')) return

  try {
    const { error: updateError } = await supabase
      .from('sales')
      .update({
        status_entrega: 'entregue',
        data_entrega: new Date().toISOString(),
        paid: true
      })
      .eq('id', pedido.id)

    if (updateError) throw updateError

    alert('✅ Pedido entregue e registrado em vendas!')
    await loadPedidos()
  } catch (error) {
    console.error('Erro:', error)
    alert('Erro ao confirmar entrega: ' + error.message)
  }
}

const desfazerEntrega = async (pedido) => {
  if (!authStore.isAdmin) {
    alert('Apenas administradores podem desfazer entregas')
    return
  }

  if (!confirm('Tem certeza que deseja desfazer esta entrega? O pedido voltará para status PENDENTE.')) return

  try {
    const { error } = await supabase
      .from('sales')
      .update({
        status_entrega: 'pendente',
        data_entrega: null,
        paid: false
      })
      .eq('id', pedido.id)

    if (error) throw error

    alert('↩️ Entrega desfeita! Pedido voltou para PENDENTE.')
    await loadPedidos()
  } catch (error) {
    console.error('Erro:', error)
    alert('Erro ao desfazer entrega: ' + error.message)
  }
}

const abrirModalCancelamento = (pedido) => {
  pedidoSelecionado.value = pedido
  formCancelamento.value = {
    motivo: '',
    observacao: ''
  }
  showModalCancelamento.value = true
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

const closeModalCancelamento = () => {
  showModalCancelamento.value = false
  pedidoSelecionado.value = null
}

const salvarNovoPedido = async () => {
  loading.value = true
  try {
    if (formPedido.value.produtos.length === 0) {
      alert('Adicione pelo menos um produto ao pedido')
      loading.value = false
      return
    }

    if (!formPedido.value.vendedor_id) {
      alert('Selecione o vendedor responsável pelo pedido')
      loading.value = false
      return
    }

    if (formPedido.value.is_event && !formPedido.value.event_name) {
      alert('Informe o nome/tipo do evento')
      loading.value = false
      return
    }

    if (formPedido.value.has_exchange && !formPedido.value.exchange_product) {
      alert('Descreva o produto da troca')
      loading.value = false
      return
    }

    const produtosData = formPedido.value.produtos.map(item => {
      const product = produtos.value.find(p => p.id === item.product_id)
      return {
        id: item.product_id,
        name: product?.name || '',
        quantity: item.quantity,
        unit_price: item.unit_price,
        total: item.total
      }
    })

    const primeiroProduto = formPedido.value.produtos[0]
    
    const pedidoData = {
      date: formPedido.value.date,
      sale_type: formPedido.value.sale_type,
      client_id: formPedido.value.client_id,
      product_id: primeiroProduto.product_id,
      quantity: primeiroProduto.quantity,
      unit_price: primeiroProduto.unit_price,
      total: totalPedido.value,
      payment_method: formPedido.value.payment_method,
      paid: formPedido.value.paid,
      notes: formPedido.value.notes,
      order_status: formPedido.value.order_status,
      status_entrega: 'pendente',
      is_event: formPedido.value.is_event,
      event_name: formPedido.value.event_name || null,
      has_exchange: formPedido.value.has_exchange,
      exchange_product: formPedido.value.exchange_product || null,
      exchange_quantity: formPedido.value.exchange_quantity || null,
      exchange_value: formPedido.value.exchange_value || null,
      exchange_total: formPedido.value.exchange_total || null,
      products_data: JSON.stringify(produtosData),
      vendedor_id: formPedido.value.vendedor_id,
      created_by: authStore.user.id
    }

    const { error } = await supabase.from('sales').insert([pedidoData])

    if (error) throw error

    // Deduzir estoque
    for (const item of formPedido.value.produtos) {
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

    alert('✅ Pedido criado com sucesso!')
    closeModalNovoPedido()
    await loadPedidos()
  } catch (error) {
    console.error('Erro:', error)
    alert('Erro ao criar pedido: ' + error.message)
  } finally {
    loading.value = false
  }
}

const closeModalNovoPedido = () => {
  showModalNovoPedido.value = false
  document.body.classList.remove('modal-open')
  
  formPedido.value = {
    date: new Date().toISOString().split('T')[0],
    sale_type: 'retail',
    client_id: '',
    vendedor_id: '',
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

const alterarFormaPagamento = (pedido) => {
  pedidoSelecionado.value = pedido
  novaFormaPagamento.value = pedido.payment_method
  showModalAlterarPagamento.value = true
}

const confirmarAlteracaoPagamento = async () => {
  try {
    const { error } = await supabase
      .from('sales')
      .update({ payment_method: novaFormaPagamento.value })
      .eq('id', pedidoSelecionado.value.id)

    if (error) throw error

    alert('✅ Forma de pagamento alterada!')
    showModalAlterarPagamento.value = false
    await loadPedidos()
  } catch (error) {
    console.error('Erro:', error)
    alert('Erro ao alterar forma de pagamento: ' + error.message)
  }
}

const buscarCliente = async () => {
  if (buscaCliente.value.length < 2) {
    clientesEncontrados.value = []
    clienteSelecionadoConsulta.value = null
    return
  }

  const { data } = await supabase
    .from('clients')
    .select('*')
    .ilike('name', `%${buscaCliente.value}%`)
    .eq('ativo', true)
    .limit(10)

  clientesEncontrados.value = data || []
}

const selecionarClienteConsulta = async (cliente) => {
  clienteSelecionadoConsulta.value = cliente
  
  const { data: pedidosData } = await supabase
    .from('sales')
    .select('*, products(name)')
    .eq('client_id', cliente.id)
    .order('date', { ascending: false })

  historicoPedidosCliente.value = pedidosData || []

  const totalComprado = pedidosData?.reduce((sum, p) => sum + p.total, 0) || 0
  const totalDevido = pedidosData?.filter(p => !p.paid).reduce((sum, p) => sum + p.total, 0) || 0

  estatisticasCliente.value = { totalComprado, totalDevido }
}

const closeModalConsultaCliente = () => {
  showModalConsultaCliente.value = false
  buscaCliente.value = ''
  clientesEncontrados.value = []
  clienteSelecionadoConsulta.value = null
  historicoPedidosCliente.value = []
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
}

onMounted(() => {
  loadPedidos()
  loadClientes()
  loadProdutos()
  loadVendedores()
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

.btn-secondary {
  @apply px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-md;
}

.btn-outline {
  @apply px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium;
}

/* 🔥 ESTILOS CRÍTICOS PARA O MODAL NO MOBILE */
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

.modal-content-mobile {
  scroll-behavior: smooth;
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
}

.modal-container-mobile {
  animation: slideUp 0.3s ease-out;
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

@media (min-width: 768px) {
  .modal-container-mobile {
    animation: scaleIn 0.3s ease-out;
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
</style>
