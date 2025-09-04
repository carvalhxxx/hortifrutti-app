<template>
  <div>
    <h1>Cadastro de Motoristas</h1>

    <!-- Formulário de cadastro/edição -->
    <div class="formulario">
      <label>Nome:</label>
      <input type="text" v-model="motoristaForm.nome" placeholder="Nome do motorista" />

      <label>CPF:</label>
      <input type="text" v-model="motoristaForm.cpf" placeholder="CPF" />

      <label>Telefone:</label>
      <input type="text" v-model="motoristaForm.telefone" placeholder="Telefone" />

      <label>Status:</label>
      <select v-model="motoristaForm.status">
        <option value="ativo">Ativo</option>
        <option value="inativo">Inativo</option>
      </select>

      <label>Veículo:</label>
      <input type="text" v-model="motoristaForm.veiculo" placeholder="Veículo" />

      <label>Placa:</label>
      <input type="text" v-model="motoristaForm.placa" placeholder="Placa do veículo" />

      <button @click="salvarMotorista">
        {{ motoristaForm.id ? 'Atualizar Motorista' : 'Salvar Motorista' }}
      </button>
      <button @click="limparFormulario">Cancelar</button>
    </div>

    <!-- Lista de motoristas -->
    <h2>Motoristas Cadastrados</h2>
    <ul>
      <li v-for="motorista in motoristas" :key="motorista.id">
        {{ motorista.nome }} - {{ motorista.telefone }} - {{ motorista.status }}
        <button @click="editarMotorista(motorista)">Editar</button>
      </li>
    </ul>
  </div>
</template>

<script>
import { supabase } from '../supabase.js'

export default {
  name: 'MotoristasAdmin',
  data() {
    return {
      motoristas: [],
      motoristaForm: {
        id: null,
        nome: '',
        cpf: '',
        telefone: '',
        status: 'ativo',
        veiculo: '',
        placa: ''
      }
    }
  },
  async created() {
    await this.buscarMotoristas()
  },
  methods: {
    async buscarMotoristas() {
      const { data, error } = await supabase.from('motoristas').select('*').order('nome')
      if (!error) this.motoristas = data
    },

    async salvarMotorista() {
      if (!this.motoristaForm.nome) return alert('Nome é obrigatório')

      if (this.motoristaForm.id) {
        // Atualização
        const { error } = await supabase.from('motoristas')
          .update({
            nome: this.motoristaForm.nome,
            cpf: this.motoristaForm.cpf,
            telefone: this.motoristaForm.telefone,
            status: this.motoristaForm.status,
            veiculo: this.motoristaForm.veiculo,
            placa: this.motoristaForm.placa,
            updated_at: new Date()
          })
          .eq('id', this.motoristaForm.id)
        if (error) return alert('Erro ao atualizar: ' + error.message)
      } else {
        // Inserção (não envia id, será gerado automaticamente)
        const { data, error } = await supabase.from('motoristas').insert([{
          nome: this.motoristaForm.nome,
          cpf: this.motoristaForm.cpf,
          telefone: this.motoristaForm.telefone,
          status: this.motoristaForm.status,
          veiculo: this.motoristaForm.veiculo,
          placa: this.motoristaForm.placa
        }]).select().single()
        if (error) return alert('Erro ao salvar: ' + error.message)

        // Atualiza formulário com ID gerado
        this.motoristaForm.id = data.id
      }

      alert('Motorista salvo com sucesso!')
      this.limparFormulario()
      await this.buscarMotoristas()
    },

    editarMotorista(motorista) {
      this.motoristaForm = { ...motorista }
    },

    limparFormulario() {
      this.motoristaForm = {
        id: null,
        nome: '',
        cpf: '',
        telefone: '',
        status: 'ativo',
        veiculo: '',
        placa: ''
      }
    }
  }
}
</script>

<style scoped>
.formulario {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 20px;
}

.formulario input,
.formulario select {
  padding: 5px;
}

button {
  padding: 5px 10px;
  cursor: pointer;
}
</style>
