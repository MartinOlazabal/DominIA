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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* Panel principal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[85vh] flex flex-col mx-4">

        {/* Header del panel */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-indigo-50 rounded-xl flex items-center justify-center">
              <Sigma className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <h2 className="font-bold text-gray-900">Formulario</h2>
              <p className="text-xs text-gray-500">{subjectName}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Botón para forzar recarga (invalida el caché) */}
            <button
              onClick={() => loadFormulas(true)}
              disabled={loading}
              title="Recargar desde la base de datos"
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-40"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Contenido scrolleable */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {loading && (
            <div className="flex items-center justify-center py-20 text-gray-400">
              <Loader2 className="w-6 h-6 animate-spin mr-3" />
              <span className="text-sm">Cargando fórmulas...</span>
            </div>
          )}

          {error && !loading && (
            <div className="text-center py-16">
              <p className="text-red-500 text-sm mb-3">{error}</p>
              <button
                onClick={() => loadFormulas(true)}
                className="text-sm text-indigo-600 underline"
              >
                Reintentar
              </button>
            </div>
          )}

          {!loading && !error && (
            /* Renderizamos el contenido con KaTeX para las fórmulas */
            <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed">
              {/* Dividimos por párrafos para renderizar MathRenderer correctamente */}
              {content.split('\n').map((line, i) => {
                if (line.startsWith('# ')) {
                  return <h2 key={i} className="text-xl font-bold text-gray-900 mt-6 mb-3 first:mt-0">{line.slice(2)}</h2>;
                }
                if (line.startsWith('## ')) {
                  return <h3 key={i} className="text-base font-bold text-gray-800 mt-4 mb-2">{line.slice(3)}</h3>;
                }
                if (line.startsWith('### ')) {
                  return <h4 key={i} className="text-sm font-bold text-gray-700 mt-3 mb-1">{line.slice(4)}</h4>;
                }
                if (line.startsWith('- ') || line.startsWith('* ')) {
                  return (
                    <div key={i} className="flex gap-2 my-1">
                      <span className="text-indigo-400 mt-0.5">•</span>
                      <MathRenderer text={line.slice(2)} />
                    </div>
                  );
                }
                if (line.trim() === '' || line.trim() === '---') {
                  return <div key={i} className="my-3 border-t border-gray-100" />;
                }
                return (
                  <p key={i} className="my-1">
                    <MathRenderer text={line} />
                  </p>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer informativo */}
        <div className="px-6 py-3 border-t border-gray-50 bg-gray-50/50 rounded-b-2xl shrink-0">
          <p className="text-[10px] text-gray-400 text-center uppercase tracking-widest font-bold">
            Contenido sin IA · Recuperado desde la base de datos · {subjectName}
          </p>
        </div>
      </div>
    </div>
  );
};
