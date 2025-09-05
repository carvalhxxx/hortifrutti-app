<template>
  <div class="app-container">
    <!-- Header com título e botão Nova Rota -->
    <div class="produtos-header">
      <h1>Rotas</h1>
      <button @click="$router.push({ name: 'rotasForm' })">Nova Rota</button>
    </div>

    <!-- Filtros -->
    <h3>Filtrar Rotas</h3>
    <form class="filtros">
      <div>
        <label>Motorista:</label>
        <select v-model="filtroMotorista">
          <option value="">Todos</option>
          <option v-for="m in motoristas" :key="m.id" :value="m.id">{{ m.nome }}</option>
        </select>
      </div>
      <div>
        <label>Status:</label>
        <select v-model="filtroStatus">
          <option value="">Todos</option>
          <option v-for="s in statusDisponiveis" :key="s" :value="s">{{ s }}</option>
        </select>
      </div>
    </form>

    <!-- Grid de rotas -->
    <div class="lista-grid">
      <div v-for="rota in rotasFiltradas" :key="rota.id" class="card-item">
        <p><strong>Motorista:</strong> {{ obterNomeMotorista(rota.id_motorista) }}</p>
        <p><strong>Status:</strong> {{ rota.status }}</p>
        <p><strong>Saída:</strong> {{ formatarData(rota.data_saida) }}</p>
        <p><strong>Chegada:</strong> {{ formatarData(rota.data_chegada) }}</p>
        <button @click="$router.push({ name: 'rotasForm', params: { id: rota.id } })">
          Editar
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { supabase } from '../supabase.js'

export default {
  name: 'RotasLista',
  data() {
    return {
      rotas: [],
      motoristas: [],
      statusDisponiveis: ['aberta','em_andamento','finalizada','cancelada'],
      filtroMotorista: '',
      filtroStatus: ''
    }
  },
  async created() {
    await this.buscarMotoristas()
    await this.buscarRotas()
  },
  computed: {
    rotasFiltradas() {
      return this.rotas.filter(r => {
        let ok = true
        if (this.filtroMotorista) ok = ok && r.id_motorista === this.filtroMotorista
        if (this.filtroStatus) ok = ok && r.status === this.filtroStatus
        return ok
      })
    }
  },
  methods: {
    async buscarMotoristas() {
      const { data, error } = await supabase.from('motoristas').select('*').order('nome')
      if (!error) this.motoristas = data
    },
    async buscarRotas() {
      const { data, error } = await supabase.from('rotas').select('*').order('data_saida', { ascending: false })
      if (!error) this.rotas = data
    },
    obterNomeMotorista(id_motorista) {
      const motorista = this.motoristas.find(m => m.id === id_motorista)
      return motorista ? motorista.nome : ''
    },
    formatarData(dt) {
      if (!dt) return '-'
      const data = new Date(dt)
      return data.toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    }
  }
}
</script>

<style scoped>
.app-container {
  max-width: 700px;
  margin: 0 auto;
  padding: 20px;
}

.produtos-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.filtros {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  margin-bottom: 15px;
}

.filtros label {
  margin-right: 5px;
}

.filtros select {
  padding: 5px;
}

.lista-grid {
  display: grid;
  gap: 15px;
}

.card-item {
  padding: 15px;
  border: 1px solid #ccc;
  border-radius: 6px;
}

button {
  padding: 8px 12px;
  cursor: pointer;
  margin-top: 10px;
}
</style>
