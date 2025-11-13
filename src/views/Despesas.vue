<template>
  <Layout>
    <div class="space-y-6 pb-20 md:pb-6">
      <!-- Cabeçalho -->
      <div class="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h2 class="text-2xl md:text-3xl font-bold text-gray-900">Controle de Despesas</h2>
          <p class="text-gray-600 mt-1">Gerencie os custos e despesas da empresa</p>
        </div>
        <div class="flex space-x-2 mt-4 md:mt-0">
          <button @click="showCategoryModal = true" class="btn-outline">
            🏷️ Categorias
          </button>
          <button @click="showExpenseModal = true" class="btn-primary">
            + Nova Despesa
          </button>
        </div>
      </div>

      <!-- Resumo do Mês -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div class="card bg-gradient-to-br from-red-50 to-red-100">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-red-600 font-medium">Total do Mês</p>
              <p class="text-2xl font-bold text-red-700 mt-1">{{ formatCurrency(monthTotal) }}</p>
            </div>
            <div class="text-4xl">💸</div>
          </div>
        </div>

        <div class="card bg-gradient-to-br from-orange-50 to-orange-100">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-orange-600 font-medium">Despesas Pagas</p>
              <p class="text-2xl font-bold text-orange-700 mt-1">{{ formatCurrency(paidTotal) }}</p>
            </div>
            <div class="text-4xl">✅</div>
          </div>
        </div>

        <div class="card bg-gradient-to-br from-yellow-50 to-yellow-100">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-yellow-600 font-medium">A Pagar</p>
              <p class="text-2xl font-bold text-yellow-700 mt-1">{{ formatCurrency(pendingTotal) }}</p>
            </div>
            <div class="text-4xl">⏳</div>
          </div>
        </div>
      </div>

      <!-- Filtros -->
      <div class="card">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label class="label mb-1">Mês/Ano</label>
            <input
              v-model="selectedMonth"
              type="month"
              class="input-field"
              @change="loadExpenses"
            />
          </div>
          <div>
            <label class="label mb-1">Categoria</label>
            <select v-model="filterCategory" class="input-field" @change="loadExpenses">
              <option value="">Todas</option>
              <option v-for="cat in categories" :key="cat.id" :value="cat.id">
                {{ cat.icon }} {{ cat.name }}
              </option>
            </select>
          </div>
          <div>
            <label class="label mb-1">Status</label>
            <select v-model="filterStatus" class="input-field" @change="loadExpenses">
              <option value="">Todos</option>
              <option value="pending">Pendente</option>
              <option value="paid">Pago</option>
            </select>
          </div>
          <div class="flex items-end">
            <button @click="clearFilters" class="btn-outline w-full">
              🔄 Limpar Filtros
            </button>
          </div>
        </div>
      </div>

      <!-- Lista de Despesas -->
      <div class="space-y-3">
        <div
          v-for="expense in expenses"
          :key="expense.id"
          class="card hover:shadow-lg transition-all"
          :class="expense.status === 'paid' ? 'border-l-4 border-green-500' : 'border-l-4 border-yellow-500'"
        >
          <div class="flex flex-col md:flex-row md:items-center md:justify-between">
            <div class="flex-1">
              <div class="flex items-start space-x-3">
                <div class="text-3xl">{{ expense.categories?.icon || '💰' }}</div>
                <div class="flex-1">
                  <div class="flex items-center space-x-2">
                    <h3 class="text-lg font-bold text-gray-900">{{ expense.description }}</h3>
                    <span
                      class="px-2 py-1 text-xs rounded-full"
                      :class="expense.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'"
                    >
                      {{ expense.status === 'paid' ? 'Pago' : 'Pendente' }}
                    </span>
                  </div>
                  <p class="text-sm text-gray-600 mt-1">
                    {{ expense.categories?.name }} • {{ formatDate(expense.due_date) }}
                  </p>
                  <p v-if="expense.notes" class="text-xs text-gray-500 mt-2">{{ expense.notes }}</p>
                </div>
              </div>
            </div>

            <div class="flex items-center space-x-4 mt-4 md:mt-0">
              <div class="text-right">
                <p class="text-2xl font-bold text-red-600">{{ formatCurrency(expense.amount) }}</p>
                <p v-if="expense.payment_date" class="text-xs text-gray-500">
                  Pago em {{ formatDate(expense.payment_date) }}
                </p>
              </div>

              <div class="flex flex-col space-y-2">
                <button
                  v-if="expense.status === 'pending'"
                  @click="markAsPaid(expense)"
                  class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                >
                  ✓ Pagar
                </button>
                <button
                  @click="editExpense(expense)"
                  class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                >
                  ✏️ Editar
                </button>
                <button
                  @click="deleteExpense(expense.id)"
                  class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
                >
                  🗑️
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Estado vazio -->
      <div v-if="expenses.length === 0" class="card text-center py-12">
        <div class="text-6xl mb-4">💰</div>
        <p class="text-gray-600">Nenhuma despesa encontrada</p>
        <button @click="showExpenseModal = true" class="mt-4 btn-primary">
          Registrar Primeira Despesa
        </button>
      </div>

      <!-- Modal de Despesa -->
      <div v-if="showExpenseModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div class="bg-white rounded-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
          <div class="flex items-center justify-between mb-6">
            <h3 class="text-xl font-bold">{{ editingExpense ? 'Editar' : 'Nova' }} Despesa</h3>
            <button @click="closeExpenseModal" class="text-gray-400 hover:text-gray-600">✕</button>
          </div>

          <form @submit.prevent="saveExpense" class="space-y-4">
            <div>
              <label class="label">Categoria *</label>
              <select v-model="expenseForm.category_id" required class="input-field">
                <option value="">Selecione uma categoria</option>
                <option v-for="cat in categories" :key="cat.id" :value="cat.id">
                  {{ cat.icon }} {{ cat.name }}
                </option>
              </select>
            </div>

            <div>
              <label class="label">Descrição *</label>
              <input
                v-model="expenseForm.description"
                type="text"
                required
                class="input-field"
                placeholder="Ex: Conta de luz - Janeiro"
              />
            </div>

            <div>
              <label class="label">Valor *</label>
              <input
                v-model.number="expenseForm.amount"
                type="number"
                min="0"
                step="0.01"
                required
                class="input-field"
                placeholder="0,00"
              />
            </div>

            <div>
              <label class="label">Data de Vencimento *</label>
              <input
                v-model="expenseForm.due_date"
                type="date"
                required
                class="input-field"
              />
            </div>

            <div>
              <label class="label">Status *</label>
              <select v-model="expenseForm.status" required class="input-field">
                <option value="pending">Pendente</option>
                <option value="paid">Pago</option>
              </select>
            </div>

            <div v-if="expenseForm.status === 'paid'">
              <label class="label">Data de Pagamento</label>
              <input
                v-model="expenseForm.payment_date"
                type="date"
                class="input-field"
              />
            </div>

            <div>
              <label class="label">Observações</label>
              <textarea
                v-model="expenseForm.notes"
                class="input-field"
                rows="3"
                placeholder="Informações adicionais..."
              ></textarea>
            </div>

            <div class="flex space-x-3">
              <button type="button" @click="closeExpenseModal" class="flex-1 btn-outline">
                Cancelar
              </button>
              <button type="submit" :disabled="loading" class="flex-1 btn-primary">
                {{ loading ? 'Salvando...' : 'Salvar' }}
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Modal de Categorias -->
      <div v-if="showCategoryModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div class="bg-white rounded-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
          <div class="flex items-center justify-between mb-6">
            <h3 class="text-xl font-bold">Gerenciar Categorias</h3>
            <button @click="closeCategoryModal" class="text-gray-400 hover:text-gray-600">✕</button>
          </div>

          <!-- Formulário de Nova Categoria -->
          <form @submit.prevent="saveCategory" class="mb-6 p-4 bg-gray-50 rounded-lg">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label class="label mb-1">Ícone</label>
                <select v-model="categoryForm.icon" required class="input-field">
                  <option value="💰">💰 Dinheiro</option>
                  <option value="🏠">🏠 Aluguel</option>
                  <option value="⚡">⚡ Energia</option>
                  <option value="💧">💧 Água</option>
                  <option value="📱">📱 Internet/Tel</option>
                  <option value="👥">👥 Salários</option>
                  <option value="🍎">🍎 Matéria-prima</option>
                  <option value="🚚">🚚 Transporte</option>
                  <option value="🔧">🔧 Manutenção</option>
                  <option value="📄">📄 Impostos</option>
                  <option value="🛒">🛒 Fornecedores</option>
                  <option value="📦">📦 Estoque</option>
                  <option value="💳">💳 Taxas</option>
                  <option value="🎯">🎯 Marketing</option>
                  <option value="📊">📊 Outros</option>
                </select>
              </div>
              <div>
                <label class="label mb-1">Nome *</label>
                <input
                  v-model="categoryForm.name"
                  type="text"
                  required
                  class="input-field"
                  placeholder="Ex: Aluguel"
                />
              </div>
              <div class="flex items-end">
                <button type="submit" :disabled="loadingCategory" class="btn-primary w-full">
                  {{ loadingCategory ? 'Salvando...' : editingCategory ? 'Atualizar' : '+ Adicionar' }}
                </button>
              </div>
            </div>
          </form>

          <!-- Lista de Categorias -->
          <div class="space-y-2">
            <div
              v-for="cat in categories"
              :key="cat.id"
              class="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100"
            >
              <div class="flex items-center space-x-3">
                <span class="text-2xl">{{ cat.icon }}</span>
                <span class="font-semibold">{{ cat.name }}</span>
              </div>
              <div class="flex space-x-2">
                <button @click="editCategory(cat)" class="text-blue-600 hover:text-blue-700">
                  ✏️
                </button>
                <button @click="deleteCategory(cat.id)" class="text-red-600 hover:text-red-700">
                  🗑️
                </button>
              </div>
            </div>
          </div>

          <div v-if="categories.length === 0" class="text-center py-8 text-gray-500">
            Nenhuma categoria cadastrada
          </div>
        </div>
      </div>
    </div>
  </Layout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { supabase } from '../lib/supabase'
