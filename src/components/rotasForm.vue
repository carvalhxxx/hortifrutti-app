<template>
  <div>
    <h1>{{ rotaForm.id ? 'Editar Rota' : 'Nova Rota' }}</h1>

    <!-- Seleção do motorista -->
    <label>Motorista:</label>
    <select v-model="rotaForm.id_motorista">
      <option value="">Selecione</option>
      <option v-for="m in motoristas" :key="m.id" :value="m.id">{{ m.nome }}</option>
    </select>

    <!-- Data de saída -->
    <label>Data de Saída:</label>
    <input type="datetime-local" v-model="rotaForm.data_saida" />

    <!-- Data de chegada -->
    <label>Data de Chegada:</label>
    <input type="datetime-local" v-model="rotaForm.data_chegada" />

    <!-- Status -->
    <label>Status:</label>
    <select v-model="rotaForm.status">
      <option v-for="s in statusDisponiveis" :key="s" :value="s">{{ s }}</option>
    </select>

    <!-- Observações -->
    <label>Observações:</label>
    <input type="text" v-model="rotaForm.observacoes" placeholder="Observações" />

    <!-- Pedidos da rota -->
    <h2>Pedidos</h2>
    <div v-for="(pedido, index) in rotaForm.pedidos" :key="pedido.id" class="pedido-item">
      {{ obterNomeCliente(pedido.id_pedido) }} - Status: {{ pedido.status_entrega }}
      <button @click="removerPedido(index)">Remover</button>
    </div>

    <!-- Selecionar pedidos disponíveis -->
    <label>Adicionar Pedido:</label>
    <select v-model="pedidoSelecionado">
      <option value="">Selecione um pedido</option>
      <option v-for="p in pedidosDisponiveis" :key="p.id" :value="p.id">
        {{ obterNomeCliente(p.id) }} - Total: R$ {{ formatarPreco(p.valor_total) }}
      </option>
    </select>
    <button @click="adicionarPedido">Adicionar</button>

    <br><br>
    <button @click="salvarRota">{{ rotaForm.id ? 'Atualizar Rota' : 'Salvar Rota' }}</button>
  </div>
</template>

<script>
import { supabase } from '../supabase.js'

export default {
  name: 'RotasForm',
  data() {
    return {
      motoristas: [],
      pedidos: [],
      statusDisponiveis: ['aberta','em_andamento','finalizada','cancelada'],
      rotaForm: {
        id: null,
        id_motorista: '',
        data_saida: '',
        data_chegada: '',
        status: 'aberta',
        observacoes: '',
        pedidos: [] // pedidos vinculados {id_pedido, status_entrega, data_entrega}
      },
      pedidoSelecionado: ''
    }
  },
  async created() {
    await this.buscarMotoristas()
    await this.buscarPedidos()
    this.carregarRota()
  },
  computed: {
    pedidosDisponiveis() {
      // Exclui pedidos já vinculados à rota
      const ids = this.rotaForm.pedidos.map(p => p.id_pedido)
      return this.pedidos.filter(p => !ids.includes(p.id))
    }
  },
  methods: {
    async buscarMotoristas() {
      const { data, error } = await supabase.from('motoristas').select('*').order('nome')
      if (!error) this.motoristas = data
    },
    async buscarPedidos() {
      const { data, error } = await supabase.from('pedidos')
        .select('*')
        .order('data_pedido', { ascending: false })
      if (!error) this.pedidos = data
    },
    async carregarRota() {
      const id = this.$route.params.id
      if (!id) return
      const { data, error } = await supabase.from('rotas')
        .select(`*, pedidos:rota_pedidos(*)`)
        .eq('id', id)
        .single()
      if (!error) {
        this.rotaForm.id = data.id
        this.rotaForm.id_motorista = data.id_motorista
        this.rotaForm.data_saida = data.data_saida ? data.data_saida.substring(0,16) : ''
        this.rotaForm.data_chegada = data.data_chegada ? data.data_chegada.substring(0,16) : ''
        this.rotaForm.status = data.status
        this.rotaForm.observacoes = data.observacoes
        this.rotaForm.pedidos = data.pedidos.map(p => ({
          id_pedido: p.id_pedido,
          status_entrega: p.status_entrega,
          data_entrega: p.data_entrega
        }))
      }
    },
    obterNomeCliente(id_pedido) {
      const pedido = this.pedidos.find(p => p.id === id_pedido)
      return pedido ? `Pedido ${pedido.id}` : ''
    },
    formatarPreco(valor) {
      if (valor == null) return '0,00'
      return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor)
    },
    adicionarPedido() {
      if (!this.pedidoSelecionado) return
      this.rotaForm.pedidos.push({
        id_pedido: this.pedidoSelecionado,
        status_entrega: 'pendente',
        data_entrega: null
      })
      this.pedidoSelecionado = ''
    },
    removerPedido(index) {
      this.rotaForm.pedidos.splice(index, 1)
    },
    async salvarRota() {
      if (!this.rotaForm.id_motorista) return alert('Selecione um motorista')
      if (!this.rotaForm.data_saida) return alert('Selecione a data de saída')

      const rotaData = {
        id_motorista: this.rotaForm.id_motorista,
        data_saida: this.rotaForm.data_saida,
        data_chegada: this.rotaForm.data_chegada || null,
        status: this.rotaForm.status,
        observacoes: this.rotaForm.observacoes
      }

      if (this.rotaForm.id) {
        // Atualizar rota
        const { error } = await supabase.from('rotas').update(rotaData).eq('id', this.rotaForm.id)
        if (error) return alert('Erro ao atualizar rota: ' + error.message)

        // Deletar pedidos antigos
        await supabase.from('rota_pedidos').delete().eq('id_rota', this.rotaForm.id)
      } else {
        // Criar rota
        const { data, error } = await supabase.from('rotas').insert([rotaData]).select().single()
        if (error) return alert('Erro ao criar rota: ' + error.message)
        this.rotaForm.id = data.id
      }

      // Inserir pedidos vinculados
      for (let p of this.rotaForm.pedidos) {
        const { error } = await supabase.from('rota_pedidos').insert([{
          id_rota: this.rotaForm.id,
          id_pedido: p.id_pedido,
          status_entrega: p.status_entrega,
          data_entrega: p.data_entrega
        }])
        if (error) return alert('Erro ao adicionar pedidos à rota: ' + error.message)
      }

      alert('Rota salva com sucesso!')
      this.$router.push('/rotas')
    }
  }
}
</script>

<style scoped>
label {
  display: block;
  margin-top: 10px;
}
input, select {
  padding: 5px;
  margin-bottom: 5px;
}
.pedido-item {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 5px;
}
button {
  padding: 5px 10px;
  cursor: pointer;
}
</style>
