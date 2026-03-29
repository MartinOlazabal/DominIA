console.log("Cargando server.ts...");
import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
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

app.use(express.json({ limit: '10mb' }));

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

// --- LOG ---
app.use((req, res, next) => {
  console.log(`Petición recibida: ${req.method} ${req.url}`);
  next();
});

// ═══════════════════════════════════════════════════════════════════════
// AUTENTICACIÓN
// ═══════════════════════════════════════════════════════════════════════

app.post("/api/auth/register", async (req, res) => {
  try {
    const { email, password, name } = req.body;
    if (!email || !password || !name) {
      return res.status(400).json({ error: "Datos incompletos" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        subscription: {
          create: {
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          }
        }
      }
    });

    res.json({ message: "Usuario creado con éxito" });
  } catch (error: any) {
    console.error("Error en registro:", error);
    res.status(400).json({ error: error.message || "Error al registrar usuario" });
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email y contraseña son requeridos" });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(401).json({ error: "Credenciales incorrectas" });

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (passwordMatch) {
      const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET);
      res.json({ token, user: { id: user.id, email: user.email, name: user.name, role: user.role } });
    } else {
      res.status(401).json({ error: "Credenciales incorrectas" });
    }
  } catch (error: any) {
    console.error("Error en login:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// ═══════════════════════════════════════════════════════════════════════
// DASHBOARD DEL USUARIO
// ═══════════════════════════════════════════════════════════════════════

app.get("/api/user/dashboard", authenticateToken, async (req: any, res) => {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  thirtyDaysAgo.setHours(0, 0, 0, 0);

  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        subscription: true,
        studySessions: {
          where: { date: { gte: thirtyDaysAgo } },
          orderBy: { date: 'asc' }
        },
        completions: true,
      }
    });

    // Calcular estadísticas de progreso
    const totalPoints = user?.completions.reduce((sum, c) => sum + c.points, 0) || 0;
    const totalExercises = user?.completions.length || 0;
    const totalStudyMinutes = user?.studySessions.reduce((sum, s) => sum + Math.floor(s.duration / 60), 0) || 0;

    res.json({
      ...user,
      password: undefined, // No enviar contraseña
      stats: {
        totalPoints,
        totalExercises,
        totalStudyMinutes,
      }
    });
  } catch (error: any) {
    console.error('[/api/user/dashboard] Error:', error.message);
    res.status(500).json({ error: "Error al cargar dashboard" });
  }
});

// ═══════════════════════════════════════════════════════════════════════
// SESIONES DE ESTUDIO (Cronómetro)
// ═══════════════════════════════════════════════════════════════════════

app.post("/api/study-session/sync", authenticateToken, async (req: any, res) => {
  const { seconds } = req.body;
  if (!seconds || seconds <= 0) return res.json({ success: true });

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  try {
    const session = await prisma.studySession.upsert({
      where: {
        userId_date: { userId: req.user.id, date: today }
      },
      update: {
        duration: { increment: seconds }
      },
      create: {
        userId: req.user.id,
        date: today,
        duration: seconds
      }
    });

    res.json({ success: true, duration: session.duration });
  } catch (error: any) {
    console.error('Error sync study session:', error);
    res.status(500).json({ error: "Error al sincronizar sesión" });
  }
});

// ═══════════════════════════════════════════════════════════════════════
// UNIVERSIDADES
// ═══════════════════════════════════════════════════════════════════════

app.get("/api/universities", async (req, res) => {
  const universities = await prisma.university.findMany({
    include: {
      subjects: {
        select: { id: true }
      }
    },
    orderBy: { name: 'asc' }
  });

  res.json(universities.map(u => ({
    ...u,
    subjectCount: u.subjects.length,
    subjects: undefined,
  })));
});

// ═══════════════════════════════════════════════════════════════════════
// MATERIAS
// ═══════════════════════════════════════════════════════════════════════

app.get("/api/universities/:universityId/subjects", async (req, res) => {
  const subjects = await prisma.subject.findMany({
    where: { universityId: req.params.universityId },
    orderBy: { name: 'asc' }
  });
  res.json(subjects);
});

