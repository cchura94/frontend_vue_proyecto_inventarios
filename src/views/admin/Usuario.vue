<template>
    <v-container fluid class="py-6">
        <v-card rounded="lg" elevation="2">
            <!-- Encabezado -->
            <v-toolbar flat color="transparent">
                <v-icon class="ms-2" color="primary" icon="mdi-account-group" />
                <v-toolbar-title class="text-h6 font-weight-bold">
                    Gestión de Usuarios
                </v-toolbar-title>

                <v-btn
                    v-if="$can('crear', 'Usuario')"
                    color="primary"
                    prepend-icon="mdi-plus"
                    rounded="lg"
                    @click="abrirCrear"
                >
                    Nuevo Usuario
                </v-btn>
            </v-toolbar>

            <v-card-subtitle class="pb-2">
                {{ usuariosFiltrados.length }} usuarios registrados
            </v-card-subtitle>

            <v-divider />

            <v-card-text>
                <v-text-field
                    v-model="buscar"
                    class="mb-4"
                    clearable
                    density="comfortable"
                    hide-details
                    label="Buscar por nombre, correo o rol"
                    prepend-inner-icon="mdi-magnify"
                    variant="outlined"
                />

                <v-data-table
                    :headers="headers"
                    :items="usuariosFiltrados"
                    :loading="cargando"
                    hover
                    item-value="id"
                >
                    <template v-slot:item.roles="{ item }">
                        <div v-if="item.roles?.length" class="d-flex flex-wrap ga-1 py-1">
                            <v-chip
                                v-for="rol in item.roles"
                                :key="rol.id"
                                color="primary"
                                size="small"
                                variant="tonal"
                                prepend-icon="mdi-shield-account"
                            >
                                {{ rol.nombre }}
                            </v-chip>
                        </div>
                        <span v-else class="text-caption text-medium-emphasis">
                            Sin rol
                        </span>
                    </template>

                    <template v-slot:item.created_at="{ item }">
                        {{ formatearFecha(item.created_at) }}
                    </template>

                    <template v-slot:item.actions="{ item }">
                        <div class="d-flex ga-2 justify-end">
                            <v-btn
                                v-if="$can('editar', 'Usuario')"
                                color="primary"
                                icon="mdi-pencil"
                                size="small"
                                variant="text"
                                @click="abrirEditar(item)"
                            />
                            <v-btn
                                v-if="$can('eliminar', 'Usuario')"
                                color="error"
                                icon="mdi-delete"
                                size="small"
                                variant="text"
                                @click="abrirEliminar(item)"
                            />
                        </div>
                    </template>

                    <template v-slot:no-data>
                        <div class="py-6 text-center text-medium-emphasis">
                            <v-icon class="mb-2" icon="mdi-account-off-outline" size="40" />
                            <div>
                                {{
                                    buscar
                                        ? 'No se encontraron usuarios con ese criterio.'
                                        : 'No existen usuarios registrados.'
                                }}
                            </div>
                        </div>
                    </template>

                    <template v-slot:loading>
                        <v-skeleton-loader type="table-row@5" />
                    </template>
                </v-data-table>
            </v-card-text>
        </v-card>

        <!-- Crear / Editar -->
        <v-dialog v-model="dialog" max-width="620" persistent>
            <v-card rounded="lg">
                <v-card-title class="d-flex align-center ga-2">
                    <v-icon color="primary" icon="mdi-account-edit" />
                    {{ form.id ? 'Editar usuario' : 'Nuevo usuario' }}
                </v-card-title>

                <v-divider />

                <v-card-text>
                    <v-form ref="formRef" @submit.prevent="guardar">
                        <v-row dense>
                            <v-col cols="12">
                                <v-text-field
                                    v-model="form.name"
                                    :error-messages="errores.name"
                                    label="Nombre"
                                    prepend-inner-icon="mdi-account"
                                    :rules="[obligatorio]"
                                    variant="outlined"
                                />
                            </v-col>

                            <v-col cols="12">
                                <v-text-field
                                    v-model="form.email"
                                    :error-messages="errores.email"
                                    label="Correo electrónico"
                                    prepend-inner-icon="mdi-email"
                                    :rules="[obligatorio, emailValido]"
                                    type="email"
                                    variant="outlined"
                                />
                            </v-col>

                            <v-col cols="12">
                                <v-text-field
                                    v-model="form.password"
                                    :error-messages="errores.password"
                                    :label="form.id ? 'Nueva contraseña (opcional)' : 'Contraseña'"
                                    prepend-inner-icon="mdi-lock"
                                    :rules="[passwordValido]"
                                    type="password"
                                    variant="outlined"
                                />
                            </v-col>

                            <v-col cols="12">
                                <v-select
                                    v-model="form.roles"
                                    chips
                                    closable-chips
                                    :error-messages="errores.roles"
                                    item-title="nombre"
                                    item-value="id"
                                    :items="roles"
                                    label="Roles"
                                    :loading="cargandoRoles"
                                    multiple
                                    :no-data-text="sinRolesDisponibles"
                                    prepend-inner-icon="mdi-shield-account"
                                    variant="outlined"
                                />
                                <div class="text-caption text-medium-emphasis">
                                    Los permisos efectivos del usuario se obtienen de sus roles.
                                </div>
                            </v-col>
                        </v-row>
                    </v-form>
                </v-card-text>

                <v-divider />

                <v-card-actions class="pa-4">
                    <v-btn variant="text" @click="cerrarDialogo">
                        Cancelar
                    </v-btn>

                    <v-spacer />

                    <v-btn
                        v-if="$can(form.id ? 'editar' : 'crear', 'Usuario')"
                        color="primary"
                        :loading="guardando"
                        prepend-icon="mdi-content-save"
                        @click="guardar"
                    >
                        {{ form.id ? 'Actualizar' : 'Guardar' }}
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <!-- Confirmar eliminación -->
        <v-dialog v-model="dialogEliminar" max-width="420">
            <v-card rounded="lg">
                <v-card-title class="d-flex align-center ga-2">
                    <v-icon color="error" icon="mdi-alert-circle-outline" />
                    Eliminar usuario
                </v-card-title>

                <v-divider />

                <v-card-text>
                    ¿Estás seguro de eliminar a
                    <strong>{{ usuarioAEliminar?.name }}</strong>?
                    Esta acción no se puede deshacer.
                </v-card-text>

                <v-card-actions class="pa-4">
                    <v-btn variant="text" @click="dialogEliminar = false">
                        Cancelar
                    </v-btn>

                    <v-spacer />

                    <v-btn
                        color="error"
                        :loading="eliminando"
                        prepend-icon="mdi-delete"
                        @click="confirmarEliminar"
                    >
                        Eliminar
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <v-snackbar v-model="snackbar.visible" :color="snackbar.color" location="top right" timeout="3500">
            {{ snackbar.texto }}
        </v-snackbar>
    </v-container>
