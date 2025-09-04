<template>
  <div>
    <h2>Cadastro de Clientes</h2>
    <form @submit.prevent="salvarCliente">
      <input v-model="cliente.nome" placeholder="Nome do cliente" required />
      <input v-model="cliente.nome_fantasia" placeholder="Nome Fantasia" />
      <select v-model="cliente.tipo_cliente">
        <option value="PF">Pessoa Física</option>
        <option value="PJ">Pessoa Jurídica</option>
      </select>
      <input v-model="cliente.cnpj_cpf" placeholder="CPF/CNPJ" />
      <input v-model="cliente.ie" placeholder="Inscrição Estadual" />
      <input v-model="cliente.rua" placeholder="Rua" />
      <input v-model="cliente.numero" placeholder="Número" />
      <input v-model="cliente.complemento" placeholder="Complemento" />
      <input v-model="cliente.bairro" placeholder="Bairro" />
      <input v-model="cliente.cidade" placeholder="Cidade" />
      <input v-model="cliente.estado" placeholder="Estado" />
      <input v-model="cliente.cep" placeholder="CEP" />
      <input v-model="cliente.telefone" placeholder="Telefone principal" />
      <input v-model="cliente.telefone2" placeholder="Telefone secundário" />
      <input v-model="cliente.email" placeholder="Email" type="email" />
      <input v-model="cliente.contato_nome" placeholder="Nome do contato" />
      <input v-model="cliente.contato_cargo" placeholder="Cargo do contato" />
      <input v-model.number="cliente.limite_credito" placeholder="Limite de crédito" type="number" step="0.01" />
      <input v-model="cliente.observacoes" placeholder="Observações" />
      <select v-model="cliente.status">
        <option value="ativo">Ativo</option>
        <option value="inativo">Inativo</option>
      </select>

      <button type="submit">{{ cliente.id ? 'Atualizar' : 'Salvar' }}</button>
    </form>

    <h3>Lista de Clientes</h3>
    <table>
      <thead>
        <tr>
          <th>Nome</th>
          <th>Fantasia</th>
          <th>CPF/CNPJ</th>
          <th>Telefone</th>
          <th>Email</th>
          <th>Status</th>
          <th>Ações</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="c in clientes" :key="c.id">
          <td>{{ c.nome }}</td>
          <td>{{ c.nome_fantasia }}</td>
          <td>{{ c.cnpj_cpf }}</td>
          <td>{{ c.telefone }}</td>
          <td>{{ c.email }}</td>
          <td>{{ c.status }}</td>
          <td>
            <button @click="editarCliente(c)">Editar</button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '../supabase.js'

const cliente = ref({
  nome: '',
  nome_fantasia: '',
  tipo_cliente: 'PF',
  cnpj_cpf: '',
  ie: '',
  rua: '',
  numero: '',
  complemento: '',
  bairro: '',
  cidade: '',
  estado: '',
  cep: '',
  telefone: '',
  telefone2: '',
  email: '',
  contato_nome: '',
  contato_cargo: '',
  limite_credito: 0,
  observacoes: '',
  status: 'ativo'
})

const clientes = ref([])

const carregarClientes = async () => {
  const { data, error } = await supabase.from('clientes').select('*').order('nome')
  if (!error) clientes.value = data
}

const salvarCliente = async () => {
  try {
    const clienteToSave = { ...cliente.value }
    delete clienteToSave.id // remove o id para o Supabase gerar UUID

    let response
    if (cliente.value.id) {
      // Atualiza cliente existente
      response = await supabase.from('clientes').update(clienteToSave).eq('id', cliente.value.id)
    } else {
      // Insere novo cliente
      response = await supabase.from('clientes').insert([clienteToSave])
    }

    if (response.error) {
      return alert('Erro ao salvar cliente: ' + response.error.message)
    }

    alert('Cliente salvo com sucesso!')
    cliente.value = { tipo_cliente: 'PF', limite_credito: 0, status: 'ativo' }
    await carregarClientes()
  } catch (err) {
    alert('Erro ao salvar cliente: ' + err.message)
  }
}

const editarCliente = (c) => {
  cliente.value = { ...c }
}

onMounted(() => {
  carregarClientes()
})
</script>