import Layout from '../components/Layout.vue'

// Estados
const selectedMonth = ref(new Date().toISOString().slice(0, 7))
const expenses = ref([])
const categories = ref([])
const showExpenseModal = ref(false)
const showCategoryModal = ref(false)
const loading = ref(false)
const loadingCategory = ref(false)
const editingExpense = ref(null)
const editingCategory = ref(null)
const filterCategory = ref('')
const filterStatus = ref('')

// Formulários
const expenseForm = ref({
  category_id: '',
  description: '',
  amount: 0,
  due_date: new Date().toISOString().split('T')[0],
  status: 'pending',
  payment_date: null,
  notes: ''
})

const categoryForm = ref({
  icon: '💰',
  name: ''
})

// Computed
const monthTotal = computed(() => {
  return expenses.value.reduce((sum, exp) => sum + exp.amount, 0)
})

const paidTotal = computed(() => {
  return expenses.value
    .filter(exp => exp.status === 'paid')
    .reduce((sum, exp) => sum + exp.amount, 0)
})

const pendingTotal = computed(() => {
  return expenses.value
    .filter(exp => exp.status === 'pending')
    .reduce((sum, exp) => sum + exp.amount, 0)
})

// Funções de formatação
const formatCurrency = (value) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value || 0)
}

const formatDate = (date) => {
  if (!date) return ''
  return new Date(date).toLocaleDateString('pt-BR')
}

