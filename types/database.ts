// Tipos que reflejan el schema.sql. Si el schema cambia, actualizar acá
// (a futuro se puede generar automático con `supabase gen types typescript`).

export type RolUsuario = "operario" | "auditor" | "administrador";
export type TipoMovimiento = "entrada" | "salida" | "traslado" | "ajuste";
export type Rotacion = "alta" | "media" | "baja" | "sin_registro";

export interface Sector {
  id: number;
  nombre: string;
  cercania_linea: string | null;
  rotacion_objetivo: Rotacion | null;
  activo: boolean;
}

export interface Calle {
  id: number;
  sector_id: number;
  numero: number;
  nombre: string | null;
}

export interface Posicion {
  id: number;
  calle_id: number;
  numero: number;
  capacidad_pallets: number;
  capacidad_cajas: number;
  activa: boolean;
}

export interface Codigo {
  id: number;
  codigo: string;
  descripcion: string | null;
  rotacion_actual: Rotacion;
  activo: boolean;
}

export interface Perfil {
  id: string;
  nombre: string;
  rol: RolUsuario;
  activo: boolean;
}

export interface Movimiento {
  id: number;
  tipo: TipoMovimiento;
  codigo_id: number;
  posicion_origen_id: number | null;
  posicion_destino_id: number | null;
  cantidad: number;
  usuario_id: string;
  observaciones: string | null;
  motivo_ajuste: string | null;
  creado_en: string;
}

// Fila de la vista v_ocupacion_posiciones — lo que consume el mapa del dashboard
export interface OcupacionPosicion {
  sector_id: number;
  sector: string;
  calle_id: number;
  calle: number;
  posicion_id: number;
  posicion: number;
  capacidad_cajas: number;
  cajas_ocupadas: number;
  porcentaje_ocupacion: number;
}

// Fila de la vista v_stock_por_codigo — lo que consume el buscador
export interface StockPorCodigo {
  codigo: string;
  descripcion: string | null;
  sector_id: number;
  sector: string;
  calle: number;
  posicion: number;
  cantidad: number;
}
