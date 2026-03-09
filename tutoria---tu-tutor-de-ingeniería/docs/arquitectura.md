# Documentación Técnica: TutorIA

## 1. Introducción
TutorIA es una plataforma de tutoría personalizada que utiliza Inteligencia Artificial (Gemini 1.5 Flash) para ayudar a estudiantes de ingeniería. La arquitectura se basa en el patrón **RAG (Retrieval-Augmented Generation)** para proporcionar respuestas precisas basadas en material de estudio oficial.

## 2. Modelado de Datos (Prisma)
- **User**: Almacena credenciales y rol.
- **UserProfile**: Datos dinámicos de aprendizaje (nivel de abstracción, temas dominados).
- **Subject & Category**: Estructura jerárquica de los cursos (ej. Cálculo 1 -> Primer Parcial).
- **KnowledgeBase**: Fragmentos de texto extraídos de documentos que sirven de contexto para la IA.
- **ChatMessage**: Historial de conversaciones para mantener el hilo y analizar el progreso.

## 3. Flujo de Autenticación
1. El usuario se registra/loguea.
2. El servidor valida y genera un **JWT**.
3. El cliente almacena el token y lo envía en el header `Authorization: Bearer <token>` en cada petición protegida.

## 4. Integración de IA (Gemini)
El chat no es una simple llamada a la API. Sigue estos pasos:
1. **Recuperación**: Se buscan fragmentos en `KnowledgeBase` filtrados por la categoría seleccionada.
2. **Aumentación**: Se inyecta el perfil del usuario y el contexto recuperado en un System Prompt.
3. **Generación**: Gemini genera la respuesta siguiendo instrucciones pedagógicas.
4. **Retroalimentación**: El sistema analiza la respuesta para actualizar el `UserProfile` (ej. si el usuario resuelve bien, sube su nivel).

## 5. Procesamiento de Archivos
- Se utiliza `pdf-parse` para extraer texto de archivos PDF subidos por el administrador.
- El texto se divide en "chunks" de ~1000 caracteres para facilitar la recuperación de contexto relevante sin exceder los límites de tokens.

## 6. Suscripciones y Pagos
- Implementado con **Stripe**.
- Al registrarse, se crea una suscripción con estado `trial`.
- Un webhook (pendiente de implementación final para producción) actualizaría el estado a `active` tras el pago.

## 7. Futuras Mejoras
- **Búsqueda Vectorial Real**: Implementar `pgvector` en lugar de la recuperación simple por ID.
- **Detección de Temas**: Usar NLP para identificar automáticamente qué temas está tratando el usuario.
- **Generación de PDFs**: Permitir al tutor generar resúmenes descargables.
