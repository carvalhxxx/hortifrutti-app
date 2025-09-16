<template>
  <div class="app-container">
    <!-- Header -->
    <div class="produtos-header">
      <h1>Produtos</h1>
      <button @click="$router.push('/produtos/form')">Inserir</button>
    </div>

    <!-- Filtros -->
    <h3>Filtrar Produtos</h3>
    <form class="filtros">
      <div>
        <label>Nome:</label>
        <input type="text" v-model="filtroNome" placeholder="Pesquisar produto..." />
      </div>

      <div>
        <label>Categoria:</label>
        <select v-model="filtroCategoria">
          <option value="">Todas</option>
          <option v-for="cat in categorias" :key="cat.id" :value="cat.id">
            {{ cat.nome.charAt(0).toUpperCase() + cat.nome.slice(1) }}
          </option>
        </select>
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
        <p>Categoria: {{ getNomeCategoria(produto.categoria_id) }}</p>
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
      categorias: [],
      loading: true,
      error: null,

      // Filtros
      filtroNome: '',
      filtroCategoria: '',
      filtroUnidade: '',
      filtroEstoqueMin: null,
      filtroEstoqueMax: null
    }
  },
  async created() {
    try {
      // Buscar categorias
      const { data: categorias, error: catError } = await supabase.from('categorias').select('*')
      if (catError) {
        this.error = 'Erro ao buscar categorias: ' + catError.message
        return
      }
      this.categorias = categorias

      // Buscar produtos
      const { data: produtos, error: prodError } = await supabase.from('produtos').select('*')
      if (prodError) {
        this.error = 'Erro ao buscar produtos: ' + prodError.message
      } else {
        this.produtos = produtos
      }

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

        if (this.filtroCategoria) {
          ok = ok && prod.categoria_id === this.filtroCategoria
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
    },
    getNomeCategoria(categoriaId) {
      const cat = this.categorias.find(c => c.id === categoriaId)
      if (!cat) return ''
      return cat.nome.charAt(0).toUpperCase() + cat.nome.slice(1)
    }
  }
}
</script>

<style scoped>
.produtos-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
