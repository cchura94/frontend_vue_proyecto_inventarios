<template>
  <v-container max-width="960" class="py-6">
    <!-- Encabezado -->
    <div class="d-flex align-center justify-space-between flex-wrap ga-3 mb-6">
      <div>
        <h1 class="text-h5 font-weight-bold mb-1">Mi Perfil</h1>
        <p class="text-body-2 text-medium-emphasis mb-0">
          Información de tu cuenta
        </p>
      </div>

      <v-btn
        color="error"
        variant="flat"
        prepend-icon="mdi-logout"
        :loading="saliendo"
        @click="funSalir"
      >
        Cerrar sesión
      </v-btn>
    </div>

    <!-- Cargando -->
    <v-skeleton-loader v-if="cargando" type="card" rounded="lg" />

    <v-row v-else>
      <!-- Tarjeta de presentación -->
      <v-col cols="12" md="4">
        <v-card rounded="lg" elevation="2" class="pa-6 text-center h-100">
          <v-avatar size="96" color="primary" class="mb-4">
            <span class="text-h4 font-weight-bold">{{ inicial }}</span>
          </v-avatar>

          <div class="text-h6 font-weight-bold">
            {{ perfil.name || 'Sin nombre' }}
          </div>
          <div class="text-body-2 text-medium-emphasis mb-3">
            {{ perfil.email || 'Sin correo' }}
          </div>

          <v-chip
            color="success"
            variant="tonal"
            size="small"
            prepend-icon="mdi-shield-check"
          >
            Usuario activo
          </v-chip>

          <div v-if="auth.roles.length" class="mt-4 d-flex flex-wrap justify-center ga-2">
            <v-chip
              v-for="rol in auth.roles"
              :key="rol"
              color="primary"
              size="small"
              variant="tonal"
              prepend-icon="mdi-account-badge"
            >
              {{ rol }}
            </v-chip>
          </div>
        </v-card>
      </v-col>

      <!-- Datos de la cuenta -->
      <v-col cols="12" md="8">
        <v-card rounded="lg" elevation="2" class="h-100">
          <v-card-title class="d-flex align-center ga-2">
            <v-icon icon="mdi-account-details" color="primary" />
            Datos de la cuenta
          </v-card-title>

          <v-divider />

          <v-card-text>
            <v-list lines="two" density="comfortable">
              <v-list-item
                prepend-icon="mdi-account"
                title="Nombre"
                :subtitle="perfil.name || 'No registrado'"
              />
              <v-divider inset />
              <v-list-item
                prepend-icon="mdi-email"
                title="Correo electrónico"
                :subtitle="perfil.email || 'No registrado'"
              />
              <v-divider inset />
              <v-list-item
                prepend-icon="mdi-calendar-clock"
                title="Fecha de registro"
                :subtitle="fechaCreacion"
              />
            </v-list>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Permisos -->
      <v-col cols="12">
        <v-card rounded="lg" elevation="2">
          <v-card-title class="d-flex align-center ga-2">
            <v-icon icon="mdi-key-variant" color="primary" />
            Permisos asignados
            <v-chip size="small" variant="tonal" color="primary" class="ms-2">
              {{ auth.permisos.length }}
            </v-chip>
          </v-card-title>

          <v-divider />

          <v-card-text>
            <div v-if="auth.esAdministrador" class="text-body-2 text-medium-emphasis">
              Tu rol <strong>administrador</strong> tiene acceso total al sistema.
            </div>

            <div
              v-else-if="auth.permisos.length"
              class="d-flex flex-wrap ga-2"
            >
              <v-chip
                v-for="permiso in permisosOrdenados"
                :key="permiso"
                size="small"
                variant="tonal"
                color="primary"
                prepend-icon="mdi-check-decagram"
              >
                {{ permiso }}
              </v-chip>
            </div>

            <div v-else class="text-body-2 text-medium-emphasis">
              No tienes permisos asignados.
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-snackbar v-model="snackbar" color="error" timeout="4000">
      {{ mensajeError }}
    </v-snackbar>
  </v-container>
</template>

<script lang="ts" setup>
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import type { UsuarioAuth } from '@/services/interfaces/Auth';

const router = useRouter();
const auth = useAuthStore();

const cargando = ref(true);
const saliendo = ref(false);
const snackbar = ref(false);
const mensajeError = ref('');

const perfil = computed<Partial<UsuarioAuth>>(() => auth.usuario ?? {});

const inicial = computed(() => {
  const nombre = perfil.value?.name?.trim();
  return nombre ? nombre.charAt(0).toUpperCase() : '?';
});

const fechaCreacion = computed(() => {
  const fecha = perfil.value?.created_at;
  if (!fecha) return 'No registrada';

  const date = new Date(fecha);
  if (Number.isNaN(date.getTime())) return fecha;

  return date.toLocaleDateString('es-PE', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
});

const permisosOrdenados = computed(() => [...auth.permisos].sort());

async function cargarPerfil() {
  try {
    if (!auth.cargado) {
      await auth.cargarPerfil();
    }
  } catch {
    mensajeError.value = 'No se pudo cargar la información del perfil.';
    snackbar.value = true;
  } finally {
    cargando.value = false;
  }
}

async function funSalir() {
  saliendo.value = true;
  try {
    await auth.cerrarSesion();
  } finally {
    saliendo.value = false;
    await router.push({ name: 'Login' });
  }
}

onMounted(cargarPerfil);
</script>
