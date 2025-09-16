<template>
  <div class="app-container">
    <div class="produtos-header">
      <h1>{{ motoristaForm.id ? 'Editar Motorista' : 'Novo Motorista' }}</h1>
    </div>

    <!-- ALERTA TOAST -->
    <div v-if="alerta.mostrar" :class="['alerta-toast', alerta.tipo]">
      {{ alerta.mensagem }}
    </div>

    <form @submit.prevent="salvarMotorista" class="formulario">
      <input v-model="motoristaForm.nome" placeholder="Nome do motorista" required />
      <input v-model="motoristaForm.cpf" placeholder="CPF" />
      <input v-model="motoristaForm.telefone" placeholder="Telefone" />
      <select v-model="motoristaForm.status">
        <option value="ativo">Ativo</option>
        <option value="inativo">Inativo</option>
      </select>
      <input v-model="motoristaForm.veiculo" placeholder="Veículo" />
      <input v-model="motoristaForm.placa" placeholder="Placa do veículo" />

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
import { createClient } from '@supabase/supabase-js'

// Supabase Admin (service_role key!)
const supabaseUrl = 'https://zxlbuwhoyemzfrsxmpjf.supabase.co'
const supabaseServiceKey = 'SUA_SERVICE_ROLE_KEY_AQUI' // NUNCA EXPOR NO FRONTEND
const supabase = createClient(supabaseUrl, supabaseServiceKey)

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

// ALERTA TOAST
const alerta = ref({ mostrar: false, mensagem: '', tipo: 'sucesso' })
const mostrarAlerta = (mensagem, tipo = 'sucesso') => {
  alerta.value = { mostrar: true, mensagem, tipo }
  setTimeout(() => alerta.value.mostrar = false, 2500)
}

const carregarMotorista = async (id) => {
  const { data, error } = await supabase.from('motoristas').select('*').eq('id', id).single()
  if (!error && data) motoristaForm.value = data
}

const salvarMotorista = async () => {
  const dados = { ...motoristaForm.value }
  delete dados.id

  try {
    let idAuth

    // Se for novo motorista, cria o usuário no Auth
    if (!motoristaForm.value.id) {
      const senhaPadrao = 'Senha123!' // ou gere uma senha aleatória
      const emailFicticio = `${dados.nome.replace(/\s+/g, '').toLowerCase()}@meusistema.local`

      const { data: user, error: authError } = await supabase.auth.admin.createUser({
        email: emailFicticio,
        password: senhaPadrao,
        email_confirm: true
      })

      if (authError) throw authError
      idAuth = user.id
    } else {
      idAuth = motoristaForm.value.id_auth
    }

    // Salva ou atualiza motorista
    const motoristaData = {
      ...dados,
      id_auth: idAuth
    }

    if (motoristaForm.value.id) {
      const { error } = await supabase.from('motoristas').update(motoristaData).eq('id', motoristaForm.value.id)
      if (error) throw error
      mostrarAlerta('Motorista atualizado com sucesso!', 'sucesso')
    } else {
      const { data, error } = await supabase.from('motoristas').insert([motoristaData]).select().single()
      if (error) throw error
      motoristaForm.value.id = data.id
      mostrarAlerta('Motorista cadastrado com sucesso!', 'sucesso')
    }

    setTimeout(() => cancelarEdicao(), 1000)
  } catch (err) {
    mostrarAlerta('Erro ao salvar motorista: ' + err.message, 'erro')
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
/* Campos de login */
.form-login {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 10px;
}

.form-login input {
  width: 100%;
  padding: 10px;
  font-size: 14px;
  border-radius: 6px;
  border: 1px solid #ccc;
}

.form-login input:focus {
  outline: none;
  border-color: #1abc9c;
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

.form-row input,
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