// Carregar dados
const loadExpenses = async () => {
  try {
    const [year, month] = selectedMonth.value.split('-')
    const startDate = `${year}-${month}-01`
    const endDate = `${year}-${month}-31`

    let query = supabase
      .from('expenses')
      .select(`
        *,
        categories:expense_categories(name, icon)
      `)
      .gte('due_date', startDate)
      .lte('due_date', endDate)
      .order('due_date', { ascending: false })

    if (filterCategory.value) {
      query = query.eq('category_id', filterCategory.value)
    }

    if (filterStatus.value) {
      query = query.eq('status', filterStatus.value)
    }

    const { data, error } = await query

    if (error) throw error
    expenses.value = data || []
  } catch (error) {
    console.error('Erro ao carregar despesas:', error)
    alert('Erro ao carregar despesas')
  }
}

const loadCategories = async () => {
  try {
    const { data, error } = await supabase
      .from('expense_categories')
      .select('*')
      .order('name')

    if (error) throw error
    categories.value = data || []
  } catch (error) {
    console.error('Erro ao carregar categorias:', error)
  }
}

// CRUD Despesas
const saveExpense = async () => {
  loading.value = true
  try {
    const dataToSave = {
      ...expenseForm.value,
      payment_date: expenseForm.value.status === 'paid' ? expenseForm.value.payment_date : null
    }

    if (editingExpense.value) {
      const { error } = await supabase
        .from('expenses')
        .update(dataToSave)
        .eq('id', editingExpense.value.id)

      if (error) throw error
    } else {
      const { error } = await supabase
        .from('expenses')
        .insert([dataToSave])

      if (error) throw error
    }

    // Atualizar financeiro
    await updateFinancialRecord(dataToSave)

    await loadExpenses()
    closeExpenseModal()
  } catch (error) {
    console.error('Erro ao salvar despesa:', error)
    alert('Erro ao salvar despesa: ' + error.message)
  } finally {
    loading.value = false
  }
}

