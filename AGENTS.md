# AHA Flota — Stack Ateje (Lite)

## Identidad
- **Nombre:** AHA Flota
- **Tagline:** Control de flotillas y transporte offline
- **Perfil:** Lite (file://, doble clic)
- **Stack:** Alpine.js 3 + Dexie 3 + DaisyUI 4 + Tailwind Play CDN + Bootstrap Icons
- **Tema:** #f59e0b
- **Módulos:** vehiculos, combustible, mantenimiento, incidentes, reportes
- **Repo:** github.com/aha-apps/aha-flota

## Stack Técnico

- **Runtime:** Sin servidor. Abrir `index.html` con doble clic o servir con cualquier HTTP server
- **Frontend:** Alpine.js 3.14 (x-data, x-init, x-show, x-for, x-model, x-on, x-text, x-html, x-bind)
- **CSS:** DaisyUI 4 sobre Tailwind Play CDN (sin build step). Tema inyectado vía CSS variables
- **Iconos:** Bootstrap Icons v1.11
- **Persistencia:** Dexie 3 (IndexedDB) — offline-first, sin backend
- **Animaciones:** Animate.css v4
- **Cifrado:** CryptoJS AES (core/crypto.js)
- **Gráficos:** Chart.js 4
- **Compresión:** Pako 2 (para export/import .ateje-backup)
- **PWA:** Service Worker + manifest.json (instalable offline)

## Convenciones de Código (OBLIGATORIAS)

- **ES5 estricto:** `'use strict'`, `var`, function expressions. NO usar `import`, `export`, `type="module"`
- **CDNs en index.html:** Las librerías se cargan desde `assets/js/libs/` y `assets/css/`
- **UUID v4:** Usar `window.uuid()` de `core/crypto.js`
- **UI Helpers:** `UI.toast()`, `UI.confirm()`, `UI.modalForm()`, `UI.loading()`
- **DB:** `window.db` — instancia Dexie en core/db.js
- **Router:** Hash-based (core/app.js). Módulos se cargan por `#/modulo`
- **Módulos:** `module.html` (template Alpine) + `module.js` (lógica IIFE)
- **Sin `alert()`** — usar `UI.toast()` o `UI.confirm()`
- **Antes de `db.delete()`:** siempre `UI.confirm()`

## DB Schema

```
vehiculos: ++id, *placas, *numeroEconomico, marca, modelo, *anio, *tipo, *estado, *createdBy, createdAt, updatedAt
cargas_combustible: ++id, *vehiculoId, litros, importe, *kilometraje, *tipo, createdAt
mantenimientos: ++id, *vehiculoId, *tipo, costo, *kilometraje, *taller, *proximoKm, *createdBy, createdAt
incidentes: ++id, *vehiculoId, *tipo, costo, descripcion, *createdBy, createdAt
```

## Módulos

| Módulo | Ruta | Descripción |
|--------|------|-------------|
| Vehículos | `#/vehiculos` | CRUD de unidades de la flota |
| Combustible | `#/combustible` | Control de cargas de gasolina/diésel |
| Mantenimiento | `#/mantenimiento` | Historial de servicios y reparaciones |
| Incidentes | `#/incidentes` | Registro de accidentes y siniestros |
| Reportes | `#/reportes` | Dashboard de costos y eficiencia |

## Cómo Trabajar

1. **Abrir:** Doble clic en `index.html`
2. **Reset:** DevTools > Application > IndexedDB > Eliminar
3. **Export:** Ajustes > Exportar (.ateje-backup)
4. **Debug:** `window.Alpine` en consola
