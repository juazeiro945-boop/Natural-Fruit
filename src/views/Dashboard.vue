<template>
  <Layout>
    <div class="space-y-6 pb-20 md:pb-6">
      <!-- Header com Filtros -->
      <div class="flex flex-col md:flex-row md:items-center md:justify-between">
        <div class="flex items-center space-x-4">
          <img src="/natural-fruit-logo-192.jpg" alt="Natural Fruit" class="w-20 h-20 md:w-24 md:h-24 rounded-2xl shadow-lg border-4 border-primary-200">
          <div>
            <h2 class="text-2xl md:text-3xl font-bold text-gray-900">Dashboard</h2>
            <p class="text-gray-600 mt-1">Bem-vindo, {{ authStore.userName }}!</p>
          </div>
        </div>
        
        <div class="flex items-center space-x-4 mt-4 md:mt-0">
          <!-- Filtro de Período -->
          <div class="flex items-center space-x-3 bg-white rounded-xl shadow-sm border border-gray-200 px-4 py-2">
            <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
            </svg>
            <select v-model="period" @change="handlePeriodChange" class="border-0 focus:ring-0 text-sm font-medium text-gray-700 bg-transparent">
              <option value="today">Hoje</option>
              <option value="yesterday">Ontem</option>
              <option value="week">Esta Semana</option>
              <option value="month">Este Mês</option>
            </select>
          </div>

          <!-- Data e Hora -->
          <div class="bg-white rounded-xl shadow-md px-6 py-3 border border-gray-200">
            <div class="flex items-center space-x-3">
              <div class="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
                <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <div>
                <p class="text-2xl font-bold text-gray-900">{{ currentTime }}</p>
                <p class="text-sm text-gray-600">{{ currentDate }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="space-y-6">
        <!-- Skeleton para Cards -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div v-for="n in 4" :key="n" class="bg-white rounded-2xl shadow-lg p-6 animate-pulse">
            <div class="flex space-x-4">
              <div class="w-12 h-12 bg-gray-300 rounded-xl"></div>
              <div class="flex-1 space-y-3">
                <div class="h-4 bg-gray-300 rounded w-3/4"></div>
                <div class="h-6 bg-gray-300 rounded w-1/2"></div>
                <div class="h-3 bg-gray-200 rounded w-full"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Skeleton para Gráficos -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div v-for="n in 2" :key="n" class="bg-white rounded-2xl shadow-lg p-6 animate-pulse">
            <div class="h-6 bg-gray-300 rounded w-1/3 mb-4"></div>
            <div class="space-y-4">
              <div v-for="n in 3" :key="n" class="flex items-center space-x-3">
                <div class="w-10 h-10 bg-gray-300 rounded-lg"></div>
                <div class="flex-1 space-y-2">
                  <div class="h-4 bg-gray-300 rounded w-1/2"></div>
                  <div class="h-3 bg-gray-200 rounded w-3/4"></div>
                </div>
                <div class="h-6 bg-gray-300 rounded w-16"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Conteúdo Principal -->
      <div v-else>
        <!-- Cards de Resumo -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <!-- Card Produção -->
          <div class="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100">
            <div class="p-6">
              <div class="flex items-center justify-between mb-4">
                <div class="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                  <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                  </svg>
                </div>
                <div class="text-right">
                  <div class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                    {{ periodLabel }}
                  </div>
                </div>
              </div>
              <div>
                <p class="text-gray-500 text-sm font-medium mb-1">Total Produzido</p>
                <p class="text-3xl font-bold text-gray-900 mb-1">{{ stats.totalProduced }}</p>
                <p class="text-xs text-gray-400">unidades produzidas</p>
              </div>
            </div>
            <div class="bg-gradient-to-r from-blue-50 to-blue-100 px-6 py-3">
              <div class="flex items-center justify-between text-xs">
                <span class="text-blue-700 font-medium">Eficiência</span>
                <span :class="metrics.efficiency >= 90 ? 'text-green-600' : metrics.efficiency >= 80 ? 'text-orange-600' : 'text-red-600'">
                  {{ metrics.efficiency }}%
                </span>
              </div>
            </div>
          </div>

          <!-- Card Vendas -->
          <div class="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100">
            <div class="p-6">
              <div class="flex items-center justify-between mb-4">
                <div class="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
                  <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                </div>
                <div class="text-right">
                  <div :class="[
                    'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium',
                    salesTrend >= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  ]">
                    <svg v-if="salesTrend >= 0" class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clip-rule="evenodd"/>
                    </svg>
                    <svg v-else class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                    </svg>
                    {{ Math.abs(salesTrend) }}%
                  </div>
                </div>
              </div>
              <div>
                <p class="text-gray-500 text-sm font-medium mb-1">Total Vendido</p>
                <p class="text-3xl font-bold text-gray-900 mb-1">{{ formatCurrency(stats.totalSales) }}</p>
                <p class="text-xs text-gray-400">{{ stats.totalSalesCount }} vendas</p>
              </div>
            </div>
            <div class="bg-gradient-to-r from-green-50 to-green-100 px-6 py-3">
              <div class="flex items-center justify-between text-xs">
                <span class="text-green-700 font-medium">Ticket Médio</span>
                <span class="text-green-600">{{ formatCurrency(metrics.avgProductValue) }}</span>
              </div>
            </div>
          </div>

          <!-- Card Perdas -->
          <div class="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100">
            <div class="p-6">
              <div class="flex items-center justify-between mb-4">
                <div class="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg">
                  <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6"></path>
                  </svg>
                </div>
                <div class="text-right">
                  <div :class="[
                    'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium',
                    stats.lossPercentage <= 5 ? 'bg-orange-100 text-orange-700' : 'bg-red-100 text-red-700'
                  ]">
                    {{ stats.lossPercentage }}%
                  </div>
                </div>
              </div>
              <div>
                <p class="text-gray-500 text-sm font-medium mb-1">Perdas</p>
                <p class="text-3xl font-bold text-gray-900 mb-1">{{ stats.totalLoss }}</p>
                <p class="text-xs text-red-600 font-semibold">{{ formatCurrency(stats.lossValue) }}</p>
              </div>
            </div>
            <div class="bg-gradient-to-r from-red-50 to-red-100 px-6 py-3">
              <div class="flex items-center justify-between text-xs">
                <span class="text-red-700 font-medium">Impacto</span>
                <span :class="stats.lossPercentage > 5 ? 'text-red-600 font-semibold' : 'text-orange-600'">
                  {{ stats.lossPercentage > 5 ? '⚠ Alto' : '● Controlado' }}
                </span>
              </div>
            </div>
          </div>

          <!-- Card Trocas -->
          <div class="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100">
            <div class="p-6">
              <div class="flex items-center justify-between mb-4">
                <div class="w-12 h-12 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl flex items-center justify-center shadow-lg">
                  <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"></path>
                  </svg>
                </div>
                <div class="text-right">
                  <div class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
                    {{ stats.exchangePercentage }}%
                  </div>
                </div>
              </div>
              <div>
                <p class="text-gray-500 text-sm font-medium mb-1">Trocas</p>
                <p class="text-3xl font-bold text-gray-900 mb-1">{{ stats.totalExchange }}</p>
                <p class="text-xs text-amber-600 font-semibold">{{ formatCurrency(stats.exchangeValue) }}</p>
              </div>
            </div>
            <div class="bg-gradient-to-r from-amber-50 to-amber-100 px-6 py-3">
              <div class="flex items-center justify-between text-xs">
                <span class="text-amber-700 font-medium">Status</span>
                <span class="text-amber-600">● {{ stats.totalExchange > 0 ? 'Com Trocas' : 'Sem Trocas' }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Vendas por Forma de Pagamento e Top Produtos -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <!-- Vendas por Pagamento -->
          <div class="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <div class="bg-gradient-to-r from-gray-50 to-white px-6 py-4 border-b border-gray-100">
              <div class="flex items-center justify-between">
                <div>
                  <h3 class="text-lg font-bold text-gray-900">Formas de Pagamento</h3>
                  <p class="text-sm text-gray-500 mt-0.5">Distribuição de receitas</p>
                </div>
                <div class="flex items-center space-x-2">
                  <button @click="exportPaymentReport" class="p-2 hover:bg-gray-100 rounded-lg transition-colors" title="Exportar relatório">
                    <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                    </svg>
                  </button>
                  <div class="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                    <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path>
                    </svg>
                  </div>
                </div>
              </div>
            </div>
            <div class="p-6 space-y-4">
              <div v-for="payment in paymentMethods" :key="payment.type" 
                   :class="[
                     'group p-4 rounded-xl transition-all duration-200 border-2',
                     payment.type === 'pending' ? 'border-red-200 bg-red-50 hover:bg-red-100' : 'border-transparent hover:border-gray-200 hover:bg-gray-50'
                   ]">
                <div class="flex items-center justify-between mb-2">
                  <div class="flex items-center space-x-3">
                    <div :class="payment.iconClass" class="w-10 h-10 rounded-lg flex items-center justify-center shadow-md">
                      <component :is="payment.icon" class="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p class="font-semibold text-gray-900">{{ payment.name }}</p>
                      <p class="text-xs" :class="payment.type === 'pending' ? 'text-red-600 font-medium' : 'text-gray-500'">
                        {{ payment.description }}
                      </p>
                    </div>
                  </div>
                  <div class="text-right">
                    <p :class="[
                      'text-xl font-bold',
                      payment.type === 'pending' ? 'text-red-600' : 'text-gray-900'
                    ]">
                      {{ formatCurrency(payment.value) }}
                    </p>
                    <p v-if="payment.type !== 'pending'" class="text-xs font-medium" :class="payment.percentageClass">
                      {{ payment.percentage }}%
                    </p>
                    <p v-else class="text-xs text-red-600 font-semibold">
                      {{ stats.pendingSales.length }} venda(s)
                    </p>
                  </div>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-2">
                  <div :class="payment.barClass" 
                       class="h-2 rounded-full transition-all duration-500"
                       :style="`width: ${payment.type === 'pending' ? 100 : payment.percentage}%`"></div>
                </div>
              </div>
            </div>
          </div>

          <!-- Produtos Mais Vendidos -->
          <div class="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <div class="bg-gradient-to-r from-gray-50 to-white px-6 py-4 border-b border-gray-100">
              <div class="flex items-center justify-between">
                <div>
                  <h3 class="text-lg font-bold text-gray-900">Top Produtos</h3>
                  <p class="text-sm text-gray-500 mt-0.5">Mais vendidos {{ periodLabel.toLowerCase() }}</p>
                </div>
                <div class="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center">
                  <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
                  </svg>
                </div>
              </div>
            </div>
            <div class="p-6 space-y-3">
              <div
                v-for="(product, index) in stats.topProducts"
                :key="product.id"
                class="group hover:bg-gray-50 p-4 rounded-xl transition-all duration-200 border border-transparent hover:border-gray-200"
              >
                <div class="flex items-center space-x-4">
                  <div class="relative">
                    <div :class="getRankColor(index)" class="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg">
                      <span class="text-white font-bold text-lg">#{{ index + 1 }}</span>
                    </div>
                    <div v-if="index === 0" class="absolute -top-1 -right-1 w-5 h-5 bg-yellow-400 rounded-full flex items-center justify-center">
                      <span class="text-xs">👑</span>
                    </div>
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="font-semibold text-gray-900 truncate">{{ product.name }}</p>
                    <p class="text-sm text-gray-500">{{ product.quantity }} unidades vendidas</p>
                  </div>
                  <div class="text-right">
                    <p class="font-bold text-gray-900">{{ formatCurrency(product.total) }}</p>
                    <p class="text-xs text-primary-600 font-medium">● {{ getPerformanceText(index) }}</p>
                  </div>
                </div>
              </div>
              
              <!-- Empty State Melhorado -->
              <div v-if="stats.topProducts.length === 0" class="text-center py-12">
                <div class="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg class="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"/>
                  </svg>
                </div>
                <h3 class="text-lg font-semibold text-gray-900 mb-2">Nenhuma venda {{ periodLabel.toLowerCase() }}</h3>
                <p class="text-gray-500 text-sm mb-4">As vendas {{ periodLabel.toLowerCase() }} aparecerão aqui</p>
                <button @click="$router.push('/vendas')" class="inline-flex items-center px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg transition-colors">
                  <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
                  </svg>
                  Registrar Primeira Venda
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Vendas Pendentes -->
        <div v-if="stats.pendingSales.length > 0" class="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div class="bg-gradient-to-r from-red-50 to-orange-50 px-6 py-4 border-b border-red-100">
            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-3">
                <div class="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center">
                  <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                  </svg>
                </div>
                <div>
                  <h3 class="text-lg font-bold text-gray-900">Pagamentos Pendentes</h3>
                  <p class="text-sm text-red-600 font-medium">{{ stats.pendingSales.length }} venda(s) aguardando pagamento</p>
                </div>
              </div>
              <div class="flex items-center space-x-2">
                <div class="animate-pulse w-2 h-2 bg-red-500 rounded-full"></div>
                <span class="text-sm font-medium text-red-600">Ação necessária</span>
              </div>
            </div>
          </div>
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead class="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th class="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Cliente</th>
                  <th class="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Produto</th>
                  <th class="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Valor</th>
                  <th class="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Data</th>
                  <th class="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200">
                <tr v-for="sale in stats.pendingSales" :key="sale.id" class="hover:bg-gray-50 transition-colors">
                  <td class="px-6 py-4">
                    <div class="flex items-center space-x-3">
                      <div class="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center">
                        <span class="text-white font-bold text-sm">{{ sale.client_name?.charAt(0) || 'C' }}</span>
                      </div>
                      <div>
                        <p class="font-semibold text-gray-900">{{ sale.client_name || 'Cliente não identificado' }}</p>
                        <p class="text-xs text-gray-500">Cliente</p>
                      </div>
                    </div>
                  </td>
                  <td class="px-6 py-4">
                    <p class="text-sm text-gray-900">{{ sale.product_name || 'Produto não especificado' }}</p>
                  </td>
                  <td class="px-6 py-4">
                    <p class="font-bold text-lg text-gray-900">{{ formatCurrency(sale.total) }}</p>
                  </td>
                  <td class="px-6 py-4">
                    <p class="text-sm text-gray-600">{{ formatDate(sale.date) }}</p>
                  </td>
                  <td class="px-6 py-4">
                    <div class="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold bg-red-100 text-red-700">
                      <span class="w-1.5 h-1.5 bg-red-600 rounded-full mr-2 animate-pulse"></span>
                      Pendente
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="bg-gradient-to-r from-red-50 to-orange-50 px-6 py-4 border-t border-red-100">
            <div class="flex items-center justify-between">
              <p class="text-sm text-gray-700">
                <span class="font-semibold text-red-600">{{ stats.pendingSales.length }}</span> pagamento(s) totalizando 
                <span class="font-semibold text-red-600">{{ formatCurrency(stats.salesByPayment.pending) }}</span>
              </p>
              <div class="flex items-center space-x-3">
                <button @click="exportPendingReport" class="inline-flex items-center px-4 py-2 bg-white hover:bg-gray-50 text-gray-700 text-sm font-medium rounded-lg border border-gray-300 transition-colors">
                  <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                  </svg>
                  Exportar
                </button>
                <button @click="notifyClients" class="inline-flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors">
                  <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
                  </svg>
                  Notificar clientes
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Métricas Avançadas -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div class="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <div class="flex items-center space-x-3 mb-4">
              <div class="w-10 h-10 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg flex items-center justify-center">
                <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
                </svg>
              </div>
              <div>
                <h4 class="font-semibold text-gray-900">Eficiência</h4>
                <p class="text-sm text-gray-500">Produção vs Perdas</p>
              </div>
            </div>
            <div class="text-center">
              <div class="text-3xl font-bold text-gray-900 mb-2">{{ metrics.efficiency }}%</div>
              <div class="w-full bg-gray-200 rounded-full h-2">
                <div :class="[
                  'h-2 rounded-full transition-all duration-500',
                  metrics.efficiency >= 90 ? 'bg-green-500' : 
                  metrics.efficiency >= 80 ? 'bg-orange-500' : 'bg-red-500'
                ]" :style="`width: ${metrics.efficiency}%`"></div>
              </div>
            </div>
          </div>

          <div class="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <div class="flex items-center space-x-3 mb-4">
              <div class="w-10 h-10 bg-gradient-to-br from-teal-500 to-teal-600 rounded-lg flex items-center justify-center">
                <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6-6"/>
                </svg>
              </div>
              <div>
                <h4 class="font-semibold text-gray-900">Ticket Médio</h4>
                <p class="text-sm text-gray-500">Por venda</p>
              </div>
            </div>
            <div class="text-center">
              <div class="text-3xl font-bold text-gray-900">{{ formatCurrency(metrics.avgProductValue) }}</div>
              <p class="text-sm text-gray-500 mt-1">por transação</p>
            </div>
          </div>

          <div class="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <div class="flex items-center space-x-3 mb-4">
              <div class="w-10 h-10 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-lg flex items-center justify-center">
                <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
                </svg>
              </div>
              <div>
                <h4 class="font-semibold text-gray-900">Clientes</h4>
                <p class="text-sm text-gray-500">Ativos {{ periodLabel.toLowerCase() }}</p>
              </div>
            </div>
            <div class="text-center">
              <div class="text-3xl font-bold text-gray-900">{{ metrics.uniqueClients }}</div>
              <p class="text-sm text-gray-500 mt-1">clientes diferentes</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Notificação de Erro -->
      <div v-if="error" class="fixed bottom-4 right-4 bg-red-500 text-white p-4 rounded-lg shadow-lg max-w-sm animate-fade-in">
        <div class="flex items-center space-x-3">
          <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          <div>
            <p class="font-semibold">Erro ao carregar dados</p>
            <p class="text-sm opacity-90">{{ error }}</p>
          </div>
          <button @click="error = ''" class="p-1 hover:bg-red-600 rounded transition-colors">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  </Layout>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useAuthStore } from '../stores/auth'
