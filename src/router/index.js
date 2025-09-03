import { createRouter, createWebHistory } from 'vue-router'
import produtosAdmin from '../components/produtosAdmin.vue'
import pedidosCliente from '../components/pedidosCliente.vue'
import clientesAdmin from '../components/clientesAdmin.vue'

const routes = [
  { path: '/', redirect: '/produtos' }, // Página inicial
  { path: '/produtos', component: produtosAdmin },
  { path: '/pedidos', component: pedidosCliente },
  { path: '/clientes', component: clientesAdmin }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
