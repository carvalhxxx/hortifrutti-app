<template>
  <div class="app-container">
    <h1>Produtos</h1>

    <!-- ALERTA GLOBAL FIXO -->
    <div v-if="alerta.mostrar" :class="['alerta-toast', alerta.tipo]">
      {{ alerta.mensagem }}
    </div>

    <!-- Formulário de produto -->
    <form @submit.prevent="salvarProduto" class="formulario">
      <!-- Nome do produto -->
      <input
        type="text"
        v-model="produtoForm.nome"
        placeholder="Nome do produto"
        required
      />

      <!-- Categoria -->
      <select v-model="produtoForm.categoria_id" required>
        <option value="">Selecione a categoria</option>
        <option v-for="cat in categorias" :key="cat.id" :value="cat.id">{{ cat.nome }}</option>
      </select>

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

      <!-- Botões -->
      <div class="form-actions">
        <button type="submit">{{ produtoForm.id ? 'Salvar' : 'Adicionar' }}</button>
        <button type="button" @click="cancelarEdicao">Cancelar</button>
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
      categoria_id: '',
      preco: 0,
      precoStr: '',
      estoque: 0,
      unidade: 'un'
    })

    const categorias = ref([])

    // Alerta do app
    const alerta = ref({
      mostrar: false,
      mensagem: '',
      tipo: 'sucesso' // 'sucesso' | 'erro'
    })

    const mostrarAlerta = (mensagem, tipo = 'sucesso') => {
      alerta.value = { mostrar: true, mensagem, tipo }
      setTimeout(() => {
        alerta.value.mostrar = false
      }, 2500)
    }

    const carregarProduto = async (id) => {
      const { data, error } = await supabase.from('produtos').select('*').eq('id', id).single()
      if (!error && data) {
        produtoForm.value = {
          ...data,
          precoStr: data.preco != null ? data.preco.toFixed(2).replace('.', ',') : ''
        }
      }
    }

    const carregarCategorias = async () => {
      const { data, error } = await supabase.from('categorias').select('*').order('nome')
      if (!error) categorias.value = data
    }

    onMounted(() => {
      carregarCategorias()
      const id = route.query.id
      if (id) carregarProduto(id)
    })

    const salvarProduto = async () => {
      const precoConvertido = parseFloat(produtoForm.value.precoStr.replace(',', '.'))
      if (isNaN(precoConvertido)) return mostrarAlerta('Preço inválido', 'erro')
      produtoForm.value.preco = precoConvertido

      try {
        if (produtoForm.value.id) {
          const { error } = await supabase
            .from('produtos')
            .update({
              nome: produtoForm.value.nome,
              categoria_id: produtoForm.value.categoria_id,
              preco: produtoForm.value.preco,
              estoque: produtoForm.value.estoque,
              unidade: produtoForm.value.unidade
            })
            .eq('id', produtoForm.value.id)
          if (error) throw error
          mostrarAlerta('Produto atualizado com sucesso!', 'sucesso')
        } else {
          const { error } = await supabase
            .from('produtos')
            .insert([{
              nome: produtoForm.value.nome,
              categoria_id: produtoForm.value.categoria_id,
              preco: produtoForm.value.preco,
              estoque: produtoForm.value.estoque,
              unidade: produtoForm.value.unidade
            }])
          if (error) throw error
          mostrarAlerta('Produto adicionado com sucesso!', 'sucesso')
        }

        // Reset e redirecionamento após delay
        setTimeout(() => {
          produtoForm.value = { id: null, nome: '', categoria_id: '', preco: 0, precoStr: '', estoque: 0, unidade: 'un' }
          router.push('/produtos/lista')
        }, 1000)
      } catch (err) {
        mostrarAlerta('Erro ao salvar produto: ' + err.message, 'erro')
      }
    }

    const cancelarEdicao = () => {
      produtoForm.value = { id: null, nome: '', categoria_id: '', preco: 0, precoStr: '', estoque: 0, unidade: 'un' }
      router.push('/produtos/lista')
    }

    return { produtoForm, categorias, salvarProduto, cancelarEdicao, alerta, mostrarAlerta }
  }
}
</script>

<style scoped>
.app-container {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
}

/* Formulário */
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