app.get("/api/subjects", async (req, res) => {
  const subjects = await prisma.subject.findMany({
    orderBy: { name: 'asc' }
  });
  res.json(subjects);
});

// ═══════════════════════════════════════════════════════════════════════
// TEMAS (Roadmap)
// ═══════════════════════════════════════════════════════════════════════

app.get("/api/subjects/:subjectId/topics", authenticateToken, async (req: any, res) => {
  try {
    const topics = await prisma.topic.findMany({
      where: { subjectId: req.params.subjectId },
      include: {
        exerciseNodes: {
          include: {
            exercises: {
              include: {
                completions: {
                  where: { userId: req.user.id }
                }
              }
            }
          }
        },
        theory: { select: { id: true } }, // Solo saber si existe
      },
      orderBy: { order: 'asc' }
    });

    // Calcular progreso por tema
    const topicsWithProgress = topics.map(topic => {
      let totalExercises = 0;
      let completedExercises = 0;
      let totalPoints = 0;
      let earnedPoints = 0;

      topic.exerciseNodes.forEach(node => {
        node.exercises.forEach(ex => {
          totalExercises++;
          totalPoints += ex.points;
          if (ex.completions.length > 0) {
            completedExercises++;
            earnedPoints += ex.completions[0].points;
          }
        });
      });

      return {
        id: topic.id,
        name: topic.name,
        description: topic.description,
        icon: topic.icon,
        order: topic.order,
        posX: topic.posX,
        posY: topic.posY,
        hasTheory: !!topic.theory,
        totalExercises,
        completedExercises,
        progressPercent: totalExercises > 0 ? Math.round((completedExercises / totalExercises) * 100) : 0,
        totalPoints,
        earnedPoints,
        nodeCount: topic.exerciseNodes.length,
      };
    });

    res.json(topicsWithProgress);
  } catch (error: any) {
    console.error('[/api/subjects/:id/topics] Error:', error.message);
    res.status(500).json({ error: "Error al cargar temas" });
  }
});

// ═══════════════════════════════════════════════════════════════════════
// TEÓRICO NECESARIO
// ═══════════════════════════════════════════════════════════════════════

app.get("/api/topics/:topicId/theory", async (req, res) => {
  try {
    const topic = await prisma.topic.findUnique({
      where: { id: req.params.topicId },
      include: { theory: true, subject: true }
    });

    if (!topic) return res.status(404).json({ error: "Tema no encontrado" });

    res.json({
      topicName: topic.name,
      subjectName: topic.subject.name,
      content: topic.theory?.content || "",
      tips: topic.theory?.tips || "",
    });
  } catch (error: any) {
    console.error('[/api/topics/:id/theory] Error:', error.message);
    res.status(500).json({ error: "Error al cargar teórico" });
  }
});

// ═══════════════════════════════════════════════════════════════════════
// NODOS DE EJERCICIOS
// ═══════════════════════════════════════════════════════════════════════

app.get("/api/topics/:topicId/nodes", authenticateToken, async (req: any, res) => {
  try {
    const nodes = await prisma.exerciseNode.findMany({
      where: { topicId: req.params.topicId },
      include: {
        exercises: {
          include: {
            completions: {
              where: { userId: req.user.id }
            }
          }
        }
      },
      orderBy: { order: 'asc' }
    });

    const nodesWithProgress = nodes.map(node => {
      const totalExercises = node.exercises.length;
      const completedExercises = node.exercises.filter(ex => ex.completions.length > 0).length;

      return {
        id: node.id,
        name: node.name,
        level: node.level,
        order: node.order,
        posX: node.posX,
        posY: node.posY,
        totalExercises,
        completedExercises,
        progressPercent: totalExercises > 0 ? Math.round((completedExercises / totalExercises) * 100) : 0,
      };
    });

    res.json(nodesWithProgress);
  } catch (error: any) {
    console.error('[/api/topics/:id/nodes] Error:', error.message);
    res.status(500).json({ error: "Error al cargar nodos" });
  }
});

// ═══════════════════════════════════════════════════════════════════════
// EJERCICIOS
// ═══════════════════════════════════════════════════════════════════════