</template>

<script lang="ts" setup>
import { computed, onMounted, ref } from 'vue';
import {
    funEliminar,
    funGuardar,
    funListar,
    funModificar,
} from '@/services/usuario.service';
import { funListar as funListarRoles } from '@/services/rol.service';
import type { Rol } from '@/services/interfaces/Rol';
import type { Usuario, UsuarioPayload } from '@/services/interfaces/Usuario';
import { useAuthStore } from '@/stores/auth';

interface UsuarioForm {
    id: number;
    name: string;
    email: string;
    password: string;
    roles: number[];
}

const auth = useAuthStore();

const headers = [
    { title: 'ID', key: 'id', width: 70 },
    { title: 'NOMBRE', key: 'name' },
    { title: 'CORREO', key: 'email' },
    { title: 'ROLES', key: 'roles', sortable: false },
    { title: 'REGISTRADO', key: 'created_at' },
    { title: 'ACCIONES', key: 'actions', align: 'end' as const, sortable: false },
];

const vacio = (): UsuarioForm => ({
    id: 0,
    name: '',
    email: '',
    password: '',
    roles: [],
});

const usuarios = ref<Usuario[]>([]);
const roles = ref<Rol[]>([]);
const buscar = ref('');
const cargando = ref(false);
const cargandoRoles = ref(false);
const guardando = ref(false);
const eliminando = ref(false);

const dialog = ref(false);
const dialogEliminar = ref(false);
const formRef = ref<any>(null);
const form = ref<UsuarioForm>(vacio());
const errores = ref<Record<string, string>>({});
const usuarioAEliminar = ref<Usuario | null>(null);

const snackbar = ref({ visible: false, texto: '', color: 'success' });

