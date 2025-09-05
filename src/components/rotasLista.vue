<template>
  <div>
    <h1>Rotas</h1>

    <!-- Filtros -->
    <h3>Filtrar Rotas</h3>
    <div class="filtros">
      <label>Motorista:</label>
      <select v-model="filtroMotorista">
        <option value="">Todos</option>
        <option v-for="m in motoristas" :key="m.id" :value="m.id">{{ m.nome }}</option>
      </select>

      <label>Status:</label>
      <select v-model="filtroStatus">
        <option value="">Todos</option>
        <option v-for="s in statusDisponiveis" :key="s" :value="s">{{ s }}</option>
      </select>
    </div>

    <!-- Botão nova rota -->
    <button @click="$router.push({ name: 'rotasForm' })">Nova Rota</button>

    <!-- Lista de rotas -->
    <h2>Rotas existentes</h2>
    <ul>
      <li v-for="rota in rotasFiltradas" :key="rota.id">
        Motorista: {{ obterNomeMotorista(rota.id_motorista) }} - 
        Status: {{ rota.status }} - 
        Saída: {{ rota.data_saida }} - 
        Chegada: {{ rota.data_chegada || '-' }}
        <button @click="$router.push({ name: 'rotasForm', params: { id: rota.id } })">Editar</button>
      </li>
    </ul>
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
    }
  }
}
</script>

<style scoped>
.filtros {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 15px;
  align-items: center;
}
.filtros label {
  margin-right: 5px;
}
.filtros select {
  padding: 3px 5px;
}
button {
  padding: 5px 10px;
  cursor: pointer;
  margin-top: 10px;
}
</style>