app.get("/api/nodes/:nodeId/exercises", authenticateToken, async (req: any, res) => {
  try {
    const exercises = await prisma.exerciseItem.findMany({
      where: { nodeId: req.params.nodeId },
      include: {
        completions: {
          where: { userId: req.user.id }
        }
      },
      orderBy: { order: 'asc' }
    });

    res.json(exercises.map(ex => ({
      id: ex.id,
      title: ex.title,
      statement: ex.statement,
      introduction: ex.introduction,
      hints: JSON.parse(ex.hints),
      order: ex.order,
      points: ex.points,
      isCompleted: ex.completions.length > 0,
      earnedPoints: ex.completions.length > 0 ? ex.completions[0].points : 0,
    })));
  } catch (error: any) {
    console.error('[/api/nodes/:id/exercises] Error:', error.message);
    res.status(500).json({ error: "Error al cargar ejercicios" });
  }
});

app.get("/api/exercises/:exerciseId", authenticateToken, async (req: any, res) => {
  try {
    const exercise = await prisma.exerciseItem.findUnique({
      where: { id: req.params.exerciseId },
      include: {
        completions: {
          where: { userId: req.user.id }
        },
        node: {
          include: {
            topic: {
              include: {
                subject: true,
                theory: true,
              }
            }
          }
        }
      }
    });

    if (!exercise) return res.status(404).json({ error: "Ejercicio no encontrado" });

    res.json({
      id: exercise.id,
      title: exercise.title,
      statement: exercise.statement,
      introduction: exercise.introduction,
      hints: JSON.parse(exercise.hints),
      points: exercise.points,
      isCompleted: exercise.completions.length > 0,
      topicName: exercise.node.topic.name,
      subjectName: exercise.node.topic.subject.name,
      nodeName: exercise.node.name,
      nodeLevel: exercise.node.level,
    });
  } catch (error: any) {
    console.error('[/api/exercises/:id] Error:', error.message);
    res.status(500).json({ error: "Error al cargar ejercicio" });
  }
});

// ═══════════════════════════════════════════════════════════════════════
// COMPLETAR EJERCICIO
// ═══════════════════════════════════════════════════════════════════════

app.post("/api/exercises/:exerciseId/complete", authenticateToken, async (req: any, res) => {
  try {
    const exercise = await prisma.exerciseItem.findUnique({
      where: { id: req.params.exerciseId }
    });

    if (!exercise) return res.status(404).json({ error: "Ejercicio no encontrado" });

    // Verificar si ya está completado
    const existing = await prisma.userExerciseCompletion.findUnique({
      where: {
        userId_exerciseId: {
          userId: req.user.id,
          exerciseId: exercise.id
        }
      }
    });

    if (existing) {
      return res.json({ message: "Ya completado", points: existing.points, alreadyCompleted: true });
    }

    const completion = await prisma.userExerciseCompletion.create({
      data: {
        userId: req.user.id,
        exerciseId: exercise.id,
        points: exercise.points,
      }
    });

    res.json({ message: "¡Ejercicio completado!", points: completion.points, alreadyCompleted: false });
  } catch (error: any) {
    console.error('[/api/exercises/:id/complete] Error:', error.message);
    res.status(500).json({ error: "Error al completar ejercicio" });
  }
});

// ═══════════════════════════════════════════════════════════════════════
// PROGRESO POR MATERIA
// ═══════════════════════════════════════════════════════════════════════

