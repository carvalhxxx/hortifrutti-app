<template>
  <div>
    <h1>Administração de Produtos</h1>

    <!-- Formulário para adicionar/editar -->
    <form @submit.prevent="salvarProduto" class="form-produto">
      <input type="text" v-model="produtoForm.nome" placeholder="Nome do produto" required />

      <!-- Preço + unidade lado a lado -->
      <div class="preco-unidade">
        <input
          type="text"
          v-model="produtoForm.precoStr"
          placeholder="Preço (ex: 5,50)"
          required
        />
        <select v-model="produtoForm.unidade" required>
          <option value="un">Unidade</option>
          <option value="kg">Kg</option>
          <option value="lt">Litro</option>
        </select>
      </div>

      <!-- Estoque + unidade lado a lado -->
      <div class="estoque-unidade">
        <input type="number" v-model.number="produtoForm.estoque" placeholder="Estoque" min="0" required />
        <span>{{ produtoForm.unidade }}</span>
      </div>

      <button type="submit">{{ produtoForm.id ? 'Atualizar' : 'Adicionar' }}</button>
      <button type="button" v-if="produtoForm.id" @click="cancelarEdicao">Cancelar</button>
    </form>

    <!-- Lista de produtos -->
    <ul>
      <li v-for="produto in produtos" :key="produto.id">
        {{ produto.nome }} - R$ {{ formatarPreco(produto.preco) }} / {{ produto.unidade }} - Estoque: {{ produto.estoque }} {{ produto.unidade }}
        <button @click="editarProduto(produto)">Editar</button>
        <button @click="excluirProduto(produto.id)">Excluir</button>
      </li>
    </ul>
  </div>
</template>

<script>
import { supabase } from '../supabase.js'

export default {
  name: 'AdminProdutos',
  data() {
    return {
      produtos: [],
      produtoForm: {
        id: null,
        nome: '',
        preco: 0,      // número real para salvar no banco
        precoStr: '',  // string com vírgula digitada pelo usuário
        estoque: 0,
        unidade: 'un'
      },
      loading: false,
      error: null
    }
  },
  async created() {
    await this.buscarProdutos()
  },
  methods: {
    async buscarProdutos() {
      this.loading = true
      const { data, error } = await supabase.from('produtos').select('*').order('nome')
      if (error) {
        console.error(error)
        this.error = 'Erro ao carregar produtos'
      } else {
        this.produtos = data
      }
      this.loading = false
    },

    async salvarProduto() {
      const precoConvertido = parseFloat(this.produtoForm.precoStr.replace(',', '.'))
      if (isNaN(precoConvertido)) return alert('Preço inválido')
      this.produtoForm.preco = precoConvertido

      if (this.produtoForm.id) {
        const { error } = await supabase
          .from('produtos')
          .update({
            nome: this.produtoForm.nome,
            preco: this.produtoForm.preco,
            estoque: this.produtoForm.estoque,
            unidade: this.produtoForm.unidade
          })
          .eq('id', this.produtoForm.id)
        if (error) return alert('Erro ao atualizar produto: ' + error.message)
      } else {
        const { error } = await supabase
          .from('produtos')
          .insert([{
            nome: this.produtoForm.nome,
            preco: this.produtoForm.preco,
            estoque: this.produtoForm.estoque,
            unidade: this.produtoForm.unidade
          }])
        if (error) return alert('Erro ao adicionar produto: ' + error.message)
      }

      this.produtoForm = { id: null, nome: '', preco: 0, precoStr: '', estoque: 0, unidade: 'un' }
      await this.buscarProdutos()
    },

    editarProduto(produto) {
      this.produtoForm = {
        ...produto,
        precoStr: produto.preco.toString().replace('.', ',')
      }
    },

    cancelarEdicao() {
      this.produtoForm = { id: null, nome: '', preco: 0, precoStr: '', estoque: 0, unidade: 'un' }
    },

    async excluirProduto(id) {
      if (!confirm('Deseja realmente excluir este produto?')) return
      const { error } = await supabase.from('produtos').delete().eq('id', id)
      if (error) return alert('Erro ao excluir produto: ' + error.message)
      await this.buscarProdutos()
    },

    formatarPreco(valor) {
      if (valor == null) return '0,00'
      return new Intl.NumberFormat('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(valor)
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
  margin: 10px 0;
}

input, select {
  margin-right: 5px;
}

/* Preço e unidade lado a lado */
.preco-unidade {
  display: flex;
  gap: 5px;
  margin: 5px 0;
}
.preco-unidade input {
  flex: 1;
}
.preco-unidade select {
  width: 100px;
}

/* Estoque e unidade lado a lado */
.estoque-unidade {
  display: flex;
  align-items: center;
  gap: 5px;
  margin: 5px 0;
}
.estoque-unidade input {
  width: 100px;
}

button {
  margin-left: 5px;
}
</style>
