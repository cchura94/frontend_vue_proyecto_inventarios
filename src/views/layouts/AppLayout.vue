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

      <v-list-item title="Mi Empresa" subtitle="Sistema de Inventarios"></v-list-item>
      <v-divider></v-divider>
      <v-list density="compact" nav>
        <v-list-item prepend-icon="mdi-account" to="/admin/perfil" link title="Mi Perfil" :class="{ 'pl-5': false }"></v-list-item>
        <v-list-item prepend-icon="mdi-account-group-outline" to="/admin/usuario" link title="Mis Usuarios" :class="{ 'pl-5': true }"></v-list-item>
        <v-divider></v-divider>
        <v-list-item prepend-icon="mdi-circle" to="/admin/categoria" link title="Categorias" :class="{ 'pl-5': false }"></v-list-item>
        <v-list-item prepend-icon="mdi-store-marker" to="/admin/sucursal" link title="Sucursales"></v-list-item>
        <v-list-item prepend-icon="mdi-warehouse" to="/admin/almacen" link title="Almacenes"></v-list-item>
        <v-list-item prepend-icon="mdi-package" to="/admin/producto" link title="Productos"></v-list-item>

      </v-list>


      <template v-slot:append>
          <div class="pa-2">
            <v-btn block color="secondary">
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
    <!--
      <nav>
          <RouterLink to="/admin/perfil">Perfil</RouterLink> |
          <RouterLink to="/admin/usuario">GESTIÓN USUARIO</RouterLink> |
          <RouterLink to="/admin/categoria">GESTIÓN CATEGORIAS</RouterLink>
        </nav>
      -->

  </v-app>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { RouterLink, RouterView } from 'vue-router';

const drawer = ref<any>(null)

</script>