app.get("/api/user/progress/:subjectId", authenticateToken, async (req: any, res) => {
  try {
    // Obtener todos los ejercicios de la materia con completions del usuario
    const topics = await prisma.topic.findMany({
      where: { subjectId: req.params.subjectId },
      include: {
        exerciseNodes: {
          include: {
            exercises: {
              include: {
                completions: { where: { userId: req.user.id } }
              }
            }
          }
        }
      }
    });

    let totalExercises = 0;
    let completedExercises = 0;
    let totalPoints = 0;
    let earnedPoints = 0;

    const topicProgress = topics.map(topic => {
      let tTotal = 0, tDone = 0, tPoints = 0, tEarned = 0;
      topic.exerciseNodes.forEach(node => {
        node.exercises.forEach(ex => {
          tTotal++;
          totalExercises++;
          tPoints += ex.points;
          totalPoints += ex.points;
          if (ex.completions.length > 0) {
            tDone++;
            completedExercises++;
            tEarned += ex.completions[0].points;
            earnedPoints += ex.completions[0].points;
          }
        });
      });
      return {
        topicId: topic.id,
        topicName: topic.name,
        totalExercises: tTotal,
        completedExercises: tDone,
        progressPercent: tTotal > 0 ? Math.round((tDone / tTotal) * 100) : 0,
        totalPoints: tPoints,
        earnedPoints: tEarned,
      };
    });

    res.json({
      totalExercises,
      completedExercises,
      progressPercent: totalExercises > 0 ? Math.round((completedExercises / totalExercises) * 100) : 0,
      totalPoints,
      earnedPoints,
      topics: topicProgress,
    });
  } catch (error: any) {
    console.error('[/api/user/progress/:subjectId] Error:', error.message);
    res.status(500).json({ error: "Error al cargar progreso" });
  }
});

// ═══════════════════════════════════════════════════════════════════════
// CHAT CON IA (contextualizado a un ejercicio)
// ═══════════════════════════════════════════════════════════════════════

app.post("/api/exercises/:exerciseId/chat", authenticateToken, async (req: any, res) => {
  const { message } = req.body;
  if (!message?.trim()) return res.status(400).json({ error: "Mensaje vacío" });

  try {
    // Obtener el ejercicio con su contexto completo
    const exercise = await prisma.exerciseItem.findUnique({
      where: { id: req.params.exerciseId },
      include: {
        node: {
          include: {
            topic: {
              include: {
                subject: true,
                theory: true,
              }
            }
          }
        }
      }
    });

    if (!exercise) return res.status(404).json({ error: "Ejercicio no encontrado" });

    const topicName = exercise.node.topic.name;
    const subjectName = exercise.node.topic.subject.name;
    const theoryContent = exercise.node.topic.theory?.content || "";
    const theoryTips = exercise.node.topic.theory?.tips || "";

    // Obtener user name
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    const userName = user?.name?.split(' ')[0] || 'estudiante';

    // Obtener historial de chat de este ejercicio (últimos 10 mensajes)
    const chatHistory = await prisma.chatMessage.findMany({
      where: { userId: req.user.id, exerciseId: exercise.id },
      orderBy: { createdAt: 'asc' },
      take: 20,
    });

    const historyText = chatHistory.map(m =>
      `${m.role === 'user' ? 'Estudiante' : 'Tutor'}: ${m.content}`
    ).join('\n');

    // Construir system prompt
    const systemInstruction = `
Eres TutorIA, un tutor experto y empático de la Facultad de Ingeniería (FING, Universidad de la República, Uruguay).
Tu misión es ayudar al estudiante "${userName}" a resolver un ejercicio específico.

═══════════════════════════════════════════════════
CONTEXTO DEL EJERCICIO
═══════════════════════════════════════════════════
• Materia: ${subjectName}
• Tema: ${topicName}
• Nodo: ${exercise.node.name} (Nivel ${exercise.node.level})
• Ejercicio: ${exercise.title}

═══════════════════════════════════════════════════
PLANTEAMIENTO
═══════════════════════════════════════════════════
${exercise.statement}

═══════════════════════════════════════════════════
INTRODUCCIÓN DEL EJERCICIO
═══════════════════════════════════════════════════
${exercise.introduction}

${theoryContent ? `═══════════════════════════════════════════════════
TEÓRICO DEL TEMA (contexto base)
═══════════════════════════════════════════════════
${theoryContent}` : ''}

${theoryTips ? `═══════════════════════════════════════════════════
TIPS DEL TEMA
═══════════════════════════════════════════════════
${theoryTips}` : ''}

${historyText ? `═══════════════════════════════════════════════════
HISTORIAL DE CONVERSACIÓN
═══════════════════════════════════════════════════
${historyText}` : ''}

═══════════════════════════════════════════════════
INSTRUCCIONES
═══════════════════════════════════════════════════
1. NO resuelvas el ejercicio directamente. Guía al estudiante paso a paso.
2. Si el estudiante no sabe por dónde empezar, dale una pista inicial.
3. Si da una respuesta incorrecta, corrígelo con paciencia y explica por qué.
4. Usa LaTeX: $...$ para inline, $$...$$ para bloques.
5. Responde siempre en español rioplatense con tono motivador.
6. Sé conciso pero claro. No sermones extensos.
7. Celebra los logros del estudiante cuando avance correctamente.
`;

    // Llamar a la IA
    let responseText = "";

    if (!process.env.GEMINI_API_KEY) {
      responseText = `[SIMULACIÓN] Recibí tu pregunta sobre "${message}". Configura GEMINI_API_KEY en .env para respuestas reales.`;
    } else {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: message,
        config: { systemInstruction },
      });
      responseText = response.text || "Lo siento, no pude generar una respuesta. Intenta reformular tu pregunta.";
    }

    // Guardar mensajes
    await prisma.chatMessage.createMany({
      data: [
        { userId: req.user.id, role: "user", content: message, exerciseId: exercise.id },
        { userId: req.user.id, role: "assistant", content: responseText, exerciseId: exercise.id },
      ]
    });

    res.json({ text: responseText });
  } catch (error: any) {
    console.error('[/api/exercises/:id/chat] Error:', error?.message || error);
    res.status(500).json({ error: error?.message || "Error en la IA" });
  }
});