import { supabase } from '../lib/supabase'
import Layout from '../components/Layout.vue'
import { debounce } from 'lodash-es'

const authStore = useAuthStore()
const currentTime = ref('')
const currentDate = ref('')
const loading = ref(true)
const error = ref('')
const period = ref('today')
let timeInterval = null
let realtimeSubscription = null

// Cache para otimização
const cachedData = ref(null)

const stats = ref({
  totalProduced: 0,
  totalSales: 0,
  totalSalesCount: 0,
  totalLoss: 0,
  totalExchange: 0,
  lossPercentage: 0,
  exchangePercentage: 0,
  lossValue: 0,
  exchangeValue: 0,
  salesByPayment: {
    cash: 0,
    pix: 0,
    boleto: 0,
    pending: 0
  },
  topProducts: [],
  pendingSales: []
})

const metrics = ref({
  efficiency: 0,
  avgProductValue: 0,
  uniqueClients: 0,
  salesTrend: 0
})

// Computed properties
const periodLabel = computed(() => {
  const labels = {
    today: 'Hoje',
    yesterday: 'Ontem',
    week: 'Esta Semana',
    month: 'Este Mês'
  }
  return labels[period.value] || 'Hoje'
})

const salesTrend = computed(() => metrics.value.salesTrend)

const paymentMethods = computed(() => {
  const totalPaid = stats.value.salesByPayment.cash + stats.value.salesByPayment.pix + stats.value.salesByPayment.boleto
  const totalSales = totalPaid + stats.value.salesByPayment.pending
  
  return [
    {
      type: 'cash',
      name: 'Dinheiro',
      description: 'Pagamento em espécie',
      value: stats.value.salesByPayment.cash,
      percentage: totalPaid > 0 ? ((stats.value.salesByPayment.cash / totalPaid) * 100).toFixed(1) : 0,
      icon: 'CashIcon',
      iconClass: 'bg-gradient-to-br from-green-500 to-green-600',
      percentageClass: 'text-green-600',
      barClass: 'bg-gradient-to-r from-green-500 to-green-600'
    },
    {
      type: 'pix',
      name: 'PIX',
      description: 'Transferência instantânea',
      value: stats.value.salesByPayment.pix,
      percentage: totalPaid > 0 ? ((stats.value.salesByPayment.pix / totalPaid) * 100).toFixed(1) : 0,
      icon: 'PixIcon',
      iconClass: 'bg-gradient-to-br from-purple-500 to-purple-600',
      percentageClass: 'text-purple-600',
      barClass: 'bg-gradient-to-r from-purple-500 to-purple-600'
    },
    {
      type: 'boleto',
      name: 'Boleto',
      description: 'Pagamento bancário',
      value: stats.value.salesByPayment.boleto,
      percentage: totalPaid > 0 ? ((stats.value.salesByPayment.boleto / totalPaid) * 100).toFixed(1) : 0,
      icon: 'BoletoIcon',
      iconClass: 'bg-gradient-to-br from-blue-500 to-blue-600',
      percentageClass: 'text-blue-600',
      barClass: 'bg-gradient-to-r from-blue-500 to-blue-600'
    },
    {
      type: 'pending',
      name: 'A Receber',
      description: 'Pagamento pendente',
      value: stats.value.salesByPayment.pending,
      percentage: 0,
      icon: 'PendingIcon',
      iconClass: 'bg-gradient-to-br from-red-500 to-red-600',
      percentageClass: 'text-red-600',
      barClass: 'bg-gradient-to-r from-red-500 to-red-600 animate-pulse'
    }
  ]
})

