# ⚽ The Pizarra Futnorte IA

Asistente conversacional de IA **experto en fútbol**: táctica, diseño de entrenamientos y Reglas de Juego de la IFAB.
Proyecto integrador **AI Expert Chat**, Ingeniería Web (docente Juan Pablo Arango), 2026.

- **Demo en vivo:** https://soccer-manager-futnorte.vercel.app
- **Repositorio:** https://github.com/JoseHenao16/soccer-manager

| Integrante | Rol |
|---|---|
| José Henao | Desarrollo completo (proyecto individual) |

### Cuentas de prueba

Para probar la demo sin registrarse (también puedes crear tu propia cuenta en **Registrarse**, que entra con rol USER):

| Rol | Correo | Contraseña | Qué puede hacer |
|---|---|---|---|
| **ADMIN** | `admin.demo@futnorte.com` | `AdminDemo2026*` | Chat + panel de administración (estadísticas, usuarios y configuración del asistente) |
| **USER** | `usuario.demo@futnorte.com` | `UsuarioDemo2026*` | Chat e historial propio; el panel de admin le está bloqueado (redirección en la página y 403 en la API) |

> Son cuentas exclusivas de demostración, distintas del administrador real del proyecto. Se pide no cambiar los roles de otros usuarios ni dejar el System Prompt modificado; el botón **Restaurar el prompt por defecto** (y luego **Guardar**) lo recupera.

---

## Funcionalidades

**Usuario**
- Registro, inicio y cierre de sesión (Supabase Auth, cookies httpOnly).
- Chat con respuestas **en streaming** (el texto aparece a medida que el modelo lo genera).
- **4 modos** del asistente por conversación: General, Entrenador, Árbitro y Analista.
- Historial: crear, renombrar, eliminar y retomar conversaciones (el título se genera con la primera pregunta).
- Sugerencias rápidas por modo, respuestas en Markdown (tablas, listas), estados de carga y error con reintento.
- Historial contraíble en escritorio (botón o `Ctrl/Cmd + B`) y diseño responsive.

**Administrador**
- **Estadísticas:** usuarios, conversaciones, mensajes, latencia media de la IA y preguntas por día (con vista de tabla).
- **Usuarios:** búsqueda y cambio de rol ADMIN/USER (no puede quitarse su propio rol ni degradar al último admin).
- **Asistente:** editar el System Prompt, el modelo, la temperatura, el máximo de tokens y el historial enviado al modelo.

**Seguridad**
- Permisos validados **en el backend** en capas: proxy (sesión) → guard del layout → `requireAdminPage()` en cada página → `requireAdmin()`/`assertAdmin()` en API y casos de uso.
- Un usuario solo accede a sus conversaciones (otra conversación responde 404, incluso para un admin).
- Las claves (`GROQ_API_KEY`, `SUPABASE_SECRET_KEY`, contraseñas de la BD) **solo existen en el servidor**; nunca llegan al navegador ni al repositorio.
- **RLS activado** en todas las tablas sin políticas públicas: solo el backend (Prisma) puede leer o escribir datos.
- Validación de entradas con **zod** en todas las rutas.
- Protección contra *prompt injection* en el System Prompt y recordatorio de límites antes de cada pregunta.

## Stack

| Capa | Tecnología |
|---|---|
| Frontend | Next.js 16 (App Router, React 19), TailwindCSS 4 |
| Backend | Next.js API Routes (Route Handlers) |
| Base de datos | Supabase PostgreSQL + Prisma 7 (`@prisma/adapter-pg`) |
| Autenticación | Supabase Auth (`@supabase/ssr`) |
| IA | **Groq** (plan gratuito): `openai/gpt-oss-120b`, respaldo automático `qwen/qwen3.8-27b` |
| Despliegue | Vercel |

## Arquitectura

Arquitectura limpia por capas: el dominio no depende de Next.js, Prisma ni Groq. Las dependencias apuntan hacia adentro.

```
src/
├── core/                      ← reglas del negocio (sin frameworks)
│   ├── domain/
│   │   ├── entities/          User, Conversation, Message, AssistantConfig
│   │   ├── ports/             interfaces: AIProvider, repositorios, AuthGateway
│   │   ├── errors.ts          errores de dominio → código HTTP
│   │   └── assistant.ts       System Prompt por defecto, modos y guardarraíles
│   └── application/use-cases/ auth, conversations, send-message, admin
├── infrastructure/            ← adaptadores (implementan los puertos)
│   ├── db/                    PrismaClient + repositorios
│   ├── auth/                  Supabase Auth (servidor y proxy)
│   └── ai/                    GroqProvider (streaming + respaldo) y MockProvider
├── lib/                       container (composition root), sesión, http, validación zod
├── app/                       páginas y API Routes (delgadas: validan y llaman al caso de uso)
├── components/                UI: chat, admin, landing, auth
└── proxy.ts                   redirecciones optimistas por sesión
```

Flujo de una pregunta:

```
UI (chat-app) ──POST /api/conversations/:id/messages {stream:true}──▶ Route Handler
   ▲                                                                     │ valida sesión + zod
   │  NDJSON: delta… → done | error                                      ▼
   └──────────────────────────────────────────────  streamMessage (caso de uso)
                                                    ├─ verifica que la conversación sea del usuario
                                                    ├─ arma el prompt: System Prompt + modo + historial + recordatorio
                                                    ├─ AIProvider.stream()  →  Groq
                                                    └─ guarda pregunta y respuesta solo si terminó bien
```

Cambiar de proveedor de IA solo requiere una nueva clase que implemente `AIProvider` y registrarla en `src/infrastructure/ai/index.ts`.

