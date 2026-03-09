console.log("Cargando server.ts...");
import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import fs from "fs";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import multer from "multer";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const pdf = require("pdf-parse");
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();
console.log("DATABASE_URL cargado:", process.env.DATABASE_URL);

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});
const app = express();
const PORT = 3000;
const JWT_SECRET = process.env.JWT_SECRET || "super-secret-key-tutor-ia";

// Configuración de Multer para subida de archivos
const upload = multer({ storage: multer.memoryStorage() });

app.use(express.json());

// --- MIDDLEWARE DE AUTENTICACIÓN ---
const authenticateToken = (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ error: "No autorizado" });

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) return res.status(403).json({ error: "Token inválido" });
    req.user = user;
    next();
  });
};

// --- API ROUTES ---

app.use((req, res, next) => {
  console.log(`Petición recibida: ${req.method} ${req.url}`);
  next();
});

// Registro de Usuario
app.post("/api/auth/register", async (req, res) => {
  console.log("Petición recibida en /api/auth/register");
  console.log("Cuerpo de la petición:", req.body);
  try {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      console.log("Error: Datos incompletos");
      return res.status(400).json({ error: "Datos incompletos" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    console.log("Contraseña hasheada");

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        profile: { create: {} }, // Crear perfil vacío
        subscription: {
          create: {
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 días de prueba
          }
        }
      }
    });
    console.log("Usuario creado en BD:", user.id);

    res.json({ message: "Usuario creado con éxito" });
  } catch (error: any) {
    console.error("Error en registro:", error);
    res.status(400).json({ error: error.message || "Error desconocido al registrar usuario" });
  }
});

// Login de Usuario
app.post("/api/auth/login", async (req, res) => {
  console.log("Petición recibida en /api/auth/login");
  console.log("Body recibido:", { email: req.body?.email, passwordProvided: !!req.body?.password });
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      console.log("Error: email o password faltante");
      return res.status(400).json({ error: "Email y contraseña son requeridos" });
    }

    console.log("Buscando usuario con email:", email);
    const user = await prisma.user.findUnique({ where: { email } });
    console.log("Resultado de findUnique:", user ? `Usuario encontrado (id: ${user.id})` : "Usuario NO encontrado");

    if (!user) {
      return res.status(401).json({ error: "Credenciales incorrectas" });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    console.log("¿Contraseña correcta?", passwordMatch);

    if (passwordMatch) {
      const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET);
      console.log("Login exitoso para:", email);
      res.json({ token, user: { id: user.id, email: user.email, name: user.name, role: user.role } });
    } else {
      res.status(401).json({ error: "Credenciales incorrectas" });
    }
  } catch (error: any) {
    console.error("Error en login:", error);
    res.status(500).json({ error: "Error interno del servidor", detail: error.message });
  }
});

// Obtener Perfil y Estadísticas
app.get("/api/user/dashboard", authenticateToken, async (req: any, res) => {
  const data = await prisma.user.findUnique({
    where: { id: req.user.id },
    include: { profile: true, subscription: true }
  });
  res.json(data);
});

// --- GESTIÓN DE MATERIAS (ADMIN) ---
app.get("/api/subjects", async (req, res) => {
  // Devuelve todas las materias con sus categorías ordenadas por 'order'
  const subjects = await prisma.subject.findMany({
    include: {
      categories: {
        orderBy: { order: 'asc' } // Ordenar instancias por su campo 'order'
      }
    },
    orderBy: { name: 'asc' }
  });
  res.json(subjects);
});

// Obtener categorías/instancias de una materia específica
app.get("/api/instances", async (req, res) => {
  const { subjectId } = req.query;
  if (!subjectId) return res.status(400).json({ error: "subjectId requerido" });
  const categories = await prisma.category.findMany({
    where: { subjectId: String(subjectId) },
    orderBy: { order: 'asc' }
  });
  res.json(categories);
});

app.post("/api/admin/subjects", authenticateToken, async (req: any, res) => {
  if (req.user.role !== "ADMIN") return res.status(403).json({ error: "Solo admin" });
  const { name, description, icon, code, faculty } = req.body;
  const subject = await prisma.subject.create({ data: { name, description, icon, code, faculty } });
  res.json(subject);
});

