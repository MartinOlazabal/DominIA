import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// ============================================================
// BASE DE CONOCIMIENTO: Cálculo 1 - FING
// Cada string es un "fragmento" (chunk) de texto que la IA
// usará como contexto RAG para responder preguntas.
// En producción estos datos vienen de PDFs/apuntes reales.
// ============================================================
const knowledgeBase: Record<string, string[]> = {

  // ── Prácticos Semanales ───────────────────────────────────
  practicos: [
    `PRÁCTICOS DE CÁLCULO 1 - FING UDELAR
    
Los prácticos semanales abarcan los temas fundamentales de Cálculo 1. El objetivo 
es ejercitar los conceptos teóricos con problemas de dificultad gradual.

TEMAS PRINCIPALES:
- Funciones reales de variable real: dominio, imagen, composición, inversas.
- Límites: cálculo algebraico, formas indeterminadas, límites laterales, límite al infinito.
- Continuidad: definición ε-δ, tipos de discontinuidad (removible, de salto, esencial).
- Derivadas: definición como límite, reglas de derivación (producto, cociente, cadena).
- Aplicaciones de la derivada: máximos y mínimos, monotonía, concavidad, puntos de inflexión.`,

    `LÍMITES - TÉCNICAS DE CÁLCULO
    
1. Sustitución directa: Si f(x) es continua en a, entonces lim(x→a) f(x) = f(a).
2. Factorización: Para indeterminaciones 0/0, factorizar numerador/denominador.
   Ejemplo: lim(x→2) (x²-4)/(x-2) = lim(x→2) (x+2)(x-2)/(x-2) = lim(x→2) (x+2) = 4
3. Racionalización: Para expresiones con raíces. Multiplicar por conjugada.
4. Regla de L'Hôpital: Si lim es 0/0 o ∞/∞, entonces lim f(x)/g(x) = lim f'(x)/g'(x).
   Solo aplicar cuando las condiciones se cumplan.
5. Límites trigonométricos notables: lim(x→0) sin(x)/x = 1, lim(x→0) (1-cos(x))/x = 0.`,

    `DERIVADAS - REGLAS Y FÓRMULAS

Derivadas de funciones básicas:
- (xⁿ)' = n·xⁿ⁻¹  (potencia)
- (eˣ)' = eˣ
- (ln x)' = 1/x
- (sin x)' = cos x
- (cos x)' = -sin x
- (tan x)' = sec²x = 1/cos²x

Reglas de operación:
- Suma/resta: (f ± g)' = f' ± g'
- Producto: (f·g)' = f'·g + f·g'
- Cociente: (f/g)' = (f'·g - f·g') / g²
- Cadena: (f(g(x)))' = f'(g(x))·g'(x)  ← MUY utilizada en parciales`,
  ],

  // ── Primer Parcial ────────────────────────────────────────
  primer_parcial: [
    `PRIMER PARCIAL DE CÁLCULO 1 - FING UDELAR
    
El primer parcial típicamente cubre los primeros dos bloques de la materia.
Temas con mayor peso evaluativo:

1. LÍMITES (40% del parcial aprox.)
   - Cálculo de límites con formas indeterminadas (0/0, ∞/∞, 0·∞, ∞-∞, 1^∞)
   - Aplicación de Regla de L'Hôpital
   - Límites trigonométricos y exponenciales
   - Límites laterales y verificación de existencia

2. CONTINUIDAD (20%)
   - Verificación de continuidad en un punto
   - Extensión por continuidad
   - Clasificación de discontinuidades

3. DERIVABILIDAD (40%)
   - Cálculo de derivadas con todas las reglas
   - Derivada de función implícita
   - Ecuación de la recta tangente
   - Derivadas de orden superior`,

    `EJERCICIOS TIPO - PRIMER PARCIAL

TIPO 1 - Calcular lim(x→0) (eˣ - 1 - x) / x²
Solución: Forma 0/0. Aplicar L'Hôpital dos veces:
  = lim (eˣ - 1) / (2x)  [aún 0/0]
  = lim eˣ / 2 = 1/2 ✓

TIPO 2 - Calcular lim(x→∞) (1 + 3/x)^x
Solución: Forma 1^∞. Usar que lim(1 + a/x)^x = eᵃ
  = e³ ✓

TIPO 3 - Derivar f(x) = x²·eˣ·sin(x)
Usar regla del producto (de a dos):
  f(x) = (x²)(eˣ·sin(x))
  f'(x) = 2x·eˣ·sin(x) + x²·(eˣ·sin(x) + eˣ·cos(x))
  f'(x) = x·eˣ·(2sin(x) + x·sin(x) + x·cos(x)) ✓

TIPO 4 - Determinar si f(x) = |x-2| es derivable en x=2
Calcular derivadas laterales:
  f'(2⁺) = lim(h→0⁺) |h|/h = 1
  f'(2⁻) = lim(h→0⁻) |h|/h = -1
  Como son distintas, NO es derivable en x=2 ✓`,

    `REGLA DE L'HÔPITAL - GUÍA COMPLETA

La Regla de L'Hôpital establece que si lim f(x)/g(x) tiene forma 0/0 o ±∞/∞,
entonces: lim f(x)/g(x) = lim f'(x)/g'(x)

CONDICIONES para aplicarla:
1. El límite debe ser de la forma 0/0 o ∞/∞ (no otras)
2. f y g deben ser diferenciables cerca de a
3. lim f'(x)/g'(x) debe existir

FORMAS INDETERMINADAS y cómo reducirlas a 0/0 o ∞/∞:
- 0·∞: escribir como f·g = f/(1/g) o g/(1/f)
- ∞-∞: buscar denominador común o factorizar
- 1^∞, 0⁰, ∞⁰: tomar logaritmo → convierte a 0·∞

ERRORES COMUNES a evitar:
1. Aplicar la regla cuando no hay indeterminación ← error grave
2. Derivar el cociente como función completa (en vez de derivar f y g por separado)
3. No verificar que el límite resultante existe`,
  ],

  // ── Segundo Parcial ───────────────────────────────────────
  segundo_parcial: [
    `SEGUNDO PARCIAL DE CÁLCULO 1 - FING UDELAR
    
El segundo parcial cubre los temas de integración y sus aplicaciones.

1. INTEGRALES INDEFINIDAS (30%)
   - Integrales directas (tablas básicas)
   - Sustitución simple (cambio de variable)
   - Integración por partes: ∫u dv = uv - ∫v du (regla ILATE)
   - Fracciones parciales
   - Integrales trigonométricas

2. INTEGRALES DEFINIDAS (30%)
   - Teorema Fundamental del Cálculo
   - Cálculo de área bajo una curva
   - Área entre dos curvas

3. SERIES Y SUCESIONES (40%)
   - Convergencia/divergencia de sucesiones
   - Series de Taylor y Maclaurin
   - Criterios de convergencia (razón, raíz, integral, comparación)`,

    `INTEGRACIÓN POR PARTES - REGLA ILATE

Fórmula: ∫u dv = uv - ∫v du

ILATE indica qué función elegir como "u" (tiene prioridad el que aparece primero):
  I = Función Inversa trigonométrica (arctan, arcsin...)
  L = Función Logarítmica (ln x, log x)
  A = Función Algebraica (xⁿ, polinomios)
  T = Función Trigonométrica (sin x, cos x...)
  E = Función Exponencial (eˣ, aˣ)

Ejemplo 1: ∫x·eˣ dx
  u = x (algebraica), dv = eˣ dx
  du = dx, v = eˣ
  = x·eˣ - ∫eˣ dx = x·eˣ - eˣ + C = eˣ(x-1) + C ✓

Ejemplo 2: ∫ln(x) dx
  u = ln(x) (logarítmica), dv = dx
  du = 1/x dx, v = x
  = x·ln(x) - ∫x·(1/x) dx = x·ln(x) - x + C ✓`,

    `SERIES DE TAYLOR Y MACLAURIN

Una serie de Taylor de f(x) centrada en a es:
f(x) = Σ f⁽ⁿ⁾(a)/n! · (x-a)ⁿ

Cuando a=0 se llama serie de Maclaurin.

SERIES IMPORTANTES (memorizar para el parcial):
- eˣ = 1 + x + x²/2! + x³/3! + ... = Σ xⁿ/n!
- sin(x) = x - x³/3! + x⁵/5! - ... = Σ (-1)ⁿ x²ⁿ⁺¹/(2n+1)!
- cos(x) = 1 - x²/2! + x⁴/4! - ... = Σ (-1)ⁿ x²ⁿ/(2n)!
- ln(1+x) = x - x²/2 + x³/3 - ... (converge para |x| ≤ 1, x≠-1)
- 1/(1-x) = 1 + x + x² + x³ + ... (converge para |x| < 1)

APLICACIONES:
- Calcular límites con formas indeterminadas
- Aproximar valores numéricos (ej: e ≈ 1+1+1/2+1/6+...)
- Integrar funciones difíciles`,
  ],

  // ── Examen Final ─────────────────────────────────────────
  examen: [
    `EXAMEN FINAL DE CÁLCULO 1 - FING UDELAR

El examen final es integral: evalúa todos los temas del curso.
Estructura típica: 4-5 problemas, 3 horas de duración.

DISTRIBUCIÓN DE TEMAS USUAL:
1. Límites y continuidad (1 problema, ~20%)
2. Derivadas y aplicaciones (1-2 problemas, ~30%)  
   → Incluye: ecuación de la tangente, optimización, regla de la cadena
3. Integrales (1-2 problemas, ~30%)
   → Por partes, sustitución, fracciones parciales, área
4. Series (1 problema, ~20%)
   → Taylor/Maclaurin, criterios de convergencia

ESTRATEGIA DE ESTUDIO PARA EL FINAL:
- Repasar los parciales anteriores (son el mejor indicador)
- Dominar las identidades trigonométricas
- Practicar la lectura rápida del enunciado para identificar el tipo de técnica
- En integrales: siempre verificar derivando el resultado`,

    `OPTIMIZACIÓN CON DERIVADAS - PROBLEMAS TÍPICOS DE FINAL

Procedimiento para problemas de máximos y mínimos:
1. Identificar la función objetivo f(x) a maximizar/minimizar
2. Identificar las restricciones y expresar todo en una variable
3. Calcular f'(x) = 0 → encontrar puntos críticos
4. Verificar con f''(x): si f''(a) > 0 es mínimo, si f''(a) < 0 es máximo
5. Evaluar en extremos del dominio si es cerrado

Ejemplo: Encontrar el rectángulo de área máxima inscrito en un semicírculo de radio r.
Sea la base 2x, la altura y. Restricción: x² + y² = r²
Área = 2xy = 2x·√(r²-x²)
Derivar, igualar a 0: x = r/√2
Área máxima = r² ✓`,
  ],
};

