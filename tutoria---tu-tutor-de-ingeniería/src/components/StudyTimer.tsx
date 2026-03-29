/**
 * StudyTimer.tsx — Cronómetro de sesión de estudio
 *
 * Comportamiento visual:
 * - EN PAUSA: brillo pulsante sutil (glow) que llama al usuario a darle play
 * - ACTIVO:   tono suave y discreto, sin distraer
 *
 * Sincroniza el tiempo al backend cada 10 segundos.
 */
import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Clock } from 'lucide-react';

interface StudyTimerProps {
  onStateChange?: (isStudying: boolean) => void;
}

export const StudyTimer = ({ onStateChange }: StudyTimerProps) => {
  const [isStudying, setIsStudying] = useState(false);
  const [localSeconds, setLocalSeconds] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const localSecondsRef = useRef(0);
  const pendingSyncSeconds = useRef(0);

  // Obtener tiempo acumulado del día al montar
  useEffect(() => {
    const fetchTodayStats = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        const res = await fetch('/api/user/dashboard', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.studySessions && data.studySessions.length > 0) {
          const today = new Date();
          const localOffset = today.getTimezoneOffset() * 60000;
          const localDate = new Date(today.getTime() - localOffset).toISOString().split('T')[0];
          const todaySession = data.studySessions.find((s: any) => s.date.startsWith(localDate));
          if (todaySession) {
            setLocalSeconds(todaySession.duration);
            localSecondsRef.current = todaySession.duration;
          }
        }
      } catch (err) {
        console.error('Error fetching today study time', err);
      }
    };
    fetchTodayStats();
  }, []);

  const syncStudyTime = async (secondsToSync: number) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      await fetch('/api/study-session/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ seconds: secondsToSync })
      });
    } catch (err) {
      console.error('Error syncing study time', err);
    }
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isStudying) {
      setIsPaused(false);
      interval = setInterval(() => {
        setLocalSeconds(prev => {
          const newVal = prev + 1;
          localSecondsRef.current = newVal;
          return newVal;
        });
        pendingSyncSeconds.current += 1;

        if (pendingSyncSeconds.current >= 10) {
          syncStudyTime(pendingSyncSeconds.current);
          pendingSyncSeconds.current = 0;
        }
      }, 1000);
    } else {
      if (localSecondsRef.current > 0) {
        setIsPaused(true);
      }
    }

    return () => {
      clearInterval(interval);
      if (pendingSyncSeconds.current > 0) {
        syncStudyTime(pendingSyncSeconds.current);
        pendingSyncSeconds.current = 0;
      }
    };
  }, [isStudying]);

  // Reset a medianoche
  useEffect(() => {
    const now = new Date();
    const msUntilMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0).getTime() - now.getTime();
    const timeout = setTimeout(() => {
      setLocalSeconds(0);
      localSecondsRef.current = 0;
    }, msUntilMidnight);
    return () => clearTimeout(timeout);
  }, []);

  const toggleTimer = () => {
    const newState = !isStudying;
    setIsStudying(newState);
    if (onStateChange) onStateChange(newState);
  };

  const formatTime = (totalSecs: number) => {
    const hours = Math.floor(totalSecs / 3600);
    const minutes = Math.floor((totalSecs % 3600) / 60);
    const seconds = totalSecs % 60;
    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex items-center gap-3">
      {/* Banner pulsante cuando está pausado */}
      {isPaused && (
        <div className="hidden sm:flex items-center gap-2 text-xs text-amber-400 bg-amber-400/10 border border-amber-400/20 px-3 py-1.5 rounded-full shadow-[0_0_15px_rgba(251,191,36,0.25)] animate-[glow-pulse_2s_ease-in-out_infinite]">
          <Clock className="w-4 h-4" />
          <span className="font-semibold">Dale Play para seguir</span>
        </div>
      )}

      {/* Timer container */}
      <div
        className={`flex items-center gap-3 px-4 py-2 rounded-full border transition-all duration-500
          ${isStudying
            ? 'bg-[#111827]/80 border-emerald-500/20 shadow-[0_0_10px_rgba(52,211,153,0.1)]'
            : isPaused
              ? 'bg-[#111827] border-amber-500/30 shadow-[0_0_20px_rgba(251,191,36,0.15)] animate-[glow-pulse_2s_ease-in-out_infinite]'
              : 'bg-[#111827] border-white/10 opacity-80'
          }`}
      >
        <button
          onClick={toggleTimer}
          className={`flex items-center justify-center w-8 h-8 rounded-full transition-all duration-300 hover:scale-110
            ${isStudying
              ? 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30'
              : isPaused
                ? 'bg-dominia-gradient text-white shadow-[0_0_15px_rgba(236,72,153,0.5)] animate-[glow-pulse_2s_ease-in-out_infinite]'
                : 'bg-dominia-gradient text-white hover:shadow-[0_0_15px_rgba(236,72,153,0.5)]'
            }`}
        >
          {isStudying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 ml-0.5 fill-current" />}
        </button>

        <div className="flex flex-col">
          <span className={`text-[10px] font-bold uppercase tracking-wider transition-colors ${
            isStudying ? 'text-emerald-400' : isPaused ? 'text-amber-400' : 'text-slate-500'
          }`}>
            {isStudying ? 'Estudiando' : isPaused ? 'Pausado' : 'IDLE'}
          </span>
          <span className={`text-sm font-mono font-bold leading-none transition-colors ${
            isStudying ? 'text-white' : isPaused ? 'text-amber-300' : 'text-slate-300'
          }`}>
            {formatTime(localSeconds)}
          </span>
        </div>
      </div>
    </div>
  );
};
