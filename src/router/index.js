import { createRouter, createWebHistory } from 'vue-router'
import listaProdutos from '../components/listaProdutos.vue'
import produtosAdmin from '../components/produtosAdmin.vue'
import pedidosCliente from '../components/pedidosCliente.vue'
import pedidosForm from '../components/pedidosForm.vue'
import clientesAdmin from '../components/clientesAdmin.vue'
import motoristaAdmin from '../components/motoristaAdmin.vue'
import loginTela from '../components/loginTela.vue'
import rotasLista from '../components/rotasLista.vue'
import rotasForm from '../components/rotasForm.vue'
import { supabase } from '../supabase.js'

const routes = [
  { path: '/', redirect: '/produtos/lista' },

  // Produtos
  { path: '/produtos/lista', component: listaProdutos },
  { path: '/produtos/form/:id?', component: produtosAdmin, name: 'produtosForm' },

  // Pedidos
  { path: '/pedidos', component: pedidosCliente },
  { path: '/pedidos/form/:id?', component: pedidosForm, name: 'pedidosForm' },

  // Clientes
  { path: '/clientes', component: clientesAdmin },

  // Motoristas
  { path: '/motoristas', component: motoristaAdmin },

  // Rotas
  { path: '/rotas', component: rotasLista },
  { path: '/rotas/form/:id?', component: rotasForm, name: 'rotasForm' },

  // Login
  { path: '/login', component: loginTela }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Guarda global simples: verifica apenas se o usuário está logado
router.beforeEach(async (to, from, next) => {
  const { data: { session } } = await supabase.auth.getSession()

  // Se não estiver logado e não estiver indo para /login, redireciona
  if (!session && to.path !== "/login") {
    return next("/login")
  }

  // Se estiver logado e for /login, redireciona para a página inicial
  if (session && to.path === "/login") {
    return next("/produtos/lista")
  }

  next() // permite navegação
})

export default router
