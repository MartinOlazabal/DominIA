import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  BookOpen,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  ChevronRight,
  BrainCircuit,
  TrendingUp,
  Menu,
  Loader2,
  Plus,
  Trophy,
  BarChart2,
  Clock,
  Settings,
  AlertCircle,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { authService, dataService } from './services/api';
import UniversitySelector from './components/UniversitySelector';
import CourseSelector from './components/CourseSelector';
import TopicRoadmap from './components/TopicRoadmap';
import TopicTheoryView from './components/TopicTheoryView';
import ExerciseMap from './components/ExerciseMap';
import ExerciseList from './components/ExerciseList';
import ExerciseView from './components/ExerciseView';
import { StudyTimer } from './components/StudyTimer';

// --- UI Components ---

const Button = ({ children, onClick, variant = 'primary', className = '', loading = false, disabled = false }: any) => {
  const base = "px-6 py-2.5 rounded-full font-medium transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50";
  const variants: any = {
    primary: "bg-dominia-gradient text-white hover:opacity-90 shadow-[0_0_20px_rgba(236,72,153,0.3)] hover:shadow-[0_0_30px_rgba(139,92,246,0.5)]",
    secondary: "bg-[#111827] text-white border border-white/10 hover:bg-white/5",
    ghost: "bg-transparent text-slate-300 hover:bg-white/5",
    danger: "bg-red-500/10 text-red-400 hover:bg-red-500/20"
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={`${base} ${variants[variant]} ${className}`}
    >
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : children}
    </button>
  );
};

const Card = ({ children, className = '', ...props }: any) => (
  <div className={`bg-dominia-card rounded-[24px] border border-white/5 shadow-xl p-6 ${className}`} {...props}>
    {children}
  </div>
);

