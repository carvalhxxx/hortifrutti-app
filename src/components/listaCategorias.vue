<template>
  <div class="app-container">
    <!-- Header com título e botão Adicionar Categoria -->
    <div class="produtos-header">
      <h1>Categorias</h1>
      <button @click="$router.push({ name: 'categoriasForm' })">Adicionar</button>
    </div>

    <!-- Grid de categorias -->
    <div v-if="loading">Carregando categorias...</div>
    <div v-else-if="error">{{ error }}</div>
    <div v-else class="lista-grid">
      <div v-for="categoria in categorias" :key="categoria.id" class="card-item">
        <h4>{{ categoria.nome }}</h4>
        <p>{{ categoria.descricao }}</p>
        <button @click="$router.push({ name: 'categoriasForm', params: { id: categoria.id } })">
          Editar
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { supabase } from '../supabase.js'

export default {
  name: 'CategoriasLista',
  data() {
    return {
      categorias: [],
      loading: true,
      error: null
    }
  },
  async created() {
    await this.buscarCategorias()
  },
  methods: {
    async buscarCategorias() {
      try {
        const { data, error } = await supabase
          .from('categorias')
          .select('*')
          .order('nome')
        if (error) {
          this.error = 'Erro ao buscar categorias: ' + error.message
        } else {
          this.categorias = data
        }
      } catch (err) {
        this.error = 'Erro inesperado: ' + err.message
      } finally {
        this.loading = false
      }
    }
  }
}
</script>

<style scoped>
.app-container {
  max-width: 700px;
  margin: 0 auto;
  padding: 20px;
}

.produtos-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.lista-grid {
  display: grid;
  gap: 15px;
}

.card-item {
  padding: 15px;
  border: 1px solid #ccc;
  border-radius: 6px;
}

button {
  padding: 8px 12px;
  cursor: pointer;
  margin-top: 10px;
}
</style>
