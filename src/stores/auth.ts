import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import { ability, actualizarAbility } from '@/services/ability';
import type { AppAction, AppSubject } from '@/services/ability';
import {
    loginConlaravel,
    logout as logoutApi,
    obtenerPerfil,
} from '@/services/auth.service';
import type {
    LoginResponse,
    PerfilResponse,
    UsuarioAuth,
} from '@/services/interfaces/Auth';

const TOKEN_KEY = 'access_token';

export const useAuthStore = defineStore('auth', () => {
    const usuario = ref<UsuarioAuth | null>(null);
    const permisos = ref<string[]>([]);
    const cargando = ref(false);
    const cargado = ref(false);

    const token = computed(() => localStorage.getItem(TOKEN_KEY));
    const autenticado = computed(() => !!token.value);
    const roles = computed(() => usuario.value?.roles?.map((rol) => rol.nombre) ?? []);
    const esAdministrador = computed(() => roles.value.includes('administrador'));

    /**
     * Guarda usuario + permisos y reconstruye las reglas CASL.
     */
    function aplicarSesion(usuarioSesion: UsuarioAuth, listaPermisos: string[]): void {
        usuario.value = usuarioSesion;
        permisos.value = [...(listaPermisos ?? [])];
        actualizarAbility(permisos.value, esAdministrador.value);
        cargado.value = true;
    }

    async function iniciarSesion(email: string, password: string): Promise<LoginResponse> {
        const { data } = await loginConlaravel(email, password);

        localStorage.setItem(TOKEN_KEY, data.access_token);
        aplicarSesion(data.usuario, data.permisos ?? []);

        return data;
    }

    async function cargarPerfil(): Promise<PerfilResponse | null> {
        if (!token.value) return null;

        cargando.value = true;

        try {
            const { data } = await obtenerPerfil();
            aplicarSesion(data, data.permisos ?? []);
            return data;
        } finally {
            cargando.value = false;
        }
    }

    /**
     * Limpia el estado local de la sesión sin llamar al backend.
     */
    function limpiarSesion(): void {
        localStorage.removeItem(TOKEN_KEY);
        usuario.value = null;
        permisos.value = [];
        cargado.value = false;
        actualizarAbility([]);
    }

    /**
     * Se usa en el guard del router: si hay token pero la sesión aún no
     * está en memoria (por ejemplo tras recargar la página), carga el perfil.
     *
     * Si el perfil no se puede cargar (token vencido, usuario eliminado o
     * error de red) se limpia la sesión para evitar un bucle de redirección
     * entre /auth/login y /admin/perfil.
     */
    async function asegurarCargado(): Promise<boolean> {
        if (!token.value) return false;
        if (cargado.value) return true;

        try {
            await cargarPerfil();
            return cargado.value;
        } catch {
            limpiarSesion();
            return false;
        }
    }

    async function cerrarSesion(): Promise<void> {
        try {
            await logoutApi();
        } catch {
            // Si el token ya no es válido, igual limpiamos el estado local.
        }

        limpiarSesion();
    }

    function can(action: AppAction, subject: AppSubject): boolean {
        return ability.can(action, subject);
    }

    return {
        usuario,
        permisos,
        cargando,
        cargado,
        token,
        autenticado,
        roles,
        esAdministrador,
        iniciarSesion,
        cargarPerfil,
        asegurarCargado,
        cerrarSesion,
        limpiarSesion,
        can,
    };
});