// Icon components
const CashIcon = {
  template: `<svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"></path>
  </svg>`
}

const PixIcon = {
  template: `<svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
  </svg>`
}

const BoletoIcon = {
  template: `<svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
  </svg>`
}

const PendingIcon = {
  template: `<svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
  </svg>`
}

// Date and time handling
const updateDateTime = () => {
  const now = new Date()
  currentTime.value = now.toLocaleTimeString('pt-BR', { 
    hour: '2-digit', 
    minute: '2-digit'
  })
  currentDate.value = now.toLocaleDateString('pt-BR', { 
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

// Utility functions
const formatCurrency = (value) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value || 0)
}

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('pt-BR')
}

const getRankColor = (index) => {
  const colors = [
    'bg-gradient-to-br from-yellow-500 to-yellow-600',
    'bg-gradient-to-br from-gray-400 to-gray-500',
    'bg-gradient-to-br from-orange-600 to-orange-700',
    'bg-gradient-to-br from-blue-500 to-blue-600',
    'bg-gradient-to-br from-purple-500 to-purple-600'
  ]
  return colors[index] || 'bg-gradient-to-br from-gray-500 to-gray-600'
}

const getPerformanceText = (index) => {
  const texts = ['Excelente', 'Ótimo', 'Bom', 'Regular', 'Básico']
  return texts[index] || 'Normal'
}

