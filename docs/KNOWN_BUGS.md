# Known Bugs

## Bug

Dokploy AppFit database can be populated while the deployed frontend still uses the hosted Supabase project.

## Contexto

The AppFit frontend in Dokploy is a static Vite/Nginx container. The deployed bundle contains Supabase configuration baked at build time, while the Dokploy PostgreSQL service is a separate plain PostgreSQL container.

## Stack involucrado

- Vite build-time environment variables
- Supabase JS client
- Dokploy
- PostgreSQL
- Nginx

## Sintomas

- The Dokploy PostgreSQL database contains restored tables and data, but the browser app does not use that database.
- The deployed frontend can respond with `200` on SPA routes while still reading and writing through a different Supabase backend.
- A documented temporary Traefik host can return `404` while the active production host routes correctly to the container.

## Causa raiz

The frontend depends on `VITE_SUPABASE_URL` and the publishable key at build time. A plain PostgreSQL URL is not a valid replacement for the Supabase HTTP API URL expected by `@supabase/supabase-js`, and the current AppFit Dokploy stack does not include Supabase Auth/PostgREST services for the Dokploy PostgreSQL database.

## Solucion

- Choose the intended backend source of truth before rebuilding:
  - keep using the hosted Supabase project and restore the backup there with proper database credentials, or
  - deploy a Supabase-compatible stack for the Dokploy PostgreSQL database and rebuild the frontend with that stack's public Supabase URL and publishable key.
- Do not set `VITE_SUPABASE_URL` to a raw `postgresql://...` URL.
- Update deployment docs and Dokploy build-time arguments after the backend target is chosen.

## Comandos utiles

```powershell
docker ps --format "table {{.Names}}\t{{.Image}}\t{{.Ports}}"
```

```powershell
curl -I -L https://<APP_HOST>/auth
```

## Prevencion

- Treat Vite build-time variables as part of deployment release state.
- Add a post-deploy check that compares the active bundle's Supabase URL with the intended backend.
- Keep the documented application host aligned with the active Dokploy route.

---

## Bug

`.env` in repo root is not ignored by `.gitignore`.

## Contexto

The repository contains a root `.env` file, but `.gitignore` does not include `.env` or `.env.*` ignore rules.

## Stack involucrado

- Git
- local environment management
- Supabase frontend configuration

## Sintomas

- local secrets can be accidentally staged or committed
- developers may assume `.env` is protected when it is not

## Causa raiz

Missing ignore rules for environment files.

## Solucion

- add `.env` and environment variants to `.gitignore`
- if any secret values were ever committed, rotate them and remove them from history if needed
- keep only `.env.example` with variable names, never real values

## Comandos utiles

```powershell
git status --short
```

## Prevencion

- standardize on `.env.example`
- review secrets hygiene during every security pass
- treat committed credentials as a security incident

---

## Bug

Stale frontend bundle after redeploy can preserve outdated auth configuration in the browser.

## Contexto

The app was redeployed successfully with corrected Vite build variables, but the browser continued using cached assets/state from a previous build.

## Stack involucrado

- Vite
- Nginx
- Dokploy
- Browser cache
- Supabase Auth

## Sintomas

- login or signup behavior does not match the latest deployment
- user sees stale errors such as `Failed to fetch`
- production HTML or bundle changed remotely, but the local browser behavior does not

## Causa raiz

The deployment was updated, but the client still served cached frontend assets or stale local browser state.

## Solucion

- perform hard refresh
- clear browser cache for the domain
- re-open in incognito to confirm latest bundle behavior
- for operations, include a post-deploy smoke test in a clean browser session

## Comandos utiles

```powershell
Invoke-WebRequest -UseBasicParsing 'http://<DEPLOYED_HOST>/' | Select-Object -ExpandProperty Content
```

## Prevencion

- use explicit post-deploy validation
- consider better HTML cache-control behavior
- communicate that environment-variable changes require both rebuild and browser refresh

---

## Bug

Email confirmation can appear functional in the app while actual email delivery remains unreliable with built-in Supabase mail service.

## Contexto

User registration succeeds and the app correctly shows that email confirmation is enabled, but the confirmation email may not arrive consistently.

## Stack involucrado

- Supabase Auth
- built-in Supabase email service
- browser frontend

## Sintomas

- signup returns confirmation-required flow
- user exists or signup succeeds
- confirmation email does not arrive or arrives inconsistently

## Causa raiz

Built-in Supabase email is rate-limited and not intended for production reliability.

## Solucion

- configure a custom SMTP provider
- reduce repeated rapid-fire test signups
- test with fresh emails and inspect spam

## Comandos utiles

No local command is sufficient; verify through Supabase dashboard and SMTP provider configuration.

## Prevencion

- configure custom SMTP before production rollout
- document auth email behavior and test cases

---

## Bug

Persisted auth session after redeploy can briefly expose authenticated UI before the app forces a fresh login.

## Contexto

After a deploy, the browser can still hold a previous Supabase session in local storage. The frontend may rehydrate that session on boot before the newest build finishes validating it.

## Stack involucrado

- Supabase Auth
- React auth bootstrap
- Browser localStorage
- Vite deploy lifecycle

## Sintomas

- user appears logged in immediately after opening the app post-deploy
- protected routes or `/today` render briefly
- a few seconds later the app redirects back to `/auth`
- logging in a second time usually works normally

## Causa raiz

The previous implementation accepted the persisted session returned by `getSession()` during bootstrap before confirming that the current backend still recognized that user session.

## Solucion

- validate the persisted session with a remote user check before exposing authenticated app state
- clear stale local session state when validation fails
- avoid auth-page redirects while initial auth bootstrap is still loading

## Comandos utiles

```powershell
npm test -- AuthContext
```

## Prevencion

- smoke-test post-deploy auth in a clean browser session
- watch for stale bundle or stale HTML cache after redeploy
- avoid treating local persisted auth state as authoritative before remote validation
