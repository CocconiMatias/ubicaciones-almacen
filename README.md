# Ubicaciones de Almacén

Sistema web independiente del ERP para gestionar ubicaciones físicas de cajas
en el depósito. El ERP (JD Edwards, luego SAP) sigue siendo la fuente oficial
de stock — esta app solo controla **dónde está físicamente cada cosa**.

## Estado actual (Paso 2 de la construcción)

Ya está armado:
- Login con Supabase Auth
- Dashboard con mapa visual de ocupación por sector/calle/posición
- Registro de movimientos: **entrada**, **salida** y **traslado**
- Buscador global por código

Falta (próximos pasos):
- Relevamientos físicos con exportación a Excel/PDF
- Pantalla de **ajustes** (solo Administrador) con motivo obligatorio
- Alta/gestión de usuarios y roles desde la propia app (hoy se hace a mano en Supabase)
- Importación de stock/maestro desde JDE

## Instalación

1. Instalar dependencias:
   ```bash
   npm install
   ```

2. Copiar el archivo de entorno y completar con los datos de tu proyecto de Supabase
   (Project Settings → API → Project URL / anon public key):
   ```bash
   cp .env.local.example .env.local
   ```

3. Si todavía no corriste el modelo de datos, hacerlo en el SQL Editor de Supabase,
   en este orden: `schema.sql` y después `carga_calles_posiciones.sql` (estos dos
   archivos están fuera de esta carpeta, en la entrega del Paso 1).

4. Crear al menos un usuario:
   - Crearlo en Supabase → Authentication → Users → Add user.
   - Insertar su perfil en la tabla `perfiles` con su rol:
     ```sql
     insert into perfiles (id, nombre, rol)
     values ('UUID-DEL-USUARIO', 'Nombre Apellido', 'administrador');
     ```
     El UUID se copia desde la misma pantalla de Authentication.

5. Levantar el proyecto:
   ```bash
   npm run dev
   ```
   Abrir http://localhost:3000

## Estructura

```
app/
  login/            → pantalla de login
  (app)/            → rutas protegidas (requieren sesión)
    dashboard/       → mapa de ocupación
    registro/        → alta de entrada / salida / traslado
    buscador/        → búsqueda global por código
    relevamientos/   → (placeholder, paso siguiente)
actions/
  movimientos.ts    → Server Actions que insertan en `movimientos`
lib/supabase/       → clientes de Supabase (browser y servidor)
types/database.ts   → tipos alineados con el schema SQL
middleware.ts        → protege rutas y valida rol en /admin
```

## Decisiones de diseño

- Los movimientos nunca se editan ni se borran: cada corrección es un nuevo
  movimiento tipo `ajuste` (ver `schema.sql`). La app respeta eso: no hay
  ninguna pantalla que haga UPDATE/DELETE sobre `movimientos`.
- La validación de stock insuficiente y de capacidad máxima por posición vive
  en la base (triggers), no solo en el frontend — así queda protegida aunque
  en el futuro se conecte otro cliente (ej. una integración directa).
