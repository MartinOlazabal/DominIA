# TutorIA - Plataforma de Tutoría Personalizada con IA

Este proyecto es una plataforma de educación avanzada diseñada para ayudar a estudiantes de ingeniería a preparar sus exámenes mediante un tutor virtual inteligente.

## Arquitectura del Sistema

La aplicación utiliza un stack moderno **Full-Stack**:

- **Frontend**: React 19 con Vite y Tailwind CSS.
- **Backend**: Express.js integrado como middleware en el entorno de desarrollo.
- **Base de Datos**: SQLite (vía Prisma ORM) para persistencia de datos y perfiles de usuario.
- **IA**: Google Gemini API para la generación de respuestas y razonamiento pedagógico.
- **Procesamiento de Documentos**: Extracción de texto de PDFs y búsqueda semántica (RAG) simulada para el contexto del tutor.
- **Pagos**: Integración con Stripe (Modo Test).

## Componentes Clave

### 1. Autenticación y Sesiones
Se utiliza un sistema basado en **JWT (JSON Web Tokens)**. Al iniciar sesión, el servidor genera un token que se almacena en una cookie segura (HttpOnly). Las rutas protegidas verifican este token en cada solicitud.

### 2. El Tutor IA (RAG - Retrieval Augmented Generation)
El corazón del sistema es el chat. Cuando un usuario pregunta algo:
1. El sistema identifica la **materia** y la **categoría** (ej. Cálculo 1 - Primer Parcial).
2. Se recuperan los fragmentos de texto más relevantes de la base de conocimiento asociada.
3. Se construye un "System Prompt" que incluye:
   - El rol del tutor (especialista en la materia).
   - El perfil del estudiante (nivel de abstracción, temas débiles).
   - El contexto recuperado de los documentos.
4. Gemini genera una respuesta pedagógica, ejercicios o correcciones.

### 3. Perfil Dinámico de Aprendizaje
El sistema analiza las interacciones para actualizar el perfil del usuario:
- **Nivel de Abstracción**: Se ajusta según la complejidad de las dudas.
- **Temas Dominados**: Se marcan cuando el usuario resuelve ejercicios correctamente.
- **Estilo Preferido**: Se infiere si el usuario pide más detalles o resúmenes.

### 4. Panel de Administración
Permite a los docentes cargar material de estudio. Los archivos subidos se procesan para alimentar la base de conocimiento de la IA.

## Configuración de Desarrollo

1. Instalar dependencias: `npm install`
2. Configurar variables de entorno en `.env`:
   - `GEMINI_API_KEY`: Tu clave de Google AI Studio.
   - `STRIPE_SECRET_KEY`: Clave secreta de Stripe Test.
   - `JWT_SECRET`: Una cadena aleatoria para firmar tokens.
3. Ejecutar migraciones de base de datos: `npx prisma db push`
4. Iniciar el servidor: `npm run dev`

## Estructura de Archivos

- `/src/components`: Componentes UI reutilizables.
- `/src/pages`: Vistas principales (Landing, Dashboard, Chat, Admin).
- `/server.ts`: Servidor Express y lógica de API.
- `/prisma/schema.prisma`: Definición del modelo de datos.
- `/docs`: Documentación detallada del proyecto.
