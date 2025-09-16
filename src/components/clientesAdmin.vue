<template>
  <div class="app-container">
    <div class="produtos-header">
      <h1>{{ cliente.id ? 'Editar Cliente' : 'Novo Cliente' }}</h1>
    </div>

    <!-- ALERTA TOAST -->
    <div v-if="alerta.mostrar" :class="['alerta-toast', alerta.tipo]">
      {{ alerta.mensagem }}
    </div>

    <form @submit.prevent="salvarCliente" class="formulario">
      <input v-model="cliente.nome" placeholder="Nome do cliente" required />
      <input v-model="cliente.nome_fantasia" placeholder="Nome Fantasia" />

      <div class="form-row">
        <select v-model="cliente.tipo_cliente">
          <option value="PF">Pessoa Física</option>
          <option value="PJ">Pessoa Jurídica</option>
        </select>
        <input v-model="cliente.cnpj_cpf" placeholder="CPF/CNPJ" />
      </div>

      <input v-model="cliente.ie" placeholder="Inscrição Estadual" />
      <input v-model="cliente.rua" placeholder="Rua" />
      <div class="form-row">
        <input v-model="cliente.numero" placeholder="Número" />
        <input v-model="cliente.complemento" placeholder="Complemento" />
      </div>
      <input v-model="cliente.bairro" placeholder="Bairro" />
      <input v-model="cliente.cidade" placeholder="Cidade" />
      <div class="form-row">
        <input v-model="cliente.estado" placeholder="Estado" />
        <input v-model="cliente.cep" placeholder="CEP" />
      </div>
      <input v-model="cliente.telefone" placeholder="Telefone principal" />
      <input v-model="cliente.telefone2" placeholder="Telefone secundário" />
      <input v-model="cliente.email" type="email" placeholder="Email" />
      <div class="form-row">
        <input v-model="cliente.contato_nome" placeholder="Nome do contato" />
        <input v-model="cliente.contato_cargo" placeholder="Cargo do contato" />
      </div>
      <input v-model.number="cliente.limite_credito" type="number" step="0.01" placeholder="Limite de crédito" />
      <input v-model="cliente.observacoes" placeholder="Observações" />

      <select v-model="cliente.status">
        <option value="ativo">Ativo</option>
        <option value="inativo">Inativo</option>
      </select>

      <div class="form-actions">
        <button type="submit">{{ cliente.id ? 'Atualizar' : 'Salvar' }}</button>
        <button type="button" @click="cancelarEdicao">Cancelar</button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { supabase } from '../supabase.js'

const route = useRoute()
const router = useRouter()

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

// ALERTA TOAST
const alerta = ref({ mostrar: false, mensagem: '', tipo: 'sucesso' })

const mostrarAlerta = (mensagem, tipo = 'sucesso') => {
  alerta.value = { mostrar: true, mensagem, tipo }
  setTimeout(() => {
    alerta.value.mostrar = false
  }, 2500)
}

const carregarCliente = async (id) => {
  const { data, error } = await supabase.from('clientes').select('*').eq('id', id).single()
  if (!error && data) cliente.value = data
}

const salvarCliente = async () => {
  try {
    const clienteToSave = { ...cliente.value }
    delete clienteToSave.id

    let response
    if (cliente.value.id) {
      response = await supabase.from('clientes').update(clienteToSave).eq('id', cliente.value.id)
    } else {
      response = await supabase.from('clientes').insert([clienteToSave])
    }

    if (response.error) return mostrarAlerta('Erro ao salvar cliente: ' + response.error.message, 'erro')

    mostrarAlerta('Cliente salvo com sucesso!', 'sucesso')
    cliente.value = {
      nome: '', nome_fantasia: '', tipo_cliente: 'PF', cnpj_cpf: '', ie: '',
      rua: '', numero: '', complemento: '', bairro: '', cidade: '', estado: '',
      cep: '', telefone: '', telefone2: '', email: '', contato_nome: '', contato_cargo: '',
      limite_credito: 0, observacoes: '', status: 'ativo'
    }
    setTimeout(() => router.push('/clientes'), 1000)
  } catch (err) {
    mostrarAlerta('Erro ao salvar cliente: ' + err.message, 'erro')
  }
}

const cancelarEdicao = () => {
  cliente.value = {
    nome: '', nome_fantasia: '', tipo_cliente: 'PF', cnpj_cpf: '', ie: '',
    rua: '', numero: '', complemento: '', bairro: '', cidade: '', estado: '',
    cep: '', telefone: '', telefone2: '', email: '', contato_nome: '', contato_cargo: '',
    limite_credito: 0, observacoes: '', status: 'ativo'
  }
  router.push('/clientes')
}

onMounted(() => {
  if (route.params.id) carregarCliente(route.params.id)
})
</script>

<style scoped>
.app-container {
  max-width: 600px;
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