app.post("/api/admin/categories", authenticateToken, async (req: any, res) => {
  if (req.user.role !== "ADMIN") return res.status(403).json({ error: "Solo admin" });
  const { name, subjectId, type, order } = req.body;
  const category = await prisma.category.create({
    data: { name, subjectId, type: type || "practico", order: order || 0 }
  });
  res.json(category);
});

// --- PROCESAMIENTO DE CONOCIMIENTO (ADMIN) ---
app.post("/api/admin/upload-knowledge", authenticateToken, upload.single('file'), async (req: any, res) => {
  if (req.user.role !== "ADMIN") return res.status(403).json({ error: "Solo admin" });

  const { categoryId } = req.body;
  const file = req.file;

  if (!file) return res.status(400).json({ error: "No hay archivo" });

  let text = "";
  if (file.mimetype === "application/pdf") {
    const data = await pdf(file.buffer);
    text = data.text;
  } else {
    text = file.buffer.toString('utf-8');
  }

  // Dividir en chunks de ~1000 caracteres para no sobrecargar el prompt
  const chunks = text.match(/[\s\S]{1,1000}/g) || [];

  for (const chunk of chunks) {
    await prisma.knowledgeBase.create({
      data: {
        categoryId,
        content: chunk,
        source: file.originalname
      }
    });
  }

  res.json({ message: "Conocimiento cargado", chunks: chunks.length });
});

// --- PROGRESO DEL USUARIO ---

// GET /api/progress?categoryId=...
// Retorna el progreso del usuario autenticado en una categoría/instancia específica
app.get("/api/progress", authenticateToken, async (req: any, res) => {
  const { categoryId } = req.query;
  if (!categoryId) return res.status(400).json({ error: "categoryId requerido" });

  try {
    // Buscar el registro de progreso; si no existe aún, devolvemos un objeto vacío con defaults
    const progress = await prisma.userProgress.findUnique({
      where: {
        userId_categoryId: {
          userId: req.user.id,
          categoryId: String(categoryId)
        }
      }
    });

    // Si no existe progreso, devolver valores por defecto (primera vez)
    if (!progress) {
      return res.json({
        level: 1,
        topicsMastered: [],
        topicsStruggling: [],
        interactionsCount: 0,
        lastInteractionAt: null,
        isFirstTime: true
      });
    }

    // Parsear los JSON arrays antes de enviar
    res.json({
      ...progress,
      topicsMastered: JSON.parse(progress.topicsMastered),
      topicsStruggling: JSON.parse(progress.topicsStruggling),
      isFirstTime: progress.interactionsCount === 0
    });
  } catch (error: any) {
    console.error('[/api/progress] Error:', error.message);
    res.status(500).json({ error: "Error al obtener progreso" });
  }
});

// POST /api/progress
// Actualiza manualmente el progreso (ej: desde el panel de admin o test)
app.post("/api/progress", authenticateToken, async (req: any, res) => {
  const { categoryId, level, topicsMastered, topicsStruggling } = req.body;
  if (!categoryId) return res.status(400).json({ error: "categoryId requerido" });

  try {
    const progress = await prisma.userProgress.upsert({
      where: {
        userId_categoryId: { userId: req.user.id, categoryId }
      },
      update: {
        // Solo actualizamos los campos que se envíen
        ...(level !== undefined && { level }),
        ...(topicsMastered && { topicsMastered: JSON.stringify(topicsMastered) }),
        ...(topicsStruggling && { topicsStruggling: JSON.stringify(topicsStruggling) }),
        updatedAt: new Date()
      },
      create: {
        userId: req.user.id,
        categoryId,
        level: level || 1,
        topicsMastered: JSON.stringify(topicsMastered || []),
        topicsStruggling: JSON.stringify(topicsStruggling || [])
      }
    });
    res.json(progress);
  } catch (error: any) {
    console.error('[/api/progress POST] Error:', error.message);
    res.status(500).json({ error: "Error al guardar progreso" });
  }
});

// --- MENSAJE DE BIENVENIDA ---

