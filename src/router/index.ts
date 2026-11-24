import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import LoginView from '@/views/auth/LoginView.vue'
import Usuario from '@/views/admin/Usuario.vue'
import Inicio from '@/views/web/Inicio.vue'
import WebLayout from '@/views/layouts/WebLayout.vue'
import AppLayout from '@/views/layouts/AppLayout.vue'
import Perfil from '@/views/admin/Perfil.vue'
import Categoria from '@/views/admin/inventario/Categoria.vue'
import Sucursal from '@/views/admin/inventario/Sucursal.vue'
import Almacen from '@/views/admin/inventario/Almacen.vue'
import Producto from '@/views/admin/inventario/Producto.vue'
import Compra from '@/views/admin/Notas/Compra.vue'
import ListadoCompra from '@/views/admin/Notas/ListadoCompra.vue'
import Venta from '@/views/admin/Notas/Venta.vue'
import ListadoVenta from '@/views/admin/Notas/ListadoVenta.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/inicio',
      component: WebLayout,
      children: [
        {
          path: '/inicio',
          name: 'home',
          component: Inicio,
        },
        {
          path: '/about',
          name: 'about',
          // route level code-splitting
          // this generates a separate chunk (About.[hash].js) for this route
          // which is lazy-loaded when the route is visited.
          component: () => import('../views/web/Nosotros.vue'),
        },
        {
          path: '/auth',
          children: [
            {
              path: 'login',
              name: 'Login',
              component: LoginView,
              meta: {redirectIfAuth: true}
            }
          ]
        },
      ]
    },
    {
      path: '/admin',
      component: AppLayout,
      
      children: [
        {
          path: 'perfil',
          meta: {requireAuth: true},
          name: 'Perfil',
          component: Perfil,
        },
        {
          path: 'usuario',
          meta: {requireAuth: true},
          component: Usuario,
        },
        {
          path: 'categoria',
          meta: {requireAuth: true},
          component: Categoria,
        },
        {
          path: 'sucursal',
          meta: {requireAuth: true},
          component: Sucursal,
        },
        {
          path: 'almacen',
          meta: {requireAuth: true},
          component: Almacen,
        },
        {
          path: 'producto',
          meta: {requireAuth: true},
          component: Producto,
        },
        {
          path: 'compra',
          meta: {requireAuth: true},
          name: 'Compra',
          component: Compra,
        },
        {
          path: 'compras',
          meta: {requireAuth: true},
          name: 'ListadoCompra',
          component: ListadoCompra,
        },
        {
          path: 'venta',
          meta: {requireAuth: true},
          name: 'Venta',
          component: Venta,
        },
        {
          path: 'ventas',
          meta: {requireAuth: true},
          name: 'ListadoVenta',
          component: ListadoVenta,
        }


      ]
    }
  ],
});

// guards
router.beforeEach((to, from) => {

  console.log("VENGO DE: ", from.path)
  console.log("ESTOY EN: ", to.path)
  const token = localStorage.getItem("access_token") || false;

  if(to.meta.requireAuth){
    console.log(token);
    if(!token){
      return {name: 'Login'}
    }else{
      return true;
    }
  }
  
  if(to.meta.redirectIfAuth && token){
    return {name: 'Perfil'}
  }
  return true;
})



export default router
