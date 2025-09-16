<template>
  <div class="app-container">
    <!-- Toast do app -->
    <div v-if="alerta.mostrar" :class="['app-alerta', alerta.tipo]">
      {{ alerta.mensagem }}
    </div>

    <!-- Header -->
    <h1>{{ categoriaForm.id ? 'Editar Categoria' : 'Nova Categoria' }}</h1>

    <!-- Formulário -->
    <form @submit.prevent="salvarCategoria" class="formulario">
      <!-- Nome da Categoria -->
      <input
        type="text"
        v-model="categoriaForm.nome"
        placeholder="Nome da categoria"
        required
      />

      <!-- Descrição -->
      <textarea
        v-model="categoriaForm.descricao"
        placeholder="Descrição (opcional)"
        rows="4"
      ></textarea>

      <!-- Botões -->
      <div class="form-actions">
        <button type="submit">{{ categoriaForm.id ? 'Atualizar' : 'Salvar' }}</button>
        <button type="button" @click="cancelarEdicao">Cancelar</button>
      </div>
    </form>
  </div>
</template>

<script>
import { supabase } from '../supabase.js'

export default {
  name: 'CategoriasForm',
  data() {
    return {
      categoriaForm: {
        id: null,
        nome: '',
        descricao: ''
      },
      alerta: {
        mostrar: false,
        mensagem: '',
        tipo: '' // 'sucesso' ou 'erro'
      }
    }
  },
  async created() {
    const id = this.$route.params.id
    if (id) {
      const { data, error } = await supabase
        .from('categorias')
        .select('*')
        .eq('id', id)
        .single()
      if (!error && data) this.categoriaForm = data
    }
  },
  methods: {
    mostrarAlerta(mensagem, tipo = 'sucesso') {
      this.alerta.mensagem = mensagem
      this.alerta.tipo = tipo
      this.alerta.mostrar = true
      setTimeout(() => this.alerta.mostrar = false, 3000)
    },
    async salvarCategoria() {
      if (!this.categoriaForm.nome) {
        return this.mostrarAlerta('O nome é obrigatório', 'erro')
      }

      try {
        if (this.categoriaForm.id) {
          const { error } = await supabase
            .from('categorias')
            .update({
              nome: this.categoriaForm.nome,
              descricao: this.categoriaForm.descricao,
              updated_at: new Date()
            })
            .eq('id', this.categoriaForm.id)
          if (error) throw error
          this.mostrarAlerta('Categoria atualizada com sucesso!', 'sucesso')
        } else {
          const { error } = await supabase
            .from('categorias')
            .insert([{
              nome: this.categoriaForm.nome,
              descricao: this.categoriaForm.descricao
            }])
          if (error) throw error
          this.mostrarAlerta('Categoria adicionada com sucesso!', 'sucesso')
        }

        // Delay para mostrar alerta antes de redirecionar
        setTimeout(() => {
          this.categoriaForm = { id: null, nome: '', descricao: '' }
          this.$router.push('/categorias')
        }, 1200)

      } catch (err) {
        this.mostrarAlerta('Erro ao salvar categoria: ' + err.message, 'erro')
      }
    },
    cancelarEdicao() {
      this.categoriaForm = { id: null, nome: '', descricao: '' }
      this.$router.push('/categorias')
    }
  }
}
</script>

<style>
.app-container {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
}

/* Toast do app */
.app-alerta {
  position: fixed;
  top: 70px;
  left: 50%;
  transform: translateX(-50%);
  padding: 12px 20px;
  border-radius: 6px;
  color: white;
  font-weight: 600;
  z-index: 2000;
  box-shadow: 0 2px 8px rgba(0,0,0,0.2);
  animation: fadeInOut 3s forwards;
}

.app-alerta.sucesso {
  background-color: #1abc9c;
}

.app-alerta.erro {
  background-color: #e74c3c;
}

@keyframes fadeInOut {
  0% { opacity: 0; }
  10% { opacity: 1; }
  90% { opacity: 1; }
  100% { opacity: 0; }
}

/* Formulário padronizado */
.formulario {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.formulario input,
.formulario textarea {
  width: 100%;
  padding: 10px;
  font-size: 14px;
  border-radius: 6px;
  border: 1px solid #ccc;
  transition: border 0.2s;
}

.formulario input:focus,
.formulario textarea:focus {
  outline: none;
  border-color: #1abc9c;
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
