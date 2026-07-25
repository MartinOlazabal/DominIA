# TutorIA — Tu Tutor de Ingeniería con IA

Tutor personalizado con IA para estudiantes de la Facultad de Ingeniería (FING, Udelar). Preparación por **materia** e **instancia** (Parcial, Examen, Prácticos) con base de conocimiento RAG y seguimiento de progreso individual.

View your app in AI Studio: https://ai.studio/apps/b2295662-c654-4cb2-80f4-d3cd2b579b11

---

## 🚀 Inicio Rápido

**Prerequisitos:** Node.js 18+, cuenta Neon (PostgreSQL)

```bash
# 1. Instalar dependencias
npm install

# 2. Configurar variables de entorno en .env
DATABASE_URL="postgresql://..."
GEMINI_API_KEY="..."
JWT_SECRET="tu-secreto-jwt"

# 3. Aplicar esquema de base de datos
npx prisma db push

# 4. Poblar datos iniciales (materias + base de conocimiento)
npx ts-node --esm prisma/seed.ts

# 5. Iniciar el servidor de desarrollo (Express + Vite HMR)
npx tsx server.ts
```

Credenciales de prueba después del seed:
- **Admin:** `admin@tutoria.uy` / `admin123`
- **Usuario:** `test@test.com` / `test123`

---

## 🏗️ Arquitectura

```
Frontend (React + Vite + TypeScript)
  └── src/App.tsx          — Toda la UI (Landing, Auth, Dashboard, Chat, Admin)
  └── src/services/api.ts  — Capa de servicios HTTP

Backend (Node.js + Express + TypeScript)
  └── server.ts            — Todos los endpoints API + Vite middleware

Base de Datos (PostgreSQL en Neon via Prisma)
  └── prisma/schema.prisma — Esquema de datos
  └── prisma/seed.ts       — Datos iniciales con base de conocimiento

IA (Google Gemini API)
  └── Modelo: gemini-3.1-flash-lite-preview
```

---

## 📐 Modelo de Datos

```
User                       — Usuarios registrados
UserProfile                — Perfil global (nivel abstracción, estadísticas)
Subscription               — Plan de acceso (trial / active)

Subject                    — Materias (ej: "Cálculo 1", code: "calculo1", faculty: "FING")
  └── Category             — Instancias de la materia (type: practico | primer_parcial | segundo_parcial | examen)
        └── KnowledgeBase  — Fragmentos de texto usados como contexto RAG
        └── UserProgress   — Progreso individual por usuario×instancia (level, interactions, topics)

ChatMessage                — Historial de conversaciones (role: user | assistant)
```

---

## 🔌 API Endpoints

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| POST | `/api/auth/register` | — | Registro de usuario |
| POST | `/api/auth/login` | — | Login → JWT |
| GET | `/api/user/dashboard` | ✅ | Perfil + suscripción |
| GET | `/api/subjects` | — | Materias con instancias ordenadas |
| GET | `/api/instances?subjectId=` | — | Instancias de una materia |
| GET | `/api/chat/welcome?categoryId=` | ✅ | **Mensaje de bienvenida personalizado** (IA detecta si es primera vez) |
| POST | `/api/chat` | ✅ | **Chat con tutor IA** (RAG + perfil + progreso) |
| GET | `/api/progress?categoryId=` | ✅ | Progreso del usuario en una instancia |
| POST | `/api/progress` | ✅ | Actualizar progreso |
| POST | `/api/admin/subjects` | ✅ ADMIN | Crear materia |
| POST | `/api/admin/categories` | ✅ ADMIN | Crear instancia (con `type` y `order`) |
| POST | `/api/admin/upload-knowledge` | ✅ ADMIN | Cargar PDF/TXT a la base de conocimiento |

---

## 🧠 Cómo Funciona el RAG (Retrieval Augmented Generation)

1. Al crear instancias (categorías), se carga contenido de texto a la tabla `KnowledgeBase`.
2. Cuando el usuario envía un mensaje al chat, el backend recupera los 5 fragmentos más relevantes de esa instancia.
3. El `systemInstruction` enviado a Gemini incluye:
   - El contexto de la base de conocimiento
   - El nombre de la materia e instancia
   - El perfil del usuario (nivel 1-5, temas dominados, temas con dificultad)
   - El historial de interacciones en esa instancia

**Extensión futura:** usar `pgvector` (disponible en Neon) con embeddings de Gemini para búsqueda semántica real.

---

## 🎯 Flujo de Uso del Chat

```
Dashboard → Seleccionar materia → Seleccionar instancia
  → GET /api/chat/welcome (primera vez: bienvenida motivadora; regreso: saludo continuo)
  → [Usuario envía mensaje]
  → POST /api/chat { message, subjectId, categoryId }
       → Recupera base de conocimiento (RAG)
       → Construye prompt personalizado
       → Llama a Gemini API
       → Guarda en ChatMessage
       → Actualiza UserProgress (interactionsCount, level)
  → Respuesta mostrada en chat
```

---

## ➕ Agregar una Nueva Materia

**Opción A (Panel de Admin en la app):**
1. Ir a Administración → Nueva Materia
2. Crear las instancias con el tipo correspondiente
3. Subir archivos PDF/TXT de estudio para cada instancia

**Opción B (Seed en código):**
1. Agregar la materia al array en `prisma/seed.ts`
2. Agregar los chunks de conocimiento en el objeto `knowledgeBase`
3. Volver a correr `npx ts-node --esm prisma/seed.ts`

---

## 🔧 Variables de Entorno

```env
DATABASE_URL=          # URL de conexión a PostgreSQL (Neon)
GEMINI_API_KEY=        # Clave de la API de Google Gemini
JWT_SECRET=            # Secreto para firmar tokens JWT
NODE_ENV=development   # o "production"
```
