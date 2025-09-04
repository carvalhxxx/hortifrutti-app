<template>
  <div>
    <h1>{{ pedidoForm.id ? 'Editar Pedido' : 'Novo Pedido' }}</h1>

    <!-- Seleção de cliente -->
    <label>Cliente:</label>
    <select v-model="pedidoForm.id_cliente">
      <option v-for="cliente in clientes" :key="cliente.id" :value="cliente.id">
        {{ cliente.nome }}
      </option>
    </select>

    <!-- Seleção do motorista -->
    <label>Motorista:</label>
    <select v-model="pedidoForm.id_motorista">
      <option :value="null">-- Nenhum --</option>
      <option v-for="motorista in motoristas" :key="motorista.id" :value="motorista.id">
        {{ motorista.nome }}
      </option>
    </select>

    <!-- Data de entrega -->
    <label>Data de Entrega:</label>
    <input type="date" v-model="pedidoForm.data_entrega" />

    <!-- Status -->
    <label>Status:</label>
    <select v-model="pedidoForm.status">
      <option v-for="s in statusDisponiveis" :key="s" :value="s">{{ s }}</option>
    </select>

    <!-- Observações -->
    <label>Observações:</label>
    <input type="text" v-model="pedidoForm.observacoes" placeholder="Observações" />

    <!-- Itens do pedido -->
    <h2>Produtos</h2>
    <div v-for="(item, index) in pedidoForm.itens" :key="index" class="item-pedido">
      <select v-model="item.id_produto" @change="atualizarPreco(index)">
        <option v-for="produto in produtos" :key="produto.id" :value="produto.id">
          {{ produto.nome }} - R$ {{ formatarPreco(produto.preco) }} / {{ produto.unidade }} - Estoque: {{ produto.estoque }}
        </option>
      </select>
      <input type="number" v-model.number="item.quantidade" min="0" :max="obterEstoque(item.id_produto)" :step="getStep(item.id_produto)" placeholder="Qtd" />
      <span>{{ obterUnidade(item.id_produto) }}</span>
      <button @click="removerItem(index)">Remover</button>
    </div>

    <button @click="adicionarItem">Adicionar Produto</button>

    <!-- Total -->
    <h3>Total: R$ {{ formatarPreco(calcularTotal()) }}</h3>

    <button @click="salvarPedido">{{ pedidoForm.id ? 'Atualizar Pedido' : 'Salvar Pedido' }}</button>
  </div>
</template>

<script>
import { supabase } from '../supabase.js'

export default {
  name: 'PedidosForm',
  data() {
    return {
      clientes: [],
      produtos: [],
      motoristas: [], // lista de motoristas
      statusDisponiveis: ['aberto','confirmado','separacao','rota','entregue','cancelado'],
      pedidoForm: {
        id: null,
        id_cliente: null,
        id_motorista: null, // campo do motorista
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
    await this.buscarMotoristas()
    this.carregarPedido()
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
    async buscarMotoristas() {
      const { data, error } = await supabase.from('motoristas').select('*').order('nome')
      if (!error) this.motoristas = data
    },
    async carregarPedido() {
      const id = this.$route.params.id
      if (!id) return
      const { data, error } = await supabase.from('pedidos').select(`*, itens:itens_pedido(*)`).eq('id', id).single()
      if (!error) {
        this.pedidoForm = {
          id: data.id,
          id_cliente: data.id_cliente,
          id_motorista: data.id_motorista, // preenche motorista
          data_entrega: data.data_entrega,
          status: data.status,
          observacoes: data.observacoes,
          itens: data.itens.map(i => ({
            id_produto: i.id_produto,
            quantidade: i.quantidade,
            preco_unitario: i.preco_unitario
          }))
        }
      }
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

      // Inserção ou atualização do pedido
      let pedidoData = {
        id_cliente: this.pedidoForm.id_cliente,
        id_motorista: this.pedidoForm.id_motorista, // salva motorista
        data_entrega: this.pedidoForm.data_entrega,
        status: this.pedidoForm.status,
        observacoes: this.pedidoForm.observacoes,
        valor_total: this.calcularTotal()
      }

      if (this.pedidoForm.id) {
        const { error } = await supabase.from('pedidos').update(pedidoData).eq('id', this.pedidoForm.id)
        if (error) return alert('Erro ao atualizar pedido: ' + error.message)

        // Deleta itens antigos para inserir novos
        await supabase.from('itens_pedido').delete().eq('id_pedido', this.pedidoForm.id)
      } else {
        const { data, error } = await supabase.from('pedidos').insert([pedidoData]).select().single()
        if (error) return alert('Erro ao criar pedido: ' + error.message)
        this.pedidoForm.id = data.id
      }

      // Insere itens
      for (let item of this.pedidoForm.itens) {
        const { error } = await supabase.from('itens_pedido').insert([{
          id_pedido: this.pedidoForm.id,
          id_produto: item.id_produto,
          quantidade: item.quantidade,
          preco_unitario: item.preco_unitario
        }])
        if (error) return alert('Erro ao adicionar itens: ' + error.message)

        // Atualiza estoque
        const produto = this.produtos.find(p => p.id === item.id_produto)
        if (produto) {
          await supabase.from('produtos').update({ estoque: produto.estoque - item.quantidade }).eq('id', produto.id)
        }
      }

      alert('Pedido salvo com sucesso!')
      this.$router.push('/pedidos')
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
