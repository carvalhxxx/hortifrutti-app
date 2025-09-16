<template>
  <div class="app-container">
    <!-- Header -->
    <div class="produtos-header">
      <h1>{{ rotaForm.id ? 'Editar Rota' : 'Nova Rota' }}</h1>
    </div>

    <!-- ALERTA TOAST -->
    <div v-if="alerta.mostrar" :class="['alerta-toast', alerta.tipo]">
      {{ alerta.mensagem }}
    </div>

    <!-- Formulário -->
    <form @submit.prevent="salvarRota" class="formulario">
      <label>Motorista:</label>
      <select v-model="rotaForm.id_motorista" required>
        <option value="">Selecione</option>
        <option v-for="m in motoristas" :key="m.id" :value="m.id">{{ m.nome }}</option>
      </select>

      <label>Data de Saída:</label>
      <input type="datetime-local" v-model="rotaForm.data_saida" required />

      <label>Data de Chegada:</label>
      <input type="datetime-local" v-model="rotaForm.data_chegada" />

      <label>Status:</label>
      <select v-model="rotaForm.status">
        <option v-for="(label, key) in statusLabels" :key="key" :value="key">{{ label }}</option>
      </select>

      <label>Observações:</label>
      <input type="text" v-model="rotaForm.observacoes" placeholder="Observações" />

      <h2>Pedidos</h2>
      <div v-for="(pedido, index) in rotaForm.pedidos" :key="pedido.id_pedido" class="form-row">
        <span>{{ obterNomeCliente(pedido.id_pedido) }} - Status: {{ pedido.status_entrega }}</span>
        <button type="button" @click="removerPedido(index)">Remover</button>
      </div>

      <label>Adicionar Pedido:</label>
      <div class="form-row">
        <select v-model="pedidoSelecionado">
          <option value="">Selecione um pedido</option>
          <option v-for="p in pedidosDisponiveis" :key="p.id" :value="p.id">
            {{ obterNomeCliente(p.id) }} - Total: {{ formatarPreco(p.valor_total) }}
          </option>
        </select>
        <button type="button" @click="adicionarPedido">Adicionar</button>
      </div>

      <div class="form-actions">
        <button type="submit">{{ rotaForm.id ? 'Atualizar' : 'Salvar' }}</button>
        <button type="button" @click="cancelarEdicao">Cancelar</button>
      </div>
    </form>
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
      rotaForm: {
        id: null,
        id_motorista: '',
        data_saida: '',
        data_chegada: '',
        status: 'aberta',
        observacoes: '',
        pedidos: []
      },
      pedidoSelecionado: '',
      statusLabels: {
        aberta: 'Aberta',
        em_andamento: 'Em andamento',
        finalizada: 'Finalizada',
        cancelada: 'Cancelada'
      },
      alerta: { mostrar: false, mensagem: '', tipo: 'sucesso' }
    }
  },
  async created() {
    await this.buscarMotoristas()
    await this.buscarPedidos()
    this.carregarRota()
  },
  computed: {
    pedidosDisponiveis() {
      const ids = this.rotaForm.pedidos.map(p => p.id_pedido)
      return this.pedidos.filter(p => !ids.includes(p.id))
    }
  },
  methods: {
    mostrarAlerta(mensagem, tipo = 'sucesso') {
      this.alerta = { mostrar: true, mensagem, tipo }
      setTimeout(() => { this.alerta.mostrar = false }, 2500)
    },
    async buscarMotoristas() {
      const { data, error } = await supabase.from('motoristas').select('*').order('nome')
      if (!error) this.motoristas = data
    },
    async buscarPedidos() {
      const { data, error } = await supabase.from('pedidos').select('*').order('data_pedido', { ascending: false })
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
      if (!this.rotaForm.id_motorista) return this.mostrarAlerta('Selecione um motorista', 'erro')
      if (!this.rotaForm.data_saida) return this.mostrarAlerta('Selecione a data de saída', 'erro')

      let query = supabase.from('rotas')
        .select('*')
        .eq('id_motorista', this.rotaForm.id_motorista)
        .in('status', ['aberta','em_andamento'])

      if (this.rotaForm.id) query = query.neq('id', this.rotaForm.id)

      const { data: rotasAtivas, error: rotasError } = await query
      if (rotasError) return this.mostrarAlerta('Erro ao verificar rotas: ' + rotasError.message, 'erro')
      if (rotasAtivas.length > 0) return this.mostrarAlerta('Motorista já possui rota ativa', 'erro')

      const rotaData = {
        id_motorista: this.rotaForm.id_motorista,
        data_saida: this.rotaForm.data_saida,
        data_chegada: this.rotaForm.data_chegada || null,
        status: this.rotaForm.status,
        observacoes: this.rotaForm.observacoes
      }

      try {
        if (this.rotaForm.id) {
          const { error } = await supabase.from('rotas').update(rotaData).eq('id', this.rotaForm.id)
          if (error) throw error
          await supabase.from('rota_pedidos').delete().eq('id_rota', this.rotaForm.id)
        } else {
          const { data, error } = await supabase.from('rotas').insert([rotaData]).select().single()
          if (error) throw error
          this.rotaForm.id = data.id
        }

        for (let p of this.rotaForm.pedidos) {
          const { error } = await supabase.from('rota_pedidos').insert([{
            id_rota: this.rotaForm.id,
            id_pedido: p.id_pedido,
            status_entrega: p.status_entrega,
            data_entrega: p.data_entrega
          }])
          if (error) throw error
        }

        this.mostrarAlerta('Rota salva com sucesso!', 'sucesso')
        setTimeout(() => this.cancelarEdicao(), 1000)
      } catch(err) {
        this.mostrarAlerta('Erro ao salvar rota: ' + err.message, 'erro')
      }
    },
    cancelarEdicao() {
      this.rotaForm = {
        id: null,
        id_motorista: '',
        data_saida: '',
        data_chegada: '',
        status: 'aberta',
        observacoes: '',
        pedidos: []
      }
      this.$router.push('/rotas')
    }
  }
}
</script>

<style>
.app-container {
  max-width: 700px;
  margin: 0 auto;
  padding: 20px;
}

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

.form-row {
  display: flex;
  gap: 10px;
  align-items: center;
}

.form-row input,
.form-row select {
  flex: 1;
}

.form-actions {
  display: flex;
  gap: 10px;
}

.form-actions button,
.form-row button {
  padding: 10px 15px;
  border-radius: 6px;
  border: none;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.form-actions button[type="submit"],
.form-row button[type="button"] {
  background-color: #1abc9c;
  color: white;
}

.form-actions button[type="submit"]:hover,
.form-row button[type="button"]:hover {
  background-color: #16a085;
}

.form-actions button[type="button"] {
  background-color: #e74c3c;
}

.form-actions button[type="button"]:hover {
  background-color: #c0392b;
}

/* ALERTA FIXO TOAST */
.alerta-toast {
  position: fixed;
  top: 70px;
  left: 50%;
  transform: translateX(-50%);
  padding: 12px 20px;
  border-radius: 6px;
  font-weight: 600;
  color: white;
  z-index: 9999;
  box-shadow: 0 2px 6px rgba(0,0,0,0.2);
  animation: slide-down 0.3s ease;
}

.alerta-toast.sucesso {
  background-color: #1abc9c;
}

.alerta-toast.erro {
  background-color: #e74c3c;
}

@keyframes slide-down {
  from { opacity: 0; transform: translate(-50%, -20px); }
  to   { opacity: 1; transform: translate(-50%, 0); }
}
</style>
