<template>
  <div class="app-container">
    <!-- Header com título e botão Novo Cliente -->
    <div class="produtos-header">
      <h1>Clientes</h1>
      <button @click="$router.push({ name: 'clientesForm' })">Novo Cliente</button>
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

    <!-- Grid de clientes -->
    <div class="lista-grid">
      <div v-for="c in clientesFiltrados" :key="c.id" class="card-item">
        <p><strong>Nome:</strong> {{ c.nome }}</p>
        <p><strong>Fantasia:</strong> {{ c.nome_fantasia }}</p>
        <p><strong>CPF/CNPJ:</strong> {{ c.cnpj_cpf }}</p>
        <p><strong>Telefone:</strong> {{ c.telefone }}</p>
        <p><strong>Email:</strong> {{ c.email }}</p>
        <p><strong>Status:</strong> {{ c.status }}</p>
        <button @click="$router.push({ name: 'clientesForm', params: { id: c.id } })">
          Editar
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { supabase } from '../supabase.js'

const clientes = ref([])

// Filtros
const filtroNome = ref('')
const filtroStatus = ref('')

// Busca clientes do Supabase
const carregarClientes = async () => {
  const { data, error } = await supabase.from('clientes').select('*').order('nome')
  if (!error) clientes.value = data
}

// Computed: clientes filtrados
const clientesFiltrados = computed(() => {
  return clientes.value.filter(c => {
    let ok = true
    if (filtroNome.value) ok = ok && c.nome.toLowerCase().includes(filtroNome.value.toLowerCase())
    if (filtroStatus.value) ok = ok && c.status === filtroStatus.value
    return ok
  })
})

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


</style>
