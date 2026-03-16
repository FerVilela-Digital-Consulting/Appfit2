# Admin Access

## Roles

- `member`: usuario regular
- `admin_manager`: admin designado con acceso al entorno administrativo en modo lectura/operacion
- `super_admin`: admin total con capacidad de reasignar roles

## Frontend

Rutas nuevas:

- `/admin`
- `/admin/users`
- `/admin/usage`

El acceso esta protegido por el guard `RequireAccountRole`.

## Backend / Supabase

Antes de usar el entorno admin en produccion o staging, ejecutar:

- `supabase_user_roles_admin.sql`

Ese script:

- agrega `account_role` a `public.users`
- rellena filas faltantes para usuarios existentes
- expone RPCs seguras para metricas, directorio detallado y uso de paneles
- crea la tabla `public.product_panel_events` para trazabilidad de paneles

Sistema de notificaciones:

- ejecutar `supabase_notifications.sql`
- habilita recordatorios internos y mensajes manuales enviados por admins
- conecta el icono de campana con un inbox persistente dentro de la app

Operaciones de cuenta:

- volver a ejecutar `supabase_user_roles_admin.sql` para activar `account_status`
- habilita desactivacion y reactivacion segura de cuentas desde `/admin/users`
- las cuentas desactivadas no se eliminan; simplemente pierden acceso hasta reactivarse

## RPCs usadas por el frontend

- `get_admin_dashboard_metrics`
- `get_admin_user_directory`
- `get_admin_user_directory_detailed`
- `get_admin_user_directory_operational`
- `get_admin_panel_usage`
- `get_admin_usage_daily`
- `set_user_account_role`
- `set_user_account_status`
- `track_panel_event`
- `send_admin_notification`
- `list_my_notifications`
- `mark_my_notification_read`
- `mark_all_my_notifications_read`
- `get_admin_notification_audit`

## Senales por usuario

La vista de usuarios ahora muestra tres senales operativas por cuenta:

- `Sin perfil`: existe en `public.users` pero no en `public.profiles`
- `Onboarding inconsistente`: `public.users.onboarding_completed` no coincide con `public.profiles.onboarding_completed`
- `Sin actividad`: no tiene registros en nutricion, peso ni medidas corporales

Tambien incorpora:

- `Estado`: `Activa` o `Desactivada`
- `Notificacion manual`: mensaje libre persistente hacia cualquier cuenta
- `Recordatorios sugeridos`: plantillas para cuentas con senales

## Recomendacion operativa

- definir una sola cuenta inicial como `super_admin`
- usar `admin_manager` para personal operativo
- no asignar permisos administrativos desde el frontend sin haber ejecutado primero el SQL de roles
