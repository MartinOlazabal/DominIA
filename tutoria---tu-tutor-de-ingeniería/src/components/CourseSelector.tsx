import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { BookOpen, ChevronRight, Loader2, ArrowLeft } from 'lucide-react';
import { dataService } from '../services/api';

/**
 * CourseSelector: Muestra las materias de una universidad
 */
const CourseSelector = ({
  university,
  onSelect,
  onBack
}: {
  university: any;
  onSelect: (subject: any) => void;
  onBack: () => void;
}) => {
  const [subjects, setSubjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dataService.getSubjectsByUniversity(university.id).then(s => { setSubjects(s); setLoading(false); });
  }, [university.id]);

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-[#030712]">
      <Loader2 className="animate-spin w-8 h-8 text-[#8b5cf6]" />
    </div>
  );

  return (
    <div className="p-8 max-w-5xl mx-auto bg-[#030712] min-h-screen text-slate-300">
      <button onClick={onBack} className="text-slate-500 hover:text-white mb-6 flex items-center gap-2 transition-colors text-sm">
        <ArrowLeft className="w-4 h-4" /> Volver a Universidades
      </button>

      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-dominia-gradient rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(139,92,246,0.3)]">
            <BookOpen className="text-white w-5 h-5" />
          </div>
          <h2 className="text-4xl font-header font-bold text-white">{university.name}</h2>
        </div>
        <p className="text-slate-400 mb-10 ml-[52px]">Selecciona un curso para comenzar a estudiar</p>
      </motion.div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {subjects.map((s, i) => (
          <motion.div
            key={s.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
          >
            <div
              className="bg-dominia-card rounded-[24px] border border-white/5 shadow-xl p-6 hover:border-[#8b5cf6]/50 transition-all duration-300 cursor-pointer group hover:shadow-[0_0_20px_rgba(139,92,246,0.15)] relative overflow-hidden"
              onClick={() => onSelect(s)}
            >
              {/* Decoration glow */}
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-dominia-gradient opacity-0 group-hover:opacity-10 blur-[40px] rounded-full transition-opacity duration-500 pointer-events-none" />

              <div className="flex items-center gap-4 mb-4 relative z-10">
                <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center group-hover:bg-dominia-gradient transition-all duration-300">
                  <BookOpen className="text-slate-400 group-hover:text-white w-6 h-6 transition-colors" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-base text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-dominia-gradient transition-all leading-tight">{s.name}</h4>
                </div>
              </div>

              <p className="text-sm text-slate-400 mb-6 line-clamp-2 relative z-10">{s.description}</p>

              {s.price > 0 && (
                <div className="mb-4 relative z-10">
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-full">
                    ${s.price} USD
                  </span>
                </div>
              )}

              <button className="w-full px-6 py-2.5 rounded-full font-medium transition-all duration-300 flex items-center justify-center gap-2 bg-[#111827] text-white border border-white/10 hover:bg-white/5 group-hover:border-[#ec4899]/30 relative z-10">
                Entrar al Curso <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default CourseSelector;
