import api from "./api";
import type { CompraPayload } from "./interfaces/Compra";

export interface FiltrosCompra {
    search?: string;
    desde?: string;
    hasta?: string;
}

export async function funListar(page: number = 1, limit: number = 10, filtros: FiltrosCompra = {}) {
    return await api.get("/compra", {
        params: {
            page,
            limit,
            search: filtros.search || undefined,
            desde: filtros.desde || undefined,
            hasta: filtros.hasta || undefined,
        },
    });
}

export async function funGuardar(compra: CompraPayload) {
    return await api.post("/compra", compra);
}

export async function funGenerarPdf(id: number) {
    return await api.get(`/compra/${id}/generar-pdf`, {
        responseType: "blob",
    });
}

export async function funReportePdf(filtros: FiltrosCompra = {}) {
    return await api.get("/compra/reporte-pdf", {
        params: {
            search: filtros.search || undefined,
            desde: filtros.desde || undefined,
            hasta: filtros.hasta || undefined,
        },
        responseType: "blob",
    });
}