// GET /api/chat/welcome?categoryId=...
// Genera un mensaje de bienvenida personalizado cuando el usuario entra a una instancia.
// Si es la primera vez: bienvenida motivadora con temas del programa.
// Si ya interactuó antes: saludo de continuidad.
app.get("/api/chat/welcome", authenticateToken, async (req: any, res) => {
  const { categoryId } = req.query;
  if (!categoryId) return res.status(400).json({ error: "categoryId requerido" });

  try {
    // Obtener la categoría con su materia asociada
    const category = await prisma.category.findUnique({
      where: { id: String(categoryId) },
      include: { subject: true }
    });

    if (!category) return res.status(404).json({ error: "Categoría no encontrada" });

    // Obtener el usuario con su nombre
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    const userName = user?.name?.split(' ')[0] || 'estudiante'; // Solo el primer nombre

    // Obtener o crear el registro de progreso
    let progress = await prisma.userProgress.findUnique({
      where: { userId_categoryId: { userId: req.user.id, categoryId: String(categoryId) } }
    });

    const isFirstTime = !progress || progress.interactionsCount === 0;

    // Obtener fragmentos de conocimiento para enriquecer el mensaje de bienvenida
    const knowledge = await prisma.knowledgeBase.findMany({
      where: { categoryId: String(categoryId) },
      take: 3 // Solo los primeros 3 fragmentos para la bienvenida
    });
    const contextSnippet = knowledge.map(k => k.content.slice(0, 300)).join("\n");

    let welcomeText = "";

    if (!process.env.GEMINI_API_KEY) {
      // Fallback sin IA: mensaje estático personalizado
      if (isFirstTime) {
        welcomeText = `¡Hola ${userName}! 👋 Bienvenido a **${category.subject.name} - ${category.name}**.\n\nSoy tu tutor virtual y estoy aquí para ayudarte a dominar esta instancia. ¿Por dónde te gustaría empezar? Puedes preguntarme sobre algún tema específico o pedirme que generemos ejercicios juntos.`;
      } else {
        const count = progress!.interactionsCount;
        welcomeText = `¡Qué bueno verte de nuevo, ${userName}! 💪 Ya tienes **${count} interacción${count !== 1 ? 'es' : ''}** en **${category.subject.name} - ${category.name}**.\n\nVamos a seguir preparando juntos. ¿Continuamos desde donde lo dejamos?`;
      }
      return res.json({ text: welcomeText, isFirstTime });
    }

    // Generar bienvenida con Gemini
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

    const topicsMastered = progress ? JSON.parse(progress.topicsMastered) : [];
    const topicsStruggling = progress ? JSON.parse(progress.topicsStruggling) : [];

    // Construir el prompt para el mensaje de bienvenida
    const welcomePrompt = isFirstTime
      ? `Genera un mensaje de bienvenida breve, motivador y cálido (máximo 4 oraciones) para un estudiante llamado "${userName}" que acaba de entrar por primera vez a la preparación de "${category.name}" en "${category.subject.name}" de la Facultad de Ingeniería (FING). 
         Menciona que vas a ser su tutor, nombra 2-3 temas clave de esta instancia (basándote en: ${contextSnippet || 'contenido general de la materia'}) y pregunta por dónde quiere empezar. 
         Usa un tono amigable y universitario. Puedes usar algún emoji. No uses formato markdown complejo.`
      : `Genera un saludo de continuidad breve y motivador (máximo 3 oraciones) para "${userName}" que regresa a preparar "${category.name}" de "${category.subject.name}". 
         Ya tiene ${progress!.interactionsCount} interacciones previas, nivel ${progress!.level}/5.
         ${topicsMastered.length > 0 ? `Temas que domina: ${topicsMastered.join(', ')}.` : ''}
         ${topicsStruggling.length > 0 ? `Temas con dificultad: ${topicsStruggling.join(', ')}.` : ''}
         Motívalo a continuar y quizás menciona seguir con algún tema pendiente. Usa un tono amigable. Puedes usar algún emoji.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-lite-preview",
      contents: welcomePrompt
    });

    welcomeText = response.text || `¡Hola ${userName}! Estoy listo para ayudarte con ${category.subject.name} - ${category.name}.`;

    res.json({ text: welcomeText, isFirstTime });
  } catch (error: any) {
    console.error('[/api/chat/welcome] Error:', error.message);
    // En caso de error, devolver un mensaje genérico en lugar de fallar
    res.json({
      text: `¡Hola! Estoy listo para ayudarte. ¿Qué te gustaría estudiar hoy?`,
      isFirstTime: true
    });
  }
});

// --- CHAT CON TUTOR IA ---
app.post("/api/chat", authenticateToken, async (req: any, res) => {
  const { message, subjectId, categoryId } = req.body;
  console.log('[/api/chat] Petición recibida:', { userId: req.user?.id, subjectId, categoryId, message: message?.slice(0, 60) });

  if (!message?.trim()) return res.status(400).json({ error: "Mensaje vacío" });

  try {
    // ── 1. Obtener la categoría y materia ──────────────────────────────────────
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
      include: { subject: true }
    });

    const subjectName = category?.subject?.name || "la materia";
    const categoryName = category?.name || "esta instancia";
    const categoryType = category?.type || "practico";

    // ── 2. Obtener o crear el progreso del usuario en esta instancia ───────────
    // upsert: crea el registro si no existe, lo deja como está si ya existe
    let progress = await prisma.userProgress.upsert({
      where: { userId_categoryId: { userId: req.user.id, categoryId } },
      update: {}, // No modificar nada todavía (lo actualizamos al final)
      create: {
        userId: req.user.id,
        categoryId,
        level: 1,
        topicsMastered: "[]",
        topicsStruggling: "[]",
        interactionsCount: 0
      }
    });

    // ── 3. Recuperar base de conocimiento de la instancia (RAG básico) ─────────
    // Tomamos los 5 fragmentos más relevantes. En el futuro se puede usar
    // búsqueda semántica con pgvector en lugar de simplemente take: 5
    const knowledge = await prisma.knowledgeBase.findMany({
      where: { categoryId },
      take: 5
    });
    const knowledgeContext = knowledge.map(k => k.content).join("\n\n") || "(Sin base de conocimiento cargada aún)";

    // ── 4. Obtener perfil de aprendizaje del usuario ───────────────────────────
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: { profile: true }
    });
    const profile = user?.profile;

    // Parsear JSON arrays del progreso para incluir en el prompt
    const topicsMastered: string[] = JSON.parse(progress.topicsMastered);
    const topicsStruggling: string[] = JSON.parse(progress.topicsStruggling);

    // ── 5. Describir el tipo de instancia en lenguaje natural ─────────────────
    // Esto ayuda a la IA a entender el foco de la sesión
    const instanceFocusMap: Record<string, string> = {
      practico: "preparación de prácticos semanales y ejercicios de práctica",
      primer_parcial: "preparación específica para el Primer Parcial: teoría y ejercicios del primer bloque temático",
      segundo_parcial: "preparación específica para el Segundo Parcial: teoría y ejercicios del segundo bloque temático",
      examen: "preparación integral para el Examen Final: repaso completo de todos los temas"
    };
    const instanceFocus = instanceFocusMap[categoryType] || "preparación general";

    // ── 6. Construir el system prompt personalizado ────────────────────────────
    const systemInstruction = `
Eres TutorIA, un tutor experto y empático de la Facultad de Ingeniería (FING, Universidad de la República, Uruguay).
Tu misión es preparar al estudiante "${user?.name || 'estudiante'}" para su evaluación en ${subjectName}.

═══════════════════════════════════════════════════
CONTEXTO DE LA SESIÓN
═══════════════════════════════════════════════════
• Materia: ${subjectName}
• Instancia: ${categoryName}
• Enfoque: ${instanceFocus}

═══════════════════════════════════════════════════
BASE DE CONOCIMIENTO DE ESTA INSTANCIA (RAG)
═══════════════════════════════════════════════════
Usa SOLO la siguiente información como fuente de verdad.
Si el estudiante pregunta algo fuera de este contexto, díselo amablemente.

${knowledgeContext}

═══════════════════════════════════════════════════
PERFIL DEL ESTUDIANTE
═══════════════════════════════════════════════════
• Nivel de comprensión actual: ${progress.level}/5 (1=básico, 5=avanzado)
• Nivel de abstracción (estilo de explicación): ${profile?.abstractionLevel || 1}/5
• Interacciones previas en esta instancia: ${progress.interactionsCount}
• Temas dominados: ${topicsMastered.length > 0 ? topicsMastered.join(', ') : 'ninguno registrado aún'}
• Temas con dificultad: ${topicsStruggling.length > 0 ? topicsStruggling.join(', ') : 'ninguno registrado aún'}

═══════════════════════════════════════════════════
INSTRUCCIONES DE COMPORTAMIENTO
═══════════════════════════════════════════════════
1. Adapta la complejidad de tus respuestas al nivel del estudiante:
   - Nivel 1-2: usa analogías simples, lenguaje informal, muchos ejemplos numéricos
   - Nivel 3: balance entre intuición y rigor matemático
   - Nivel 4-5: mayor formalismo, demostraciones, casos borde
2. Si el estudiante da una respuesta incorrecta, corrígelo con paciencia y sin juzgarlo.
3. Genera ejercicios cuando el estudiante lo pida, adecuados a su nivel y la instancia.
4. Al final de cada respuesta extensa, ofrece un ejercicio corto o una pregunta de verificación.
5. Halagos breves cuando el estudiante responde bien (no exagerado).
6. Si detectas que domina un tema, puedes mencionarlo (ej: "Veo que tienes claro el concepto de límite").
7. NUNCA inventes contenido que no esté en la base de conocimiento.
8. Responde siempre en español rioplatense y con un tono motivador.
`;

    // ── 7. Llamar a la IA (o simular si no hay API key) ───────────────────────
    let responseText = "";

    if (!process.env.GEMINI_API_KEY) {
      // Modo simulación: útil para desarrollo sin API key
      responseText = `[SIMULACIÓN] Recibí tu pregunta sobre "${message}".\n\nContexto disponible de la instancia: ${knowledgeContext.slice(0, 200)}...\n\nConfigura GEMINI_API_KEY en .env para obtener respuestas reales.`;
    } else {
      console.log('[/api/chat] Llamando a Gemini...');
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
      const response = await ai.models.generateContent({
        model: "gemini-3.1-flash-lite-preview",
        contents: message,
        config: {
          systemInstruction: systemInstruction,
        },
      });
      responseText = response.text || "Lo siento, no pude generar una respuesta. Intenta reformular tu pregunta.";
      console.log('[/api/chat] Respuesta de Gemini recibida, longitud:', responseText.length);
    }

    // ── 8. Guardar el intercambio en el historial de chat ─────────────────────
    await prisma.chatMessage.createMany({
      data: [
        { userId: req.user.id, role: "user", content: message, subjectId, categoryId },
        { userId: req.user.id, role: "assistant", content: responseText, subjectId, categoryId }
      ]
    });

    // ── 9. Actualizar el progreso del usuario ─────────────────────────────────
    // Heurística de nivel: si el mensaje es largo (>80 chars), el estudiante
    // probablemente está reflexionando más → potencialmente sube de nivel
    const shouldIncreaseLevel =
      message.length > 80 &&
      progress.level < 5 &&
      progress.interactionsCount > 0 &&
      progress.interactionsCount % 10 === 0; // cada 10 interacciones, reevaluar

    await prisma.userProgress.update({
      where: { userId_categoryId: { userId: req.user.id, categoryId } },
      data: {
        interactionsCount: { increment: 1 },
        lastInteractionAt: new Date(),
        // Subir nivel cada 10 interacciones si los mensajes son elaborados
        ...(shouldIncreaseLevel && { level: { increment: 1 } })
      }
    });

    // También actualizar el perfil global del usuario (estadísticas generales)
    if (profile) {
      await prisma.userProfile.update({
        where: { userId: req.user.id },
        data: { statsExercises: { increment: 1 } }
      });
    }

    res.json({ text: responseText });
  } catch (error: any) {
    console.error('[/api/chat] Error:', error?.message || error);
    res.status(500).json({ error: error?.message || "Error en la IA" });
  }
});

// --- VITE MIDDLEWARE ---
async function startServer() {
  console.log("Iniciando startServer...");
  if (process.env.NODE_ENV !== "production") {
    console.log("Configurando Vite middleware...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Vite middleware configurado.");
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
    console.log("Listo para recibir peticiones.");
  });
}

startServer().catch((err) => {
  console.error("Error al iniciar el servidor:", err);
  process.exit(1);
});
