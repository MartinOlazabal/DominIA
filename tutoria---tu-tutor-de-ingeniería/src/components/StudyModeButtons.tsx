import React from 'react';
import { ToggleLeft, List, FlaskConical, BookOpen, Sigma } from 'lucide-react';

// Los tipos válidos de modo de estudio que puede recibir el backend
export type StudyMode = 'vf' | 'multiple' | 'demo' | 'teorico' | 'formulas';

interface StudyModeButtonsProps {
  /** El modo actualmente activo (null = ninguno seleccionado) */
  activeMode: StudyMode | null;
  /** Callback al seleccionar un modo de ejercicio (vf, multiple, demo, teorico) */
  onModeChange: (mode: StudyMode) => void;
  /** Callback separado para abrir el panel de Fórmulas (no consume IA) */
  onFormulasOpen: () => void;
}

/** Configuración visual de cada botón de modo */
const MODES: {
  id: StudyMode;
  label: string;
  icon: React.ReactNode;
  description: string;
  color: string;
  activeColor: string;
}[] = [
  {
    id: 'vf',
    label: 'Verdadero o Falso',
    icon: <ToggleLeft className="w-4 h-4" />,
    description: 'Afirmaciones V/F al estilo de exámenes',
    color: 'text-violet-600',
    activeColor: 'bg-violet-50 border-violet-300 text-violet-700',
  },
  {
    id: 'multiple',
    label: 'Múltiple Opción',
    icon: <List className="w-4 h-4" />,
    description: 'Preguntas con 4 opciones',
    color: 'text-blue-600',
    activeColor: 'bg-blue-50 border-blue-300 text-blue-700',
  },
  {
    id: 'demo',
    label: 'Demostraciones',
    icon: <FlaskConical className="w-4 h-4" />,
    description: 'Guía paso a paso de teoremas',
    color: 'text-emerald-600',
    activeColor: 'bg-emerald-50 border-emerald-300 text-emerald-700',
  },
  {
    id: 'teorico',
    label: 'Teórico',
    icon: <BookOpen className="w-4 h-4" />,
    description: 'Repaso conceptual con analogías',
    color: 'text-amber-600',
    activeColor: 'bg-amber-50 border-amber-300 text-amber-700',
  },
  {
    id: 'formulas',
    label: 'Fórmulas',
    icon: <Sigma className="w-4 h-4" />,
    description: 'Resumen de fórmulas y teoremas',
    color: 'text-indigo-600',
    activeColor: 'bg-indigo-50 border-indigo-300 text-indigo-700',
  },
];

/**
 * Barra lateral de botones de modos de estudio.
 * Se muestra dentro de la vista de Chat cuando el usuario está en una instancia activa.
 */
export const StudyModeButtons: React.FC<StudyModeButtonsProps> = ({
  activeMode,
  onModeChange,
  onFormulasOpen,
}) => {
  const handleClick = (mode: StudyMode) => {
    if (mode === 'formulas') {
      // Fórmulas abre un panel especial, no activa el modo de chat
      onFormulasOpen();
    } else {
      onModeChange(mode);
    }
  };

  return (
    <div className="flex flex-col gap-1 px-3 py-4">
      {/* Título de la sección */}
      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 px-1">
        Modos de Estudio
      </p>

      {MODES.map((m) => {
        const isActive = activeMode === m.id;
        return (
          <button
            key={m.id}
            onClick={() => handleClick(m.id)}
            title={m.description}
            className={`
              w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-sm font-medium
              border transition-all duration-150
              ${isActive
                ? m.activeColor + ' shadow-sm'
                : 'bg-transparent border-transparent text-gray-500 hover:bg-gray-50 hover:text-gray-800'
              }
            `}
          >
            {/* Ícono con el color de cada modo */}
            <span className={isActive ? '' : m.color}>{m.icon}</span>
            <span className="leading-tight">{m.label}</span>
            {/* Punto indicador de modo activo */}
            {isActive && (
              <span className="ml-auto w-1.5 h-1.5 rounded-full bg-current opacity-60" />
            )}
          </button>
        );
      })}
    </div>
  );
};
