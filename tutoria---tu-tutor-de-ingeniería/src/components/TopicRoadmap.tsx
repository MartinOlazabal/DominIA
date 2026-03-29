import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  ArrowLeft, Loader2, BookOpen, Zap, Target, Repeat, Activity, Link, Sigma,
  ChevronRight, Trophy, Star, Sparkles, Lock, Check, Crown,
  TrendingUp, Compass
} from 'lucide-react';
import { dataService } from '../services/api';

const getTopicIcon = (name: string, fallbackIcon?: string) => {
  const n = (name || '').toLowerCase();
  if (n.includes('función') || n.includes('funciones')) return <Activity className="w-8 h-8 md:w-10 md:h-10" />;
  if (n.includes('límite') || n.includes('limite')) return <Target className="w-8 h-8 md:w-10 md:h-10" />;
  if (n.includes('continuidad')) return <Link className="w-8 h-8 md:w-10 md:h-10" />;
  if (n.includes('derivada')) return <Zap className="w-8 h-8 md:w-10 md:h-10" />;
  if (n.includes('aplicacion') || n.includes('aplicación')) return <TrendingUp className="w-8 h-8 md:w-10 md:h-10" />;
  if (n.includes('integral')) return <Sigma className="w-8 h-8 md:w-10 md:h-10" />;
  if (n.includes('geometría') || n.includes('vector')) return <Compass className="w-8 h-8 md:w-10 md:h-10" />;
  return <BookOpen className="w-8 h-8 md:w-10 md:h-10" />;
};

const wobble = [0, -45, -80, -45, 0, 45, 80, 45];

