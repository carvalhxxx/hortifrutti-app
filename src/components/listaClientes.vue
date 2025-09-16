<template>
  <div class="app-container">
    <!-- Header -->
    <div class="produtos-header">
      <h1>Clientes</h1>
      <button @click="$router.push({ name: 'clientesForm' })">Inserir</button>
    </div>

    <!-- Filtros -->
    <h3>Filtrar Clientes</h3>
    <form class="filtros">
      <div>
        <label>Nome:</label>
        <input type="text" v-model="filtroNome" placeholder="Pesquisar cliente..." />
      </div>
      <div>
        <label>Status:</label>
        <select v-model="filtroStatus">
          <option value="">Todos</option>
          <option value="ativo">Ativo</option>
          <option value="inativo">Inativo</option>
        </select>
      </div>
    </form>

    <!-- Mensagem caso não haja clientes -->
    <div v-if="clientesFiltrados.length === 0">
      <p>Nenhum cliente encontrado.</p>
    </div>

    <!-- Grid de clientes -->
    <div class="lista-grid">
      <div v-for="c in clientesFiltrados" :key="c.id" class="card-item">
        <p><strong>Nome:</strong> {{ c.nome }}</p>
        <p v-if="c.nome_fantasia"><strong>Fantasia:</strong> {{ c.nome_fantasia }}</p>
        <p v-if="c.cnpj_cpf"><strong>CPF/CNPJ:</strong> {{ c.cnpj_cpf }}</p>
        <p v-if="c.telefone"><strong>Telefone:</strong> {{ c.telefone }}</p>
        <p v-if="c.email"><strong>Email:</strong> {{ c.email }}</p>
        <p><strong>Status:</strong> {{ formatarStatus(c.status) }}</p>
        <button @click="$router.push({ name: 'clientesForm', params: { id: c.id } })">Editar</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { supabase } from '../supabase.js'

const clientes = ref([])

const filtroNome = ref('')
const filtroStatus = ref('')

const carregarClientes = async () => {
  const { data, error } = await supabase
    .from('clientes')
    .select('*')
    .order('nome')

  if (error) {
    console.error('Erro ao carregar clientes:', error.message)
  } else {
    clientes.value = data
  }
}

const clientesFiltrados = computed(() => {
  return clientes.value.filter(c => {
    let ok = true
    if (filtroNome.value) ok = ok && c.nome.toLowerCase().includes(filtroNome.value.toLowerCase())
    if (filtroStatus.value) ok = ok && c.status === filtroStatus.value
    return ok
  })
})

// Função para capitalizar status
const formatarStatus = (status) => {
  if (!status) return ''
  return status.charAt(0).toUpperCase() + status.slice(1)
}

onMounted(() => {
  carregarClientes()
})
</script>

<style scoped>
.produtos-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.lista-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 20px;
}

.card-item {
  background-color: #fff;
  padding: 15px;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  display: flex;
  flex-direction: column;
  gap: 10px;
}
</style>