const usuariosFiltrados = computed(() => {
    const texto = buscar.value?.trim().toLowerCase();
    if (!texto) return usuarios.value;

    return usuarios.value.filter((usuario) =>
        [
            usuario.name,
            usuario.email,
            ...(usuario.roles ?? []).map((rol) => rol.nombre),
        ].some((valor) => (valor ?? '').toLowerCase().includes(texto)),
    );
});

const sinRolesDisponibles = computed(() =>
    auth.can('ver', 'Rol')
        ? 'No hay roles registrados'
        : 'No tienes permiso para consultar los roles',
);

function obligatorio(valor: unknown) {
    return !!String(valor ?? '').trim() || 'Este campo es obligatorio';
}

function emailValido(valor: unknown) {
    return (
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(valor ?? '')) ||
        'Ingresa un correo válido'
    );
}

function passwordValido(valor: unknown) {
    if (form.value.id && !valor) return true;
    return String(valor ?? '').length >= 6 || 'Mínimo 6 caracteres';
}

function formatearFecha(fecha?: string | null) {
    if (!fecha) return '—';

    const date = new Date(fecha.replace(' ', 'T'));
    if (Number.isNaN(date.getTime())) return fecha;

    return date.toLocaleDateString('es-PE', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    });
}

function notificar(texto: string, color = 'success') {
    snackbar.value = { visible: true, texto, color };
}

function extraerErrores(error: any) {
    errores.value = {};

    const campos = error?.response?.data?.errors ?? {};
    for (const [campo, mensajes] of Object.entries(campos)) {
        errores.value[campo] = (mensajes as string[])[0] ?? 'Valor inválido';
    }

    return (
        error?.response?.data?.message ??
        error?.response?.data?.mensaje ??
        'Ocurrió un error inesperado.'
    );
}

async function listarUsuarios() {
    cargando.value = true;
    try {
        const { data } = await funListar();
        usuarios.value = Array.isArray(data) ? data : [];
    } catch (error) {
        usuarios.value = [];
        notificar(extraerErrores(error), 'error');
    } finally {
        cargando.value = false;
    }
}

async function listarRoles() {
    if (!auth.can('ver', 'Rol')) return;

    cargandoRoles.value = true;
    try {
        const { data } = await funListarRoles({ limit: 100 });
        roles.value = Array.isArray(data) ? data : (data?.data ?? []);
    } catch {
        roles.value = [];
    } finally {
        cargandoRoles.value = false;
    }
}

function abrirCrear() {
    form.value = vacio();
    errores.value = {};
    dialog.value = true;
}

function abrirEditar(usuario: Usuario) {
    form.value = {
        id: usuario.id ?? 0,
        name: usuario.name,
        email: usuario.email,
        password: '',
        roles: (usuario.roles ?? [])
            .map((rol) => rol.id)
            .filter((id): id is number => typeof id === 'number'),
    };
    errores.value = {};
    dialog.value = true;
}

function cerrarDialogo() {
    dialog.value = false;
    form.value = vacio();
    errores.value = {};
}

async function guardar() {
    const { valid } = await formRef.value.validate();
    if (!valid) return;

    guardando.value = true;
    errores.value = {};

    try {
        const payload: UsuarioPayload = {
            name: form.value.name.trim(),
            email: form.value.email.trim(),
            roles: form.value.roles,
        };

        if (form.value.password) {
            payload.password = form.value.password;
        }

        if (form.value.id) {
            await funModificar(form.value.id, payload);
            notificar('Usuario actualizado correctamente.');
        } else {
            await funGuardar(payload);
            notificar('Usuario registrado correctamente.');
        }

        dialog.value = false;
        form.value = vacio();
        await listarUsuarios();
    } catch (error) {
        notificar(extraerErrores(error), 'error');
    } finally {
        guardando.value = false;
    }
}

function abrirEliminar(usuario: Usuario) {
    usuarioAEliminar.value = usuario;
    dialogEliminar.value = true;
}

async function confirmarEliminar() {
    if (!usuarioAEliminar.value?.id) return;

    eliminando.value = true;
    try {
        await funEliminar(usuarioAEliminar.value.id);
        notificar('Usuario eliminado correctamente.');
        dialogEliminar.value = false;
        usuarioAEliminar.value = null;
        await listarUsuarios();
    } catch (error) {
        notificar(extraerErrores(error), 'error');
    } finally {
        eliminando.value = false;
    }
}

onMounted(() => {
    listarUsuarios();
    listarRoles();
});
</script>
