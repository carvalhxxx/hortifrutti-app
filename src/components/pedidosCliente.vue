<template>
  <div>
    <h1>Pedidos</h1>

    <!-- Seleção de cliente -->
    <label>Cliente:</label>
    <select v-model="pedidoForm.id_cliente">
      <option v-for="cliente in clientes" :key="cliente.id" :value="cliente.id">
        {{ cliente.nome }}
      </option>
    </select>

    <!-- Adicionar produtos ao pedido -->
    <h2>Produtos</h2>
    <div v-for="(item, index) in pedidoForm.itens" :key="index" class="item-pedido">
      <select v-model="item.id_produto" @change="atualizarPreco(index)">
        <option v-for="produto in produtos" :key="produto.id" :value="produto.id">
          {{ produto.nome }} - R$ {{ formatarPreco(produto.preco) }} / {{ produto.unidade }} - Estoque: {{ produto.estoque }}
        </option>
      </select>
      <input type="number" v-model.number="item.quantidade" min="1" :max="obterEstoque(item.id_produto)" placeholder="Qtd" />
      <span>{{ obterUnidade(item.id_produto) }}</span>
      <button @click="removerItem(index)">Remover</button>
    </div>

    <button @click="adicionarItem">Adicionar Produto</button>
    <br /><br />
    <button @click="salvarPedido">Salvar Pedido</button>

    <!-- Lista de pedidos -->
    <h2>Pedidos existentes</h2>
    <ul>
      <li v-for="pedido in pedidos" :key="pedido.id">
        Cliente: {{ obterNomeCliente(pedido.id_cliente) }} - Status: {{ pedido.status }} - Itens: {{ pedido.itens.length }}
      </li>
    </ul>
  </div>
</template>

<script>
import { supabase } from '../supabase.js'

export default {
  name: 'pedidosCliente',
  data() {
    return {
      clientes: [],
      produtos: [],
      pedidos: [],
      pedidoForm: {
        id_cliente: null,
        itens: []
      }
    }
  },
  async created() {
    await this.buscarClientes()
    await this.buscarProdutos()
    await this.buscarPedidos()
  },
  methods: {
    async buscarClientes() {
      const { data, error } = await supabase.from('clientes').select('*').order('nome')
      if (!error) this.clientes = data
    },
    async buscarProdutos() {
      const { data, error } = await supabase.from('produtos').select('*').order('nome')
      if (!error) this.produtos = data
    },
    async buscarPedidos() {
      const { data, error } = await supabase.from('pedidos').select(`
        *,
        itens:itens_pedido(*)
      `)
      if (!error) this.pedidos = data
    },

    adicionarItem() {
      this.pedidoForm.itens.push({ id_produto: null, quantidade: 1, preco_unitario: 0 })
    },
    removerItem(index) {
      this.pedidoForm.itens.splice(index, 1)
    },
    atualizarPreco(index) {
      const item = this.pedidoForm.itens[index]
      const produto = this.produtos.find(p => p.id === item.id_produto)
      if (produto) item.preco_unitario = produto.preco
    },
    obterEstoque(id_produto) {
      const produto = this.produtos.find(p => p.id === id_produto)
      return produto ? produto.estoque : 0
    },
    obterUnidade(id_produto) {
      const produto = this.produtos.find(p => p.id === id_produto)
      return produto ? produto.unidade : ''
    },
    obterNomeCliente(id_cliente) {
      const cliente = this.clientes.find(c => c.id === id_cliente)
      return cliente ? cliente.nome : ''
    },
    formatarPreco(valor) {
      if (valor == null) return '0,00'
      return new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(valor)
    },

    async salvarPedido() {
      if (!this.pedidoForm.id_cliente) return alert('Selecione o cliente')
      if (this.pedidoForm.itens.length === 0) return alert('Adicione ao menos um produto')

      // cria pedido
      const { data: pedido, error: pedidoError } = await supabase
        .from('pedidos')
        .insert([{ id_cliente: this.pedidoForm.id_cliente }])
        .select()
        .single()
      if (pedidoError) return alert('Erro ao criar pedido: ' + pedidoError.message)

      // adiciona itens
      const itens = this.pedidoForm.itens.map(i => ({
        id_pedido: pedido.id,
        id_produto: i.id_produto,
        quantidade: i.quantidade,
        preco_unitario: i.preco_unitario
      }))
      const { error: itensError } = await supabase.from('itens_pedido').insert(itens)
      if (itensError) return alert('Erro ao adicionar itens: ' + itensError.message)

      alert('Pedido criado com sucesso!')
      this.pedidoForm = { id_cliente: null, itens: [] }
      await this.buscarPedidos()
      await this.buscarProdutos() // atualiza estoque
    }
  }
}
</script>

<style scoped>
.item-pedido {
  display: flex;
  align-items: center;
  gap: 5px;
  margin: 5px 0;
}
.item-pedido select {
  flex: 2;
}
.item-pedido input {
  width: 80px;
}
</style>
