<template>
  <div>
    <h2>Cadastro de Clientes</h2>
    <form @submit.prevent="salvarCliente">
      <input v-model="cliente.nome" placeholder="Nome do cliente" required />

      <input v-model="cliente.cnpj" placeholder="CNPJ" />

      <input v-model="cliente.telefone" placeholder="Telefone" />

      <input v-model="cliente.endereco" placeholder="Endereço" />

      <button type="submit">Salvar</button>
    </form>

    <h3>Lista de Clientes</h3>
    <table>
      <thead>
        <tr>
          <th>Nome</th>
          <th>CNPJ</th>
          <th>Telefone</th>
          <th>Endereço</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="c in clientes" :key="c.id">
          <td>{{ c.nome }}</td>
          <td>{{ c.cnpj }}</td>
          <td>{{ c.telefone }}</td>
          <td>{{ c.endereco }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '../supabase'

const cliente = ref({
  nome: '',
  cnpj: '',
  telefone: '',
  endereco: ''
})

const clientes = ref([])

const carregarClientes = async () => {
  let { data, error } = await supabase.from('clientes').select('*')
  if (!error) clientes.value = data
}

const salvarCliente = async () => {
  let { error } = await supabase.from('clientes').insert([cliente.value])
  if (!error) {
    await carregarClientes()
    cliente.value = { nome: '', cnpj: '', telefone: '', endereco: '' }
  }
}

onMounted(() => {
  carregarClientes()
})
</script>
