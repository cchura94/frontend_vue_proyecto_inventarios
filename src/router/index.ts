import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '@/views/auth/LoginView.vue'
import Usuario from '@/views/admin/Usuario.vue'
import Rol from '@/views/admin/Rol.vue'
import Inicio from '@/views/web/Inicio.vue'
import WebLayout from '@/views/layouts/WebLayout.vue'
import AppLayout from '@/views/layouts/AppLayout.vue'
import Perfil from '@/views/admin/Perfil.vue'
import NoAutorizado from '@/views/admin/NoAutorizado.vue'
import Categoria from '@/views/admin/inventario/Categoria.vue'
import Sucursal from '@/views/admin/inventario/Sucursal.vue'
import Almacen from '@/views/admin/inventario/Almacen.vue'
import Producto from '@/views/admin/inventario/Producto.vue'
import Compra from '@/views/admin/Notas/Compra.vue'
import ListadoCompra from '@/views/admin/Notas/ListadoCompra.vue'
import Venta from '@/views/admin/Notas/Venta.vue'
import ListadoVenta from '@/views/admin/Notas/ListadoVenta.vue'
import { useAuthStore } from '@/stores/auth'

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
      redirect: '/admin/perfil',
      meta: {requireAuth: true},

      children: [
        {
          path: 'perfil',
          meta: {requireAuth: true},
          name: 'Perfil',
          component: Perfil,
        },
        {
          path: 'no-autorizado',
          meta: {requireAuth: true},
          name: 'NoAutorizado',
          component: NoAutorizado,
        },
        {
          path: 'usuario',
          meta: {requireAuth: true, abilities: [{action: 'ver', subject: 'Usuario'}]},
          component: Usuario,
        },
        {
          path: 'rol',
          meta: {requireAuth: true, abilities: [{action: 'ver', subject: 'Rol'}]},
          name: 'Rol',
          component: Rol,
        },
        {
          path: 'categoria',
          meta: {requireAuth: true, abilities: [{action: 'ver', subject: 'Categoria'}]},
          component: Categoria,
        },
        {
          path: 'sucursal',
          meta: {requireAuth: true, abilities: [{action: 'ver', subject: 'Sucursal'}]},
          component: Sucursal,
        },
        {
          path: 'almacen',
          meta: {requireAuth: true, abilities: [{action: 'ver', subject: 'Almacen'}]},
          component: Almacen,
        },
        {
          path: 'producto',
          meta: {requireAuth: true, abilities: [{action: 'ver', subject: 'Producto'}]},
          component: Producto,
        },
        {
          path: 'compra',
          meta: {requireAuth: true, abilities: [{action: 'crear', subject: 'Compra'}]},
          name: 'Compra',
          component: Compra,
        },
        {
          path: 'compras',
          meta: {requireAuth: true, abilities: [{action: 'ver', subject: 'Compra'}]},
          name: 'ListadoCompra',
          component: ListadoCompra,
        },
        {
          path: 'venta',
          meta: {requireAuth: true, abilities: [{action: 'crear', subject: 'Venta'}]},
          name: 'Venta',
          component: Venta,
        },
        {
          path: 'ventas',
          meta: {requireAuth: true, abilities: [{action: 'ver', subject: 'Venta'}]},
          name: 'ListadoVenta',
          component: ListadoVenta,
        }
      ]
    }
  ],
});

// guards
router.beforeEach(async (to) => {
  const auth = useAuthStore();
  const token = localStorage.getItem('access_token') || false;

  if (to.meta.requireAuth) {
    if (!token) {
      return {name: 'Login'}
    }

    // Carga el perfil (y reconstruye CASL) si se recargó la página.
    const sesionLista = await auth.asegurarCargado();
    if (!sesionLista) {
      return {name: 'Login'}
    }

    const requeridos = to.meta.abilities
      ?? (to.meta.action && to.meta.subject
        ? [{action: to.meta.action, subject: to.meta.subject}]
        : []);

    if (requeridos.length && !requeridos.every((regla) => auth.can(regla.action, regla.subject))) {
      return {name: 'NoAutorizado'}
    }
  }

  if (to.meta.redirectIfAuth && token) {
    return {name: 'Perfil'}
  }

  return true;
})

export default router