const getDateRange = () => {
  const now = new Date()
  const today = now.toISOString().split('T')[0]
  
  switch (period.value) {
    case 'yesterday':
      const yesterday = new Date(now)
      yesterday.setDate(yesterday.getDate() - 1)
      return yesterday.toISOString().split('T')[0]
    
    case 'week':
      const weekAgo = new Date(now)
      weekAgo.setDate(weekAgo.getDate() - 7)
      return {
        start: weekAgo.toISOString().split('T')[0],
        end: today
      }
    
    case 'month':
      const monthAgo = new Date(now)
      monthAgo.setMonth(monthAgo.getMonth() - 1)
      return {
        start: monthAgo.toISOString().split('T')[0],
        end: today
      }
    
    default:
      return today
  }
}

// Data loading with error handling and caching
const loadData = debounce(async () => {
  loading.value = true
  error.value = ''
  
  const dateRange = getDateRange()
  const cacheKey = `${period.value}-${JSON.stringify(dateRange)}`
  
  // Check cache
  if (cachedData.value?.key === cacheKey && 
      cachedData.value?.timestamp > Date.now() - 5 * 60 * 1000) {
    stats.value = cachedData.value.stats
    metrics.value = cachedData.value.metrics
    loading.value = false
    return
  }

  try {
    await Promise.all([
      loadProductionData(dateRange),
      loadSalesData(dateRange),
      loadMetrics(dateRange)
    ])

    // Update cache
    cachedData.value = {
      key: cacheKey,
      timestamp: Date.now(),
      stats: { ...stats.value },
      metrics: { ...metrics.value }
    }

  } catch (err) {
    console.error('Erro ao carregar dados:', err)
    error.value = err.message || 'Erro ao carregar dados do dashboard'
  } finally {
    loading.value = false
  }
}, 300)