// ═══════════════════════════════════════════════════════════════════════
// ADMIN: Gestión de contenido
// ═══════════════════════════════════════════════════════════════════════

app.post("/api/admin/subjects", authenticateToken, async (req: any, res) => {
  if (req.user.role !== "ADMIN") return res.status(403).json({ error: "Solo admin" });
  const { name, description, icon, code, universityId, price } = req.body;
  const subject = await prisma.subject.create({
    data: { name, description, icon, code, universityId, price: price || 0 }
  });
  res.json(subject);
});

app.post("/api/admin/topics", authenticateToken, async (req: any, res) => {
  if (req.user.role !== "ADMIN") return res.status(403).json({ error: "Solo admin" });
  const { name, description, icon, subjectId, order, posX, posY } = req.body;
  const topic = await prisma.topic.create({
    data: { name, description, icon, subjectId, order: order || 0, posX: posX || 0, posY: posY || 0 }
  });
  res.json(topic);
});

app.post("/api/admin/nodes", authenticateToken, async (req: any, res) => {
  if (req.user.role !== "ADMIN") return res.status(403).json({ error: "Solo admin" });
  const { name, topicId, level, order, posX, posY } = req.body;
  const node = await prisma.exerciseNode.create({
    data: { name, topicId, level: level || 1, order: order || 0, posX: posX || 0, posY: posY || 0 }
  });
  res.json(node);
});

app.post("/api/admin/exercises", authenticateToken, async (req: any, res) => {
  if (req.user.role !== "ADMIN") return res.status(403).json({ error: "Solo admin" });
  const { title, statement, introduction, hints, nodeId, order, points } = req.body;
  const exercise = await prisma.exerciseItem.create({
    data: {
      title, statement, introduction: introduction || "",
      hints: JSON.stringify(hints || []),
      nodeId, order: order || 0, points: points || 10
    }
  });
  res.json(exercise);
});

app.put("/api/admin/topics/:topicId/theory", authenticateToken, async (req: any, res) => {
  if (req.user.role !== "ADMIN") return res.status(403).json({ error: "Solo admin" });
  const { content, tips } = req.body;
  const theory = await prisma.topicTheory.upsert({
    where: { topicId: req.params.topicId },
    update: { content: content || "", tips: tips || "" },
    create: { topicId: req.params.topicId, content: content || "", tips: tips || "" }
  });
  res.json(theory);
});

// ═══════════════════════════════════════════════════════════════════════
// VITE MIDDLEWARE
// ═══════════════════════════════════════════════════════════════════════

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
