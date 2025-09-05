<template>
  <div class="app-container">
    <div class="produtos-header">
      <h1>{{ motoristaForm.id ? 'Editar Motorista' : 'Novo Motorista' }}</h1>
    </div>

    <form @submit.prevent="salvarMotorista" class="formulario">
      <input type="text" v-model="motoristaForm.nome" placeholder="Nome do motorista" required />
      <input type="text" v-model="motoristaForm.cpf" placeholder="CPF" />
      <input type="text" v-model="motoristaForm.telefone" placeholder="Telefone" />
      <select v-model="motoristaForm.status">
        <option value="ativo">Ativo</option>
        <option value="inativo">Inativo</option>
      </select>
      <input type="text" v-model="motoristaForm.veiculo" placeholder="Veículo" />
      <input type="text" v-model="motoristaForm.placa" placeholder="Placa do veículo" />

      <div class="form-actions">
        <button type="submit">{{ motoristaForm.id ? 'Atualizar' : 'Salvar' }}</button>
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

const motoristaForm = ref({
  id: null,
  nome: '',
  cpf: '',
  telefone: '',
  status: 'ativo',
  veiculo: '',
  placa: ''
})

const carregarMotorista = async (id) => {
  const { data, error } = await supabase.from('motoristas').select('*').eq('id', id).single()
  if (!error && data) motoristaForm.value = data
}

const salvarMotorista = async () => {
  const dados = { ...motoristaForm.value }
  delete dados.id

  try {
    if (motoristaForm.value.id) {
      const { error } = await supabase.from('motoristas').update(dados).eq('id', motoristaForm.value.id)
      if (error) throw error
      alert('Motorista atualizado com sucesso!')
    } else {
      const { data, error } = await supabase.from('motoristas').insert([dados]).select().single()
      if (error) throw error
      motoristaForm.value.id = data.id
      alert('Motorista cadastrado com sucesso!')
    }
    cancelarEdicao()
  } catch (err) {
    alert('Erro ao salvar motorista: ' + err.message)
  }
}

const cancelarEdicao = () => {
  motoristaForm.value = {
    id: null,
    nome: '',
    cpf: '',
    telefone: '',
    status: 'ativo',
    veiculo: '',
    placa: ''
  }
  router.push('/motoristas')
}

onMounted(() => {
  if (route.params.id) carregarMotorista(route.params.id)
})
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