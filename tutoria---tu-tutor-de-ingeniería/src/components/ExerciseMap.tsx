import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Loader2, Star, Sparkles, ChevronRight, Lock, Unlock } from 'lucide-react';
import { dataService } from '../services/api';

/**
 * ExerciseMap: Sub-mapa de nodos de ejercicios dentro de un tema
 * Muestra nodos de diferente nivel con barras de progreso
 */
const ExerciseMap = ({
  topic,
  subjectName,
  onSelectNode,
  onBack,
}: {
  topic: any;
  subjectName: string;
  onSelectNode: (node: any) => void;
  onBack: () => void;
}) => {
  const [nodes, setNodes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dataService.getExerciseNodes(topic.id).then(n => { setNodes(n); setLoading(false); });
  }, [topic.id]);

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-[#030712]">
      <Loader2 className="animate-spin w-8 h-8 text-[#8b5cf6]" />
    </div>
  );

  const levelColors: Record<number, { bg: string; border: string; text: string; label: string }> = {
    1: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', text: 'text-emerald-400', label: 'Básico' },
    2: { bg: 'bg-amber-500/10', border: 'border-amber-500/30', text: 'text-amber-400', label: 'Intermedio' },
    3: { bg: 'bg-red-500/10', border: 'border-red-500/30', text: 'text-red-400', label: 'Avanzado' },
  };

  return (
    <div className="p-8 max-w-5xl mx-auto bg-[#030712] min-h-screen text-slate-300">
      <button onClick={onBack} className="text-slate-500 hover:text-white mb-6 flex items-center gap-2 transition-colors text-sm">
        <ArrowLeft className="w-4 h-4" /> Volver al Roadmap
      </button>

      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
        <p className="text-xs text-[#8b5cf6] uppercase font-bold tracking-wider mb-1">{subjectName}</p>
        <h2 className="text-3xl font-header font-bold text-white mb-2">{topic.name}</h2>
        <p className="text-slate-400 text-sm">{topic.description || 'Nodos de ejercicios por nivel de dificultad'}</p>
      </motion.div>

      {/* Nodos conectados */}
      <div className="relative">
        {/* SVG connections */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-0" style={{ minHeight: nodes.length * 160 }}>
          {nodes.slice(0, -1).map((_, i) => (
            <line
              key={i}
              x1="50%" y1={80 + i * 160}
              x2="50%" y2={80 + (i + 1) * 160}
              stroke="url(#node-gradient)"
              strokeWidth="2"
              strokeDasharray="6 4"
              opacity="0.2"
            />
          ))}
          <defs>
            <linearGradient id="node-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#ec4899" />
              <stop offset="100%" stopColor="#8b5cf6" />
            </linearGradient>
          </defs>
        </svg>

        <div className="relative z-10 space-y-8">
          {nodes.map((node, i) => {
            const isCompleted = node.progressPercent === 100;
            const hasProgress = node.completedExercises > 0;
            const colors = levelColors[node.level] || levelColors[1];

            return (
              <motion.div
                key={node.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.12 }}
                className="flex justify-center"
              >
                <div
                  className={`w-[480px] bg-dominia-card rounded-[24px] border shadow-xl p-6 cursor-pointer group transition-all duration-300 relative overflow-hidden
                    ${isCompleted
                      ? 'border-emerald-500/30 hover:shadow-[0_0_25px_rgba(52,211,153,0.15)]'
                      : 'border-white/5 hover:border-[#8b5cf6]/50 hover:shadow-[0_0_25px_rgba(139,92,246,0.15)]'
                    }`}
                  onClick={() => onSelectNode(node)}
                >
                  <div className="absolute -top-10 -right-10 w-32 h-32 bg-dominia-gradient opacity-0 group-hover:opacity-10 blur-[40px] rounded-full transition-opacity duration-500 pointer-events-none" />

                  <div className="flex items-center gap-4 mb-4 relative z-10">
                    {/* Icono del nodo */}
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${
                      isCompleted
                        ? 'bg-emerald-500/20 border border-emerald-500/30'
                        : `${colors.bg} border ${colors.border}`
                    }`}>
                      {isCompleted
                        ? <Star className="w-6 h-6 text-emerald-400" />
                        : hasProgress
                          ? <Unlock className={`w-6 h-6 ${colors.text}`} />
                          : <Lock className={`w-6 h-6 ${colors.text}`} />
                      }
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-white text-lg">{node.name}</h3>
                        {isCompleted && <Sparkles className="w-4 h-4 text-emerald-400" />}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className={`text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${colors.bg} ${colors.text} border ${colors.border}`}>
                          {colors.label}
                        </span>
                        <span className="text-xs text-slate-500">{node.totalExercises} ejercicio{node.totalExercises !== 1 ? 's' : ''}</span>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <p className="text-2xl font-bold text-white">{node.progressPercent}%</p>
                      <p className="text-xs text-slate-500">{node.completedExercises}/{node.totalExercises}</p>
                    </div>
                  </div>

                  {/* Barra de progreso */}
                  <div className="h-2.5 bg-[#030712] rounded-full overflow-hidden border border-white/5 relative z-10">
                    <div
                      className={`h-full rounded-full transition-all duration-1000 ease-out ${
                        isCompleted ? 'bg-gradient-to-r from-emerald-400 to-emerald-500' : 'bg-dominia-gradient'
                      }`}
                      style={{ width: `${node.progressPercent}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-end mt-3 relative z-10">
                    <span className="text-xs text-slate-400 font-medium flex items-center gap-1 group-hover:text-white transition-colors">
                      Ver ejercicios <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {nodes.length === 0 && (
        <div className="text-center text-slate-500 py-20 border-2 border-dashed border-white/10 rounded-2xl">
          <Lock className="w-12 h-12 mx-auto mb-4 opacity-30" />
          <p className="text-lg font-header font-semibold text-white mb-1">No hay nodos disponibles</p>
          <p className="text-sm">Un administrador debe crear nodos de ejercicios para este tema.</p>
        </div>
      )}
    </div>
  );
};

export default ExerciseMap;
