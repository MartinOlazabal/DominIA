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
    color: 'text-[#8b5cf6]',
    activeColor: 'bg-[#8b5cf6]/10 border-[#8b5cf6]/50 text-[#8b5cf6] shadow-[0_0_15px_rgba(139,92,246,0.2)]',
  },
  {
    id: 'multiple',
    label: 'Múltiple Opción',
    icon: <List className="w-4 h-4" />,
    description: 'Preguntas con 4 opciones',
    color: 'text-blue-400',
    activeColor: 'bg-blue-500/10 border-blue-500/50 text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.2)]',
  },
  {
    id: 'demo',
    label: 'Demostraciones',
    icon: <FlaskConical className="w-4 h-4" />,
    description: 'Guía paso a paso de teoremas',
    color: 'text-emerald-400',
    activeColor: 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)]',
  },
  {
    id: 'teorico',
    label: 'Teórico',
    icon: <BookOpen className="w-4 h-4" />,
    description: 'Repaso conceptual con analogías',
    color: 'text-amber-400',
    activeColor: 'bg-amber-500/10 border-amber-500/50 text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.2)]',
  },
  {
    id: 'formulas',
    label: 'Fórmulas',
    icon: <Sigma className="w-4 h-4" />,
    description: 'Resumen de fórmulas y teoremas',
    color: 'text-[#ec4899]',
    activeColor: 'bg-[#ec4899]/10 border-[#ec4899]/50 text-[#ec4899] shadow-[0_0_15px_rgba(236,72,153,0.2)]',
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
    <div className="flex flex-col gap-2 px-4 py-6 h-full bg-[#030712]">
      {/* Título de la sección */}
      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4 px-1">
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
              w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left text-[13px] font-medium
              border transition-all duration-300
              ${isActive
                ? m.activeColor
                : 'bg-black/40 border-white/5 text-slate-400 hover:bg-white/5 hover:text-white hover:border-white/20'
              }
            `}
          >
            {/* Ícono con el color de cada modo */}
            <span className={isActive ? '' : m.color}>{m.icon}</span>
            <span className="leading-tight tracking-wide">{m.label}</span>
            {/* Punto indicador de modo activo */}
            {isActive && (
              <span className="ml-auto w-1.5 h-1.5 rounded-full bg-current opacity-80 animate-pulse" />
            )}
          </button>
        );
      })}
    </div>
  );
};
