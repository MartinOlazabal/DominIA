import React from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';

interface MathRendererProps {
  text: string;
}

export const MathRenderer: React.FC<MathRendererProps> = ({ text }) => {
  const renderMath = (content: string) => {
    // Reemplazar $$...$$ (bloques) primero
    const blockRegex = /\$\$(.*?)\$\$/gs;
    const inlineRegex = /\$(.*?)\$/g;

    let html = content.replace(blockRegex, (_, formula) => {
      try {
        return katex.renderToString(formula, { displayMode: true, throwOnError: false });
      } catch (e) {
        console.error('Error rendering block math:', e);
        return `$$${formula}$$`; // fallback
      }
    });

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

  return <span className="math-renderer-content" dangerouslySetInnerHTML={{ __html: renderMath(text) }} />;
};
