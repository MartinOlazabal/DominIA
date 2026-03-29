/**
 * MathRenderer.tsx
 *
 * Componente que convierte texto plano con notación LaTeX en HTML renderizado
 * con la librería KaTeX. Es usado en todos los mensajes del chat (usuario y asistente)
 * para mostrar ecuaciones matemáticas de forma legible.
 *
 * Sintaxis LaTeX soportada:
 * - $$ecuación$$  → bloque de ecuación (centrado, modo display)
 * - $ecuación$    → ecuación inline (dentro del texto, sin salto de línea)
 *
 * Ejemplo visual:
 *   "La derivada de $x^n$ es $nx^{n-1}$" → texto con fórmulas renderizadas
 *   "$$\int_0^1 x^2 dx = \frac{1}{3}$$"  → ecuación en bloque centrado
 */
import React from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';

interface MathRendererProps {
  text: string;
}

export const MathRenderer: React.FC<MathRendererProps> = ({ text }) => {
  /**
   * Transforma el texto reemplazando las expresiones LaTeX por HTML generado por KaTeX.
   *
   * ORDEN IMPORTANTE: primero se procesan los bloques $$ y DESPUÉS los inline $.
   * Esto evita que el regex de $...$ capture accidentalmente la mitad de un $$...$$,
   * lo que produciría un renderizado incorrecto.
   */
  const renderMath = (content: string) => {
    // Regex para bloques: $$...$$ con soporte multi-línea (flag /s = dotAll)
    const blockRegex = /\$\$(.*?)\$\$/gs;
    // Regex para inline: $...$
    const inlineRegex = /\$(.*?)\$/g;

    // Paso 1: Reemplazar bloques $$...$$ con KaTeX en displayMode (ecuación centrada)
    let html = content.replace(blockRegex, (_, formula) => {
      try {
        return katex.renderToString(formula, { displayMode: true, throwOnError: false });
      } catch (e) {
        console.error('Error rendering block math:', e);
        return `$$${formula}$$`; // fallback: devuelve el texto original sin renderizar
      }
    });

    // Paso 2: Reemplazar inline $...$ con KaTeX en modo normal (dentro del texto)
    html = html.replace(inlineRegex, (_, formula) => {
      try {
        // En aseguramos de que no hay espacios en blanco rompiendo el renderizado inline
        return katex.renderToString(formula, { displayMode: false, throwOnError: false });
      } catch (e) {
        console.error('Error rendering inline math:', e);
        return `$${formula}$`;
      }
    });

    return html;
  };

  /**
   * NOTA sobre dangerouslySetInnerHTML:
   * KaTeX.renderToString() devuelve un string HTML que necesitamos inyectar directamente
   * en el DOM. React normalmente escapa todo el HTML para prevenir XSS, pero aquí
   * el HTML proviene de KaTeX (librería confiable) que solo genera etiquetas de renderizado
   * matemático, no scripts ni eventos inline. El texto LaTeX viene de la API del propio backend.
   */
  return <span className="math-renderer-content" dangerouslySetInnerHTML={{ __html: renderMath(text) }} />;
};