const loadProductionData = async (dateRange) => {
  let query = supabase.from('production').select('*')
  
  if (typeof dateRange === 'object') {
    query = query.gte('date', dateRange.start).lte('date', dateRange.end)
  } else {
    query = query.eq('date', dateRange)
  }

  const { data: production, error: productionError } = await query

  if (productionError) throw productionError

  if (production) {
    const totalProduced = production.reduce((sum, p) => sum + (p.quantity || 0), 0)
    const totalLoss = production.reduce((sum, p) => sum + (p.loss || 0), 0)
    const totalExchange = production.reduce((sum, p) => sum + (p.exchange || 0), 0)
    const totalLossValue = production.reduce((sum, p) => sum + (p.loss_value || 0), 0)
    const totalExchangeValue = production.reduce((sum, p) => sum + (p.exchange_value || 0), 0)

    stats.value.totalProduced = totalProduced
    stats.value.totalLoss = totalLoss
    stats.value.totalExchange = totalExchange
    stats.value.lossValue = totalLossValue
    stats.value.exchangeValue = totalExchangeValue
    stats.value.lossPercentage = totalProduced > 0 ? ((totalLoss / totalProduced) * 100).toFixed(1) : 0
    stats.value.exchangePercentage = totalProduced > 0 ? ((totalExchange / totalProduced) * 100).toFixed(1) : 0
  }
}

