import { createRouter, createWebHistory } from 'vue-router'
import produtosAdmin from '../components/produtosAdmin.vue'
import pedidosCliente from '../components/pedidosCliente.vue'
import pedidosForm from '../components/pedidosForm.vue'
import clientesAdmin from '../components/clientesAdmin.vue'
import motoristaAdmin from '../components/motoristaAdmin.vue'
import loginTela from '../components/loginTela.vue'
import { supabase } from '../supabase.js'

const routes = [
  { path: '/', redirect: '/produtos' }, // Página inicial
  { path: '/produtos', component: produtosAdmin },
  { path: '/pedidos',   component: pedidosCliente },
  { path: '/pedidos/form/:id?', component: pedidosForm, name: 'pedidosForm' },
  { path: '/clientes', component: clientesAdmin },
  { path: '/login', component: loginTela },
  { path: '/motoristas', component: motoristaAdmin } // Nova rota
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
    return next("/produtos")
  }

  next() // permite navegação
})

export default router
