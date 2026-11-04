<template>
    <nav>
        <RouterLink to="/admin/perfil">Perfil</RouterLink> |
        <RouterLink to="/admin/usuario">GESTIÓN USUARIO</RouterLink> |
        <RouterLink to="/admin/categoria">GESTIÓN CATEGORIAS</RouterLink>
      </nav>
    <RouterView />
</template>

<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router';

</script>