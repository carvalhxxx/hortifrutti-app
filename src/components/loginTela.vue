<template>
  <div class="login-wrapper">
    <!-- ALERTA TOAST -->
    <div v-if="alerta.mostrar" :class="['alerta-toast', alerta.tipo]">
      {{ alerta.mensagem }}
    </div>

    <div class="login-box">
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
    </div>
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
      modo: "login",
      alerta: { mostrar: false, mensagem: "", tipo: "sucesso" } // TOAST
    }
  },
  methods: {
    mostrarAlerta(mensagem, tipo = "sucesso") {
      this.alerta = { mostrar: true, mensagem, tipo }
      setTimeout(() => {
        this.alerta.mostrar = false
      }, 2500)
    },

    async signup() {
      const userNameNormalized = this.username.trim().toLowerCase()
      if (!userNameNormalized || !this.senha) {
        this.mostrarAlerta("Preencha todos os campos", "erro")
        return
      }

      try {
        const emailFicticio = `${userNameNormalized}@meusistema.local`
        const { error } = await supabase.auth.signUp({ email: emailFicticio, password: this.senha })
        if (error) throw error

        this.mostrarAlerta("Cadastro realizado! Faça login agora.", "sucesso")
        this.modo = "login"
      } catch (err) {
        this.mostrarAlerta("Erro ao cadastrar: " + err.message, "erro")
      }
    },

    async login() {
      const userNameNormalized = this.username.trim().toLowerCase()
      if (!userNameNormalized || !this.senha) {
        this.mostrarAlerta("Preencha todos os campos", "erro")
        return
      }

      try {
        const emailFicticio = `${userNameNormalized}@meusistema.local`
        const { error } = await supabase.auth.signInWithPassword({ email: emailFicticio, password: this.senha })
        if (error) {
          this.mostrarAlerta("Usuário ou senha incorretos", "erro")
          return
        }

        this.mostrarAlerta("Login realizado com sucesso!", "sucesso")
        this.$router.push("/produtos")
      } catch (err) {
        this.mostrarAlerta("Ocorreu um erro: " + err.message, "erro")
      }
    },

    alternarModo() {
      this.modo = this.modo === "login" ? "cadastro" : "login"
    }
  }
}
</script>

<style scoped>
html, body, #app {
  width: 100%;
  height: 100%;
  margin: 0;
}

.login-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  width: 100%;
  background-color: #f5f5f5;
}

.login-box {
  background: white;
  padding: 30px 25px;
  border-radius: 10px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.1);
  max-width: 350px;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 15px;
  text-align: center;
}

.login-box input {
  width: 100%;
  padding: 10px;
  font-size: 14px;
  border-radius: 6px;
  border: 1px solid #ccc;
}

.login-box input:focus {
  outline: none;
  border-color: #1abc9c;
}

.login-box button {
  padding: 10px;
  border-radius: 6px;
  border: none;
  background-color: #1abc9c;
  color: white;
  font-weight: 600;
  cursor: pointer;
}

.login-box button:hover {
  background-color: #16a085;
}

.alternar {
  margin-top: 10px;
  font-size: 14px;
}

.alternar a {
  color: #1abc9c;
  cursor: pointer;
  text-decoration: none;
  font-weight: bold;
}

/* TOAST */
.alerta-toast {
  position: fixed;
  top: 20px;
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
