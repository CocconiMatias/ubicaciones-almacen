// Tipos que reflejan el schema.sql + 003_simplificar_a_calle.sql.

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
  capacidad_cajas: number;
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

export interface UsuarioConEmail {
  id: string;
  nombre: string;
  rol: RolUsuario;
  activo: boolean;
  email: string;
}

export interface Movimiento {
  id: number;
  tipo: TipoMovimiento;
  codigo_id: number;
  calle_origen_id: number | null;
  calle_destino_id: number | null;
  cantidad: number;
  usuario_id: string;
  observaciones: string | null;
  motivo_ajuste: string | null;
  creado_en: string;
}

// Fila de la vista v_ocupacion_calles — lo que consume el mapa del dashboard
export interface OcupacionCalle {
  sector_id: number;
  sector: string;
  calle_id: number;
  calle: number;
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
  cantidad: number;
}