## Modelo de datos

```
profiles ─────────────┐ 1
  id (uuid = auth.users.id)
  email, name, role (ADMIN | USER), createdAt
                      │ N
conversations ────────┘──────┐ 1
  id, userId, title, mode (GENERAL | ENTRENADOR | ARBITRO | ANALISTA), createdAt, updatedAt
                             │ N
messages ────────────────────┘
  id, conversationId, role (user | assistant), content, model, tokens, latencyMs, createdAt

assistant_config (fila única id = 1)
  systemPrompt, model, temperature, maxTokens, historyLimit, updatedAt, updatedBy
```

Borrado en cascada: eliminar una conversación elimina sus mensajes. Esquema en [`prisma/schema.prisma`](prisma/schema.prisma) y migraciones en [`prisma/migrations`](prisma/migrations).

## Proveedor de IA y System Prompt

- **Proveedor:** Groq, modelo `openai/gpt-oss-120b` con razonamiento `medium` (el razonamiento no se muestra al usuario).
- **Respaldo automático:** si el modelo principal agota su cupo por minuto (plan gratuito: 8.000 tokens/min), responde `qwen/qwen3.8-27b`; si también falla, se reintenta el principal respetando el `retry-after`. El modelo que respondió queda guardado en cada mensaje.
- **Errores amigables:** límite de uso (429), tiempo agotado (504), configuración (500) y proveedor caído (502), siempre con opción de reintentar y sin guardar mensajes incompletos.
- **System Prompt** (editable desde el panel de admin; el valor por defecto está en [`src/core/domain/assistant.ts`](src/core/domain/assistant.ts)):
  - **Identidad:** asistente experto en fútbol.
  - **Dominio:** táctica, entrenamiento, Reglas de Juego, preparación física aplicada e historia del fútbol.
  - **Hechos clave verificados:** mano, sanciones, fuera de juego y balón a tierra.
  - **Comportamiento:** cita las reglas por número y nombre oficial (las 17 Reglas de la IFAB), sin inventar citas textuales.
  - **Límites:**
    - rechaza temas ajenos al fútbol;
    - remite a profesionales en lesiones y salud;
    - no ayuda con apuestas;
    - avisa que no tiene datos en tiempo real;
    - reconoce la incertidumbre.
  - **Seguridad:** no revela ni cambia sus instrucciones.
  - **Formato:** Markdown, unas 300 palabras y un "Consejo de pizarra" final.
- **Prompt final enviado al modelo:**
  1. System Prompt;
  2. instrucción del modo;
  3. últimos mensajes de la conversación (configurable, 8 por defecto);
  4. recordatorio de límites;
  5. pregunta del usuario.

### Evaluación

Se evaluó con 13 preguntas de prueba, comparando el resultado esperado con el obtenido. Las preguntas cubren:
- fútbol en los 4 modos;
- preguntas fuera de dominio;
- salud y apuestas;
- datos en tiempo real;
- intentos de *prompt injection*.

**Resultado:** 13/13 con el comportamiento esperado. La primera palabra llega en unos 1,7 s (mediana).

## Instalación y ejecución local

Requisitos: Node.js 20+, una cuenta gratuita de [Supabase](https://supabase.com) y una API key gratuita de [Groq](https://console.groq.com).

```bash
git clone https://github.com/JoseHenao16/soccer-manager.git
cd soccer-manager
npm install                 # también genera el cliente de Prisma
cp .env.example .env        # y completa los valores (ver abajo)
npm run db:deploy           # crea las tablas en Supabase
npm run db:seed             # crea el administrador y la configuración inicial
npm run dev                 # http://localhost:3000
```

En Supabase, desactiva **Authentication → Sign In / Providers → Email → Confirm email** para poder entrar sin confirmar el correo.

### Variables de entorno

| Variable | Dónde se obtiene | ¿Pública? |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Project Settings → API | Sí |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Supabase → API Keys (publishable) | Sí, por diseño |
| `SUPABASE_SECRET_KEY` | Supabase → API Keys (secret) | **No, solo servidor** |
| `DATABASE_URL` | Supabase → Connect → Transaction pooler (puerto 6543, `?pgbouncer=true`) | **No** |
| `DIRECT_URL` | Supabase → Connect → Session pooler (puerto 5432), para migraciones | **No** |
| `AI_PROVIDER` | `groq` (IA real) o `mock` (respuestas simuladas, sin API key) | — |
| `GROQ_API_KEY` | console.groq.com → API Keys | **No, solo servidor** |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | Los defines tú; solo los usa `npm run db:seed` | **No** |

### Scripts

| Script | Uso |
|---|---|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` / `npm start` | Build y servidor de producción |
| `npm run typecheck` / `npm run lint` | Verificación de tipos y linter |
| `npm run db:migrate` | Crear una migración nueva (desarrollo) |
| `npm run db:deploy` | Aplicar migraciones (producción) |
| `npm run db:seed` | Crear el admin y la configuración del asistente |
| `npm run db:studio` | Explorar la base de datos |

## Despliegue en Vercel

1. Importa el repositorio en [vercel.com/new](https://vercel.com/new); Next.js se detecta solo.
2. En **Environment Variables**, agrega las variables de la tabla anterior, excepto `ADMIN_EMAIL` y `ADMIN_PASSWORD`, que solo usa el seed.
3. Pulsa **Deploy**. Las migraciones se aplican desde local con `npm run db:deploy`; la base de datos es la misma.

Las funciones se ejecutan en `pdx1` (Oregón), junto a la base de datos de Supabase en `us-west-2` (ver [`vercel.json`](vercel.json)).
