<template>
    <v-container class="py-10 d-flex align-center justify-center" fluid style="min-height: 70vh;">
        <v-card max-width="620" rounded="lg" elevation="3" class="pa-6 text-center">
            <v-avatar color="error" size="84" class="mb-4">
                <v-icon color="white" icon="mdi-shield-lock-outline" size="46" />
            </v-avatar>

            <h1 class="text-h5 font-weight-bold mb-2">Acceso no autorizado</h1>

            <p class="text-body-2 text-medium-emphasis mb-4">
                Tu usuario no tiene el permiso necesario para ver esta sección.
                Si crees que es un error, contacta al administrador del sistema.
            </p>

            <div v-if="auth.roles.length" class="d-flex flex-wrap justify-center ga-2 mb-4">
                <v-chip
                    v-for="rol in auth.roles"
                    :key="rol"
                    color="primary"
                    size="small"
                    variant="tonal"
                >
                    {{ rol }}
                </v-chip>
            </div>

            <div class="d-flex justify-center ga-2 flex-wrap">
                <v-btn color="primary" prepend-icon="mdi-account" to="/admin/perfil" rounded="lg">
                    Ir a mi perfil
                </v-btn>
                <v-btn variant="tonal" prepend-icon="mdi-arrow-left" rounded="lg" @click="volver">
                    Volver
                </v-btn>
            </div>
        </v-card>
    </v-container>
</template>

<script lang="ts" setup>
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const router = useRouter();
const auth = useAuthStore();

function volver() {
    if (window.history.length > 1) {
        router.back();
    } else {
        router.push({ name: 'Perfil' });
    }
}
</script>
