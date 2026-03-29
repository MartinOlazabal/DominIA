import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando siembra de datos...');

  // ── Universidad ────────────────────────────────────────────────────────────
  const fing = await prisma.university.upsert({
    where: { code: 'fing' },
    update: {},
    create: {
      name: 'Facultad de Ingeniería - Udelar',
      code: 'fing',
      logo: 'GraduationCap',
    }
  });
  console.log('✅ Universidad FING creada');

  // ── Materias ───────────────────────────────────────────────────────────────
  const materiasData = [
    { name: 'Cálculo Diferencial e Integral en una Variable', code: 'cdiv1', description: 'Límites, derivadas, integrales y series en una variable real.', icon: 'TrendingUp' },
    { name: 'Cálculo Diferencial e Integral en Varias Variables', code: 'cdivv', description: 'Funciones de varias variables, derivadas parciales, integrales múltiples.', icon: 'Layers' },
    { name: 'Matemática Discreta 1', code: 'md1', description: 'Lógica, conjuntos, relaciones, grafos y combinatoria.', icon: 'Binary' },
    { name: 'Álgebra Lineal 1', code: 'al1', description: 'Espacios vectoriales, transformaciones lineales, matrices y determinantes.', icon: 'Grid3X3' },
    { name: 'Álgebra Lineal 2', code: 'al2', description: 'Autovalores, diagonalización, formas cuadráticas y espacios con producto interno.', icon: 'Box' },
  ];

  const materias: Record<string, any> = {};
  for (const m of materiasData) {
    materias[m.code] = await prisma.subject.upsert({
      where: { code: m.code },
      update: {},
      create: {
        name: m.name,
        code: m.code,
        description: m.description,
        icon: m.icon,
        universityId: fing.id,
        price: 0,
      }
    });
    console.log(`  ✅ Materia: ${m.name}`);
  }

  // ── Temas para CDIV1 ──────────────────────────────────────────────────────
  const temasCalculo = [
    { name: 'Funciones', description: 'Dominio, imagen, composición e inversas', icon: 'Activity', order: 1, posX: 0, posY: 0 },
    { name: 'Límites', description: 'Cálculo de límites, formas indeterminadas, L\'Hôpital', icon: 'ArrowRight', order: 2, posX: 1, posY: 1 },
    { name: 'Continuidad', description: 'Definición ε-δ, tipos de discontinuidad', icon: 'Link', order: 3, posX: 2, posY: 0 },
    { name: 'Derivadas', description: 'Reglas de derivación, cadena, implícita', icon: 'Zap', order: 4, posX: 3, posY: 1 },
    { name: 'Aplicaciones de Derivadas', description: 'Máximos, mínimos, monotonía, concavidad', icon: 'Target', order: 5, posX: 4, posY: 0 },
    { name: 'Integrales', description: 'Sustitución, por partes, fracciones parciales', icon: 'Sigma', order: 6, posX: 5, posY: 1 },
    { name: 'Series', description: 'Taylor, Maclaurin, criterios de convergencia', icon: 'Repeat', order: 7, posX: 6, posY: 0 },
  ];

  const topics: Record<string, any> = {};
  for (const t of temasCalculo) {
    const existing = await prisma.topic.findFirst({
      where: { name: t.name, subjectId: materias['cdiv1'].id }
    });
    if (existing) {
      topics[t.name] = existing;
      console.log(`  ↻ Tema existente: ${t.name}`);
    } else {
      topics[t.name] = await prisma.topic.create({
        data: {
          ...t,
          subjectId: materias['cdiv1'].id,
        }
      });
      console.log(`  ✅ Tema creado: ${t.name}`);
    }
  }

  // ── Contenido teórico para "Límites" ───────────────────────────────────────
  await prisma.topicTheory.upsert({
    where: { topicId: topics['Límites'].id },
    update: {},
    create: {
      topicId: topics['Límites'].id,
      content: `# Límites - Teórico Necesario

## Definición formal
El límite de $f(x)$ cuando $x$ tiende a $a$ es $L$ si:
$$\\forall \\varepsilon > 0, \\exists \\delta > 0 : 0 < |x - a| < \\delta \\Rightarrow |f(x) - L| < \\varepsilon$$

## Técnicas de cálculo
1. **Sustitución directa:** Si $f$ es continua en $a$, entonces $\\lim_{x \\to a} f(x) = f(a)$.
2. **Factorización:** Para formas $0/0$, factorizar numerador y denominador.
3. **Racionalización:** Multiplicar por la conjugada.
4. **L'Hôpital:** Si $\\lim \\frac{f(x)}{g(x)}$ es $\\frac{0}{0}$ o $\\frac{\\infty}{\\infty}$, entonces $\\lim \\frac{f(x)}{g(x)} = \\lim \\frac{f'(x)}{g'(x)}$.

## Límites notables
- $\\lim_{x \\to 0} \\frac{\\sin x}{x} = 1$
- $\\lim_{x \\to 0} \\frac{1 - \\cos x}{x} = 0$
- $\\lim_{x \\to \\infty} (1 + \\frac{a}{x})^x = e^a$`,
      tips: `## Tips para Límites
- Siempre intentá sustitución directa primero.
- Si da $0/0$, buscá factorizar antes de usar L'Hôpital.
- Recordá las formas indeterminadas: $0/0$, $\\infty/\\infty$, $0 \\cdot \\infty$, $\\infty - \\infty$, $1^\\infty$, $0^0$, $\\infty^0$.
- En el parcial, la clave es identificar rápido qué técnica usar.`
    }
  });

  // ── Nodos de ejercicios para "Límites" ─────────────────────────────────────
  const nodosLimites = [
    { name: 'Nivel 1 - Básico', level: 1, order: 1, posX: 0, posY: 0 },
    { name: 'Nivel 2 - Intermedio', level: 2, order: 2, posX: 1, posY: 1 },
    { name: 'Nivel 3 - Avanzado', level: 3, order: 3, posX: 2, posY: 0 },
  ];

  const nodes: Record<string, any> = {};
  for (const n of nodosLimites) {
    const existing = await prisma.exerciseNode.findFirst({
      where: { name: n.name, topicId: topics['Límites'].id }
    });
    if (existing) {
      nodes[n.name] = existing;
    } else {
      nodes[n.name] = await prisma.exerciseNode.create({
        data: { ...n, topicId: topics['Límites'].id }
      });
    }
    console.log(`    ✅ Nodo: ${n.name}`);
  }

  // ── Ejercicios para Nivel 1 - Básico ──────────────────────────────────────
  const ejerciciosBasicos = [
    {
      title: 'Límite por sustitución directa',
      statement: 'Calcular $\\lim_{x \\to 3} (2x + 1)$',
      introduction: 'En este ejercicio practicaremos la técnica más simple: la sustitución directa. Si la función es continua en el punto, simplemente evaluamos.',
      hints: JSON.stringify(['¿Qué pasa si reemplazo x por 3?', '¿Esta función es continua?', 'Dame una pista para empezar']),
      order: 1,
      points: 10,
    },
    {
      title: 'Límite con factorización',
      statement: 'Calcular $\\lim_{x \\to 2} \\frac{x^2 - 4}{x - 2}$',
      introduction: 'Cuando la sustitución directa da $0/0$, necesitamos simplificar. La factorización es la primera herramienta a probar.',
      hints: JSON.stringify(['¿Qué forma indeterminada obtengo?', '¿Puedo factorizar el numerador?', 'Recordá: a² - b² = (a+b)(a-b)']),
      order: 2,
      points: 10,
    },
    {
      title: 'Límite trigonométrico notable',
      statement: 'Calcular $\\lim_{x \\to 0} \\frac{\\sin(3x)}{x}$',
      introduction: 'Los límites trigonométricos son fundamentales. El más importante es $\\lim_{x \\to 0} \\frac{\\sin x}{x} = 1$. Aprendé a manipular expresiones para usar este resultado.',
      hints: JSON.stringify(['¿Puedo multiplicar y dividir por algo?', '¿Cómo uso el límite notable de sin(x)/x?', 'Intentá multiplicar y dividir por 3']),
      order: 3,
      points: 15,
    },
  ];

  for (const ej of ejerciciosBasicos) {
    const existing = await prisma.exerciseItem.findFirst({
      where: { title: ej.title, nodeId: nodes['Nivel 1 - Básico'].id }
    });
    if (!existing) {
      await prisma.exerciseItem.create({
        data: { ...ej, nodeId: nodes['Nivel 1 - Básico'].id }
      });
    }
    console.log(`      ✅ Ejercicio: ${ej.title}`);
  }

  // ── Ejercicios para Nivel 2 - Intermedio ───────────────────────────────────
  const ejerciciosIntermedios = [
    {
      title: 'L\'Hôpital simple',
      statement: 'Calcular $\\lim_{x \\to 0} \\frac{e^x - 1 - x}{x^2}$',
      introduction: 'La Regla de L\'Hôpital permite resolver formas $0/0$ y $\\infty/\\infty$ derivando numerador y denominador por separado.',
      hints: JSON.stringify(['¿Qué forma indeterminada es?', '¿Puedo aplicar L\'Hôpital?', '¿Necesito aplicar L\'Hôpital más de una vez?']),
      order: 1,
      points: 20,
    },
    {
      title: 'Límite exponencial',
      statement: 'Calcular $\\lim_{x \\to \\infty} \\left(1 + \\frac{3}{x}\\right)^x$',
      introduction: 'Los límites de la forma $1^\\infty$ requieren un tratamiento especial usando el límite notable $\\lim (1 + a/x)^x = e^a$.',
      hints: JSON.stringify(['¿Qué forma indeterminada es?', '¿Reconocés el patrón de e?', '¿Cuánto vale a en este caso?']),
      order: 2,
      points: 20,
    },
  ];

  for (const ej of ejerciciosIntermedios) {
    const existing = await prisma.exerciseItem.findFirst({
      where: { title: ej.title, nodeId: nodes['Nivel 2 - Intermedio'].id }
    });
    if (!existing) {
      await prisma.exerciseItem.create({
        data: { ...ej, nodeId: nodes['Nivel 2 - Intermedio'].id }
      });
    }
    console.log(`      ✅ Ejercicio: ${ej.title}`);
  }

  // ── Nodos de ejercicios para "Derivadas" ───────────────────────────────────
  const nodosDerivadas = [
    { name: 'Nivel 1 - Básico', level: 1, order: 1, posX: 0, posY: 0 },
    { name: 'Nivel 2 - Intermedio', level: 2, order: 2, posX: 1, posY: 1 },
  ];

  for (const n of nodosDerivadas) {
    const existing = await prisma.exerciseNode.findFirst({
      where: { name: n.name, topicId: topics['Derivadas'].id }
    });
    if (!existing) {
      const node = await prisma.exerciseNode.create({
        data: { ...n, topicId: topics['Derivadas'].id }
      });
      // Un ejercicio de ejemplo
      await prisma.exerciseItem.create({
        data: {
          nodeId: node.id,
          title: 'Derivada de un polinomio',
          statement: 'Calcular $f\'(x)$ si $f(x) = 3x^4 - 2x^2 + 5x - 1$',
          introduction: 'Las derivadas de polinomios usan la regla de la potencia: $(x^n)\' = n \\cdot x^{n-1}$.',
          hints: JSON.stringify(['Aplicá la regla de la potencia a cada término', '¿Cuánto vale la derivada de una constante?']),
          order: 1,
          points: 10,
        }
      });
    }
    console.log(`    ✅ Nodo Derivadas: ${n.name}`);
  }

  // ── Usuarios ───────────────────────────────────────────────────────────────
  const adminPassword = await bcrypt.hash('admin123', 10);
  await prisma.user.upsert({
    where: { email: 'admin@tutoria.uy' },
    update: {},
    create: {
      email: 'admin@tutoria.uy',
      password: adminPassword,
      name: 'Administrador',
      role: 'ADMIN',
      subscription: {
        create: { status: 'active', expiresAt: new Date(2030, 0, 1) }
      }
    }
  });

  const testPassword = await bcrypt.hash('test123', 10);
  await prisma.user.upsert({
    where: { email: 'test@test.com' },
    update: {},
    create: {
      email: 'test@test.com',
      password: testPassword,
      name: 'María García',
      role: 'USER',
      subscription: {
        create: {
          status: 'trial',
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        }
      }
    }
  });

  console.log('');
  console.log('✅ Siembra completada con éxito');
  console.log('');
  console.log('Credenciales de prueba:');
  console.log('  Admin:   admin@tutoria.uy / admin123');
  console.log('  Usuario: test@test.com / test123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
