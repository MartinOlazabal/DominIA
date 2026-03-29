import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import {
  ArrowLeft, Loader2, Send, BrainCircuit, CheckCircle2,
  Sparkles, MessageSquare, ChevronRight, PartyPopper
} from 'lucide-react';
import { dataService } from '../services/api';
import { MathRenderer } from './MathRenderer';

/**
 * ExerciseView: Vista de un ejercicio específico con chat IA lateral
 * Layout: izquierda = planteamiento + intro + casilla "resuelto"
 *         derecha   = chat IA con sugerencias de prompts
 */
const ExerciseView = ({
  exerciseId,
  onBack,
  onComplete,
}: {
  exerciseId: string;
  onBack: () => void;
  onComplete: () => void;
}) => {
  const [exercise, setExercise] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    dataService.getExercise(exerciseId).then(ex => {
      setExercise(ex);
      setCompleted(ex.isCompleted);
      setLoading(false);
      // Mensaje introductorio del tutor
      setMessages([{
        role: 'assistant',
        content: `¡Hola! 👋 Soy tu tutor para este ejercicio: **${ex.title}**\n\nLeé el planteamiento a la izquierda y cuando estés listo, preguntame lo que necesites. ¡Estoy acá para guiarte paso a paso!`,
        isWelcome: true,
      }]);
    });
  }, [exerciseId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, chatLoading]);

  const handleSend = async (text?: string) => {
    const messageToSend = text || input;
    if (!messageToSend.trim() || chatLoading) return;

    setMessages(prev => [...prev, { role: 'user', content: messageToSend }]);
    setInput('');
    setChatLoading(true);

    try {
      const res = await dataService.sendExerciseChat(exerciseId, messageToSend);
      setMessages(prev => [...prev, { role: 'assistant', content: res.text }]);
    } catch (err: any) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `⚠️ Error: ${err.message || 'No se pudo conectar con el tutor.'}`,
        isError: true,
      }]);
    } finally {
      setChatLoading(false);
    }
  };

  const handleComplete = async () => {
    if (completed) return;
    try {
      await dataService.completeExercise(exerciseId);
      setCompleted(true);
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
      onComplete();
    } catch (err) {
      console.error('Error completing exercise:', err);
    }
  };

  if (loading || !exercise) return (
    <div className="h-screen flex items-center justify-center bg-[#030712]">
      <Loader2 className="animate-spin w-8 h-8 text-[#8b5cf6]" />
    </div>
  );

  const hints: string[] = exercise.hints || [];

  return (
    <div className="h-screen flex flex-col bg-[#030712] text-slate-300">
      {/* Header */}
      <header className="bg-black/60 backdrop-blur-md border-b border-white/10 px-6 py-3 flex justify-between items-center z-10 shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <p className="text-xs text-[#8b5cf6] font-bold uppercase tracking-wider">
              {exercise.subjectName} · {exercise.topicName} · {exercise.nodeName}
            </p>
            <h3 className="font-header font-bold text-white text-sm">{exercise.title}</h3>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-full border border-white/5">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse shadow-[0_0_8px_rgba(74,222,128,0.6)]" />
            <span className="text-xs font-semibold text-slate-400 tracking-wide uppercase">Tutor Online</span>
          </div>
        </div>
      </header>

      {/* Main content: two columns */}
      <div className="flex flex-1 overflow-hidden">
        {/* LEFT: Exercise content */}
        <div className="w-1/2 border-r border-white/10 overflow-y-auto p-6 space-y-6 scrollbar-hide">
          {/* Introduction */}
          {exercise.introduction && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-[#8b5cf6]/5 border border-[#8b5cf6]/20 rounded-2xl p-5"
            >
              <h4 className="text-sm font-bold text-[#8b5cf6] uppercase tracking-wider mb-2">📖 Introducción</h4>
              <div className="text-sm text-slate-300 leading-relaxed">
                <MathRenderer text={exercise.introduction} />
              </div>
            </motion.div>
          )}

          {/* Statement */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-dominia-card rounded-2xl border border-white/10 p-6"
          >
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">📝 Planteamiento</h4>
            <div className="text-lg text-white leading-relaxed">
              <MathRenderer text={exercise.statement} />
            </div>
          </motion.div>

          {/* Incentive to try */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-black/40 rounded-2xl border border-white/5 p-5 text-center"
          >
            <p className="text-slate-400 text-sm mb-1">
              💪 Intentá resolverlo por tu cuenta primero.
            </p>
            <p className="text-slate-500 text-xs">
              Si necesitás ayuda, usa las sugerencias del chat o escribí una pregunta.
            </p>
          </motion.div>

          {/* Complete button */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            {completed ? (
              <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-6 text-center">
                <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-2" />
                <h4 className="font-bold text-emerald-400 text-lg">¡Ejercicio Completado!</h4>
                <p className="text-sm text-emerald-400/70 mt-1">+{exercise.points} puntos ganados</p>
              </div>
            ) : (
              <button
                onClick={handleComplete}
                className="w-full py-5 rounded-2xl font-bold text-lg transition-all duration-300 relative overflow-hidden group
                  bg-dominia-gradient text-white shadow-[0_0_30px_rgba(236,72,153,0.3)] hover:shadow-[0_0_50px_rgba(139,92,246,0.5)]"
              >
                <span className="relative z-10 flex items-center justify-center gap-3">
                  <CheckCircle2 className="w-6 h-6" />
                  ¡Ejercicio Resuelto! — Ganar {exercise.points} pts
                  <Sparkles className="w-5 h-5 animate-pulse" />
                </span>
                {/* Shine effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              </button>
            )}
          </motion.div>

          {/* Confetti effect */}
          {showConfetti && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none"
            >
              <div className="text-6xl animate-bounce">
                <PartyPopper className="w-24 h-24 text-amber-400" />
              </div>
            </motion.div>
          )}
        </div>

        {/* RIGHT: Chat panel */}
        <div className="w-1/2 flex flex-col bg-[#030712]">
          {/* Chat header */}
          <div className="px-5 py-3 border-b border-white/5 flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-[#8b5cf6]" />
            <span className="text-sm font-bold text-white">Chat con Tutor IA</span>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {m.role === 'assistant' && (
                  <div className="w-7 h-7 bg-dominia-gradient rounded-full flex items-center justify-center mr-2 shrink-0 mt-1 shadow-[0_0_10px_rgba(139,92,246,0.3)] border border-white/20">
                    <BrainCircuit className="text-white w-3.5 h-3.5" />
                  </div>
                )}
                <div className={`max-w-[85%] p-4 rounded-[20px] shadow-sm text-[14px] leading-relaxed ${m.role === 'user'
                  ? 'bg-dominia-gradient text-white !rounded-tr-sm shadow-[0_5px_15px_rgba(236,72,153,0.2)]'
                  : m.isError
                    ? 'bg-red-500/10 border border-red-500/20 text-red-400 !rounded-tl-sm'
                    : 'bg-[#111827] border border-white/10 text-slate-300 !rounded-tl-sm'
                }`}>
                  <div className="whitespace-pre-wrap"><MathRenderer text={m.content} /></div>
                </div>
              </div>
            ))}

            {chatLoading && (
              <div className="flex justify-start">
                <div className="w-7 h-7 bg-dominia-gradient rounded-full flex items-center justify-center mr-2 shrink-0 mt-1 shadow-[0_0_10px_rgba(139,92,246,0.3)] border border-white/20">
                  <BrainCircuit className="text-white w-3.5 h-3.5" />
                </div>
                <div className="bg-[#111827] border border-white/10 px-4 py-3 rounded-[20px] !rounded-tl-sm flex gap-1.5 items-center">
                  <div className="w-2 h-2 bg-[#ec4899] rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-[#d946ef] rounded-full animate-bounce [animation-delay:100ms]" />
                  <div className="w-2 h-2 bg-[#8b5cf6] rounded-full animate-bounce [animation-delay:200ms]" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Prompt suggestions */}
          {hints.length > 0 && messages.length <= 2 && (
            <div className="px-4 pb-2 flex flex-wrap gap-2">
              {hints.map((hint, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(hint)}
                  className="px-3 py-1.5 rounded-full text-xs font-medium bg-white/5 border border-white/10 text-slate-400 hover:bg-[#8b5cf6]/10 hover:border-[#8b5cf6]/30 hover:text-white transition-all"
                >
                  {hint}
                </button>
              ))}
            </div>
          )}

          {/* Chat input */}
          <div className="p-4 border-t border-white/5">
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-dominia-gradient rounded-[20px] opacity-0 group-focus-within:opacity-20 transition duration-500 blur" />
              <textarea
                rows={1}
                placeholder="Preguntale al tutor..."
                className="w-full pl-5 pr-14 py-3 bg-[#111827] relative z-10 rounded-[18px] border border-white/10 focus:border-[#8b5cf6]/50 text-white outline-none resize-none text-sm shadow-lg transition-all placeholder:text-slate-500"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
              />
              <button
                onClick={() => handleSend()}
                disabled={!input.trim() || chatLoading}
                className="absolute right-2 top-1/2 -translate-y-1/2 z-20 w-9 h-9 flex items-center justify-center bg-dominia-gradient text-white rounded-full hover:shadow-[0_0_15px_rgba(139,92,246,0.5)] disabled:opacity-40 disabled:grayscale transition-all"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExerciseView;
