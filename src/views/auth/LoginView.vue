<template>
    <v-container class="login-container fill-height d-flex align-center justify-center" fluid>
        <v-card width="450" max-width="95%" elevation="12" rounded="xl" class="pa-6">
            <div class="text-center mb-6">
                <v-avatar color="primary" size="75" class="mb-4">
                    <v-icon icon="mdi-account-circle" size="45" color="white" />
                </v-avatar>

                <h2>Ingresar</h2>
                <h2 class="text-h4 font-weight-bold text-primary">Bienvenido</h2>
            </div>

            <v-divider />

            <v-alert
                v-if="mensajeError"
                class="mt-4"
                closable
                type="error"
                variant="tonal"
                @click:close="mensajeError = ''"
            >
                {{ mensajeError }}
            </v-alert>

            <v-form @submit.prevent="login">
                <v-text-field
                    v-model="credenciales.email"
                    class="mb-2"
                    color="primary"
                    :error-messages="errors.email"
                    label="Correo Electrónico"
                    prepend-inner-icon="mdi-email-outline"
                    type="email"
                    variant="outlined"
                />

                <v-text-field
                    v-model="credenciales.password"
                    class="mb-2"
                    color="primary"
                    :error-messages="errors.password"
                    label="Contraseña"
                    prepend-inner-icon="mdi-lock-outline"
                    type="password"
                    variant="outlined"
                />

                <v-btn
                    block
                    class="mt-4"
                    color="primary"
                    elevation="3"
                    :loading="cargando"
                    rounded="lg"
                    size="large"
                    type="submit"
                >
                    Iniciar Sesión
                </v-btn>
            </v-form>
        </v-card>
    </v-container>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const credenciales = ref({ email: '', password: '' });
const errors = ref<Record<string, string[]>>({});
const mensajeError = ref('');
const cargando = ref(false);

const router = useRouter();
const auth = useAuthStore();

async function login() {
    errors.value = {};
    mensajeError.value = '';
    cargando.value = true;

    try {
        await auth.iniciarSesion(credenciales.value.email, credenciales.value.password);
        await router.push({ name: 'Perfil' });
    } catch (error: any) {
        const data = error?.response?.data;

        if (error?.response?.status === 422 && data?.errors) {
            errors.value = data.errors;
            mensajeError.value = data.message || 'Revisa los datos ingresados.';
        } else {
            mensajeError.value = data?.mensaje || data?.message || 'No se pudo iniciar sesión.';
        }
    } finally {
        cargando.value = false;
    }
}
</script>

<style>
.login-container {
    min-height: 100vh;
}
</style>
