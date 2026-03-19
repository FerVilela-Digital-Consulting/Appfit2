Actua como Product Designer Lead + UX Architect especializado en SaaS B2B y operaciones logisticas.

Tu tarea es preparar un rediseño completo de:

1) Landing comercial  
2) Intranet operativa (PWA)

para el producto **Trazabilidad Cafe**.

---

CONTEXTO OBLIGATORIO A REVISAR ANTES DE RESPONDER

- docs/ENGINEERING_RUNBOOK.md
- docs/ARCHITECTURE.md
- apps/web/src/App.tsx
- apps/web/src/styles.css
- apps/web/src/components/dashboard/kpi-dashboard.tsx

Si alguno no existe, indicarlo.

---

OBJETIVO

Entregar un brief de diseño + prompt listo para Figma AI (copiar/pegar), alineado al flujo real del producto.

El rediseño debe cubrir:

- Mobile-first (PWA en campo)
- Desktop operativo para admin/supervisor
- Accesibilidad (WCAG AA)
- Claridad de estado (offline/online, API up/down, anclaje blockchain)
- Multi-rol (ADMIN, SUPERVISOR, FIELD_OPERATOR, PACKAGING_OPERATOR)

---

PANTALLAS MINIMAS A DISEÑAR

Landing:
- Home con hero, propuesta de valor, modulos, flujo, plan piloto, FAQ y CTA de login.
- Modal de login + recuperacion/reset de password.

Intranet:
- Dashboard admin con tabs: Dashboard, Operaciones, Trazabilidad, Simulaciones, Auditoria.
- Hub de operaciones (crear lote, evento, servicio laboratorio, empresa/usuario admin).
- Panel de trazabilidad por lote (timeline, etapas, KPIs, anclajes).
- Seccion certificado + QR + estado de trazabilidad minima.
- Reportes de KPIs y uso.
- Modal global "Crear" con variantes de formulario.

---

SALIDA ESPERADA

Responde con estas secciones y en este orden:

### 1) Diagnostico UX/UI actual
- problemas de jerarquia visual
- problemas de flujo
- problemas de consistencia de componentes
- gaps de accesibilidad

### 2) Direccion visual propuesta
- concepto visual (1 solo, no 3 variantes)
- paleta de color (tokens)
- tipografia
- sistema de espaciado
- sistema de estados (exito, alerta, error, pendiente)

### 3) Arquitectura de informacion propuesta
- mapa de landing
- mapa de intranet
- navegacion principal y secundaria

### 4) Prompt final para Figma AI (copiable)
Debe estar en un bloque unico de texto y contener:
- contexto de negocio
- objetivo de conversion (landing) y productividad (intranet)
- lista de pantallas
- restricciones responsive (360, 768, 1440)
- componentes obligatorios (botones, tabs, cards, tablas/listas, modal, timeline, badges de estado)
- criterio de accesibilidad AA
- tono visual (premium agro-tech, confiable, sin estilo generico)
- microcopys en espanol

### 5) Checklist de validacion de entregable
- coherencia visual
- legibilidad
- facilidad de uso en campo
- claridad de estados operativos
- handoff para desarrollo (tokens, componentes, variantes)

---

REGLAS IMPORTANTES

- No escribir codigo frontend.
- No inventar funcionalidades fuera del flujo real.
- Priorizar decisiones que reduzcan friccion operativa.
- Evitar layouts genericos tipo dashboard template.
- El resultado debe poder pegarse directo en Figma AI.
