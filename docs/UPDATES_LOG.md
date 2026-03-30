# Registro de updates

## Proposito

Registro cronologico compacto de cambios de producto y tecnologia.
Este documento esta optimizado para recuperar contexto con bajo consumo de tokens.

## Plantilla de entrada

```md
## YYYY-MM-DD - Titulo corto

### Alcance
- Area:
- Tipo: feat | fix | refactor | infra | docs
- Owner:

### Cambios
- Item 1
- Item 2

### Archivos tocados
- ruta/archivo

### Riesgo
- low | medium | high
- Notas:

### Verificacion
- Como se valido

### Pendientes
- Tarea pendiente 1
```

---

## 2026-03-30 - Validacion de sesion persistida tras deploy

### Alcance
- Area: Auth bootstrap
- Tipo: fix
- Owner: CTO flow

### Cambios
- Se agrego validacion del usuario persistido con Supabase antes de aceptar la sesion inicial del navegador.
- Se limpia la sesion local stale cuando `getSession()` devuelve un usuario pero la validacion remota no lo confirma.
- La pantalla `/auth` ya no redirige a `/today` mientras el bootstrap de autenticacion sigue resolviendo.
- Se agrego cobertura de tests para el caso de sesion persistida invalida post-deploy.

### Archivos tocados
- src/context/AuthContext.tsx
- src/pages/Auth.tsx
- src/context/AuthContext.test.tsx

### Riesgo
- medium
- Notas: cambia el criterio de aceptacion de sesion inicial; conviene smoke test manual despues del siguiente deploy.

### Verificacion
- `npm test -- AuthContext`
- Caso cubierto: una sesion persistida no validada ya no expone al usuario en la app antes de limpiar el estado.

### Pendientes
- Validar en entorno desplegado si el rebote post-deploy desaparece sin afectar logins legitimos.
- Evaluar si conviene endurecer tambien la estrategia de cache HTML en Nginx/Dokploy.

---

## 2026-03-30 - Actualizacion forzada de Service Worker en deploy

### Alcance
- Area: PWA cache invalidation
- Tipo: infra
- Owner: CTO flow

### Cambios
- Se activo registro inmediato del Service Worker para no diferir su handshake en rutas publicas.
- Cuando hay nueva version (`onNeedRefresh`), ahora se aplica `updateSW(true)` automaticamente una vez por sesion.
- Se mantiene evento de fallback para actualizacion manual si ya hubo auto-reload previo.

### Archivos tocados
- src/pwa/registerServiceWorker.ts

### Riesgo
- medium
- Notas: la primera carga post-deploy puede recargar una vez automaticamente para garantizar bundle actualizado.

### Verificacion
- `npm run build`
- Confirmar que `dist/sw.js` y `dist/workbox-*.js` se regeneran con el nuevo build.

### Pendientes
- Validar en produccion que desaparece el ciclo `/today -> /auth -> /today` inmediatamente despues de deploy.

---

## 2026-03-27 - Cierre de sesion (CTO)

### Alcance
- Area: Notificaciones, Landing, PWA boot, gobernanza de agentes
- Tipo: docs
- Owner: CTO flow

### Cambios
- Notificaciones: el recorrido guiado paso al desplegable superior y dejo de ocupar espacio en la lista.
- Landing: header fijado en estilo claro para mantener legibilidad de marca.
- Carga inicial: se redujo trabajo del service worker y se difirio su registro en rutas publicas.
- Gobernanza: se agrego auditoria de agentes y flujo de documentacion.

### Archivos tocados
- src/components/NotificationCenter.tsx
- src/components/landing/LandingHeader.tsx
- src/pwa/registerServiceWorker.ts
- vite.config.ts
- docs/AGENTS_AUDIT_2026-03-27.md
- agents/cto_agent.md
- agents/context_documentation_agent.md

### Riesgo
- medium
- Notas: cambios de cache requieren smoke test en mobile y desktop.

### Verificacion
- Validar que landing no quede en spinner tras deploy.
- Validar que badge de notificaciones muestre solo pendientes reales.
- Validar que acciones del recorrido existan en dropdown y no como card.

### Pendientes
- Unificar prompts parciales con plantilla comun.
- Agregar checklist de release con update obligatorio de este archivo.

---

## 2026-03-27 - Performance de primera carga en landing post-deploy

### Alcance
- Area: PWA bootstrap y estrategia de cache
- Tipo: infra
- Owner: CTO + DevOps

### Cambios
- Se redujo el precache de Workbox para evitar descarga de todos los chunks lazy en cada deploy.
- Script y style pasaron a `StaleWhileRevalidate`.
- Se difirio el registro del service worker en rutas publicas (`/`, `/auth*`).

### Archivos tocados
- vite.config.ts
- src/pwa/registerServiceWorker.ts

### Riesgo
- medium
- Notas: cambio de estrategia de cache.

### Verificacion
- Confirmar que landing renderiza sin demora larga.
- Confirmar que auth y dashboard siguen funcionando.

### Pendientes
- Medir p50/p95 de first render en mobile.

---

## 2026-03-27 - Header de landing fijo en tema claro

### Alcance
- Area: Landing UI
- Tipo: fix
- Owner: Frontend

### Cambios
- Header de landing forzado a paleta clara fija.
- Se mejoro contraste de logo y etiqueta de idioma.

### Archivos tocados
- src/components/landing/LandingHeader.tsx

### Riesgo
- low
- Notas: cambio visual.

### Verificacion
- Confirmar que header mantiene estilo claro sin depender del tema del usuario.

### Pendientes
- Ajustar espaciado final para igualarlo al header interno si se requiere.

---

## 2026-03-27 - Recorrido guiado fuera de lista de notificaciones

### Alcance
- Area: Notification center
- Tipo: fix
- Owner: CTO flow

### Cambios
- Se removio la card local de recorrido del listado principal.
- El recorrido quedo en el dropdown superior.
- El conteo de no leidas refleja notificaciones reales.

### Archivos tocados
- src/components/NotificationCenter.tsx

### Riesgo
- low
- Notas: impacto acotado a render y acciones de notificaciones.

### Verificacion
- Confirmar que "Recorrido disponible" no aparece como card en lista.
- Confirmar que iniciar/continuar/rehacer sigue disponible en dropdown.

### Pendientes
- Revisar microcopy final del dropdown.