const loadSalesData = async (dateRange) => {
  let query = supabase
    .from('sales')
    .select(`
      *,
      clients (name),
      products (name)
    `)
  
  if (typeof dateRange === 'object') {
    query = query.gte('date', dateRange.start).lte('date', dateRange.end)
  } else {
    query = query.eq('date', dateRange)
  }

  const { data: sales, error: salesError } = await query

  if (salesError) throw salesError

  if (sales) {
    stats.value.totalSales = sales.reduce((sum, s) => sum + (s.total || 0), 0)
    stats.value.totalSalesCount = sales.length
    
    const paidSales = sales.filter(s => s.paid)
    stats.value.salesByPayment = {
      cash: paidSales.filter(s => s.payment_method === 'cash').reduce((sum, s) => sum + s.total, 0),
      pix: paidSales.filter(s => s.payment_method === 'pix').reduce((sum, s) => sum + s.total, 0),
      boleto: paidSales.filter(s => s.payment_method === 'boleto').reduce((sum, s) => sum + s.total, 0),
      pending: sales.filter(s => !s.paid).reduce((sum, s) => sum + s.total, 0)
    }

    stats.value.pendingSales = sales
      .filter(s => !s.paid)
      .map(s => ({
        ...s,
        client_name: s.clients?.name || 'Cliente não identificado',
        product_name: s.products?.name || 'Produto não especificado'
      }))

    // Top products
    const productMap = {}
    sales.forEach(item => {
      const id = item.product_id
      if (!productMap[id]) {
        productMap[id] = {
          id,
          name: item.products?.name || 'Produto',
          quantity: 0,
          total: 0
        }
      }
      productMap[id].quantity += item.quantity || 0
      productMap[id].total += item.total || 0
    })

    stats.value.topProducts = Object.values(productMap)
      .sort((a, b) => b.total - a.total)
      .slice(0, 5)
  }
}

