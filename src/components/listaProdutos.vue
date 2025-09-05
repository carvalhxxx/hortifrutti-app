<template>
  <div class="app-container">
    <!-- Header -->
    <div class="produtos-header">
      <h1>Produtos</h1>
      <button @click="$router.push('/produtos/form')">Adicionar Produto</button>
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
        <h4>{{ produto.nome }}</h4>
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
/* Header flexível */
.produtos-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 20px;
}

.produtos-header h1 {
  margin: 0;
  color: #2c3e50;
}

.produtos-header button {
  padding: 10px 15px;
  border-radius: 6px;
  border: none;
  background-color: #1abc9c;
  color: white;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.produtos-header button:hover {
  background-color: #16a085;
}

/* Grid de filtros */
.filtros {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
  margin-bottom: 20px;
}

.filtros label {
  display: block;
  margin-bottom: 5px;
  font-weight: 600;
}

.filtros input,
.filtros select {
  width: 100%;
  padding: 8px 10px;
  border-radius: 6px;
  border: 1px solid #ccc;
  font-size: 14px;
  transition: border 0.2s;
}

.filtros input:focus,
.filtros select:focus {
  border-color: #1abc9c;
  outline: none;
}

/* Grid de produtos */
.lista-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 20px;
}

/* Card de produto */
.card-item {
  background-color: #fff;
  padding: 15px;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.card-item h4 {
  margin-bottom: 5px;
  color: #2c3e50;
}

.card-item p {
  margin: 0;
  font-size: 14px;
}

/* Botão dentro do card */
.card-item button {
  width: 100%;
  margin-top: 10px;
  padding: 8px 10px;
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.2s;
}

.card-item button:hover {
  background-color: #2980b9;
}

/* Responsividade */
@media (max-width: 768px) {
  .lista-grid {
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  }

  .produtos-header button {
    width: 100%;
  }
}
</style>
