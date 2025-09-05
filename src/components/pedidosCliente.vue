<template>
  <div class="app-container">
    <!-- Header -->
    <div class="produtos-header">
      <h1>Pedidos</h1>
      <button @click="$router.push({ name: 'pedidosForm' })">Novo Pedido</button>
    </div>

    <!-- Filtros -->
    <h3>Filtrar Pedidos</h3>
    <form class="filtros">
      <div>
        <label>Cliente:</label>
        <input type="text" v-model="filtroClienteNome" placeholder="Pesquisar cliente..." />
      </div>

      <div>
        <label>Status:</label>
        <select v-model="filtroStatus">
          <option value="">Todos</option>
          <option v-for="s in statusDisponiveis" :key="s" :value="s">{{ s }}</option>
        </select>
      </div>

      <div>
        <label>Data Inicial:</label>
        <input type="date" v-model="filtroDataInicio" />
      </div>

      <div>
        <label>Data Final:</label>
        <input type="date" v-model="filtroDataFim" />
      </div>
    </form>

    <!-- Lista de pedidos -->
    <h2>Pedidos existentes</h2>
    <div class="lista-grid">
      <div v-for="pedido in pedidosFiltrados" :key="pedido.id" class="card-item">
        <p><strong>Cliente:</strong> {{ obterNomeCliente(pedido.id_cliente) }}</p>
        <p><strong>Status:</strong> {{ pedido.status }}</p>
        <p><strong>Total:</strong> {{ formatarPreco(pedido.valor_total) }}</p>
        <p><strong>Itens:</strong> {{ pedido.itens.length }}</p>
        <button @click="$router.push({ name: 'pedidosForm', params: { id: pedido.id } })">
          Editar
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { supabase } from '../supabase.js'

export default {
  name: 'PedidosLista',
  data() {
    return {
      clientes: [],
      pedidos: [],
      statusDisponiveis: ['aberto','confirmado','separacao','rota','entregue','cancelado'],

      // Filtros
      filtroClienteNome: '',
      filtroStatus: '',
      filtroDataInicio: '',
      filtroDataFim: ''
    }
  },
  async created() {
    await this.buscarClientes()
    await this.buscarPedidos()
  },
  computed: {
    pedidosFiltrados() {
      return this.pedidos.filter(p => {
        let ok = true

        if (this.filtroClienteNome) {
          const cliente = this.clientes.find(c => c.id === p.id_cliente)
          ok = ok && cliente && cliente.nome.toLowerCase().includes(this.filtroClienteNome.toLowerCase())
        }

        if (this.filtroStatus) ok = ok && p.status === this.filtroStatus
        if (this.filtroDataInicio) ok = ok && p.data_entrega >= this.filtroDataInicio
        if (this.filtroDataFim) ok = ok && p.data_entrega <= this.filtroDataFim

        return ok
      })
    }
  },
  methods: {
    async buscarClientes() {
      const { data, error } = await supabase.from('clientes').select('*').order('nome')
      if (!error) this.clientes = data
    },
    async buscarPedidos() {
      const { data, error } = await supabase.from('pedidos').select(`*, itens:itens_pedido(*)`).order('data_pedido', { ascending: false })
      if (!error) this.pedidos = data
    },
    obterNomeCliente(id_cliente) {
      const cliente = this.clientes.find(c => c.id === id_cliente)
      return cliente ? cliente.nome : ''
    },
    formatarPreco(valor) {
      if (valor == null) return '0,00'
      return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor)
    }
  }
}
</script>

<style scoped>
/* Grid para filtros */
.filtros {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
  margin-bottom: 20px;
}

.filtros label {
  display: block;
  margin-bottom: 5px;
  font-weight: 600;
}

.filtros input,
.filtros select {
  width: 100%;
  padding: 8px 10px;
  border-radius: 6px;
  border: 1px solid #ccc;
  font-size: 14px;
  transition: border 0.2s;
}

.filtros input:focus,
.filtros select:focus {
  border-color: #1abc9c;
  outline: none;
}

/* Grid de pedidos */
.lista-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
}

/* Card de pedido */
.card-item {
  background-color: #fff;
  padding: 15px;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.card-item p {
  margin: 0;
  font-size: 14px;
}

/* Botão dentro do card */
.card-item button {
  width: 100px;
  margin-top: 10px;
  padding: 8px 10px;
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.2s;
}

.card-item button:hover {
  background-color: #2980b9;
}

/* Responsividade */
@media (max-width: 768px) {
  .lista-grid {
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  }
}
</style>
