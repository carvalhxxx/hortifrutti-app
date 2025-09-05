<template>
  <div id="app">
    <div class="container">
      
      <!-- Menu lateral -->
      <nav :class="['menu-lateral', { fechado: !menuAberto }]">
        <button class="toggle-btn" @click="menuAberto = !menuAberto">☰</button>
        <ul v-if="menuAberto">
          <li>
            <router-link to="/produtos/lista" class="menu-link" active-class="ativo">
              Produtos
            </router-link>
          </li>
          <li>
            <router-link to="/pedidos" class="menu-link" active-class="ativo">
              Pedidos
            </router-link>
          </li>
          <li>
            <router-link to="/clientes" class="menu-link" active-class="ativo">
              Clientes
            </router-link>
          </li>
          <li>
            <router-link to="/motoristas" class="menu-link" active-class="ativo">
              Motoristas
            </router-link>
          </li>
          <li>
            <router-link to="/rotas" class="menu-link" active-class="ativo">
              Rotas
            </router-link>
          </li>
          <li>
            <button @click="logout" class="menu-link">Sair</button>
          </li>
        </ul>
      </nav>

      <!-- Área principal -->
      <main class="conteudo">
        <router-view></router-view>
      </main>
    </div>
  </div>
</template>

<script>
import { supabase } from "./supabase.js"

export default {
  name: 'App',
  data() {
    return {
      menuAberto: true
    }
  },
  methods: {
    async logout() {
      await supabase.auth.signOut()
      this.$router.push("/login")
    }
  }
}
</script>

<style>
.container {
  display: flex;
  height: 100vh;
}

/* Menu lateral */
.menu-lateral {
  width: 220px;
  background-color: #2c3e50;
  color: white;
  padding: 20px 10px 20px 20px; /* espaço extra à esquerda */
  transition: width 0.3s;
  position: relative;
  display: flex;
  flex-direction: column;
}

.menu-lateral.fechado {
  width: 100px; /* só ícone visível */
}

.toggle-btn {
  background-color: #1abc9c;
  border: none;
  color: white;
  border-radius: 4px;
  cursor: pointer;
  padding: 8px;
  font-size: 18px;
  margin-bottom: 20px;
  align-self: flex-start;
}

.menu-lateral ul {
  list-style: none;
  padding: 0;
  margin: 0;
  flex: 1;
}

.menu-lateral li {
  margin-bottom: 15px;
}

.menu-link {
  display: flex;
  align-items: center;
  gap: 10px;
  color: white;
  text-decoration: none;
  font-weight: 500;
  padding: 5px 10px;
  border-radius: 5px;
  transition: background 0.2s;
}

.menu-link:hover {
  background-color: #34495e;
}

.menu-link.ativo {
  background-color: #1abc9c;
  font-weight: bold;
}

/* Conteúdo principal */
.conteudo {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
}
</style>
