import React, { useEffect, useState } from 'react';
import { X, Sigma, Loader2, RefreshCw } from 'lucide-react';
import { dataService } from '../services/api';
import { MathRenderer } from './MathRenderer';

interface FormulasPanelProps {
  /** ID de la materia actual (para saber qué fórmulas cargar) */
  subjectId: string;
  /** Nombre de la materia (para el título del panel) */
  subjectName: string;
  /** Callback para cerrar el panel */
  onClose: () => void;
}

/**
 * Modal que muestra el contenido de fórmulas de una materia.
 * Lee el contenido desde la base de datos (sin consumo de IA) y lo renderiza con KaTeX.
 * El resultado se cachea en localStorage para evitar peticiones repetidas.
 */
export const FormulasPanel: React.FC<FormulasPanelProps> = ({
  subjectId,
  subjectName,
  onClose,
}) => {
  // Estado del contenido de fórmulas
  const [content, setContent] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cargar el contenido de fórmulas al montar el componente
  const loadFormulas = async (forceRefresh = false) => {
    setLoading(true);
    setError(null);

    // Si se fuerza la actualización, eliminar del caché
    if (forceRefresh) {
      localStorage.removeItem(`formulas-${subjectId}`);
    }

    try {
      const data = await dataService.getFormulas(subjectId);
      setContent(data.content);
    } catch (err: any) {
      console.error('[FormulasPanel] Error cargando fórmulas:', err);
      setError(err.message || 'No se pudieron cargar las fórmulas.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFormulas();
  }, [subjectId]);

  return (
    /* Overlay oscuro que cubre toda la pantalla */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md px-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* Panel principal */}
      <div className="relative bg-[#030712] rounded-[24px] border border-white/10 shadow-[0_0_40px_rgba(139,92,246,0.15)] w-full max-w-3xl max-h-[85vh] flex flex-col mx-4 overflow-hidden">
        {/* Glow background effect */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80%] h-[100px] bg-dominia-gradient opacity-[0.15] blur-[50px] pointer-events-none" />

        {/* Header del panel */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/10 shrink-0 relative z-10 bg-black/40 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-dominia-gradient rounded-xl flex items-center justify-center p-[1px] shadow-[0_0_15px_rgba(236,72,153,0.3)]">
              <div className="w-full h-full bg-[#111827] rounded-[11px] flex items-center justify-center">
                <Sigma className="w-5 h-5 text-white" />
              </div>
            </div>
            <div>
              <h2 className="font-header font-bold text-white text-lg tracking-tight">Formulario</h2>
              <p className="text-xs text-[#ec4899] font-medium tracking-wide">{subjectName}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Botón para forzar recarga (invalida el caché) */}
            <button
              onClick={() => loadFormulas(true)}
              disabled={loading}
              title="Recargar desde la base de datos"
              className="p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors disabled:opacity-40"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Contenido scrolleable */}
        <div className="flex-1 overflow-y-auto px-6 py-6 scrollbar-hide relative z-10 bg-transparent">
          {loading && (
            <div className="flex flex-col items-center justify-center py-24 text-slate-400 gap-4">
              <Loader2 className="w-8 h-8 animate-spin text-[#8b5cf6]" />
              <span className="text-sm font-medium tracking-wide">Cargando fórmulas...</span>
            </div>
          )}

          {error && !loading && (
            <div className="text-center py-20 bg-red-500/10 border border-red-500/20 rounded-2xl mx-4 mt-4">
              <p className="text-red-400 text-sm mb-4 font-medium">{error}</p>
              <button
                onClick={() => loadFormulas(true)}
                className="text-sm text-white bg-red-500/20 hover:bg-red-500/30 px-4 py-2 rounded-lg transition-colors"
              >
                Reintentar
              </button>
            </div>
          )}

          {!loading && !error && (
            /* Renderizamos el contenido con KaTeX para las fórmulas */
            <div className="prose prose-sm prose-invert max-w-none text-slate-300 leading-relaxed font-sans">
              {/* Dividimos por párrafos para renderizar MathRenderer correctamente */}
              {content.split('\n').map((line, i) => {
                if (line.startsWith('# ')) {
                  return <h2 key={i} className="text-2xl font-header font-bold text-white mt-8 mb-4 first:mt-0 tracking-tight">{line.slice(2)}</h2>;
                }
                if (line.startsWith('## ')) {
                  return <h3 key={i} className="text-lg font-header font-bold text-white mt-6 mb-3 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#ec4899] inline-block" />
                    {line.slice(3)}
                  </h3>;
                }
                if (line.startsWith('### ')) {
                  return <h4 key={i} className="text-base font-bold text-[#8b5cf6] mt-4 mb-2">{line.slice(4)}</h4>;
                }
                if (line.startsWith('- ') || line.startsWith('* ')) {
                  return (
                    <div key={i} className="flex gap-3 my-2 items-start p-3 bg-white/5 rounded-xl border border-white/5 hover:border-white/10 transition-colors">
                      <span className="text-[#8b5cf6] mt-0.5 shrink-0">•</span>
                      <div className="text-[14px]"><MathRenderer text={line.slice(2)} /></div>
                    </div>
                  );
                }
                if (line.trim() === '' || line.trim() === '---') {
                  return <div key={i} className="my-5 border-t border-white/10 w-full" />;
                }
                return (
                  <p key={i} className="my-2 text-[15px]">
                    <MathRenderer text={line} />
                  </p>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer informativo */}
        <div className="px-6 py-4 border-t border-white/5 bg-[#030712] shrink-0 relative z-10 flex justify-center">
          <p className="text-[10px] text-slate-500 text-center uppercase tracking-widest font-bold bg-white/5 px-4 py-1.5 rounded-full border border-white/5">
            Contenido recuperado desde la base de datos · {subjectName}
          </p>
        </div>
      </div>
    </div>
  );
};
