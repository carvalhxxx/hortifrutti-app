<template>
  <div class="app-container">
    <!-- Header com título e botão -->
    <div class="produtos-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
      <h1>Motoristas</h1>
      <button
        @click="$router.push({ name: 'motoristasForm' })"
        style="padding: 8px 15px; border-radius: 6px; background-color: #1abc9c; color: white; border: none; cursor: pointer;"
      >
        Novo Motorista
      </button>
    </div>

    <!-- Filtros -->
    <h3>Filtrar Motoristas</h3>
    <form class="filtros">
      <div>
        <label>Nome:</label>
        <input type="text" v-model="filtroNome" placeholder="Pesquisar motorista..." />
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

    <!-- Grid de motoristas -->
    <div class="lista-grid">
      <div v-for="m in motoristasFiltrados" :key="m.id" class="card-item">
        <p><strong>Nome:</strong> {{ m.nome }}</p>
        <p><strong>CPF:</strong> {{ m.cpf }}</p>
        <p><strong>Telefone:</strong> {{ m.telefone }}</p>
        <p><strong>Status:</strong> {{ m.status }}</p>
        <p><strong>Veículo:</strong> {{ m.veiculo }}</p>
        <p><strong>Placa:</strong> {{ m.placa }}</p>
        <button @click="$router.push({ name: 'motoristasForm', params: { id: m.id } })">
          Editar
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { supabase } from '../supabase.js'

const motoristas = ref([])

// Filtros
const filtroNome = ref('')
const filtroStatus = ref('')

// Busca motoristas do Supabase
const carregarMotoristas = async () => {
  const { data, error } = await supabase.from('motoristas').select('*').order('nome')
  if (!error) motoristas.value = data
}

// Computed: motoristas filtrados
const motoristasFiltrados = computed(() => {
  return motoristas.value.filter(m => {
    let ok = true
    if (filtroNome.value) ok = ok && m.nome.toLowerCase().includes(filtroNome.value.toLowerCase())
    if (filtroStatus.value) ok = ok && m.status === filtroStatus.value
    return ok
  })
})

onMounted(() => {
  carregarMotoristas()
})
</script>
