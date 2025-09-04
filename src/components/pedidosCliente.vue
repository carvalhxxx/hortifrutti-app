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

    <!-- Data de entrega -->
    <label>Data de Entrega:</label>
    <input type="date" v-model="pedidoForm.data_entrega" />

    <!-- Status do pedido -->
    <label>Status:</label>
    <select v-model="pedidoForm.status">
      <option v-for="s in statusDisponiveis" :key="s" :value="s">{{ s }}</option>
    </select>

    <!-- Observações -->
    <label>Observações:</label>
    <input type="text" v-model="pedidoForm.observacoes" placeholder="Observações" />

    <!-- Adicionar produtos ao pedido -->
    <h2>Produtos</h2>
    <div v-for="(item, index) in pedidoForm.itens" :key="index" class="item-pedido">
      <select v-model="item.id_produto" @change="atualizarPreco(index)">
        <option v-for="produto in produtos" :key="produto.id" :value="produto.id">
          {{ produto.nome }} - R$ {{ formatarPreco(produto.preco) }} / {{ produto.unidade }} - Estoque: {{ produto.estoque }}
        </option>
      </select>
      <input
        type="number"
        v-model.number="item.quantidade"
        min="0"
        :step="getStep(item.id_produto)"
        :max="obterEstoque(item.id_produto)"
        placeholder="Qtd"
      />
      <span>{{ obterUnidade(item.id_produto) }}</span>
      <button @click="removerItem(index)">Remover</button>
    </div>

    <button @click="adicionarItem">Adicionar Produto</button>
    <br /><br />

    <!-- Total do pedido -->
    <h3>Total: R$ {{ formatarPreco(calcularTotal()) }}</h3>

    <button @click="salvarPedido">{{ pedidoForm.id ? 'Atualizar Pedido' : 'Salvar Pedido' }}</button>

    <!-- Lista de pedidos -->
    <h2>Pedidos existentes</h2>
    <ul>
      <li v-for="pedido in pedidos" :key="pedido.id">
        Cliente: {{ obterNomeCliente(pedido.id_cliente) }} -
        Status: {{ pedido.status }} -
        Total: R$ {{ formatarPreco(pedido.valor_total) }} -
        Itens: {{ pedido.itens.length }}
        <button @click="editarPedido(pedido)">Editar</button>
      </li>
    </ul>
  </div>
</template>

<script>
import { supabase } from '../supabase.js'

