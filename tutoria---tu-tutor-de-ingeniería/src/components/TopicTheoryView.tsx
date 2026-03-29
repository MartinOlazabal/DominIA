import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Loader2, BookOpen } from 'lucide-react';
import { dataService } from '../services/api';
import { MathRenderer } from './MathRenderer';

/**
 * TopicTheoryView: Vista del contenido teórico y tips de un tema
 */
const TopicTheoryView = ({
  topicId,
  onBack,
}: {
  topicId: string;
  onBack: () => void;
}) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dataService.getTopicTheory(topicId).then(d => { setData(d); setLoading(false); });
  }, [topicId]);

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-[#030712]">
      <Loader2 className="animate-spin w-8 h-8 text-[#8b5cf6]" />
    </div>
  );

  return (
    <div className="p-8 max-w-4xl mx-auto bg-[#030712] min-h-screen text-slate-300">
      <button onClick={onBack} className="text-slate-500 hover:text-white mb-6 flex items-center gap-2 transition-colors text-sm">
        <ArrowLeft className="w-4 h-4" /> Volver
      </button>

      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-4 mb-8">
          <div className="w-14 h-14 bg-[#8b5cf6]/20 rounded-2xl flex items-center justify-center border border-[#8b5cf6]/30">
            <BookOpen className="w-7 h-7 text-[#8b5cf6]" />
          </div>
          <div>
            <p className="text-xs text-[#8b5cf6] uppercase font-bold tracking-wider">{data?.subjectName}</p>
            <h2 className="text-3xl font-header font-bold text-white">{data?.topicName} — Teórico Necesario</h2>
          </div>
        </div>
      </motion.div>

      {/* Contenido teórico */}
      {data?.content ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-dominia-card rounded-[24px] border border-white/5 p-8 mb-8 shadow-xl"
        >
          <div className="prose prose-invert max-w-none text-slate-300 leading-relaxed text-[15px]">
            <MathRenderer text={data.content} />
          </div>
        </motion.div>
      ) : (
        <div className="bg-dominia-card rounded-[24px] border border-white/5 p-8 mb-8 text-center">
          <p className="text-slate-500">El contenido teórico aún no ha sido agregado para este tema.</p>
          <p className="text-sm text-slate-600 mt-1">Un administrador puede agregar contenido desde el panel de administración.</p>
        </div>
      )}

      {/* Tips */}
      {data?.tips && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-black/40 backdrop-blur-xl rounded-[24px] border border-amber-500/20 p-8 shadow-xl"
        >
          <h3 className="text-lg font-header font-bold text-amber-400 mb-4 flex items-center gap-2">
            💡 Tips
          </h3>
          <div className="prose prose-invert max-w-none text-slate-300 leading-relaxed text-[15px]">
            <MathRenderer text={data.tips} />
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default TopicTheoryView;