async function main() {
  console.log('🌱 Iniciando siembra de datos...');

  // ── Usuarios ────────────────────────────────────────────────────────────────
  const adminPassword = await bcrypt.hash('admin123', 10);
  await prisma.user.upsert({
    where: { email: 'admin@tutoria.uy' },
    update: {},
    create: {
      email: 'admin@tutoria.uy',
      password: adminPassword,
      name: 'Administrador',
      role: 'ADMIN',
      profile: { create: {} },
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
      profile: { create: {} },
      subscription: {
        create: {
          status: 'trial',
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        }
      }
    }
  });

  // ── Materia: Cálculo 1 ───────────────────────────────────────────────────────
  // upsert por 'name' (campo unique). Si ya existe, no la sobreescribe.
  const calculo1 = await prisma.subject.upsert({
    where: { name: 'Cálculo 1' },
    update: {
      // Actualizar campos nuevos si la materia ya existía
      code: 'calculo1',
      faculty: 'FING',
    },
    create: {
      name: 'Cálculo 1',
      code: 'calculo1',
      faculty: 'FING',
      description: 'Cálculo diferencial e integral en una variable. Límites, derivadas, integrales y series.',
      icon: 'BookOpen',
    }
  });

  // ── Instancias/Categorías con tipo y orden ────────────────────────────────
  // Las definimos como array para poder iterar y crearlas
  const categoriasData = [
    { name: 'Prácticos Semanales', type: 'practico', order: 1, key: 'practicos' },
    { name: 'Primer Parcial', type: 'primer_parcial', order: 2, key: 'primer_parcial' },
    { name: 'Segundo Parcial', type: 'segundo_parcial', order: 3, key: 'segundo_parcial' },
    { name: 'Examen Final', type: 'examen', order: 4, key: 'examen' },
  ];

  for (const catData of categoriasData) {
    // Verificar si ya existe una categoría con ese nombre en esta materia
    const existing = await prisma.category.findFirst({
      where: { name: catData.name, subjectId: calculo1.id }
    });

    let category;

    if (existing) {
      // Si existe, actualizar los campos nuevos (type y order)
      category = await prisma.category.update({
        where: { id: existing.id },
        data: { type: catData.type, order: catData.order }
      });
      console.log(`  ↻ Categoría actualizada: ${catData.name}`);
    } else {
      // Si no existe, crearla
      category = await prisma.category.create({
        data: {
          name: catData.name,
          type: catData.type,
          order: catData.order,
          subjectId: calculo1.id,
        }
      });
      console.log(`  ✚ Categoría creada: ${catData.name}`);
    }

    // ── Cargar base de conocimiento para esta instancia ──────────────────────
    // Solo cargar si la categoría no tiene knowledge ya (evitar duplicados)
    const existingKnowledge = await prisma.knowledgeBase.count({
      where: { categoryId: category.id }
    });

    if (existingKnowledge === 0) {
      const chunks = knowledgeBase[catData.key] || [];
      for (const chunk of chunks) {
        await prisma.knowledgeBase.create({
          data: {
            categoryId: category.id,
            content: chunk.trim(),
            source: `seed_${catData.key}.txt` // Marcar como sembrado desde seed
          }
        });
      }
      console.log(`    📚 Base de conocimiento cargada: ${chunks.length} fragmentos`);
    } else {
      console.log(`    ⏭  Base de conocimiento ya existe (${existingKnowledge} fragmentos)`);
    }
  }

  console.log('✅ Siembra completada con éxito');
  console.log('');
  console.log('Credenciales de prueba:');
  console.log('  Admin:  admin@tutoria.uy / admin123');
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
