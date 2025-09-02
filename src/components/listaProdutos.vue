<template>
  <div>
    <h1>Produtos</h1>

    <div v-if="loading">Carregando produtos...</div>
    <div v-else-if="error">{{ error }}</div>
    <ul v-else>
      <li v-for="produto in produtos" :key="produto.id">
        {{ produto.nome }} - R$ {{ produto.preco }}
      </li>
    </ul>
  </div>
</template>

<script>
import { supabase } from '../supabase.js'

export default {
  name: 'ListaProdutos',
  data() {
    return {
      produtos: [],
      loading: true,
      error: null
    }
  },
  async created() {
    try {
      const { data: produtos, error } = await supabase
        .from('produtos')
        .select('*')

      if (error) {
        this.error = 'Erro ao buscar produtos: ' + error.message
        console.error(error)
      } else {
        this.produtos = produtos
      }
    } catch (err) {
      this.error = 'Erro inesperado: ' + err.message
      console.error(err)
    } finally {
      this.loading = false
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
  margin: 5px 0;
}
</style>
