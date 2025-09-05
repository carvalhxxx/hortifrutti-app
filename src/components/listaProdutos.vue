<template>
  <div class="app-container">
    <!-- Header -->
    <div class="produtos-header">
      <h1>Produtos</h1>
      <button @click="$router.push('/produtos/form')">Novo Produto</button>
    </div>

    <!-- Filtros -->
    <h3>Filtrar Produtos</h3>
    <form class="filtros">
      <div>
        <label>Nome:</label>
        <input type="text" v-model="filtroNome" placeholder="Pesquisar produto..." />
      </div>

      <div>
        <label>Unidade:</label>
        <select v-model="filtroUnidade">
          <option value="">Todas</option>
          <option value="kg">Kg</option>
          <option value="un">Unidade</option>
          <option value="l">Litro</option>
        </select>
      </div>

      <div>
        <label>Estoque mínimo:</label>
        <input type="number" v-model.number="filtroEstoqueMin" placeholder="0" />
      </div>

      <div>
        <label>Estoque máximo:</label>
        <input type="number" v-model.number="filtroEstoqueMax" placeholder="0" />
      </div>
    </form>

    <!-- Status de carregamento / erro -->
    <div v-if="loading" class="loading">Carregando produtos...</div>
    <div v-else-if="error" class="error">{{ error }}</div>

    <!-- Grid de produtos filtrados -->
    <div v-else class="lista-grid">
      <div
        v-for="produto in produtosFiltrados"
        :key="produto.id"
        class="card-item"
      >
        <h4>{{ produto.nome.charAt(0).toUpperCase() + produto.nome.slice(1).toLowerCase() }}</h4>
        <p>Preço: {{ formatarPreco(produto.preco) }}</p>
        <p>Estoque: {{ produto.estoque }}</p>
        <p>Unidade: {{ produto.unidade }}</p>
        <!-- Botão Editar -->
        <button @click="$router.push({ path: '/produtos/form', query: { id: produto.id } })">
          Editar
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { supabase } from '../supabase.js'

export default {
  name: 'listaProdutos',
  data() {
    return {
      produtos: [],
      loading: true,
      error: null,

      // Filtros
      filtroNome: '',
      filtroUnidade: '',
      filtroEstoqueMin: null,
      filtroEstoqueMax: null
    }
  },
  async created() {
    try {
      const { data: produtos, error } = await supabase.from('produtos').select('*')
      if (error) this.error = 'Erro ao buscar produtos: ' + error.message
      else this.produtos = produtos
    } catch (err) {
      this.error = 'Erro inesperado: ' + err.message
    } finally {
      this.loading = false
    }
  },
  computed: {
    produtosFiltrados() {
      return this.produtos.filter(prod => {
        let ok = true

        if (this.filtroNome) {
          ok = ok && prod.nome.toLowerCase().includes(this.filtroNome.toLowerCase())
        }

        if (this.filtroUnidade) {
          ok = ok && prod.unidade === this.filtroUnidade
        }

        if (this.filtroEstoqueMin != null) {
          ok = ok && prod.estoque >= this.filtroEstoqueMin
        }

        if (this.filtroEstoqueMax != null) {
          ok = ok && prod.estoque <= this.filtroEstoqueMax
        }

        return ok
      })
    }
  },
  methods: {
    formatarPreco(valor) {
      if (valor == null) return '0,00'
      return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor)
    }
  }
}
</script>

<style scoped>
/* Só o header, o resto já vem do global.css */
.produtos-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
