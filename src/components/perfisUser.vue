<template>
  <div>
    <h2>Gestão de Perfis</h2>

    <!-- Botão para criar novo perfil -->
    <button @click="novoPerfilAberto = !novoPerfilAberto">
      {{ novoPerfilAberto ? 'Cancelar' : 'Adicionar Perfil' }}
    </button>

    <!-- Formulário de criação/edição -->
    <div v-if="novoPerfilAberto" class="form-perfil">
      <input v-model="nome" placeholder="Nome do usuário" />
      <select v-model="role">
        <option value="usuario">Usuário</option>
        <option value="admin">Admin</option>
      </select>
      <button @click="salvarPerfil">{{ editando ? 'Atualizar' : 'Salvar' }}</button>
    </div>

    <!-- Mensagem de erro -->
    <p v-if="error" class="erro">{{ error }}</p>

    <!-- Lista de perfis -->
    <ul v-if="perfils.length">
      <li v-for="p in perfils" :key="p.id">
        {{ p.nome }} - {{ p.role }}
        <button @click="editarPerfil(p)">Editar</button>
        <button @click="removerPerfil(p)">Excluir</button>
      </li>
    </ul>
    <p v-else>Nenhum perfil encontrado.</p>
  </div>
</template>

<script>
import { supabase } from '../supabase.js'

export default {
  name: 'perfisUser',
  data() {
    return {
      perfils: [],
      error: null,
      novoPerfilAberto: false,
      nome: '',
      role: 'usuario',
      editando: false,
      perfilEditandoId: null
    }
  },
  async created() {
    await this.carregarPerfis()
  },
  methods: {
    // Carrega todos os perfis
    async carregarPerfis() {
      const { data, error } = await supabase.from('perfis').select('*').order('nome')
      if (error) {
        this.error = 'Não foi possível carregar os perfis.'
        console.error(error)
      } else {
        this.perfils = data
      }
    },

    // Abre formulário para editar um perfil
    editarPerfil(perfil) {
      this.nome = perfil.nome
      this.role = perfil.role
      this.perfilEditandoId = perfil.id
      this.editando = true
      this.novoPerfilAberto = true
    },

    // Cria ou atualiza perfil
    async salvarPerfil() {
      if (!this.nome) return alert('Digite um nome')

      try {
        if (this.editando) {
          // Atualiza perfil
          const { error } = await supabase.from('perfis')
            .update({ nome: this.nome, role: this.role })
            .eq('id', this.perfilEditandoId)
          if (error) throw error
        } else {
          // Cria novo perfil
          const { error } = await supabase.from('perfis')
            .insert([{ nome: this.nome, role: this.role }])
          if (error) throw error
        }

        // Resetar formulário e atualizar lista
        this.nome = ''
        this.role = 'usuario'
        this.editando = false
        this.perfilEditandoId = null
        this.novoPerfilAberto = false
        await this.carregarPerfis()
      } catch (err) {
        alert('Erro ao salvar perfil: ' + err.message)
      }
    },

    // Deleta perfil
    async removerPerfil(perfil) {
      if (!confirm(`Deseja realmente excluir ${perfil.nome}?`)) return
      const { error } = await supabase.from('perfis').delete().eq('id', perfil.id)
      if (error) return alert('Erro ao excluir perfil: ' + error.message)
      await this.carregarPerfis()
    }
  }
}
</script>

<style>
.erro { color: red; font-weight: bold; }
.form-perfil { margin: 10px 0; display: flex; gap: 10px; align-items: center; }
.form-perfil input, .form-perfil select { padding: 5px; }
.form-perfil button { padding: 5px 10px; }
ul li button { margin-left: 5px; }
</style>