const loadMetrics = async (dateRange) => {
  // Calculate efficiency
  if (stats.value.totalProduced > 0) {
    metrics.value.efficiency = ((stats.value.totalProduced - stats.value.totalLoss) / stats.value.totalProduced * 100).toFixed(1)
  }

  // Calculate average product value
  if (stats.value.totalSalesCount > 0) {
    metrics.value.avgProductValue = stats.value.totalSales / stats.value.totalSalesCount
  }

  // Calculate unique clients (you'll need to implement this based on your data)
  metrics.value.uniqueClients = await calculateUniqueClients(dateRange)

  // Calculate sales trend (simplified - you might want to compare with previous period)
  metrics.value.salesTrend = await calculateSalesTrend(dateRange)
}

const calculateUniqueClients = async (dateRange) => {
  // Implement based on your client data structure
  return Math.floor(Math.random() * 20) + 5 // Placeholder
}

const calculateSalesTrend = async (dateRange) => {
  // Implement comparison with previous period
  return 12.5 // Placeholder - 12.5% growth
}

// Real-time updates
const setupRealtimeSubscription = () => {
  realtimeSubscription = supabase
    .channel('dashboard-changes')
    .on('postgres_changes', 
      { event: '*', schema: 'public', table: 'sales' },
      () => {
        // Invalidate cache and reload
        cachedData.value = null
        loadData()
      }
    )
    .on('postgres_changes',
      { event: '*', schema: 'public', table: 'production' },
      () => {
        cachedData.value = null
        loadData()
      }
    )
    .subscribe()
}