export default {
  name: 'PedidosCliente',
  data() {
    return {
      clientes: [],
      produtos: [],
      pedidos: [],
      statusDisponiveis: ['aberto','confirmado','separacao','rota','entregue','cancelado'],
      pedidoForm: {
        id: null,
        id_cliente: null,
        data_entrega: null,
        status: 'aberto',
        observacoes: '',
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
      const { data, error } = await supabase.from('pedidos').select(`*, itens:itens_pedido(*)`).order('data_pedido', { ascending: false })
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
    getStep(id_produto) {
      const produto = this.produtos.find(p => p.id === id_produto)
      return produto?.unidade === 'un' ? 1 : 0.01
    },
    obterNomeCliente(id_cliente) {
      const cliente = this.clientes.find(c => c.id === id_cliente)
      return cliente ? cliente.nome : ''
    },
    formatarPreco(valor) {
      if (valor == null) return '0,00'
      return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor)
    },
    calcularTotal() {
      return this.pedidoForm.itens.reduce((sum, i) => sum + (i.quantidade * i.preco_unitario), 0)
    },

    async salvarPedido() {
      if (!this.pedidoForm.id_cliente) return alert('Selecione o cliente')
      if (!this.pedidoForm.data_entrega) return alert('Selecione a data de entrega')
      if (this.pedidoForm.itens.length === 0 && this.pedidoForm.status !== 'cancelado') return alert('Adicione ao menos um produto')

      // Se for edição
      if (this.pedidoForm.id) {
        // Se estiver cancelando, devolve estoque e finaliza
        if (this.pedidoForm.status === 'cancelado') {
          const { data: itensDoPedido } = await supabase.from('itens_pedido').select('*').eq('id_pedido', this.pedidoForm.id)
          for (let item of itensDoPedido) {
            const produto = this.produtos.find(p => p.id === item.id_produto)
            if (produto) {
              await supabase.from('produtos').update({ estoque: produto.estoque + item.quantidade }).eq('id', item.id_produto)
            }
          }
          await supabase.from('pedidos').update({ status: 'cancelado' }).eq('id', this.pedidoForm.id)
          alert('Pedido cancelado e estoque ajustado!')
          this.pedidoForm = { id: null, id_cliente: null, data_entrega: null, status: 'aberto', observacoes: '', itens: [] }
          await this.buscarProdutos()
          await this.buscarPedidos()
          return
        }

        // Devolver estoque antigo antes de atualizar itens
        const { data: itensAntigos } = await supabase.from('itens_pedido').select('*').eq('id_pedido', this.pedidoForm.id)
        for (let item of itensAntigos) {
          const produto = this.produtos.find(p => p.id === item.id_produto)
          if (produto) {
            await supabase.from('produtos').update({ estoque: produto.estoque + item.quantidade }).eq('id', item.id_produto)
          }
        }

        // Atualiza pedido
        const { error: pedidoError } = await supabase.from('pedidos')
          .update({
            id_cliente: this.pedidoForm.id_cliente,
            data_entrega: this.pedidoForm.data_entrega,
            status: this.pedidoForm.status,
            observacoes: this.pedidoForm.observacoes,
            valor_total: this.calcularTotal()
          })
          .eq('id', this.pedidoForm.id)
        if (pedidoError) return alert('Erro ao atualizar pedido: ' + pedidoError.message)

        // Remove itens antigos
        await supabase.from('itens_pedido').delete().eq('id_pedido', this.pedidoForm.id)
      } else {
        // Novo pedido cancelado: só cria pedido sem itens
        if (this.pedidoForm.status === 'cancelado') {
          const { error } = await supabase.from('pedidos').insert([{
            id_cliente: this.pedidoForm.id_cliente,
            data_entrega: this.pedidoForm.data_entrega,
            status: 'cancelado',
            observacoes: this.pedidoForm.observacoes,
            valor_total: 0
          }])
          if (error) return alert('Erro ao criar pedido cancelado: ' + error.message)
          alert('Pedido criado como cancelado!')
          this.pedidoForm = { id: null, id_cliente: null, data_entrega: null, status: 'aberto', observacoes: '', itens: [] }
          await this.buscarPedidos()
          return
        }

        // Cria novo pedido
        const { data: pedido, error: pedidoError } = await supabase.from('pedidos')
          .insert([{
            id_cliente: this.pedidoForm.id_cliente,
            data_entrega: this.pedidoForm.data_entrega,
            status: this.pedidoForm.status,
            observacoes: this.pedidoForm.observacoes,
            valor_total: this.calcularTotal()
          }])
          .select()
          .single()
        if (pedidoError) return alert('Erro ao criar pedido: ' + pedidoError.message)
        this.pedidoForm.id = pedido.id
      }

      // Insere itens e decrementa estoque
      for (let item of this.pedidoForm.itens) {
        const { data: produtoAtual } = await supabase.from('produtos').select('*').eq('id', item.id_produto).single()
        if (!produtoAtual) return alert('Produto não encontrado: ' + item.id_produto)
        const novoEstoque = produtoAtual.estoque - item.quantidade
        if (novoEstoque < 0) return alert(`Estoque insuficiente para o produto ${produtoAtual.nome}`)

        // Insere item
        const { error: itemError } = await supabase.from('itens_pedido').insert([{
          id_pedido: this.pedidoForm.id,
          id_produto: item.id_produto,
          quantidade: item.quantidade,
          preco_unitario: item.preco_unitario
        }])
        if (itemError) return alert('Erro ao adicionar itens: ' + itemError.message)

        // Atualiza estoque
        await supabase.from('produtos').update({ estoque: novoEstoque }).eq('id', item.id_produto)
      }

      alert('Pedido salvo com sucesso!')
      this.pedidoForm = { id: null, id_cliente: null, data_entrega: null, status: 'aberto', observacoes: '', itens: [] }
      await this.buscarPedidos()
      await this.buscarProdutos()
    },

    editarPedido(pedido) {
      this.pedidoForm = {
        id: pedido.id,
        id_cliente: pedido.id_cliente,
        data_entrega: pedido.data_entrega,
        status: pedido.status,
        observacoes: pedido.observacoes,
        itens: pedido.itens.map(i => ({
          id_produto: i.id_produto,
          quantidade: i.quantidade,
          preco_unitario: i.preco_unitario
        }))
      }
    }
  }
}
</script>

<style scoped>
.item-pedido {
  display: flex;
  gap: 10px;
  margin-bottom: 5px;
  align-items: center;
}
.item-pedido select,
.item-pedido input {
  padding: 5px;
}
button {
  padding: 5px 10px;
  cursor: pointer;
}
</style>
