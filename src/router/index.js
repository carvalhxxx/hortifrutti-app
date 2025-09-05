import { createRouter, createWebHistory } from 'vue-router'
import listaProdutos from '../components/listaProdutos.vue'
import produtosAdmin from '../components/produtosAdmin.vue'
import pedidosCliente from '../components/pedidosCliente.vue'
import pedidosForm from '../components/pedidosForm.vue'
import listaClientes from '../components/listaClientes.vue'
import clientesAdmin from '../components/clientesAdmin.vue'
import listaMotorista from '../components/listaMotorista.vue' // <--- novo
import motoristaAdmin from '../components/motoristaAdmin.vue'    // formulário
import loginTela from '../components/loginTela.vue'
import rotasLista from '../components/rotasLista.vue'
import rotasForm from '../components/rotasForm.vue'
import inicioApp from '../components/inicioApp.vue'
import { supabase } from '../supabase.js'

const routes = [
  { path: '/', redirect: '/inicio' },
  { path: '/inicio', component: inicioApp },

  // Produtos
  { path: '/produtos/lista', component: listaProdutos },
  { path: '/produtos/form/:id?', component: produtosAdmin, name: 'produtosForm' },

  // Pedidos
  { path: '/pedidos', component: pedidosCliente },
  { path: '/pedidos/form/:id?', component: pedidosForm, name: 'pedidosForm' },

  // Clientes
  { path: '/clientes', component: listaClientes },
  { path: '/clientes/form/:id?', component: clientesAdmin, name: 'clientesForm' },

  // Motoristas
  { path: '/motoristas', component: listaMotorista },
  { path: '/motoristas/form/:id?', component: motoristaAdmin, name: 'motoristasForm' },

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

  if (!session && to.path !== "/login") {
    return next("/login")
  }

  if (session && to.path === "/login") {
    return next("/produtos/lista")
  }

  next()
})

export default router
