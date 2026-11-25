<template>
  <v-app>
    <v-app-bar color="primary">
       <v-app-bar-nav-icon @click.stop="drawer = !drawer"></v-app-bar-nav-icon>
         <v-toolbar-title>Inventarios</v-toolbar-title>

          <template v-if="$vuetify.display.mdAndUp">
          <v-btn icon="mdi-magnify" variant="text"></v-btn>

          <v-btn icon="mdi-filter" variant="text"></v-btn>
        </template>

        <v-btn icon="mdi-dots-vertical" variant="text"></v-btn>

    </v-app-bar>
    <v-navigation-drawer v-model="drawer" :location="$vuetify.display.mobile ? 'left' : undefined">

      <v-list-item
        :title="auth.usuario?.name || 'Mi Empresa'"
        :subtitle="auth.roles.length ? auth.roles.join(' / ') : 'Sistema de Inventarios'"
        prepend-icon="mdi-account-circle"
      />
      <v-divider></v-divider>
      <v-list density="compact" nav>
        <v-list-item prepend-icon="mdi-account" to="/admin/perfil" link title="Mi Perfil" :class="{ 'pl-5': false }"></v-list-item>
        <v-list-item
          v-if="$can('ver', 'Usuario')"
          prepend-icon="mdi-account-group-outline"
          to="/admin/usuario"
          link
          title="Mis Usuarios"
          :class="{ 'pl-5': true }"
        ></v-list-item>
        <v-list-item
          v-if="$can('ver', 'Rol')"
          prepend-icon="mdi-shield-account"
          to="/admin/rol"
          link
          title="Roles y Permisos"
          :class="{ 'pl-5': true }"
        ></v-list-item>
        <v-divider></v-divider>
        <v-list-item
          v-if="$can('ver', 'Categoria')"
          prepend-icon="mdi-circle"
          to="/admin/categoria"
          link
          title="Categorias"
          :class="{ 'pl-5': false }"
        ></v-list-item>
        <v-list-item
          v-if="$can('ver', 'Sucursal')"
          prepend-icon="mdi-store-marker"
          to="/admin/sucursal"
          link
          title="Sucursales"
        ></v-list-item>
        <v-list-item
          v-if="$can('ver', 'Almacen')"
          prepend-icon="mdi-warehouse"
          to="/admin/almacen"
          link
          title="Almacenes"
        ></v-list-item>
        <v-list-item
          v-if="$can('ver', 'Producto')"
          prepend-icon="mdi-package"
          to="/admin/producto"
          link
          title="Productos"
        ></v-list-item>
        <v-list-item
          v-if="$can('crear', 'Compra')"
          prepend-icon="mdi-cart-plus"
          to="/admin/compra"
          link
          title="Registrar Compra"
        ></v-list-item>
        <v-list-item
          v-if="$can('ver', 'Compra')"
          prepend-icon="mdi-format-list-bulleted"
          to="/admin/compras"
          link
          title="Listado Compras"
        ></v-list-item>
        <v-list-item
          v-if="$can('crear', 'Venta')"
          prepend-icon="mdi-cash-register"
          to="/admin/venta"
          link
          title="Registrar Venta"
        ></v-list-item>
        <v-list-item
          v-if="$can('ver', 'Venta')"
          prepend-icon="mdi-format-list-bulleted"
          to="/admin/ventas"
          link
          title="Listado Ventas"
        ></v-list-item>

      </v-list>


      <template v-slot:append>
          <div class="pa-2">
            <v-btn
              block
              color="secondary"
              prepend-icon="mdi-logout"
              :loading="saliendo"
              @click="funSalir"
            >
              Cerrar Sesion
            </v-btn>
          </div>
        </template>
    </v-navigation-drawer>

    <v-main style="height: 500px;">
      <div class="ml-8">
        <RouterView />

      </div>
    </v-main>

  </v-app>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { RouterView, useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const drawer = ref<any>(null);
const saliendo = ref(false);
const auth = useAuthStore();
const router = useRouter();

async function funSalir() {
  saliendo.value = true;
  try {
    await auth.cerrarSesion();
  } finally {
    saliendo.value = false;
    await router.push({ name: 'Login' });
  }
}
</script>
