export interface Cliente {
    id?: number;
    nombre_completo: string;
    nro_identificacion?: string | null;
    fecha_nacimiento?: string | null;
    telefono?: string | null;
    correo?: string | null;
    estado?: boolean;
    created_at?: string | null;
    updated_at?: string | null;
}
