<template>
  <div>
    <h1>Administração de Clientes</h1>

    <!-- Botão para abrir formulário -->
    <button @click="showForm = true">Adicionar Cliente</button>

    <!-- Formulário modal -->
    <div v-if="showForm" class="modal">
      <form @submit.prevent="salvarCliente">
        <input type="text" v-model="clienteForm.nome" placeholder="Nome" required />
        <input type="text" v-model="clienteForm.contato" placeholder="Telefone ou email" />
        <input type="text" v-model="clienteForm.endereco" placeholder="Endereço" />
        
        <button type="submit">{{ clienteForm.id ? 'Atualizar' : 'Adicionar' }}</button>
        <button type="button" @click="cancelarEdicao">Cancelar</button>
      </form>
    </div>

    <!-- Lista de clientes -->
    <ul>
      <li v-for="cliente in clientes" :key="cliente.id">
        {{ cliente.nome }} - {{ cliente.contato }} - {{ cliente.endereco }}
        <button @click="editarCliente(cliente)">Editar</button>
        <button @click="excluirCliente(cliente.id)">Excluir</button>
      </li>
    </ul>
  </div>
</template>

<script>
import { supabase } from '../supabase.js'

export default {
  name: 'clientesAdmin',
  data() {
    return {
      clientes: [],
      clienteForm: {
        id: null,
        nome: '',
        contato: '',
        endereco: ''
      },
      showForm: false,
      loading: false,
      error: null
    }
  },
  async created() {
    await this.buscarClientes()
  },
  methods: {
    async buscarClientes() {
      this.loading = true
      const { data, error } = await supabase.from('clientes').select('*').order('nome')
      if (error) {
        console.error(error)
        this.error = 'Erro ao carregar clientes'
      } else {
        this.clientes = data
      }
      this.loading = false
    },

    async salvarCliente() {
      if (this.clienteForm.id) {
        // Atualizar cliente
        const { error } = await supabase
          .from('clientes')
          .update({
            nome: this.clienteForm.nome,
            contato: this.clienteForm.contato,
            endereco: this.clienteForm.endereco
          })
          .eq('id', this.clienteForm.id)
        if (error) return alert('Erro ao atualizar cliente: ' + error.message)
      } else {
        // Adicionar cliente
        const { error } = await supabase
          .from('clientes')
          .insert([{
            nome: this.clienteForm.nome,
            contato: this.clienteForm.contato,
            endereco: this.clienteForm.endereco
          }])
        if (error) return alert('Erro ao adicionar cliente: ' + error.message)
      }

      this.clienteForm = { id: null, nome: '', contato: '', endereco: '' }
      this.showForm = false
      await this.buscarClientes()
    },

    editarCliente(cliente) {
      this.clienteForm = { ...cliente }
      this.showForm = true
    },

    cancelarEdicao() {
      this.clienteForm = { id: null, nome: '', contato: '', endereco: '' }
      this.showForm = false
    },

    async excluirCliente(id) {
      if (!confirm('Deseja realmente excluir este cliente?')) return
      const { error } = await supabase.from('clientes').delete().eq('id', id)
      if (error) return alert('Erro ao excluir cliente: ' + error.message)
      await this.buscarClientes()
    }
  }
}
</script>

<style scoped>
ul {
  list-style: none;
  padding: 0;
}
li {
  margin: 10px 0;
}
input {
  margin-right: 5px;
  margin-bottom: 5px;
}
button {
  margin-left: 5px;
}
.modal {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: white;
  padding: 20px;
  border-radius: 6px;
  box-shadow: 0 5px 15px rgba(0,0,0,0.3);
  z-index: 1000;
}
</style>
