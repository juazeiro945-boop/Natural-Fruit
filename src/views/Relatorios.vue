<template>
  <Layout>
    <div class="space-y-6 pb-20 md:pb-6">
      <h2 class="text-2xl md:text-3xl font-bold text-gray-900">Relatórios</h2>

      <div class="card">
        <h3 class="text-lg font-bold mb-4">Filtros</h3>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label class="label">Data Inicial</label>
            <input v-model="filters.startDate" type="date" class="input-field" />
          </div>
          <div>
            <label class="label">Data Final</label>
            <input v-model="filters.endDate" type="date" class="input-field" />
          </div>
          <div>
            <label class="label">Tipo de Relatório</label>
            <select v-model="filters.type" class="input-field" @change="resetFilters">
              <option value="sales">Vendas</option>
              <option value="production">Produção</option>
              <option value="losses">Perdas e Trocas</option>
              <option value="clients">Clientes</option>
              <option value="payment">Formas de Pagamento</option>
            </select>
          </div>
        </div>

        <!-- Filtros Adicionais para Vendas e Pagamento -->
        <div v-if="filters.type === 'sales' || filters.type === 'payment'" class="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-200">
          <div>
            <label class="label">Tipo de Venda</label>
            <select v-model="filters.saleType" class="input-field">
              <option value="all">Todos</option>
              <option value="wholesale">Atacado</option>
              <option value="retail">Varejo</option>
            </select>
          </div>
          <div>
            <label class="label">Forma de Pagamento</label>
            <select v-model="filters.paymentMethod" class="input-field">
              <option value="all">Todas</option>
              <option value="cash">Dinheiro</option>
              <option value="pix">PIX</option>
              <option value="boleto">Boleto</option>
              <option value="credito">Crediário</option>
            </select>
          </div>
          <div>
            <label class="label">Status de Pagamento</label>
            <select v-model="filters.paymentStatus" class="input-field">
              <option value="all">Todos</option>
              <option value="paid">Pago</option>
              <option value="pending">Pendente</option>
            </select>
          </div>
        </div>

        <div class="mt-4 pt-4 border-t border-gray-200">
          <button @click="generateReport" class="btn-primary w-full md:w-auto" :disabled="loading">
            {{ loading ? 'Gerando...' : '🔍 Gerar Relatório' }}
          </button>
        </div>
      </div>

      <div v-if="reportData.length > 0" class="card">
        <div class="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-4">
          <div>
            <h3 class="text-lg font-bold">Resultado - {{ reportData.length }} registro(s)</h3>
            <p class="text-sm text-gray-600 mt-1">
              <span v-if="filters.saleType !== 'all'">
                Tipo: {{ getSaleTypeName(filters.saleType) }}
              </span>
              <span v-if="filters.paymentMethod !== 'all'" :class="filters.saleType !== 'all' ? 'ml-2' : ''">
                {{ filters.saleType !== 'all' ? '|' : '' }} Pagamento: {{ getPaymentMethodName(filters.paymentMethod) }}
              </span>
              <span v-if="filters.paymentStatus !== 'all'" class="ml-2">
                | Status: {{ filters.paymentStatus === 'paid' ? 'Pago' : 'Pendente' }}
              </span>
            </p>
          </div>
          <div class="flex gap-2">
            <button @click="exportPDF" class="btn-outline flex-1 md:flex-none text-sm">📄 PDF</button>
            <button @click="exportExcel" class="btn-outline flex-1 md:flex-none text-sm">📊 Excel</button>
          </div>
        </div>

        <!-- Tabela Desktop -->
        <div class="hidden md:block overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gray-50">
              <tr>
                <th v-for="col in columns" :key="col" class="px-4 py-3 text-left text-sm font-semibold text-gray-600">
                  {{ col }}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(row, index) in reportData" :key="index" class="border-t hover:bg-gray-50">
                <td v-for="col in columns" :key="col" class="px-4 py-3 text-sm">
                  <span v-if="col === 'Status'" :class="getStatusClass(row[col])">
                    {{ formatValue(row[col], col) }}
                  </span>
                  <span v-else-if="col === 'Tipo'" :class="getSaleTypeBadgeClass(row[col])">
                    {{ formatValue(row[col], col) }}
                  </span>
                  <span v-else>
                    {{ formatValue(row[col], col) }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Cards Mobile -->
        <div class="md:hidden space-y-3">
          <div v-for="(row, index) in reportData" :key="index" class="card p-4 border-2">
            <div v-for="col in columns" :key="col" class="mb-2 last:mb-0">
              <span class="text-xs text-gray-500">{{ col }}:</span>
              <span v-if="col === 'Status'" :class="getStatusClass(row[col])" class="ml-2">
                {{ formatValue(row[col], col) }}
              </span>
              <span v-else-if="col === 'Tipo'" :class="getSaleTypeBadgeClass(row[col])" class="ml-2">
                {{ formatValue(row[col], col) }}
              </span>
              <span v-else class="ml-2 font-semibold">
                {{ formatValue(row[col], col) }}
              </span>
            </div>
          </div>
        </div>

        <div class="mt-4 p-4 bg-primary-50 rounded-lg">
          <h4 class="font-bold text-primary-900 mb-2">Resumo do Período</h4>
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p class="text-gray-600">Total de Registros</p>
              <p class="font-bold text-lg">{{ reportData.length }}</p>
            </div>
            <div v-if="filters.type === 'sales' || filters.type === 'payment'">
              <p class="text-gray-600">Total em Vendas</p>
              <p class="font-bold text-lg text-green-600">{{ formatCurrency(summary.totalSales) }}</p>
            </div>
            <div v-if="filters.type === 'sales'">
              <p class="text-gray-600">Ticket Médio</p>
              <p class="font-bold text-lg">{{ formatCurrency(summary.avgTicket) }}</p>
            </div>
            <div v-if="(filters.type === 'sales' || filters.type === 'payment') && summary.totalPaid > 0">
              <p class="text-gray-600">Total Pago</p>
              <p class="font-bold text-lg text-green-600">{{ formatCurrency(summary.totalPaid) }}</p>
            </div>
            <div v-if="(filters.type === 'sales' || filters.type === 'payment') && summary.totalPending > 0">
              <p class="text-gray-600">Total Pendente</p>
              <p class="font-bold text-lg text-red-600">{{ formatCurrency(summary.totalPending) }}</p>
            </div>
            <div v-if="filters.type === 'sales' && summary.wholesaleTotal > 0">
              <p class="text-gray-600">Total Atacado</p>
              <p class="font-bold text-lg text-blue-600">{{ formatCurrency(summary.wholesaleTotal) }}</p>
            </div>
            <div v-if="filters.type === 'sales' && summary.retailTotal > 0">
              <p class="text-gray-600">Total Varejo</p>
              <p class="font-bold text-lg text-green-600">{{ formatCurrency(summary.retailTotal) }}</p>
            </div>
            <div v-if="filters.type === 'production'">
              <p class="text-gray-600">Total Produzido</p>
              <p class="font-bold text-lg text-blue-600">{{ summary.totalProduced }} un.</p>
            </div>
            <div v-if="filters.type === 'production'">
              <p class="text-gray-600">Perdas Totais</p>
              <p class="font-bold text-lg text-red-600">{{ summary.totalLoss }} un.</p>
            </div>
            <div v-if="filters.type === 'losses'">
              <p class="text-gray-600">Total de Perdas</p>
              <p class="font-bold text-lg text-red-600">{{ summary.totalLoss }} un.</p>
            </div>
            <div v-if="filters.type === 'losses'">
              <p class="text-gray-600">Total de Trocas</p>
              <p class="font-bold text-lg text-amber-600">{{ summary.totalExchange }} un.</p>
            </div>
            <div v-if="filters.type === 'payment'">
              <p class="text-gray-600">Total Recebido</p>
              <p class="font-bold text-lg text-green-600">{{ formatCurrency(summary.totalReceived) }}</p>
            </div>
            <div v-if="filters.type === 'payment'">
              <p class="text-gray-600">Total Pendente</p>
              <p class="font-bold text-lg text-red-600">{{ formatCurrency(summary.totalPending) }}</p>
            </div>
          </div>
        </div>
      </div>

      <div v-else-if="!loading && reportData.length === 0 && hasGenerated" class="card text-center py-12">
        <div class="text-gray-400 mb-4">
          <svg class="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
          </svg>
        </div>
        <p class="text-gray-600 font-medium">Nenhum registro encontrado para os filtros selecionados</p>
        <p class="text-gray-500 text-sm mt-2">Tente ajustar os filtros ou período</p>
      </div>
    </div>
  </Layout>
</template>

<script setup>
import { ref } from 'vue'
import { supabase } from '../lib/supabase'
import Layout from '../components/Layout.vue'
import jsPDF from 'jspdf'
import 'jspdf-autotable'
import * as XLSX from 'xlsx'

const filters = ref({
  startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  endDate: new Date().toISOString().split('T')[0],
  type: 'sales',
  saleType: 'all',
  paymentMethod: 'all',
  paymentStatus: 'all'
})

const reportData = ref([])
const columns = ref([])
const summary = ref({})
const loading = ref(false)
const hasGenerated = ref(false)

const resetFilters = () => {
  filters.value.saleType = 'all'
  filters.value.paymentMethod = 'all'
  filters.value.paymentStatus = 'all'
}

const formatCurrency = (value) => {
  return new Intl.NumberFormat('pt-BR', { 
    style: 'currency', 
    currency: 'BRL' 
  }).format(value || 0)
}

const formatValue = (value, columnName) => {
  if (value === null || value === undefined) return '-'
  
  if (columnName && (columnName.includes('Total') || columnName.includes('Valor') || columnName.includes('R$'))) {
    return formatCurrency(value)
  }
  
  if (typeof value === 'number' && value > 100) {
    return formatCurrency(value)
  }
  
  return value
}

const getStatusClass = (status) => {
  if (status && status.includes('Pago')) {
    return 'px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold'
  }
  if (status && status.includes('Pendente')) {
    return 'px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-semibold'
  }
  return ''
}

const getSaleTypeBadgeClass = (type) => {
  if (type && type.includes('Atacado')) {
    return 'px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold'
  }
  if (type && type.includes('Varejo')) {
    return 'px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold'
  }
  return ''
}

const removeEmojis = (text) => {
  if (!text) return text
  return String(text).replace(/[\u{1F300}-\u{1F9FF}]/gu, '').trim()
}

const getPaymentMethodName = (method) => {
  const names = {
    cash: 'Dinheiro',
    pix: 'PIX',
    boleto: 'Boleto',
    credito: 'Crediario',
    all: 'Todas'
  }
  return names[method] || method
}

const getSaleTypeName = (type) => {
  const names = {
    wholesale: 'Atacado',
    retail: 'Varejo',
    all: 'Todos'
  }
  return names[type] || type
}

const generateReport = async () => {
  loading.value = true
  hasGenerated.value = true
  reportData.value = []
  
  try {
    if (filters.value.type === 'sales') {
      await generateSalesReport()
    } else if (filters.value.type === 'production') {
      await generateProductionReport()
    } else if (filters.value.type === 'losses') {
      await generateLossesReport()
    } else if (filters.value.type === 'clients') {
      await generateClientsReport()
    } else if (filters.value.type === 'payment') {
      await generatePaymentReport()
    }
  } catch (error) {
    console.error('Erro ao gerar relatório:', error)
    alert('Erro ao gerar relatório. Verifique o console para mais detalhes.')
  } finally {
    loading.value = false
  }
}

const generateSalesReport = async () => {
  let query = supabase
    .from('sales')
    .select(`
      id,
      date,
      sale_type,
      quantity,
      total,
      payment_method,
      paid,
      clients (name),
      products (name)
    `)
    .gte('date', filters.value.startDate)
    .lte('date', filters.value.endDate)

  if (filters.value.saleType !== 'all') {
    query = query.eq('sale_type', filters.value.saleType)
  }

  if (filters.value.paymentMethod !== 'all') {
    query = query.eq('payment_method', filters.value.paymentMethod)
  }

  if (filters.value.paymentStatus !== 'all') {
    query = query.eq('paid', filters.value.paymentStatus === 'paid')
  }

  query = query.order('date', { ascending: false })

  const { data, error } = await query

  if (error) throw error

  reportData.value = data.map(d => ({
    'Data': new Date(d.date + 'T00:00:00').toLocaleDateString('pt-BR'),
    'Tipo': d.sale_type === 'wholesale' ? 'Atacado' : 'Varejo',
    'Cliente': d.clients?.name || 'N/A',
    'Produto': d.products?.name || 'N/A',
    'Quantidade': d.quantity,
    'Total (R$)': d.total,
    'Pagamento': getPaymentLabel(d.payment_method),
    'Status': d.paid ? 'Pago' : 'Pendente'
  }))
  
  columns.value = ['Data', 'Tipo', 'Cliente', 'Produto', 'Quantidade', 'Total (R$)', 'Pagamento', 'Status']
  
  const totalSales = data.reduce((sum, d) => sum + (d.total || 0), 0)
  const totalPaid = data.filter(d => d.paid).reduce((sum, d) => sum + (d.total || 0), 0)
  const totalPending = data.filter(d => !d.paid).reduce((sum, d) => sum + (d.total || 0), 0)
  const wholesaleTotal = data.filter(d => d.sale_type === 'wholesale').reduce((sum, d) => sum + (d.total || 0), 0)
  const retailTotal = data.filter(d => d.sale_type === 'retail').reduce((sum, d) => sum + (d.total || 0), 0)
  
  summary.value = { 
    totalSales,
    totalPaid,
    totalPending,
    wholesaleTotal,
    retailTotal,
    avgTicket: data.length > 0 ? totalSales / data.length : 0
  }
}

const getPaymentLabel = (method) => {
  const labels = {
    'cash': 'Dinheiro',
    'pix': 'PIX',
    'boleto': 'Boleto',
    'credito': 'Crediario',
    'pendente': 'Pendente'
  }
  return labels[method] || 'N/A'
}

const generateProductionReport = async () => {
  const { data, error } = await supabase
    .from('production')
    .select(`
      id,
      date,
      quantity,
      loss,
      exchange,
      loss_value,
      exchange_value,
      products (name)
    `)
    .gte('date', filters.value.startDate)
    .lte('date', filters.value.endDate)
    .order('date', { ascending: false })

  if (error) throw error

  reportData.value = data.map(d => ({
    'Data': new Date(d.date + 'T00:00:00').toLocaleDateString('pt-BR'),
    'Produto': d.products?.name || 'N/A',
    'Produzido': d.quantity,
    'Perdas': d.loss || 0,
    'Trocas': d.exchange || 0,
    'Perda %': d.quantity > 0 ? ((d.loss / d.quantity) * 100).toFixed(1) + '%' : '0%'
  }))
  
  columns.value = ['Data', 'Produto', 'Produzido', 'Perdas', 'Trocas', 'Perda %']
  
  summary.value = { 
    totalProduced: data.reduce((sum, d) => sum + (d.quantity || 0), 0),
    totalLoss: data.reduce((sum, d) => sum + (d.loss || 0), 0),
    totalExchange: data.reduce((sum, d) => sum + (d.exchange || 0), 0)
  }
}

const generateLossesReport = async () => {
  const { data, error } = await supabase
    .from('production')
    .select(`
      id,
      date,
      quantity,
      loss,
      exchange,
      loss_value,
      exchange_value,
      products (name)
    `)
    .gte('date', filters.value.startDate)
    .lte('date', filters.value.endDate)
    .order('loss', { ascending: false })

  if (error) throw error

  reportData.value = data
    .filter(d => (d.loss > 0 || d.exchange > 0))
    .map(d => ({
      'Data': new Date(d.date + 'T00:00:00').toLocaleDateString('pt-BR'),
      'Produto': d.products?.name || 'N/A',
      'Produzido': d.quantity,
      'Perdas': d.loss || 0,
      'Perda %': d.quantity > 0 ? ((d.loss / d.quantity) * 100).toFixed(1) + '%' : '0%',
      'Valor Perda (R$)': d.loss_value || 0,
      'Trocas': d.exchange || 0,
      'Troca %': d.quantity > 0 ? ((d.exchange / d.quantity) * 100).toFixed(1) + '%' : '0%',
      'Valor Troca (R$)': d.exchange_value || 0
    }))
  
  columns.value = ['Data', 'Produto', 'Produzido', 'Perdas', 'Perda %', 'Valor Perda (R$)', 'Trocas', 'Troca %', 'Valor Troca (R$)']
  
  summary.value = { 
    totalLoss: data.reduce((sum, d) => sum + (d.loss || 0), 0),
    totalExchange: data.reduce((sum, d) => sum + (d.exchange || 0), 0),
    totalLossValue: data.reduce((sum, d) => sum + (d.loss_value || 0), 0),
    totalExchangeValue: data.reduce((sum, d) => sum + (d.exchange_value || 0), 0)
  }
}

const generateClientsReport = async () => {
  const { data: salesData, error } = await supabase
    .from('sales')
    .select(`
      client_id,
      total,
      paid,
      clients (name, phone, email)
    `)
    .gte('date', filters.value.startDate)
    .lte('date', filters.value.endDate)

  if (error) throw error

  const clientMap = {}
  salesData.forEach(sale => {
    const clientId = sale.client_id
    if (!clientMap[clientId]) {
      clientMap[clientId] = {
        name: sale.clients?.name || 'N/A',
        phone: sale.clients?.phone || 'N/A',
        email: sale.clients?.email || 'N/A',
        totalPurchases: 0,
        totalValue: 0,
        totalPaid: 0,
        totalPending: 0,
        count: 0
      }
    }
    clientMap[clientId].count++
    clientMap[clientId].totalValue += sale.total || 0
    if (sale.paid) {
      clientMap[clientId].totalPaid += sale.total || 0
    } else {
      clientMap[clientId].totalPending += sale.total || 0
    }
  })

  reportData.value = Object.values(clientMap)
    .sort((a, b) => b.totalValue - a.totalValue)
    .map(client => ({
      'Cliente': client.name,
      'Telefone': client.phone,
      'Email': client.email,
      'N° Compras': client.count,
      'Total Comprado (R$)': client.totalValue,
      'Pago (R$)': client.totalPaid,
      'Pendente (R$)': client.totalPending
    }))

  columns.value = ['Cliente', 'Telefone', 'Email', 'N° Compras', 'Total Comprado (R$)', 'Pago (R$)', 'Pendente (R$)']
  
  summary.value = {
    totalClients: Object.keys(clientMap).length,
    totalSales: salesData.reduce((sum, d) => sum + (d.total || 0), 0)
  }
}

const generatePaymentReport = async () => {
  let query = supabase
    .from('sales')
    .select(`
      date,
      sale_type,
      total,
      payment_method,
      paid,
      clients (name)
    `)
    .gte('date', filters.value.startDate)
    .lte('date', filters.value.endDate)

  if (filters.value.saleType !== 'all') {
    query = query.eq('sale_type', filters.value.saleType)
  }

  if (filters.value.paymentMethod !== 'all') {
    query = query.eq('payment_method', filters.value.paymentMethod)
  }

  if (filters.value.paymentStatus !== 'all') {
    query = query.eq('paid', filters.value.paymentStatus === 'paid')
  }

  query = query.order('date', { ascending: false })

  const { data, error } = await query

  if (error) throw error

  reportData.value = data.map(d => ({
    'Data': new Date(d.date + 'T00:00:00').toLocaleDateString('pt-BR'),
    'Tipo': d.sale_type === 'wholesale' ? 'Atacado' : 'Varejo',
    'Cliente': d.clients?.name || 'N/A',
    'Forma de Pagamento': getPaymentLabel(d.payment_method),
    'Valor (R$)': d.total,
    'Status': d.paid ? 'Recebido' : 'Pendente'
  }))

  columns.value = ['Data', 'Tipo', 'Cliente', 'Forma de Pagamento', 'Valor (R$)', 'Status']
  
  const totalReceived = data.filter(d => d.paid).reduce((sum, d) => sum + (d.total || 0), 0)
  const totalPending = data.filter(d => !d.paid).reduce((sum, d) => sum + (d.total || 0), 0)
  
  summary.value = {
    totalReceived,
    totalPending,
    cashTotal: data.filter(d => d.payment_method === 'cash' && d.paid).reduce((sum, d) => sum + (d.total || 0), 0),
    pixTotal: data.filter(d => d.payment_method === 'pix' && d.paid).reduce((sum, d) => sum + (d.total || 0), 0),
    boletoTotal: data.filter(d => d.payment_method === 'boleto' && d.paid).reduce((sum, d) => sum + (d.total || 0), 0),
    creditoTotal: data.filter(d => d.payment_method === 'credito' && d.paid).reduce((sum, d) => sum + (d.total || 0), 0)
  }
}

const exportPDF = () => {
  const doc = new jsPDF('landscape')
  
  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  doc.text('Natural Fruit - Relatorio', 14, 15)
  
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.text(`Tipo: ${getTipeName()}`, 14, 22)
  doc.text(`Periodo: ${new Date(filters.value.startDate).toLocaleDateString('pt-BR')} ate ${new Date(filters.value.endDate).toLocaleDateString('pt-BR')}`, 14, 27)
  
  let yPos = 32
  if (filters.value.saleType !== 'all') {
    doc.text(`Tipo de Venda: ${getSaleTypeName(filters.value.saleType)}`, 14, yPos)
    yPos += 5
  }
  if (filters.value.paymentMethod !== 'all') {
    doc.text(`Forma de Pagamento: ${getPaymentMethodName(filters.value.paymentMethod)}`, 14, yPos)
    yPos += 5
  }
  if (filters.value.paymentStatus !== 'all') {
    doc.text(`Status: ${filters.value.paymentStatus === 'paid' ? 'Pago' : 'Pendente'}`, 14, yPos)
    yPos += 5
  }
  
  doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, 14, yPos)
  yPos += 5
  doc.text(`Total de registros: ${reportData.value.length}`, 14, yPos)
  yPos += 8
  
  const pdfData = reportData.value.map(row => 
    columns.value.map(col => {
      let value = row[col]
      
      if (typeof value === 'string') {
        value = removeEmojis(value)
      }
      
      if (col.includes('R$') && typeof value === 'number') {
        value = formatCurrency(value)
      }
      
      if (typeof value === 'string' && value.length > 30) {
        value = value.substring(0, 27) + '...'
      }
      
      return value
    })
  )
  
  const columnStyles = {}
  columns.value.forEach((col, index) => {
    if (col.includes('Cliente') || col.includes('Produto')) {
      columnStyles[index] = { cellWidth: 'auto', minCellWidth: 35 }
    } else if (col.includes('R$') || col.includes('Total') || col.includes('Valor')) {
      columnStyles[index] = { cellWidth: 25, halign: 'right' }
    } else if (col === 'Data') {
      columnStyles[index] = { cellWidth: 22 }
    } else if (col === 'Status' || col === 'Tipo') {
      columnStyles[index] = { cellWidth: 20 }
    }
  })
  
  doc.autoTable({
    head: [columns.value],
    body: pdfData,
    startY: yPos,
    styles: { 
      fontSize: 7,
      cellPadding: 2,
      overflow: 'linebreak',
      cellWidth: 'wrap'
    },
    headStyles: { 
      fillColor: [255, 140, 0],
      fontStyle: 'bold',
      fontSize: 8
    },
    columnStyles: columnStyles,
    margin: { left: 14, right: 14 },
    tableWidth: 'auto',
    theme: 'grid'
  })
  
  doc.save(`relatorio-natural-fruit-${filters.value.type}-${Date.now()}.pdf`)
}

const exportExcel = () => {
  const excelData = reportData.value.map(row => {
    const formattedRow = {}
    columns.value.forEach(col => {
      let value = row[col]
      
      if (typeof value === 'string') {
        value = removeEmojis(value)
      }
      
      formattedRow[col] = value
    })
    return formattedRow
  })
  
  const ws = XLSX.utils.json_to_sheet(excelData)
  
  const colWidths = columns.value.map(col => {
    if (col.includes('Cliente') || col.includes('Produto') || col.includes('Email')) {
      return { wch: 30 }
    }
    if (col.includes('R$') || col.includes('Total') || col.includes('Valor')) {
      return { wch: 15 }
    }
    return { wch: 12 }
  })
  ws['!cols'] = colWidths
  
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, getTipeName())
  
  XLSX.writeFile(wb, `relatorio-natural-fruit-${filters.value.type}-${Date.now()}.xlsx`)
}

const getTipeName = () => {
  const types = {
    sales: 'Vendas',
    production: 'Producao',
    losses: 'Perdas e Trocas',
    clients: 'Clientes',
    payment: 'Formas de Pagamento'
  }
  return types[filters.value.type] || 'Relatorio'
}
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
  @apply px-4 py-2 bg-white border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium;
}
</style>
