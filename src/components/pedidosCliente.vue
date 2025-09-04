<template>
  <div>
    <h1>Pedidos</h1>

    <!-- Filtros -->
    <h3>Filtrar Pedidos</h3>
    <div class="filtros">
      <label>Cliente:</label>
      <input type="text" v-model="filtroClienteNome" placeholder="Pesquisar cliente..." />

      <label>Status:</label>
      <select v-model="filtroStatus">
        <option value="">Todos</option>
        <option v-for="s in statusDisponiveis" :key="s" :value="s">{{ s }}</option>
      </select>

      <label>Data Inicial:</label>
      <input type="date" v-model="filtroDataInicio" />

      <label>Data Final:</label>
      <input type="date" v-model="filtroDataFim" />
    </div>

    <!-- Botão Novo Pedido -->
    <button @click="$router.push({ name: 'pedidosForm' })" style="margin-bottom:15px;">
      Novo Pedido
    </button>

    <!-- Lista de pedidos -->
    <h2>Pedidos existentes</h2>
    <ul>
      <li v-for="pedido in pedidosFiltrados" :key="pedido.id">
        Cliente: {{ obterNomeCliente(pedido.id_cliente) }} -
        Status: {{ pedido.status }} -
        Total: R$ {{ formatarPreco(pedido.valor_total) }} -
        Itens: {{ pedido.itens.length }}
        <button @click="$router.push({ name: 'pedidosForm', params: { id: pedido.id } })">
          Editar
        </button>
      </li>
    </ul>
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
.filtros input, .filtros select {
  padding: 3px 5px;
}
button {
  padding: 5px 10px;
  cursor: pointer;
}
</style>
