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

        <div style="width: 120px">
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
      <div v-for="(item, index) in pedidoForm.itens" :key="index" class="item-card-mobile">
        <select v-model="item.id_produto" @change="atualizarPreco(index)">
          <option value="" disabled>-- Selecione o produto --</option>
          <option v-for="produto in produtos" :key="produto.id" :value="produto.id">
            {{ produto.nome }}
          </option>
        </select>

        <div class="item-row">
          <input type="number"
                 v-model.number="item.quantidade"
                 min="0"
                 :max="obterEstoque(item.id_produto)"
                 :step="getStep(item.id_produto)" />
          <span>{{ obterUnidade(item.id_produto) }}</span>
          <span class="item-total">R$ {{ formatarPreco(item.quantidade * item.preco_unitario) }}</span>
          <button type="button" class="remove-x" @click="removerItem(index)">×</button>
        </div>
      </div>

      <button type="button" @click="adicionarItem">Adicionar Produto</button>

      <!-- Total Geral -->
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
      statusDisponiveis: ['Aberto','Confirmado','Separacao','Rota','Entregue','Cancelado'],
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
  try {
    const pedidoData = {
      id_cliente: this.pedidoForm.id_cliente,
      id_motorista: this.pedidoForm.id_motorista || null,
      data_entrega: this.pedidoForm.data_entrega,
      status: this.pedidoForm.status,
      observacoes: this.pedidoForm.observacoes,
      valor_total: this.calcularTotal()
    }

    let pedidoAntigo = null
    if (this.pedidoForm.id) {
      // Buscar o status antigo do pedido
      const { data, error } = await supabase
        .from('pedidos')
        .select('status')
        .eq('id', this.pedidoForm.id)
        .single()
      if (!error) pedidoAntigo = data
    }

    if (!this.pedidoForm.id) {
      // Criar pedido novo
      const { data, error } = await supabase
        .from('pedidos')
        .insert([pedidoData])
        .select()
        .single()
      if (error) throw error
      this.pedidoForm.id = data.id
    } else {
      // Atualizar pedido existente
      const { error } = await supabase
        .from('pedidos')
        .update(pedidoData)
        .eq('id', this.pedidoForm.id)
      if (error) throw error

      // Limpa itens antigos
      await supabase.from('itens_pedido').delete().eq('id_pedido', this.pedidoForm.id)
    }

    // Inserir itens
    for (let item of this.pedidoForm.itens) {
      await supabase.from('itens_pedido').insert([{
        id_pedido: this.pedidoForm.id,
        id_produto: item.id_produto,
        quantidade: item.quantidade,
        preco_unitario: item.preco_unitario
      }])
    }

    // 🔥 Controle de estoque
    const mudouParaConfirmado =
      (!this.pedidoForm.id && this.pedidoForm.status === 'Confirmado') ||
      (pedidoAntigo && pedidoAntigo.status !== 'Confirmado' && this.pedidoForm.status === 'Confirmado')

    if (mudouParaConfirmado) {
      for (let item of this.pedidoForm.itens) {
        const produto = this.produtos.find(p => p.id === item.id_produto)
        if (produto) {
          await supabase
            .from('produtos')
            .update({ estoque: produto.estoque - item.quantidade })
            .eq('id', produto.id)
        }
      }
    }

    alert('Pedido salvo com sucesso!')
    this.$router.push('/pedidos')
  } catch (err) {
    console.error(err)
    alert('Erro ao salvar pedido: ' + err.message)
  }
},

    cancelarEdicao() {
      this.$router.push('/pedidos')
    }
  }
}
</script>

<style scoped>
.item-card-mobile {
  display: flex;
  flex-direction: column;
  gap: 5px;
  background-color: #fff;
  padding: 8px 10px;
  border-radius: 8px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.1);
  margin-bottom: 10px;
}

.item-card-mobile select {
  width: 100%;
  font-size: 14px;
  padding: 6px;
}

.item-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 5px;
}

.item-row input {
  width: 50px;
  font-size: 14px;
  padding: 4px;
}

.item-total {
  font-weight: 600;
  font-size: 14px;
  min-width: 70px;
  text-align: right;
}

.remove-x {
  background: none;
  border: none;
  color: #e74c3c;
  font-size: 18px;
  font-weight: bold;
  cursor: pointer;
}

.remove-x:hover {
  color: #c0392b;
}

/* Responsividade Mobile */
@media (max-width: 480px) {
  .item-row {
    flex-wrap: wrap;
    gap: 5px;
  }

  .item-total {
    min-width: auto;
    flex: 1;
  }
}
</style>
