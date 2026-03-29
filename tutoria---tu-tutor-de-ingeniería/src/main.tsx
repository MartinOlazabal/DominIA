/**
 * main.tsx — Punto de entrada de la aplicación React.
 *
 * Este archivo es el "bootstrap" de la app: React toma control del div#root
 * definido en index.html y monta el componente raíz <App />.
 *
 * StrictMode: En desarrollo, React ejecuta cada componente DOS veces para
 * detectar efectos secundarios problemáticos. No afecta a producción.
 *
 * Estilos globales importados aquí para que estén disponibles en toda la app:
 * - index.css → Tailwind + variables de tema + utilidades propias
 * - katex.min.css → Estilos necesarios para renderizar fórmulas matemáticas con KaTeX
 */
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import 'katex/dist/katex.min.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
