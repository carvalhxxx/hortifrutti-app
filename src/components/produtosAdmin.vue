<template>
  <div class="app-container">
    <h1>Administração de Produtos</h1>

    <!-- Formulário de produto -->
    <form @submit.prevent="salvarProduto" class="formulario">
      <input
        type="text"
        v-model="produtoForm.nome"
        placeholder="Nome do produto"
        required
      />

      <!-- Preço + unidade lado a lado -->
      <div class="form-row">
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
      <div class="form-row">
        <input
          type="number"
          v-model.number="produtoForm.estoque"
          placeholder="Estoque"
          min="0"
          required
        />
        <span>{{ produtoForm.unidade }}</span>
      </div>

      <div class="form-actions">
        <button type="submit">{{ produtoForm.id ? 'Atualizar' : 'Adicionar' }}</button>
        <button type="button" v-if="produtoForm.id" @click="cancelarEdicao">Cancelar</button>
      </div>
    </form>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { supabase } from '../supabase.js'

export default {
  name: 'AdminProdutos',
  setup() {
    const route = useRoute()
    const router = useRouter()
    const produtoForm = ref({
      id: null,
      nome: '',
      preco: 0,
      precoStr: '',
      estoque: 0,
      unidade: 'un'
    })

    const carregarProduto = async (id) => {
      const { data, error } = await supabase.from('produtos').select('*').eq('id', id).single()
      if (!error && data) {
        produtoForm.value = {
          ...data,
          precoStr: data.preco != null ? data.preco.toFixed(2).replace('.', ',') : ''
        }
      }
    }

    onMounted(() => {
      const id = route.query.id
      if (id) carregarProduto(id)
    })

    const salvarProduto = async () => {
      const precoConvertido = parseFloat(produtoForm.value.precoStr.replace(',', '.'))
      if (isNaN(precoConvertido)) return alert('Preço inválido')
      produtoForm.value.preco = precoConvertido

      try {
        if (produtoForm.value.id) {
          const { error } = await supabase
            .from('produtos')
            .update({
              nome: produtoForm.value.nome,
              preco: produtoForm.value.preco,
              estoque: produtoForm.value.estoque,
              unidade: produtoForm.value.unidade
            })
            .eq('id', produtoForm.value.id)
          if (error) throw error
          alert('Produto atualizado com sucesso!')
        } else {
          const { error } = await supabase
            .from('produtos')
            .insert([{
              nome: produtoForm.value.nome,
              preco: produtoForm.value.preco,
              estoque: produtoForm.value.estoque,
              unidade: produtoForm.value.unidade
            }])
          if (error) throw error
          alert('Produto adicionado com sucesso!')
        }
        produtoForm.value = { id: null, nome: '', preco: 0, precoStr: '', estoque: 0, unidade: 'un' }
        router.push('/produtos') // volta para a lista após salvar
      } catch (err) {
        alert('Erro ao salvar produto: ' + err.message)
      }
    }

    const cancelarEdicao = () => {
      produtoForm.value = { id: null, nome: '', preco: 0, precoStr: '', estoque: 0, unidade: 'un' }
      router.push('/produtos') // volta para a lista
    }

    return { produtoForm, salvarProduto, cancelarEdicao }
  }
}
</script>

<style scoped>
.app-container {
  max-width: 600px;
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
  width: 120px;
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