// Export functions
const exportPaymentReport = () => {
  const data = {
    period: periodLabel.value,
    date: new Date().toLocaleDateString('pt-BR'),
    paymentMethods: paymentMethods.value,
    totalSales: stats.value.totalSales
  }
  
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `relatorio-pagamentos-${new Date().toISOString().split('T')[0]}.json`
  a.click()
  URL.revokeObjectURL(url)
}

const exportPendingReport = () => {
  const data = {
    period: periodLabel.value,
    date: new Date().toLocaleDateString('pt-BR'),
    pendingSales: stats.value.pendingSales,
    totalPending: stats.value.salesByPayment.pending
  }
  
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `relatorio-pendentes-${new Date().toISOString().split('T')[0]}.json`
  a.click()
  URL.revokeObjectURL(url)
}

const notifyClients = () => {
  // Implement client notification logic
  alert(`Notificando ${stats.value.pendingSales.length} clientes sobre pagamentos pendentes...`)
}

// Event handlers
const handlePeriodChange = () => {
  cachedData.value = null
  loadData()
}

// Lifecycle
onMounted(() => {
  updateDateTime()
  timeInterval = setInterval(updateDateTime, 1000)
  loadData()
  setupRealtimeSubscription()
})

onUnmounted(() => {
  if (timeInterval) {
    clearInterval(timeInterval)
  }
  if (realtimeSubscription) {
    realtimeSubscription.unsubscribe()
  }
  loadData.cancel()
})
</script>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>