const NavBtn = ({ onClick, active, icon, label, danger = false }: any) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left font-medium transition-all text-sm
      ${danger
        ? 'text-slate-400 hover:text-red-400 hover:bg-red-500/10'
        : active
          ? 'bg-white/10 text-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] border border-white/5'
          : 'text-slate-400 hover:bg-white/5 hover:text-white'
      }`}
  >
    {icon}
    {label}
  </button>
);

// --- Landing Page ---

const Landing = ({ onStart }: any) => (
  <div className="min-h-screen bg-[#030712] relative overflow-hidden">
    <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-[#ec4899] opacity-20 blur-[120px] rounded-full pointer-events-none" />
    <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-[#8b5cf6] opacity-20 blur-[120px] rounded-full pointer-events-none" />

    <nav className="max-w-7xl mx-auto px-6 py-6 flex justify-between items-center relative z-10">
      <div className="flex items-center gap-2">
        <div className="w-10 h-10 bg-dominia-gradient rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(236,72,153,0.5)]">
          <BrainCircuit className="text-white w-5 h-5" />
        </div>
        <span className="text-xl font-header font-bold text-white tracking-tight">TutorIA</span>
      </div>
      <div className="flex gap-4">
        <Button variant="ghost" onClick={() => onStart('login')}>Iniciar Sesión</Button>
        <Button onClick={() => onStart('register')}>Empezar Gratis</Button>
      </div>
    </nav>

    <main className="max-w-7xl mx-auto px-6 pt-20 pb-32 grid lg:grid-cols-2 gap-16 items-center relative z-10">
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
        <span className="inline-block px-4 py-1.5 bg-white/5 border border-white/10 text-slate-300 rounded-full text-sm font-semibold mb-6 backdrop-blur-sm">
          Especializado en FING, Udelar
        </span>
        <h1 className="text-5xl lg:text-7xl font-header font-bold text-white leading-[1.1] mb-8">
          Domina tus exámenes de <br />
          <span className="text-dominia-gradient">Ingeniería</span> con IA.
        </h1>
        <p className="text-xl text-slate-400 mb-10 leading-relaxed font-sans">
          Tu tutor personal disponible 24/7. Ejercicios interactivos, roadmaps de estudio y asistencia IA personalizada por ejercicio.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <Button className="px-8 py-4 text-lg w-full sm:w-auto" onClick={() => onStart('register')}>Comenzar Prueba de 7 Días</Button>
          <Button variant="secondary" className="px-8 py-4 text-lg w-full sm:w-auto">Ver Cursos</Button>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="relative">
        <div className="absolute -inset-4 bg-dominia-gradient opacity-20 blur-2xl rounded-full" />
        <Card className="relative overflow-hidden bg-black/40 backdrop-blur-xl border border-white/10">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/5">
            <div className="w-3 h-3 rounded-full bg-red-500/80" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
            <div className="w-3 h-3 rounded-full bg-green-500/80" />
            <span className="text-xs font-mono text-slate-400 ml-2">Tutor Virtual - Cálculo 1</span>
          </div>
          <div className="space-y-4">
            <div className="bg-white/5 border border-white/5 p-4 rounded-2xl max-w-[80%] text-slate-300">
              <p className="text-sm">¿Cómo puedo resolver este límite por L'Hôpital?</p>
            </div>
            <div className="bg-dominia-gradient p-4 rounded-2xl text-white ml-auto max-w-[80%] shadow-[0_10px_30px_rgba(236,72,153,0.3)]">
              <p className="text-sm font-medium">¡Claro! Primero verificá que tengas forma 0/0 o ∞/∞. Derivá numerador y denominador por separado...</p>
            </div>
          </div>
        </Card>
      </motion.div>
    </main>
  </div>
);

// --- Auth ---

const Auth = ({ mode, onBack, onSuccess }: any) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (mode === 'login') {
        await authService.login(email, password);
      } else {
        await authService.register(email, password, name);
        await authService.login(email, password);
      }
      onSuccess();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#030712] px-6 relative overflow-hidden">
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#ec4899] opacity-10 blur-[100px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#8b5cf6] opacity-10 blur-[100px] rounded-full pointer-events-none" />

      <Card className="w-full max-w-md p-8 relative z-10 bg-black/60 backdrop-blur-xl border-white/10">
        <button onClick={onBack} className="text-slate-400 hover:text-white mb-6 flex items-center gap-2 text-sm transition-colors">
          <ChevronRight className="rotate-180 w-4 h-4" /> Volver
        </button>
        <h2 className="text-3xl font-header font-bold mb-2 text-white">{mode === 'login' ? 'Bienvenido' : 'Crea tu cuenta'}</h2>
        <p className="text-slate-400 mb-8">{mode === 'login' ? 'Ingresa tus credenciales' : 'Únete a la comunidad de ingeniería'}</p>

        {error && <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl mb-6 text-sm flex items-center gap-2"><AlertCircle className="w-4 h-4" /> {error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Nombre Completo</label>
              <input type="text" required className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-[#8b5cf6] focus:ring-1 focus:ring-[#8b5cf6] text-white outline-none transition-all placeholder:text-slate-500" placeholder="Juan Pérez" value={name} onChange={e => setName(e.target.value)} />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Email</label>
            <input type="email" required className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-[#8b5cf6] focus:ring-1 focus:ring-[#8b5cf6] text-white outline-none transition-all placeholder:text-slate-500" placeholder="juan@ejemplo.com" value={email} onChange={e => setEmail(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Contraseña</label>
            <input type="password" required className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-[#8b5cf6] focus:ring-1 focus:ring-[#8b5cf6] text-white outline-none transition-all placeholder:text-slate-500" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} />
          </div>
          <Button className="w-full py-4 mt-6 text-lg tracking-wide" loading={loading}>
            {mode === 'login' ? 'Entrar' : 'Registrarse'}
          </Button>
        </form>
      </Card>
    </div>
  );
};

// --- Dashboard ---

const Dashboard = ({ user, onAction }: any) => {
  const [data, setData] = useState<any>(null);
  const [subjects, setSubjects] = useState<any[]>([]);

  useEffect(() => {
    dataService.getDashboard().then(setData);
    dataService.getSubjects().then(setSubjects);
  }, []);

  const chartData = React.useMemo(() => {
    if (!data?.studySessions) return [];
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

    const currentMonthDays = Array.from({ length: daysInMonth }, (_, i) => {
      const d = new Date(currentYear, currentMonth, i + 1);
      const localOffset = d.getTimezoneOffset() * 60000;
      return new Date(d.getTime() - localOffset).toISOString().split('T')[0];
    });

    const sessionsMap = new Map<string, number>(data.studySessions.map((s: any) => [s.date.split('T')[0], Number(s.duration)]));

    return currentMonthDays.map(dateStr => {
      const parts = dateStr.split('-');
      const day = parts[2];
      const durationVal = sessionsMap.get(dateStr) || 0;
      return {
        name: day,
        value: Math.floor(durationVal / 60)
      };
    });
  }, [data]);

  const todayMinutes = React.useMemo(() => {
    if (!data?.studySessions) return 0;
    const now = new Date();
    const localDate = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().split('T')[0];
    const todaySession = data.studySessions.find((s: any) => s.date.startsWith(localDate));
    return todaySession ? Math.floor(todaySession.duration / 60) : 0;
  }, [data]);

  if (!data) return <div className="p-12 text-center"><Loader2 className="animate-spin mx-auto w-8 h-8 text-[#8b5cf6]" /></div>;

  return (
    <div className="p-8 max-w-7xl mx-auto bg-[#030712] min-h-screen text-slate-300">
      <header className="flex justify-between items-end mb-12">
        <div>
          <h1 className="text-4xl font-header font-bold text-white mb-2">Hola, {user.name} 👋</h1>
          <p className="text-slate-400">Tu progreso de estudio</p>
        </div>
        <div className="flex gap-4">
          <Card className="py-3 px-6 flex items-center gap-3 bg-black/40 hidden sm:flex">
            <Clock className="text-[#8b5cf6] w-5 h-5" />
            <div>
              <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">Estudio Hoy</p>
              <p className="text-lg font-bold text-white">
                {Math.floor(todayMinutes / 60)}h {todayMinutes % 60}m
              </p>
            </div>
          </Card>
          <Card className="py-3 px-6 flex items-center gap-3 bg-black/40">
            <Trophy className="text-amber-400 w-5 h-5" />
            <div>
              <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">Puntos</p>
              <p className="text-lg font-bold text-white">{data.stats?.totalPoints || 0}</p>
            </div>
          </Card>
          <Card className="py-3 px-6 flex items-center gap-3 bg-black/40">
            <TrendingUp className="text-emerald-400 w-5 h-5" />
            <div>
              <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">Ejercicios</p>
              <p className="text-lg font-bold text-white">{data.stats?.totalExercises || 0}</p>
            </div>
          </Card>
        </div>
      </header>

      <div className="grid lg:grid-cols-3 gap-8 mb-12">
        {/* Gráfico de actividad */}
        <Card className="lg:col-span-2 bg-black/40">
          <h3 className="text-lg font-header font-bold text-white mb-6">Actividad de Estudio (Mes Actual)</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#ec4899" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff10" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} tickFormatter={(val) => `${val} min`} />
                <Tooltip
                  contentStyle={{ borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', backgroundColor: '#111827', color: '#fff' }}
                  formatter={(value: number) => [`${value} minutos`, 'Estudio']}
                />
                <Area type="monotone" dataKey="value" stroke="url(#colorValue)" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <div className="space-y-6">
          {/* Total de minutos de estudio */}
          <Card className="bg-black/40">
            <h3 className="text-lg font-header font-bold text-white mb-4">Resumen de Estudio</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center bg-white/5 p-3 rounded-xl">
                <span className="text-slate-400 text-sm">Total Minutos de Estudio</span>
                <span className="font-bold text-white">{data.stats?.totalStudyMinutes || 0} min</span>
              </div>
              <div className="flex justify-between items-center bg-white/5 p-3 rounded-xl">
                <span className="text-slate-400 text-sm">Ejercicios Completados</span>
                <span className="font-bold text-emerald-400">{data.stats?.totalExercises || 0}</span>
              </div>
              <div className="flex justify-between items-center bg-white/5 p-3 rounded-xl">
                <span className="text-slate-400 text-sm">Puntos Totales</span>
                <span className="font-bold text-amber-400">{data.stats?.totalPoints || 0}</span>
              </div>
            </div>
          </Card>

          {data.subscription && (
            <Card className="bg-dominia-gradient border-none relative overflow-hidden group">
              <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-500" />
              <div className="relative z-10">
                <h3 className="font-bold text-white mb-1">Suscripción {data.subscription.status === 'trial' ? 'Prueba' : 'Activa'}</h3>
                <p className="text-white/80 text-sm mb-5">Vence el {new Date(data.subscription.expiresAt).toLocaleDateString()}</p>
                <Button variant="secondary" className="w-full bg-white/20 border-white/30 text-white hover:bg-white/30 backdrop-blur-md">Gestionar Plan</Button>
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Materias */}
      <h3 className="text-2xl font-header font-bold text-white mb-6">Tus Cursos</h3>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {subjects.map(s => (
          <Card key={s.id} className="bg-black/40 hover:border-[#8b5cf6]/50 transition-all cursor-pointer group hover:shadow-[0_0_20px_rgba(139,92,246,0.15)]" onClick={() => onAction('roadmap', s)}>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center group-hover:bg-dominia-gradient transition-all duration-300">
                <BookOpen className="text-slate-300 group-hover:text-white w-6 h-6 transition-colors" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-base text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-dominia-gradient transition-all leading-tight">{s.name}</h4>
              </div>
            </div>
            <p className="text-sm text-slate-400 mb-6 line-clamp-2">{s.description}</p>
            <span className="text-slate-300 group-hover:text-white font-bold text-sm flex items-center gap-1 transition-colors">
              Estudiar <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </span>
          </Card>
        ))}
      </div>
    </div>
  );
};

// --- Admin (simplified) ---

const Admin = ({ onBack }: any) => {
  const [subjects, setSubjects] = useState<any[]>([]);

  useEffect(() => {
    dataService.getSubjects().then(setSubjects);
  }, []);

  return (
    <div className="p-8 max-w-5xl mx-auto bg-[#030712] min-h-screen text-slate-300">
      <button onClick={onBack} className="text-slate-400 hover:text-white mb-8 flex items-center gap-2">
        <ChevronRight className="rotate-180 w-4 h-4" /> Salir del Panel
      </button>
      <h2 className="text-4xl font-header font-bold text-white mb-12">Panel de Administración</h2>
      <Card className="bg-black/40 p-8">
        <p className="text-slate-400">El panel de administración será actualizado para gestionar temas, nodos y ejercicios.</p>
        <p className="text-sm text-slate-500 mt-2">Materias actuales: {subjects.map(s => s.name).join(', ')}</p>
      </Card>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════
// APP PRINCIPAL
// ═══════════════════════════════════════════════════════════════════════

export default function App() {
  const [view, setView] = useState('landing');
  const [user, setUser] = useState<any>(authService.getUser());

  // Navigation state
  const [activeUniversity, setActiveUniversity] = useState<any>(null);
  const [activeSubject, setActiveSubject] = useState<any>(null);
  const [activeTopic, setActiveTopic] = useState<any>(null);
  const [activeNode, setActiveNode] = useState<any>(null);
  const [activeExerciseId, setActiveExerciseId] = useState<string | null>(null);
  const [activeTheoryTopicId, setActiveTheoryTopicId] = useState<string | null>(null);

  useEffect(() => {
    if (user) setView('dashboard');
  }, []);

  const handleAuthSuccess = () => {
    setUser(authService.getUser());
    setView('dashboard');
  };

  const handleAction = (type: string, data?: any) => {
    if (type === 'roadmap') {
      setActiveSubject(data);
      setView('roadmap');
    }
  };

  // Content rendering based on view
  const renderContent = () => {
    switch (view) {
      case 'landing':
        return <Landing onStart={(mode: string) => setView(mode)} />;

      case 'login':
      case 'register':
        return <Auth mode={view} onBack={() => setView('landing')} onSuccess={handleAuthSuccess} />;

      case 'dashboard':
        return <Dashboard user={user} onAction={handleAction} />;

      case 'universities':
        return (
          <UniversitySelector onSelect={(u) => {
            setActiveUniversity(u);
            setView('courses');
          }} />
        );

      case 'courses':
        return (
          <CourseSelector
            university={activeUniversity}
            onSelect={(s) => {
              setActiveSubject(s);
              setView('roadmap');
            }}
            onBack={() => setView('universities')}
          />
        );

      case 'roadmap':
        return (
          <TopicRoadmap
            subject={activeSubject}
            onSelectTopic={(topic) => {
              setActiveTopic(topic);
              setView('exerciseMap');
            }}
            onSelectTheory={(topic) => {
              setActiveTheoryTopicId(topic.id);
              setView('theory');
            }}
            onBack={() => setView('courses')}
          />
        );

      case 'theory':
        return (
          <TopicTheoryView
            topicId={activeTheoryTopicId!}
            onBack={() => setView('roadmap')}
          />
        );

      case 'exerciseMap':
        return (
          <ExerciseMap
            topic={activeTopic}
            subjectName={activeSubject?.name || ''}
            onSelectNode={(node) => {
              setActiveNode(node);
              setView('exerciseList');
            }}
            onBack={() => setView('roadmap')}
          />
        );

      case 'exerciseList':
        return (
          <ExerciseList
            node={activeNode}
            topicName={activeTopic?.name || ''}
            subjectName={activeSubject?.name || ''}
            onSelectExercise={(id) => {
              setActiveExerciseId(id);
              setView('exercise');
            }}
            onBack={() => setView('exerciseMap')}
          />
        );

      case 'exercise':
        return (
          <ExerciseView
            exerciseId={activeExerciseId!}
            onBack={() => setView('exerciseList')}
            onComplete={() => {
              // Refresh data on completion
            }}
          />
        );

      case 'admin':
        return <Admin onBack={() => setView('dashboard')} />;

      default:
        return <Landing onStart={(mode: string) => setView(mode)} />;
    }
  };

  return (
    <div className="min-h-screen font-sans text-gray-900">
      {/* Sidebar */}
      {user && (
        <aside className="fixed left-0 top-0 h-full w-56 bg-[#030712] border-r border-white/10 flex flex-col py-6 px-3 gap-1 z-50">
          {/* University buttons */}
          <div className="flex gap-2 px-3 mb-6 overflow-x-auto scrollbar-hide">
            <button
              onClick={() => setView('universities')}
              className="w-10 h-10 rounded-xl bg-dominia-gradient flex flex-col items-center justify-center shrink-0 shadow-[0_0_15px_rgba(236,72,153,0.3)] border border-white/20 transition-all hover:scale-105"
              title="FING - Facultad de Ingeniería"
            >
              <span className="text-white text-[10px] font-bold tracking-wider">FING</span>
            </button>
            <button
              className="w-10 h-10 rounded-xl bg-white/5 flex flex-col items-center justify-center shrink-0 border border-white/5 transition-all hover:bg-white/10 opacity-50 cursor-not-allowed"
              title="Próximamente"
            >
              <Plus className="w-4 h-4 text-slate-400" />
            </button>
          </div>

          <button 
            onClick={() => setView('landing')}
            className="flex items-center gap-3 px-3 mb-8 hover:opacity-80 transition-opacity text-left cursor-pointer"
          >
            <div className="w-9 h-9 bg-dominia-gradient rounded-xl flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(139,92,246,0.3)]">
              <BrainCircuit className="text-white w-5 h-5" />
            </div>
            <span className="text-lg font-header font-bold text-white tracking-tight">TutorIA</span>
          </button>

          <NavBtn onClick={() => setView('dashboard')} active={view === 'dashboard'} icon={<BarChart2 className="w-5 h-5" />} label="Dashboard" />
          <NavBtn onClick={() => setView('universities')} active={['universities', 'courses', 'roadmap', 'exerciseMap', 'exerciseList', 'exercise', 'theory'].includes(view)} icon={<BookOpen className="w-5 h-5" />} label="Cursos" />

          {user.role === 'ADMIN' && (
            <NavBtn onClick={() => setView('admin')} active={view === 'admin'} icon={<Settings className="w-5 h-5" />} label="Administración" />
          )}

          {/* Study Timer in sidebar */}
          <div className="mt-4 px-2">
            <StudyTimer />
          </div>

          <div className="mt-auto space-y-1">
            <div className="px-3 py-2 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-dominia-gradient flex items-center justify-center shrink-0 shadow-[0_0_10px_rgba(139,92,246,0.2)]">
                <span className="text-xs font-bold text-white">
                  {(user.name?.[0] || user.email[0]).toUpperCase()}
                </span>
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-white truncate">{user.name || user.email}</p>
                <p className="text-[10px] text-slate-400 truncate">{user.email}</p>
              </div>
            </div>
            <NavBtn onClick={() => authService.logout()} active={false} icon={<LogOut className="w-5 h-5" />} label="Cerrar sesión" danger />
          </div>
        </aside>
      )}

      <main className={user ? 'pl-56' : ''}>
        <AnimatePresence mode="wait">
          <motion.div key={view} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}