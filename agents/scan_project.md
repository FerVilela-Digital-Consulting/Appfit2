RUTA UNICA DE DOCUMENTACION (OBLIGATORIA)

- Usar solo la carpeta: docs/
- No usar ni crear: agents/docs/
- Toda lectura de contexto debe salir de docs/.
- Si falta un archivo en docs/, reportarlo; no crear otra carpeta de documentacion.
ActÃºa como un Staff Engineer especializado en anÃ¡lisis de repositorios y arquitectura de software.

Tu tarea es analizar completamente este repositorio y preparar la documentaciÃ³n tÃ©cnica base para desarrollo asistido por IA.

---

OBJETIVO

Escanear el repositorio completo y generar la documentaciÃ³n tÃ©cnica inicial dentro de la carpeta docs/.

Los documentos que debes generar son:

docs/ENGINEERING_RUNBOOK.md  
docs/ARCHITECTURE.md  
docs/DEPLOYMENT.md  
docs/COMMANDS.md  
docs/KNOWN_BUGS.md  
docs/SERVER_OPERATIONS.md  

---

ARCHIVOS QUE DEBES ANALIZAR

Revisar si existen:

package.json  
tsconfig.json  
vite.config.*  
next.config.*  

docker-compose.yml  
Dockerfile  

.env / .env.example  

configuraciones nginx  

configuraciones Dokploy  

WordPress  
wp-config.php  
plugins personalizados  
themes personalizados  

workflows n8n  

scripts bash  

carpetas del proyecto:

src  
services  
api  
components  
scripts  
workers  
jobs  
plugins  
themes  

---

INFRAESTRUCTURA BASE

Asume que el servidor base incluye:

Ubuntu Server  
Nginx  
VPS en Linode  
acceso SSH  

El sistema tambiÃ©n puede utilizar una plataforma de despliegue como:

Dokploy

En ese caso debes identificar:

- contenedores Docker utilizados
- puertos expuestos
- variables de entorno necesarias
- servicios desplegados
- configuraciÃ³n de proxy (Traefik o Nginx)

Si detectas:

Docker  
Dokploy  
Node.js  
React  
WordPress  
n8n  
PostgreSQL  
MySQL  
Redis  

debes documentarlo.

---

INFORMACIÃ“N QUE DEBES EXTRAER

1. Stack tecnolÃ³gico detectado
2. Arquitectura del sistema
3. Dependencias crÃ­ticas
4. Flujo de datos
5. Integraciones externas
6. Comandos operativos
7. Estrategia de despliegue
8. Riesgos tÃ©cnicos
9. posibles bugs comunes
10. exposiciÃ³n de secretos (si hay `.env` versionado o credenciales hardcodeadas)

---

FORMATO DE DOCUMENTOS

Cada documento debe estar estructurado y ser fÃ¡cil de entender tanto para ingenieros humanos como para agentes de IA.

Aplicar buenas prÃ¡cticas utilizadas por equipos de ingenierÃ­a de grandes empresas.

Reglas de seguridad obligatorias:
- Al analizar `.env`, documentar solo nombres de variables y riesgos; nunca copiar valores reales.
- Si detectas credenciales expuestas en el repositorio, registrarlo como bug crÃ­tico con plan de rotaciÃ³n.
- Usar placeholders en ejemplos (`<RESEND_API_KEY>`, `<CRON_SECRET>`, `<SUPABASE_SERVICE_ROLE>`).

---

OBJETIVO FINAL

El repositorio debe quedar preparado para trabajar con agentes especializados:

Architecture Agent  
Backend Agent  
Frontend Agent  
QA Agent  
Refactor Agent  
Debugging Agent  
Cybersecurity Agent  
Server / DevOps Agent  

El runbook debe servir como memoria tÃ©cnica del sistema.

Si hay incertidumbre en algÃºn punto debes indicarlo claramente.

