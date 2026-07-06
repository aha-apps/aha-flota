# AHA Flota — Especificación Funcional

## Identidad

- **Nombre:** AHA Flota
- **Tagline:** Control de flotillas y transporte offline
- **Perfil:** Lite (file://, doble clic)
- **Stack:** Alpine.js 3 + Dexie 3 + DaisyUI 4 + Tailwind Play CDN + Bootstrap Icons
- **Tema:** #f59e0b (amber-500)
- **Branch:** main

## Propósito

Aplicación offline-first para la gestión de flotillas vehiculares. Permite controlar vehículos, cargas de combustible, mantenimientos programados e incidentes, con reportes de costos operativos.

## DB Schema (Dexie)

```
vehiculos: ++id, *placas, *numeroEconomico, marca, modelo, *anio, *tipo, *estado, *createdBy, createdAt, updatedAt
cargas_combustible: ++id, *vehiculoId, litros, importe, *kilometraje, *tipo, createdAt
mantenimientos: ++id, *vehiculoId, *tipo, costo, *kilometraje, *taller, *proximoKm, *createdBy, createdAt
incidentes: ++id, *vehiculoId, *tipo, costo, descripcion, *createdBy, createdAt
```

### Indexes adicionales

- vehiculos: `&placas` (unique), `&numeroEconomico` (unique), `*estado`
- cargas_combustible: `*vehiculoId`, `*tipo`
- mantenimientos: `*vehiculoId`, `*tipo`
- incidentes: `*vehiculoId`, `*tipo`

## Módulos

### 1. Vehículos (`#/vehiculos`)
- Lista de unidades con placas, número económico y estado
- CRUD completo
- Campos: placas (requerido, único), número económico (único), marca, modelo, año, tipo (sedan,SUV, camioneta, camion, moto, otro), estado (activo, en-taller, baja)
- Vista de detalle con historial completo

### 2. Combustible (`#/combustible`)
- Registro de cargas de combustible por vehículo
- Campos: litros, importe, kilometraje actual, tipo (regular, premium, diesel)
- Cálculo automático de rendimiento (km/l) comparando cargas anteriores
- Lista filtrada por vehículo con total acumulado

### 3. Mantenimiento (`#/mantenimiento`)
- Historial de servicios por vehículo
- Tipos: preventivo, correctivo, llantas, frenos, suspension, motor, transmision, electrico, otros
- Campos: tipo, costo, kilometraje, taller, próximo km sugerido
- Alerta de mantenimiento próximo (basado en kilometraje)
- Programar recordatorio por km

### 4. Incidentes (`#/incidentes`)
- Registro de accidentes, infracciones y siniestros
- Tipos: choque, infraccion, vandalismo, robo, otro
- Campos: tipo, costo estimado, descripción, fecha
- Vincular fotos (base64) si aplica

### 5. Reportes (`#/reportes`)
- Costo total por vehículo (barras)
- Gasto en combustible vs mantenimiento (dona)
- Incidentes por tipo (pastel)
- Rendimiento de combustible por vehículo (línea)
- Alertas: vehículos en taller, mantenimientos próximos
- Exportar reporte como JSON

## Reglas de Negocio

- Placas y número económico deben ser únicos
- Kilometraje de una carga debe ser mayor al anterior del mismo vehículo
- No se puede eliminar un vehículo con cargas de combustible
- Alerta visual cuando el vehículo se acerca al próximo mantenimiento
- El costo de incidente puede ser 0 si está en proceso de ajuste
