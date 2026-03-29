import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  ArrowLeft, Loader2, CheckCircle2, Circle, ChevronRight, Sparkles, Trophy
} from 'lucide-react';
import { dataService } from '../services/api';
import { MathRenderer } from './MathRenderer';

/**
 * ExerciseList: Lista de ejercicios de un nodo
 * Muestra cada ejercicio con su estado de completado
 */
const ExerciseList = ({
  node,
  topicName,
  subjectName,
  onSelectExercise,
  onBack,
}: {
  node: any;
  topicName: string;
  subjectName: string;
  onSelectExercise: (exerciseId: string) => void;
  onBack: () => void;
}) => {
  const [exercises, setExercises] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dataService.getExercises(node.id).then(e => { setExercises(e); setLoading(false); });
  }, [node.id]);

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-[#030712]">
      <Loader2 className="animate-spin w-8 h-8 text-[#8b5cf6]" />
    </div>
  );

  const completedCount = exercises.filter(e => e.isCompleted).length;
  const totalPoints = exercises.reduce((s, e) => s + (e.isCompleted ? e.earnedPoints : 0), 0);

  return (
    <div className="p-8 max-w-4xl mx-auto bg-[#030712] min-h-screen text-slate-300">
      <button onClick={onBack} className="text-slate-500 hover:text-white mb-6 flex items-center gap-2 transition-colors text-sm">
        <ArrowLeft className="w-4 h-4" /> Volver al Mapa de Ejercicios
      </button>

      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <p className="text-xs text-[#8b5cf6] uppercase font-bold tracking-wider mb-1">
          {subjectName} · {topicName}
        </p>
        <h2 className="text-3xl font-header font-bold text-white mb-2">{node.name}</h2>
        <div className="flex items-center gap-4 mt-3">
          <span className="text-sm text-slate-400">{completedCount}/{exercises.length} completados</span>
          <span className="text-sm text-amber-400 flex items-center gap-1">
            <Trophy className="w-4 h-4" /> {totalPoints} pts
          </span>
        </div>
      </motion.div>

      <div className="space-y-4">
        {exercises.map((ex, i) => (
          <motion.div
            key={ex.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.08 }}
          >
            <div
              className={`bg-dominia-card rounded-[20px] border p-5 cursor-pointer group transition-all duration-300 relative overflow-hidden
                ${ex.isCompleted
                  ? 'border-emerald-500/20 hover:border-emerald-500/40'
                  : 'border-white/5 hover:border-[#8b5cf6]/50 hover:shadow-[0_0_20px_rgba(139,92,246,0.1)]'
                }`}
              onClick={() => onSelectExercise(ex.id)}
            >
              <div className="absolute -top-10 -right-10 w-28 h-28 bg-dominia-gradient opacity-0 group-hover:opacity-10 blur-[40px] rounded-full transition-opacity duration-500 pointer-events-none" />

              <div className="flex items-center gap-4 relative z-10">
                {/* Status icon */}
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  ex.isCompleted
                    ? 'bg-emerald-500/20 text-emerald-400'
                    : 'bg-white/5 text-slate-500 group-hover:text-[#8b5cf6]'
                }`}>
                  {ex.isCompleted
                    ? <CheckCircle2 className="w-5 h-5" />
                    : <Circle className="w-5 h-5" />
                  }
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className={`font-bold text-base ${ex.isCompleted ? 'text-emerald-400' : 'text-white'}`}>
                      {ex.title}
                    </h3>
                    {ex.isCompleted && <Sparkles className="w-3.5 h-3.5 text-emerald-400" />}
                  </div>
                  <p className="text-sm text-slate-500 line-clamp-1 mt-0.5">
                    <MathRenderer text={ex.statement} />
                  </p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className={`text-sm font-bold ${ex.isCompleted ? 'text-emerald-400' : 'text-slate-500'}`}>
                    {ex.isCompleted ? `+${ex.earnedPoints}` : ex.points} pts
                  </span>
                  <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-white group-hover:translate-x-1 transition-all" />
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {exercises.length === 0 && (
        <div className="text-center text-slate-500 py-16 border-2 border-dashed border-white/10 rounded-2xl">
          <Circle className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="text-lg font-header font-semibold text-white mb-1">No hay ejercicios</p>
          <p className="text-sm">Un administrador debe agregar ejercicios a este nodo.</p>
        </div>
      )}
    </div>
  );
};

export default ExerciseList;