const markAsPaid = async (expense) => {
  try {
    const { error } = await supabase
      .from('expenses')
      .update({
        status: 'paid',
        payment_date: new Date().toISOString().split('T')[0]
      })
      .eq('id', expense.id)

    if (error) throw error

    // Atualizar financeiro
    await updateFinancialRecord({
      ...expense,
      status: 'paid',
      payment_date: new Date().toISOString().split('T')[0]
    })

    await loadExpenses()
  } catch (error) {
    console.error('Erro ao marcar como pago:', error)
    alert('Erro ao marcar despesa como paga')
  }
}

const updateFinancialRecord = async (expense) => {
  try {
    if (expense.status !== 'paid' || !expense.payment_date) return

    const date = new Date(expense.payment_date)
    const period = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`

    // Verificar se já existe registro financeiro para o período
    const { data: existing } = await supabase
      .from('financial_summary')
      .select('*')
      .eq('period', period)
      .single()

    const totalExpenses = expenses.value
      .filter(e => e.status === 'paid' && e.payment_date?.startsWith(period))
      .reduce((sum, e) => sum + e.amount, 0)

    if (existing) {
      const newProfit = existing.revenue - totalExpenses

      await supabase
        .from('financial_summary')
        .update({
          expenses: totalExpenses,
          profit: newProfit
        })
        .eq('id', existing.id)
    } else {
      await supabase
        .from('financial_summary')
        .insert([{
          period,
          revenue: 0,
          expenses: totalExpenses,
          profit: -totalExpenses
        }])
    }
  } catch (error) {
    console.error('Erro ao atualizar registro financeiro:', error)
  }
}

const editExpense = (expense) => {
  editingExpense.value = expense
  expenseForm.value = {
    category_id: expense.category_id,
    description: expense.description,
    amount: expense.amount,
    due_date: expense.due_date,
    status: expense.status,
    payment_date: expense.payment_date || new Date().toISOString().split('T')[0],
    notes: expense.notes || ''
  }
  showExpenseModal.value = true
}

const deleteExpense = async (id) => {
  if (!confirm('Deseja realmente excluir esta despesa?')) return

  try {
    const { error } = await supabase
      .from('expenses')
      .delete()
      .eq('id', id)

    if (error) throw error
    await loadExpenses()
  } catch (error) {
    console.error('Erro ao excluir despesa:', error)
    alert('Erro ao excluir despesa')
  }
}

const closeExpenseModal = () => {
  showExpenseModal.value = false
  editingExpense.value = null
  expenseForm.value = {
    category_id: '',
    description: '',
    amount: 0,
    due_date: new Date().toISOString().split('T')[0],
    status: 'pending',
    payment_date: null,
    notes: ''
  }
}

// CRUD Categorias
const saveCategory = async () => {
  loadingCategory.value = true
  try {
    if (editingCategory.value) {
      const { error } = await supabase
        .from('expense_categories')
        .update(categoryForm.value)
        .eq('id', editingCategory.value.id)

      if (error) throw error
    } else {
      const { error } = await supabase
        .from('expense_categories')
        .insert([categoryForm.value])

      if (error) throw error
    }

    await loadCategories()
    categoryForm.value = { icon: '💰', name: '' }
    editingCategory.value = null
  } catch (error) {
    console.error('Erro ao salvar categoria:', error)
    alert('Erro ao salvar categoria')
  } finally {
    loadingCategory.value = false
  }
}

const editCategory = (category) => {
  editingCategory.value = category
  categoryForm.value = {
    icon: category.icon,
    name: category.name
  }
}

const deleteCategory = async (id) => {
  if (!confirm('Deseja realmente excluir esta categoria?')) return

  try {
    const { error } = await supabase
      .from('expense_categories')
      .delete()
      .eq('id', id)

    if (error) throw error
    await loadCategories()
  } catch (error) {
    console.error('Erro ao excluir categoria:', error)
    alert('Erro ao excluir categoria. Verifique se não há despesas vinculadas.')
  }
}

const closeCategoryModal = () => {
  showCategoryModal.value = false
  editingCategory.value = null
  categoryForm.value = { icon: '💰', name: '' }
}

const clearFilters = () => {
  filterCategory.value = ''
  filterStatus.value = ''
  loadExpenses()
}

onMounted(() => {
  loadCategories()
  loadExpenses()
})
</script>
