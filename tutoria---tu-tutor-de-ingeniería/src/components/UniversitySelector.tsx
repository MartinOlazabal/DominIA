import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { GraduationCap, ChevronRight, Loader2, MapPin } from 'lucide-react';
import { dataService } from '../services/api';

/**
 * UniversitySelector: Muestra las universidades disponibles
 * El usuario elige una universidad para ver sus materias
 */
const UniversitySelector = ({ onSelect }: { onSelect: (university: any) => void }) => {
  const [universities, setUniversities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dataService.getUniversities().then(u => { setUniversities(u); setLoading(false); });
  }, []);

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-[#030712]">
      <Loader2 className="animate-spin w-8 h-8 text-[#8b5cf6]" />
    </div>
  );

  return (
    <div className="p-8 max-w-5xl mx-auto bg-[#030712] min-h-screen text-slate-300">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h2 className="text-4xl font-header font-bold text-white mb-2">Universidades</h2>
        <p className="text-slate-400 mb-10">Selecciona tu universidad para ver los cursos disponibles</p>
      </motion.div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {universities.map((u, i) => (
          <motion.div
            key={u.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <div
              className="bg-dominia-card rounded-[24px] border border-white/5 shadow-xl p-6 hover:border-[#8b5cf6]/50 transition-all duration-300 cursor-pointer group hover:shadow-[0_0_30px_rgba(139,92,246,0.15)]"
              onClick={() => onSelect(u)}
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 bg-dominia-gradient rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(236,72,153,0.3)] group-hover:shadow-[0_0_30px_rgba(139,92,246,0.5)] transition-all duration-500">
                  <GraduationCap className="text-white w-7 h-7" />
                </div>
                <div>
                  <h4 className="font-bold text-lg text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-dominia-gradient transition-all">{u.name}</h4>
                  <p className="text-sm text-slate-500 flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {u.subjectCount} materia{u.subjectCount !== 1 ? 's' : ''} disponible{u.subjectCount !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>

              <button className="w-full px-6 py-2.5 rounded-full font-medium transition-all duration-300 flex items-center justify-center gap-2 bg-[#111827] text-white border border-white/10 hover:bg-white/5 group-hover:border-[#ec4899]/30">
                Explorar Cursos <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </motion.div>
        ))}

        {/* Placeholder para futuras universidades */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: universities.length * 0.1 }}
        >
          <div className="rounded-[24px] border-dashed border-2 border-white/10 bg-transparent flex flex-col items-center justify-center text-slate-500 hover:text-white hover:border-white/30 transition-all min-h-[200px] p-6">
            <GraduationCap className="w-8 h-8 mb-2 opacity-30" />
            <p className="font-medium text-sm">Próximamente más universidades</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default UniversitySelector;
