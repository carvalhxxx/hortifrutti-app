<template>
  <div class="login-container">
    <h2>{{ modo === 'login' ? 'Login' : 'Cadastro' }}</h2>

    <input v-model="username" placeholder="Usuário" />
    <input v-model="senha" type="password" placeholder="Senha" />

    <button v-if="modo === 'login'" @click="login">Entrar</button>
    <button v-else @click="signup">Cadastrar</button>

    <p class="alternar">
      {{ modo === 'login' ? 'Não tem conta?' : 'Já tem conta?' }}
      <a href="#" @click.prevent="alternarModo">
        {{ modo === 'login' ? 'Cadastrar' : 'Entrar' }}
      </a>
    </p>

    <p v-if="erro" class="erro">{{ erro }}</p>
  </div>
</template>

<script>
import { supabase } from "../supabase.js"

export default {
  name: "loginTela",
  data() {
    return {
      username: "",
      senha: "",
      modo: "login", // ou "cadastro"
      erro: null
    }
  },
  methods: {
    async signup() {
      this.erro = null
      const userNameNormalized = this.username.trim().toLowerCase()
      if (!userNameNormalized || !this.senha) {
        this.erro = "Preencha todos os campos"
        return
      }

      try {
        const emailFicticio = `${userNameNormalized}@meusistema.local`

        const { error } = await supabase.auth.signUp({
          email: emailFicticio,
          password: this.senha
        })

        if (error) throw error

        alert("Cadastro realizado! Faça login agora.")
        this.modo = "login"

      } catch (err) {
        this.erro = "Erro ao cadastrar: " + err.message
      }
    },

    async login() {
      this.erro = null
      const userNameNormalized = this.username.trim().toLowerCase()
      if (!userNameNormalized || !this.senha) {
        this.erro = "Preencha todos os campos"
        return
      }

      try {
        const emailFicticio = `${userNameNormalized}@meusistema.local`

        const { error } = await supabase.auth.signInWithPassword({
          email: emailFicticio,
          password: this.senha
        })

        if (error) {
          this.erro = "Usuário ou senha incorretos"
          return
        }

        // Login bem-sucedido
        alert("Login realizado com sucesso!")
        this.$router.push("/produtos")

      } catch (err) {
        this.erro = "Ocorreu um erro: " + err.message
      }
    },

    alternarModo() {
      this.modo = this.modo === "login" ? "cadastro" : "login"
      this.erro = null
    }
  }
}
</script>

<style>
.login-container {
  max-width: 300px;
  margin: 100px auto;
  padding: 20px;
  border: 1px solid #ccc;
  border-radius: 8px;
  background: white;
  text-align: center;
}
.login-container input {
  display: block;
  width: 100%;
  margin-bottom: 12px;
  padding: 8px;
}
.login-container button {
  width: 100%;
  padding: 10px;
  background: #1abc9c;
  border: none;
  color: white;
  border-radius: 5px;
  cursor: pointer;
}
.alternar {
  margin-top: 15px;
  font-size: 14px;
}
.alternar a {
  color: #1abc9c;
  cursor: pointer;
  text-decoration: none;
  font-weight: bold;
}
.erro {
  color: red;
  margin-top: 10px;
}
</style>