const TopicRoadmap = ({
  subject,
  onSelectTopic,
  onSelectTheory,
  onBack,
}: {
  subject: any;
  onSelectTopic: (topic: any) => void;
  onSelectTheory: (topic: any) => void;
  onBack: () => void;
}) => {
  const [topics, setTopics] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dataService.getTopics(subject.id).then(t => { setTopics(t); setLoading(false); });
  }, [subject.id]);

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-[#030712] relative overflow-hidden">
      <Loader2 className="animate-spin w-12 h-12 text-[#8b5cf6]" />
    </div>
  );

  const totalPoints = topics.reduce((s, t) => s + t.earnedPoints, 0);
  
  // Logic states
  let foundCurrent = false;
  const processedTopics = topics.map(topic => {
    const isCompleted = topic.progressPercent === 100;
    let state = 'locked';
    if (isCompleted) {
      state = 'completed';
    } else if (!foundCurrent) {
      state = 'current';
      foundCurrent = true;
    }
    return { ...topic, state };
  });

  return (
    <div className="relative pt-8 pb-32 px-4 max-w-2xl mx-auto min-h-screen text-slate-300 font-sans selection:bg-pink-500/30 overflow-hidden">
      
      {/* Background blobs que coinciden con la landing */}
      <div className="fixed top-[-20%] left-[-10%] w-[50%] h-[50%] bg-[#ec4899] opacity-15 blur-[120px] rounded-full pointer-events-none z-0" />
      <div className="fixed bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-[#8b5cf6] opacity-15 blur-[120px] rounded-full pointer-events-none z-0" />

      {/* Navbar super clean */}
      <div className="relative flex items-center justify-between mb-8 sticky top-4 z-50 bg-[#030712]/80 backdrop-blur-md p-4 rounded-3xl border border-white/5 shadow-2xl">
        <button onClick={onBack} className="text-slate-400 hover:text-white flex items-center gap-2 transition-colors font-bold uppercase tracking-wider text-xs bg-white/5 hover:bg-white/10 px-4 py-3 rounded-2xl">
          <ArrowLeft className="w-5 h-5" />
          <span className="hidden sm:inline">Cursos</span>
        </button>
        <h2 className="text-lg sm:text-xl font-black text-white px-4 text-center truncate max-w-[200px] sm:max-w-xs">{subject.name}</h2>
        <div className="flex items-center gap-2 text-amber-400 font-bold bg-amber-400/10 px-4 py-2 rounded-2xl border border-amber-400/20">
          <Crown className="w-5 h-5 fill-amber-400" />
          <span className="text-lg">{totalPoints}</span>
        </div>
      </div>

      <div className="relative flex flex-col items-center mt-16 pt-8">
        {processedTopics.map((topic, i) => {
          const xOffset = wobble[i % wobble.length];
          const nextOffset = i < processedTopics.length - 1 ? wobble[(i + 1) % wobble.length] : 0;
          
          const isCurrent = topic.state === 'current';
          const isCompleted = topic.state === 'completed';
          const isLocked = topic.state === 'locked';

          // Estilos Duolingo full
          const btnClass = isCompleted 
            ? 'bg-emerald-500 shadow-[0_8px_0_#059669] active:shadow-[0_0px_0_#059669]' 
            : isCurrent
              ? 'bg-[#8b5cf6] shadow-[0_8px_0_#5b21b6] active:shadow-[0_0px_0_#5b21b6]'
              : 'bg-[#374151] shadow-[0_8px_0_#1f2937]';
          
          const iconColor = isLocked ? 'text-slate-400' : 'text-white';

          return (
             <div key={topic.id} className="relative z-10 flex flex-col items-center" style={{ transform: `translateX(${xOffset}px)`, height: '220px' }}>
               
               {/* Conexión al próximo nodo */}
               <svg 
                  className="absolute left-1/2 overflow-visible z-[-1]" 
                  style={{ top: '48px', width: 0, height: 220 }}
               >
                 {i < processedTopics.length - 1 && (
                   <>
                     <path 
                        d={`M 0 0 C 0 110, ${nextOffset - xOffset} 110, ${nextOffset - xOffset} 220`}
                        fill="none"
                        stroke={isCompleted ? "#10b981" : "#1f2937"} 
                        strokeWidth="38" 
                        strokeLinecap="round"
                        className="transition-all duration-700 delay-300"
                     />
                     <path 
                        d={`M 0 0 C 0 110, ${nextOffset - xOffset} 110, ${nextOffset - xOffset} 220`}
                        fill="none"
                        stroke={isCompleted ? "#34d399" : "#374151"} 
                        strokeWidth="18" 
                        strokeLinecap="round"
                        className="transition-all duration-700 delay-300 opacity-80"
                     />
                   </>
                 )}
               </svg>

               {/* Hint Tooltip si está actual */}
               {isCurrent && (
                 <motion.div 
                   animate={{ y: [0, -8, 0] }} 
                   transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
                   className="absolute -top-14 bg-white text-[#8b5cf6] font-black uppercase tracking-wider text-xs py-2 px-4 rounded-xl shadow-[0_4px_0_#cbd5e1] border-2 border-slate-200 z-20 whitespace-nowrap"
                 >
                   ¡Aprender!
                   <div className="absolute -bottom-[7px] left-1/2 -translate-x-1/2 w-3 h-3 bg-white rotate-45 border-b-2 border-r-2 border-slate-200"></div>
                 </motion.div>
               )}

               {/* Botón Principal (Nodo) */}
               <div className={`relative cursor-pointer hover:scale-105 transition-transform`}>
               
                 {/* Anillo de progreso para current - colocado DETRAS del botón para evitar z-index issues */}
                 {isCurrent && (
                    <div className="absolute -inset-[18px] pointer-events-none z-0">
                      <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="46" fill="transparent" stroke="#1f2937" strokeWidth="8" />
                        <motion.circle 
                          cx="50" cy="50" r="46" 
                          fill="transparent" 
                          stroke="#ec4899" 
                          strokeWidth="8" 
                          strokeLinecap="round" 
                          strokeDasharray={`${(topic.progressPercent || 5) * 2.89} 289`}
                        />
                      </svg>
                    </div>
                 )}

                 <motion.button 
                   whileHover={{ scale: 1.05 }}
                   whileTap={{ scale: 0.95, y: 8 }}
                   onClick={() => onSelectTopic(topic)}
                   className={`relative z-10 w-24 h-24 md:w-28 md:h-28 rounded-full flex items-center justify-center ${btnClass} border-[3px] md:border-4 ${isLocked ? 'border-[#4b5563]' : 'border-white/20'} transition-all duration-200`}
                   style={{ transitionProperty: 'transform, filter' }} 
                 >
                   {/* Iconos del nodo */}
                   <div className={`${iconColor}`}>
                     {isCompleted 
                       ? <Star className="w-10 h-10 md:w-12 md:h-12 fill-white text-white" /> 
                       : getTopicIcon(topic.name, topic.icon)}
                   </div>

                   {/* Corona pop up cuando es completed */}
                   {isCompleted && (
                     <motion.div 
                       initial={{ scale: 0, rotate: -45 }}
                       animate={{ scale: 1, rotate: 15 }}
                       transition={{ type: 'spring', delay: 0.2 }}
                       className="absolute -top-3 -right-3 md:-top-4 md:-right-4 bg-amber-400 p-2 rounded-full border-[3px] border-[#030712] text-amber-900 z-10 shadow-lg"
                     >
                       <Crown className="w-5 h-5 fill-amber-900" />
                     </motion.div>
                   )}
                 </motion.button>
               </div>

               {/* Título de la unidad */}
               <div className="mt-6 md:mt-8 text-center w-40 drop-shadow-md z-10">
                 <h3 className={`font-black text-[16px] md:text-lg leading-tight tracking-wide ${isLocked ? 'text-slate-500' : isCompleted ? 'text-emerald-400' : 'text-white'}`}>
                   {topic.name}
                 </h3>
                 {!isLocked && (
                   <div className="flex items-center justify-center gap-2 mt-1 opacity-80">
                     <span className="text-[11px] md:text-xs text-white/70 font-bold bg-white/10 px-2.5 py-1 rounded-md border border-white/5">{topic.completedExercises}/{topic.totalExercises}</span>
                   </div>
                 )}
               </div>

             </div>
          )
        })}

        {/* Cofre/Libro Especial: Teórico Necesario al final de todo */}
        {topics.length > 0 && (
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="relative z-10 flex flex-col items-center mt-12 mb-20" 
              style={{ transform: `translateX(0px)` }}
            >
               {/* Conexión desde el último nodo, dibujada hacia arriba */}
               <svg 
                  className="absolute left-1/2 overflow-visible z-[-1]" 
                  style={{ top: '-110px', width: 0, height: 110 }}
               >
                 <path 
                    d={`M ${wobble[(processedTopics.length - 1) % wobble.length]} -110 C ${wobble[(processedTopics.length - 1) % wobble.length]} -55, 0 -55, 0 0`}
                    fill="none"
                    stroke="#1f2937" 
                    strokeWidth="38" 
                    strokeLinecap="round"
                 />
                 <path 
                    d={`M ${wobble[(processedTopics.length - 1) % wobble.length]} -110 C ${wobble[(processedTopics.length - 1) % wobble.length]} -55, 0 -55, 0 0`}
                    fill="none"
                    stroke="#374151" 
                    strokeWidth="18" 
                    strokeLinecap="round"
                 />
               </svg>

               <motion.button 
                 whileHover={{ scale: 1.05 }}
                 whileTap={{ scale: 0.95, y: 8, boxShadow: '0 0px 0 #b45309' }}
                 onClick={() => {
                   const topicWithTheory = topics.find((t: any) => t.hasTheory);
                   if (topicWithTheory) onSelectTheory(topicWithTheory);
                 }}
                 className="relative w-28 h-28 md:w-32 md:h-32 rounded-[2rem] flex items-center justify-center bg-gradient-to-b from-amber-300 to-amber-500 shadow-[0_8px_0_#b45309] active:shadow-[0_0px_0_#b45309] border-[4px] border-amber-100 cursor-pointer transition-all duration-200 group"
                 style={{ transitionProperty: 'transform' }}
               >
                 {/* Destellos ✨ */}
                 <Sparkles className="absolute -top-4 -right-2 w-7 h-7 text-amber-300 animate-pulse" />
                 <Sparkles className="absolute -bottom-2 -left-3 w-6 h-6 text-amber-400 animate-pulse delay-300" />
                 
                 <BookOpen className="w-14 h-14 md:w-16 md:h-16 text-amber-900 group-hover:scale-110 transition-transform" />
               </motion.button>

               {/* Título de Cofre */}
               <div className="mt-8 text-center bg-white/5 border border-white/10 px-5 py-2.5 rounded-2xl backdrop-blur-md shadow-xl border-t-white/20">
                 <h3 className="font-black text-[15px] md:text-[17px] uppercase tracking-wider text-amber-400">
                   Teórico Esencial
                 </h3>
                 <p className="text-xs md:text-sm text-slate-400 font-medium mt-1">Repasa todos los conceptos</p>
               </div>
            </motion.div>
        )}
      </div>
    </div>
  );
};

export default TopicRoadmap;
