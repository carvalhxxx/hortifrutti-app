<template>
  <div class="app-container">
    <h1>{{ pedidoForm.id ? 'Editar Pedido' : 'Novo Pedido' }}</h1>

    <form @submit.prevent="salvarPedido" class="formulario">
      <!-- Cliente -->
      <div>
        <label>Cliente:</label>
        <select v-model="pedidoForm.id_cliente" required>
          <option value="" disabled>-- Selecione o cliente --</option>
          <option v-for="cliente in clientes" :key="cliente.id" :value="cliente.id">
            {{ cliente.nome }}
          </option>
        </select>
      </div>

      <!-- Motorista e Status lado a lado -->
      <div class="form-row">
        <div style="flex: 1">
          <label>Motorista:</label>
          <select v-model="pedidoForm.id_motorista">
            <option :value="null">-- Nenhum --</option>
            <option v-for="motorista in motoristas" :key="motorista.id" :value="motorista.id">
              {{ motorista.nome }}
            </option>
          </select>
        </div>

        <div style="width: 150px">
          <label>Status:</label>
          <select v-model="pedidoForm.status">
            <option v-for="s in statusDisponiveis" :key="s" :value="s">{{ s }}</option>
          </select>
        </div>
      </div>

      <!-- Data de entrega -->
      <div>
        <label>Data de Entrega:</label>
        <input type="date" v-model="pedidoForm.data_entrega" required />
      </div>

      <!-- Observações -->
      <div>
        <label>Observações:</label>
        <input type="text" v-model="pedidoForm.observacoes" placeholder="Observações" />
      </div>

      <!-- Itens do pedido -->
      <h2>Produtos</h2>
      <div v-for="(item, index) in pedidoForm.itens" :key="index" class="form-row">
        <div style="flex: 1">
          <select v-model="item.id_produto" @change="atualizarPreco(index)">
            <option value="" disabled>-- Selecione o produto --</option>
            <option v-for="produto in produtos" :key="produto.id" :value="produto.id">
              {{ produto.nome }} - R$ {{ formatarPreco(produto.preco) }} / {{ produto.unidade }} - Estoque: {{ produto.estoque }}
            </option>
          </select>
        </div>
        <input type="number" v-model.number="item.quantidade" min="0" :max="obterEstoque(item.id_produto)" :step="getStep(item.id_produto)" placeholder="Qtd" />
        <span>{{ obterUnidade(item.id_produto) }}</span>
        <button type="button" @click="removerItem(index)">Remover</button>
      </div>

      <button type="button" @click="adicionarItem">Adicionar Produto</button>

      <!-- Total -->
      <h3>Total: R$ {{ formatarPreco(calcularTotal()) }}</h3>

      <!-- Botões do formulário -->
      <div class="form-actions">
        <button type="submit">{{ pedidoForm.id ? 'Atualizar Pedido' : 'Salvar Pedido' }}</button>
        <button type="button" @click="cancelarEdicao">Cancelar</button>
      </div>
    </form>
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
      motoristas: [],
      statusDisponiveis: ['aberto','confirmado','separacao','rota','entregue','cancelado'],
      pedidoForm: {
        id: null,
        id_cliente: null,
        id_motorista: null,
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
          id_motorista: data.id_motorista,
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

      let pedidoData = {
        id_cliente: this.pedidoForm.id_cliente,
        id_motorista: this.pedidoForm.id_motorista,
        data_entrega: this.pedidoForm.data_entrega,
        status: this.pedidoForm.status,
        observacoes: this.pedidoForm.observacoes,
        valor_total: this.calcularTotal()
      }

      if (this.pedidoForm.id) {
        const { error } = await supabase.from('pedidos').update(pedidoData).eq('id', this.pedidoForm.id)
        if (error) return alert('Erro ao atualizar pedido: ' + error.message)
        await supabase.from('itens_pedido').delete().eq('id_pedido', this.pedidoForm.id)
      } else {
        const { data, error } = await supabase.from('pedidos').insert([pedidoData]).select().single()
        if (error) return alert('Erro ao criar pedido: ' + error.message)
        this.pedidoForm.id = data.id
      }

      for (let item of this.pedidoForm.itens) {
        const { error } = await supabase.from('itens_pedido').insert([{
          id_pedido: this.pedidoForm.id,
          id_produto: item.id_produto,
          quantidade: item.quantidade,
          preco_unitario: item.preco_unitario
        }])
        if (error) return alert('Erro ao adicionar itens: ' + error.message)

        const produto = this.produtos.find(p => p.id === item.id_produto)
        if (produto) {
          await supabase.from('produtos').update({ estoque: produto.estoque - item.quantidade }).eq('id', produto.id)
        }
      }

      alert('Pedido salvo com sucesso!')
      this.$router.push('/pedidos')
    },

    cancelarEdicao() {
      this.$router.push('/pedidos')
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

/* Formulário padronizado */
.formulario {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.formulario input,
.formulario select {
  width: 100%;
  padding: 10px;
  font-size: 14px;
  border-radius: 6px;
  border: 1px solid #ccc;
  transition: border 0.2s;
}

.formulario input:focus,
.formulario select:focus {
  outline: none;
  border-color: #1abc9c;
}

/* Linhas de campos lado a lado */
.form-row {
  display: flex;
  gap: 10px;
  align-items: center;
}

.form-row input {
  flex: 1;
}

.form-row select {
  flex: 1;
}

/* Botões do formulário */
.form-actions {
  display: flex;
  gap: 10px;
}

.form-actions button {
  padding: 10px 15px;
  border-radius: 6px;
  border: none;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.form-actions button[type="submit"] {
  background-color: #1abc9c;
  color: white;
}

.form-actions button[type="submit"]:hover {
  background-color: #16a085;
}

.form-actions button[type="button"] {
  background-color: #e74c3c;
  color: white;
}

.form-actions button[type="button"]:hover {
  background-color: #c0392b;
}
</style>
