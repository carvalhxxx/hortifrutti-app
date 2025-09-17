<template>
  <div class="app-container">
    <!-- Header -->
    <div class="produtos-header">
      <h1>Pedidos</h1>
      <button @click="$router.push({ name: 'pedidosForm' })">Inserir</button>
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
      statusDisponiveis: ['Aberto','Confirmado','Separacao','Rota','Entregue','Cancelado'],

      // Filtros
      filtroClienteNome: '',
      filtroStatus: '',
      filtroDataInicio: '',
      filtroDataFim: '',

      intervalId: null // guarda o setInterval para limpar depois
      filtroDataFim: '',

      channel: null
    }
  },
  async created() {
    await this.buscarClientes()
    await this.buscarPedidos()

    // Atualiza pedidos a cada 10 segundos
    this.intervalId = setInterval(() => {
      this.buscarPedidos()
    }, 10000)
  },
  beforeUnmount() {
    // limpa o intervalo quando sair da página
    if (this.intervalId) {
      clearInterval(this.intervalId)
      this.intervalId = null
    }
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
    },
    // Adiciona ou atualiza pedido na lista
    atualizarPedidoRealtime(pedido) {
      const index = this.pedidos.findIndex(p => p.id === pedido.id)
      if (index === -1) {
        this.pedidos.unshift(pedido) // novo pedido
      } else {
        this.pedidos[index] = pedido // atualização
      }
    }
  },
  async mounted() {
    await this.buscarClientes()
    await this.buscarPedidos()

    // Realtime Supabase v2
    this.channel = supabase
      .channel('realtime-pedidos')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'pedidos' },
        (payload) => {
          this.atualizarPedidoRealtime(payload.new)
        }
      )
      .subscribe()
  },
  beforeUnmount() {
    if (this.channel) {
      supabase.removeChannel(this.channel)
    }
  }
}
</script>

<style scoped>
.produtos-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
