import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  BookOpen,
  GraduationCap,
  MessageSquare,
  LayoutDashboard,
  Settings,
  LogOut,
  ChevronRight,
  BrainCircuit,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  Menu,
  X,
  Send,
  Loader2,
  Plus,
  FlaskConical,
  Trophy,
  Target,
  BarChart2,
  Flame
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { authService, dataService, adminService } from './services/api';
import { MathRenderer } from './components/MathRenderer';
import { StudyModeButtons, StudyMode } from './components/StudyModeButtons';
import { FormulasPanel } from './components/FormulasPanel';

// --- COMPONENTES UI ---

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

// --- COMPONENTES DE NAVEGACIÓN ---

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

// --- VISTAS ---

const SubjectSelector = ({ onAction }: any) => {
  const [subjects, setSubjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dataService.getSubjects().then(s => { setSubjects(s); setLoading(false); });
  }, []);

  if (loading) return (
    <div className="h-screen flex items-center justify-center">
      <Loader2 className="animate-spin w-8 h-8 text-indigo-600" />
    </div>
  );

  return (
    <div className="p-8 max-w-5xl mx-auto bg-[#030712] min-h-screen text-slate-300">
      <h2 className="text-4xl font-header font-bold text-white mb-2">Materias</h2>
      <p className="text-slate-400 mb-10">Selecciona una materia para hablar con tu tutor IA</p>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {subjects.map(s => (
          <Card
            key={s.id}
            className="bg-black/40 hover:border-[#8b5cf6]/50 transition-all duration-300 cursor-pointer group hover:shadow-[0_0_20px_rgba(139,92,246,0.15)]"
            onClick={() => onAction('chat', s)}
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center group-hover:bg-dominia-gradient transition-all duration-300">
                <BookOpen className="text-slate-400 group-hover:text-white w-6 h-6 transition-colors" />
              </div>
              <div>
                <h4 className="font-bold text-lg text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-dominia-gradient transition-all">{s.name}</h4>
                <p className="text-sm text-slate-500">{s.categories.length} categorías</p>
              </div>
            </div>
            <p className="text-sm text-slate-400 mb-6 line-clamp-2">{s.description}</p>
            <Button variant="secondary" className="w-full bg-white/5 border-white/10 hover:bg-white/10 group-hover:border-[#ec4899]/30">
              Comenzar Chat <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Card>
        ))}
        {subjects.length === 0 && (
          <div className="col-span-3 text-center text-slate-500 py-20 border-2 border-dashed border-white/10 rounded-2xl">
            <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p className="text-lg font-header font-semibold text-white mb-1">No hay materias disponibles</p>
            <p className="text-sm">Un administrador debe crearlas desde el Panel de Administración.</p>
          </div>
        )}
      </div>
    </div>
  );
};

const Landing = ({ onStart }: any) => (
  <div className="min-h-screen bg-[#030712] relative overflow-hidden">
    {/* Effects */}
    <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-[#ec4899] opacity-20 blur-[120px] rounded-full pointer-events-none" />
    <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-[#8b5cf6] opacity-20 blur-[120px] rounded-full pointer-events-none" />

    {/* Navbar */}
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

    {/* Hero */}
    <main className="max-w-7xl mx-auto px-6 pt-20 pb-32 grid lg:grid-cols-2 gap-16 items-center relative z-10">
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
      >
        <span className="inline-block px-4 py-1.5 bg-white/5 border border-white/10 text-slate-300 rounded-full text-sm font-semibold mb-6 backdrop-blur-sm">
          Especializado en FING, Udelar
        </span>
        <h1 className="text-5xl lg:text-7xl font-header font-bold text-white leading-[1.1] mb-8">
          Domina tus exámenes de <br/>
          <span className="text-dominia-gradient">Ingeniería</span> con IA.
        </h1>
        <p className="text-xl text-slate-400 mb-10 leading-relaxed font-sans">
          Tu tutor personal disponible 24/7. Preparación específica para Cálculo 1, CDIV, GAL y más. Basado en exámenes reales y bibliografía oficial.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <Button className="px-8 py-4 text-lg w-full sm:w-auto" onClick={() => onStart('register')}>Comenzar Prueba de 7 Días</Button>
          <Button variant="secondary" className="px-8 py-4 text-lg w-full sm:w-auto">Ver Cursos</Button>
        </div>

        <div className="mt-12 flex items-center gap-6">
          <div className="flex -space-x-3">
            {[1, 2, 3, 4].map(i => (
              <img key={i} src={`https://picsum.photos/seed/user${i}/100`} className="w-10 h-10 rounded-full border-2 border-[#030712]" referrerPolicy="no-referrer" alt={`User ${i}`} />
            ))}
          </div>
          <p className="text-sm text-slate-400">
            <span className="font-bold text-white">+500 estudiantes</span> ya están aprobando con TutorIA
          </p>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative"
      >
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
              <p className="text-sm">¿Cómo puedo resolver una integral por partes?</p>
            </div>
            <div className="bg-dominia-gradient p-4 rounded-2xl text-white ml-auto max-w-[80%] shadow-[0_10px_30px_rgba(236,72,153,0.3)]">
              <p className="text-sm font-medium">¡Claro! Recuerda la regla <span className="font-mono bg-black/20 px-1.5 py-0.5 rounded text-white/90">ILATE</span>. Para el primer parcial de Cálculo 1, solemos usarla cuando...</p>
            </div>
          </div>
        </Card>
      </motion.div>
    </main>
  </div>
);

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
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#ec4899] opacity-10 blur-[100px] rounded-full point-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#8b5cf6] opacity-10 blur-[100px] rounded-full point-events-none" />

      <Card className="w-full max-w-md p-8 relative z-10 bg-black/60 backdrop-blur-xl border-white/10">
        <button onClick={onBack} className="text-slate-400 hover:text-white mb-6 flex items-center gap-2 text-sm transition-colors">
          <ChevronRight className="rotate-180 w-4 h-4" /> Volver
        </button>
        <h2 className="text-3xl font-header font-bold mb-2 text-white">{mode === 'login' ? 'Bienvenido' : 'Crea tu cuenta'}</h2>
        <p className="text-slate-400 mb-8">{mode === 'login' ? 'Ingresa tus credenciales para continuar' : 'Únete a la comunidad de ingeniería'}</p>

        {error && <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl mb-6 text-sm flex items-center gap-2"><AlertCircle className="w-4 h-4" /> {error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Nombre Completo</label>
              <input
                type="text"
                required
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-[#8b5cf6] focus:ring-1 focus:ring-[#8b5cf6] text-white outline-none transition-all placeholder:text-slate-500"
                placeholder="Juan Pérez"
                value={name}
                onChange={e => setName(e.target.value)}
              />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Email</label>
            <input
              type="email"
              required
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-[#8b5cf6] focus:ring-1 focus:ring-[#8b5cf6] text-white outline-none transition-all placeholder:text-slate-500"
              placeholder="juan@ejemplo.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Contraseña</label>
            <input
              type="password"
              required
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-[#8b5cf6] focus:ring-1 focus:ring-[#8b5cf6] text-white outline-none transition-all placeholder:text-slate-500"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          </div>
          <Button className="w-full py-4 mt-6 text-lg tracking-wide" loading={loading}>
            {mode === 'login' ? 'Entrar' : 'Registrarse'}
          </Button>
        </form>
      </Card>
    </div>
  );
};

const Dashboard = ({ user, onAction }: any) => {
  const [data, setData] = useState<any>(null);
  const [subjects, setSubjects] = useState<any[]>([]);

  useEffect(() => {
    dataService.getDashboard().then(setData);
    dataService.getSubjects().then(setSubjects);
  }, []);

  const chartData = [
    { name: 'Lun', value: 40 },
    { name: 'Mar', value: 30 },
    { name: 'Mie', value: 60 },
    { name: 'Jue', value: 80 },
    { name: 'Vie', value: 50 },
    { name: 'Sab', value: 90 },
    { name: 'Dom', value: 70 },
  ];

  if (!data) return <div className="p-12 text-center"><Loader2 className="animate-spin mx-auto w-8 h-8 text-indigo-600" /></div>;

  return (
    <div className="p-8 max-w-7xl mx-auto bg-[#030712] min-h-screen text-slate-300">
      <header className="flex justify-between items-end mb-12">
        <div>
          <h1 className="text-4xl font-header font-bold text-white mb-2">Hola, {user.name} 👋</h1>
          <p className="text-slate-400">Tu progreso actual en la facultad</p>
        </div>
        <div className="flex gap-4">
          <Card className="py-3 px-6 flex items-center gap-3 bg-black/40">
            <TrendingUp className="text-emerald-400 w-5 h-5" />
            <div>
              <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">Nivel IA</p>
              <p className="text-lg font-bold text-white">{data.profile.abstractionLevel}/5</p>
            </div>
          </Card>
        </div>
      </header>

      <div className="grid lg:grid-cols-3 gap-8 mb-12">
        <Card className="lg:col-span-2 bg-black/40">
          <h3 className="text-lg font-header font-bold text-white mb-6">Actividad de Aprendizaje</h3>
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
                <YAxis hide />
                <Tooltip
                  contentStyle={{ borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', backgroundColor: '#111827', color: '#fff' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Area type="monotone" dataKey="value" stroke="url(#colorValue)" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <div className="space-y-6">
          <Card className="bg-black/40">
            <h3 className="text-lg font-header font-bold text-white mb-4">Estadísticas</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center bg-white/5 p-3 rounded-xl">
                <span className="text-slate-400 text-sm">Ejercicios Resueltos</span>
                <span className="font-bold text-white">{data.profile.statsExercises}</span>
              </div>
              <div className="flex justify-between items-center bg-white/5 p-3 rounded-xl">
                <span className="text-slate-400 text-sm">Tasa de Acierto</span>
                <span className="font-bold text-emerald-400">{data.profile.statsExercises > 0 ? (data.profile.statsCorrect / data.profile.statsExercises * 100).toFixed(0) : 0}%</span>
              </div>
              <div className="flex justify-between items-center bg-white/5 p-3 rounded-xl">
                <span className="text-slate-400 text-sm">Tiempo de Estudio</span>
                <span className="font-bold text-white">{data.profile.statsTimeSpent} min</span>
              </div>
            </div>
          </Card>

          <Card className="bg-dominia-gradient border-none relative overflow-hidden group">
            <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-500" />
            <div className="relative z-10">
              <h3 className="font-bold text-white mb-1">Suscripción {data.subscription.status === 'trial' ? 'Prueba' : 'Activa'}</h3>
              <p className="text-white/80 text-sm mb-5">Vence el {new Date(data.subscription.expiresAt).toLocaleDateString()}</p>
              <Button variant="secondary" className="w-full bg-white/20 border-white/30 text-white hover:bg-white/30 backdrop-blur-md">Gestionar Plan</Button>
            </div>
          </Card>
        </div>
      </div>

      <h3 className="text-2xl font-header font-bold text-white mb-6">Tus Materias</h3>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {subjects.map(s => (
          <Card key={s.id} className="bg-black/40 hover:border-[#8b5cf6]/50 transition-all cursor-pointer group hover:shadow-[0_0_20px_rgba(139,92,246,0.15)]">
            <div className="flex items-center gap-4 mb-4" onClick={() => onAction('chat', s)}>
              <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center group-hover:bg-dominia-gradient transition-all duration-300">
                <BookOpen className="text-slate-300 group-hover:text-white w-6 h-6 transition-colors" />
              </div>
              <div>
                <h4 className="font-bold text-lg text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-dominia-gradient transition-all">{s.name}</h4>
                <p className="text-sm text-slate-400">{s.categories.length} Categorías</p>
              </div>
            </div>
            <p className="text-sm text-slate-400 mb-6 line-clamp-2">{s.description}</p>
            <div className="flex justify-between items-center">
              <div className="flex -space-x-2">
                {[1, 2, 3].map(i => <div key={i} className="w-8 h-8 rounded-full bg-[#111827] border-2 border-[#030712] flex flex-col justify-center items-center text-[10px] text-slate-500 font-bold">{i}</div>)}
              </div>
              <span className="text-slate-300 group-hover:text-white font-bold text-sm flex items-center gap-1 transition-colors">
                Entrar <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </span>
            </div>
          </Card>
        ))}
        <Card className="border-dashed border-2 border-white/10 bg-transparent flex flex-col items-center justify-center text-slate-500 hover:text-white hover:border-white/30 transition-all min-h-[220px]">
          <Plus className="w-8 h-8 mb-2" />
          <p className="font-medium text-sm">Próximamente más materias</p>
        </Card>
      </div>
    </div>
  );
};

const Chat = ({ subject, onBack }: any) => {
  const [category, setCategory] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [welcomeLoading, setWelcomeLoading] = useState(false);
  const [progressMap, setProgressMap] = useState<Record<string, any>>({});
  // Modo de estudio activo (null = chat libre, 'vf', 'multiple', 'demo', 'teorico')
  const [activeMode, setActiveMode] = useState<StudyMode | null>(null);
  // Controla si el panel de fórmulas está abierto
  const [formulasOpen, setFormulasOpen] = useState(false);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  // Al entrar a la pantalla de selección, cargar el progreso de todas las instancias
  // así podemos mostrar "X interacciones" en cada tarjeta
  useEffect(() => {
    if (!category && subject?.categories?.length > 0) {
      Promise.all(
        subject.categories.map((cat: any) =>
          dataService.getProgress(cat.id)
            .then(p => ({ id: cat.id, data: p }))
            .catch(() => ({ id: cat.id, data: null }))
        )
      ).then(results => {
        const map: Record<string, any> = {};
        results.forEach(r => { if (r.data) map[r.id] = r.data; });
        setProgressMap(map);
      });
    }
  }, [category, subject]);

  // Cuando el usuario selecciona una instancia, obtener el mensaje de bienvenida
  // personalizado del backend (primera vez vs. regreso)
  useEffect(() => {
    if (!category) return;

    setMessages([]); // Limpiar mensajes al cambiar de instancia
    setWelcomeLoading(true);

    dataService.getWelcomeMessage(category.id)
      .then(({ text }) => {
        // Agregar el mensaje de bienvenida como primer mensaje del asistente
        setMessages([{ role: 'assistant', content: text, isWelcome: true }]);
      })
      .catch(() => {
        setMessages([{
          role: 'assistant',
          content: `¡Hola! Estoy listo para ayudarte con **${subject.name} - ${category.name}**. ¿Qué te gustaría estudiar hoy?`,
          isWelcome: true
        }]);
      })
      .finally(() => setWelcomeLoading(false));
  }, [category]); // Solo re-ejecutar cuando cambia la categoría seleccionada

  // Auto-scroll al último mensaje
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // Activa un modo de estudio: inyecta un mensaje de sistema en el chat
  // que indica a la IA cómo comportarse y le muestra al usuario las opciones
  const handleModeChange = (mode: StudyMode) => {
    // Alternar: si el modo ya está activo, lo desactiva (chat libre)
    if (activeMode === mode) {
      setActiveMode(null);
      return;
    }
    setActiveMode(mode);

    // Mensajes iniciales que el tutor envió al activar el modo
    const modeIntro: Record<StudyMode, string> = {
      vf: '**Modo Verdadero o Falso activado** ✅\n\nPuedo generar afirmaciones al estilo de examen real para que me digas si son verdaderas o falsas, y después te explico el por qué en detalle.\n\n¿Qué preferís?\n\n• Escribí un **tema** (ej: "Límites", "Derivadas", "Integrales")\n• O escribí **"mixto"** para un simulacro con temas variados',
      multiple: '**Modo Múltiple Opción activado** 📝\n\nVoy a presentarte preguntas con 4 opciones (A, B, C, D) y expilicé las correctas e incorrectas.\n\n¿Qué preferís?\n\n• Escribí un **tema** (ej: "Límites", "Derivadas")\n• O escribí **"mixto"** para mode de examen con temas variados',
      demo: '**Modo Demostraciones activado** ⚖️\n\nPuedo guiarte paso a paso por la demostración de cualquier teorema o propiedad.\n\nEscribí el **teorema o propiedad** que querés demostrar (ej: "derivada de x^n", "teorema del sándwich")',
      teorico: '**Modo Teórico activado** 📖\n\nVamos a repasar conceptos con explicaciones claras y analogías.\n\nEscribí el **tema** que querés repasar, o escribí **"sugerir"** para que te recomiende temas según tu perfil.',
      formulas: '', // No se usa aquí, abre el panel directamente
    };

    setMessages(prev => [
      ...prev,
      { role: 'assistant', content: modeIntro[mode], isModeIntro: true }
    ]);
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMsg = { role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      // Envíamos el modo activo y el topic al backend para que ajuste el system prompt
      const res = await dataService.sendMessage(input, subject.id, category.id, activeMode, null);
      setMessages(prev => [...prev, { role: 'assistant', content: res.text }]);
    } catch (err: any) {
      console.error('[Chat] Error al enviar mensaje:', err);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `⚠️ Error: ${err.message || 'No se pudo conectar con el tutor. Intenta de nuevo.'}`,
        isError: true
      }]);
    } finally {
      setLoading(false);
    }
  };

  // ── Pantalla de selección de instancia ──────────────────────────────────────
  if (!category) {
    return (
      <div className="p-8 max-w-4xl mx-auto bg-[#030712] min-h-screen text-slate-300">
        <button onClick={onBack} className="text-slate-500 hover:text-white mb-8 flex items-center gap-2 transition-colors">
          <ChevronRight className="rotate-180 w-4 h-4" /> Volver al Dashboard
        </button>

        <div className="flex items-center gap-4 mb-2">
          <div className="w-12 h-12 bg-dominia-gradient rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(139,92,246,0.3)]">
            <BookOpen className="text-white w-6 h-6" />
          </div>
          <div>
            <h2 className="text-4xl font-header font-bold text-white tracking-tight">{subject.name}</h2>
            <p className="text-slate-400 text-sm mt-1">{subject.faculty || 'FING'} · {subject.description}</p>
          </div>
        </div>

        <p className="text-slate-500 mb-8 mt-6">Selecciona qué instancia quieres preparar hoy</p>

        <div className="grid md:grid-cols-2 gap-6">
          {subject.categories.map((cat: any) => {
            // Configuración visual por tipo de instancia
            const typeConfig: Record<string, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
              practico: { label: 'Práctico', color: 'text-blue-400', bg: 'bg-blue-500/10 border border-blue-500/20', icon: <FlaskConical className="w-5 h-5" /> },
              primer_parcial: { label: 'Primer Parcial', color: 'text-amber-400', bg: 'bg-amber-500/10 border border-amber-500/20', icon: <Target className="w-5 h-5" /> },
              segundo_parcial: { label: 'Segundo Parcial', color: 'text-orange-400', bg: 'bg-orange-500/10 border border-orange-500/20', icon: <Target className="w-5 h-5" /> },
              examen: { label: 'Examen Final', color: 'text-red-400', bg: 'bg-red-500/10 border border-red-500/20', icon: <Trophy className="w-5 h-5" /> }
            };
            const cfg = typeConfig[cat.type] || { label: cat.type, color: 'text-[#8b5cf6]', bg: 'bg-[#8b5cf6]/10 border border-[#8b5cf6]/20', icon: <BookOpen className="w-5 h-5" /> };

            // Datos de progreso de esta instancia (si ya se cargaron)
            const prog = progressMap[cat.id];
            const interactions = prog?.interactionsCount || 0;
            const level = prog?.level || 1;

            return (
              <Card
                key={cat.id}
                className="bg-black/40 hover:border-[#ec4899]/50 transition-all duration-300 cursor-pointer p-6 group hover:shadow-[0_0_20px_rgba(236,72,153,0.1)] relative overflow-hidden"
                onClick={() => setCategory(cat)}
              >
                {/* Decoration glow */}
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-dominia-gradient opacity-0 group-hover:opacity-10 blur-[40px] rounded-full transition-opacity duration-500 pointer-events-none" />

                {/* Encabezado con ícono del tipo */}
                <div className="flex items-center justify-between mb-4 relative z-10">
                  <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${cfg.bg}`}>
                    <span className={cfg.color}>{cfg.icon}</span>
                    <span className={`text-xs font-bold uppercase tracking-wider ${cfg.color}`}>{cfg.label}</span>
                  </div>
                  {/* Badge de progreso: distinto si ya interactuó */}
                  {interactions > 0 ? (
                    <div className="flex items-center gap-1 text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-1 rounded-full text-xs font-bold">
                      <Flame className="w-3 h-3" />
                      {interactions} sesión{interactions !== 1 ? 'es' : ''}
                    </div>
                  ) : (
                    <span className="text-xs text-slate-500 bg-white/5 px-2 py-1 rounded-full">Sin iniciar</span>
                  )}
                </div>

                <h4 className="text-xl font-header font-bold mb-1 text-white relative z-10 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-dominia-gradient transition-all">{cat.name}</h4>
                <p className="text-slate-400 text-sm mb-5 relative z-10 min-h-[40px]">
                  {interactions > 0
                    ? `Nivel ${level}/5 · ${interactions} interacción${interactions !== 1 ? 'es' : ''} previas`
                    : 'Preparación enfocada con base de conocimiento específica.'}
                </p>

                {/* Barra de nivel de progreso */}
                {interactions > 0 && (
                  <div className="mb-5 relative z-10">
                    <div className="flex justify-between text-xs text-slate-500 mb-2">
                      <span>Nivel de dominio</span>
                      <span className="text-white font-medium">{level}/5</span>
                    </div>
                    <div className="h-1.5 bg-[#030712] rounded-full overflow-hidden border border-white/5">
                      <div
                        className="h-full bg-dominia-gradient rounded-full transition-all duration-1000 ease-out"
                        style={{ width: `${(level / 5) * 100}%` }}
                      />
                    </div>
                  </div>
                )}

                <Button
                  variant={interactions > 0 ? 'primary' : 'secondary'}
                  className="w-full relative z-10"
                >
                  {interactions > 0 ? 'Continuar →' : 'Comenzar'}
                </Button>
              </Card>
            );
          })}
        </div>
      </div>
    );
  }

  // ── Pantalla de chat ──────────────────────────────────────────────────────────────────
  return (
    <div className="h-screen flex flex-col bg-[#030712] text-slate-300">
      {/* Panel de fórmulas (modal, sin consumo de IA) */}
      {formulasOpen && (
        <FormulasPanel
          subjectId={subject.id}
          subjectName={subject.name}
          onClose={() => setFormulasOpen(false)}
        />
      )}

      {/* Header con materia, instancia y estado */}
      <header className="bg-black/60 backdrop-blur-md border-b border-white/10 px-8 py-4 flex justify-between items-center z-10 relative">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setCategory(null)}
            className="p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
            title="Volver a las instancias"
          >
            <ChevronRight className="rotate-180 w-5 h-5" />
          </button>
          <div>
            <h3 className="font-header font-bold text-white tracking-tight">{subject.name}</h3>
            <div className="flex items-center gap-2 mt-0.5">
              <p className="text-xs text-[#8b5cf6] font-bold uppercase tracking-wider">{category.name}</p>
              {progressMap[category.id]?.interactionsCount > 0 && (
                <span className="text-[10px] bg-[#8b5cf6]/10 border border-[#8b5cf6]/20 text-[#8b5cf6] px-2 py-0.5 rounded-full font-semibold shadow-[0_0_10px_rgba(139,92,246,0.2)]">
                  Nivel {progressMap[category.id]?.level || 1}/5
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3 bg-white/5 px-3 py-1.5 rounded-full border border-white/5">
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse shadow-[0_0_8px_rgba(74,222,128,0.6)]" />
          <span className="text-xs font-semibold text-slate-400 tracking-wide uppercase">Tutor Online</span>
        </div>
      </header>

      {/* Layout principal: sidebar de modos + área de chat */}
      <div className="flex flex-1 overflow-hidden relative">

        {/* Decoración de fondo del chat */}
        <div className="absolute inset-0 bg-dominia-gradient opacity-[0.02] mix-blend-screen pointer-events-none" />

        {/* Barra lateral de modos de estudio */}
        <aside className="w-52 bg-black/40 border-r border-white/10 flex-col hidden md:flex shrink-0 overflow-y-auto relative z-10">
          <StudyModeButtons
            activeMode={activeMode}
            onModeChange={handleModeChange}
            onFormulasOpen={() => setFormulasOpen(true)}
          />
        </aside>

        {/* Columna derecha: mensajes + input */}
        <div className="flex flex-col flex-1 overflow-hidden relative z-10">
          {/* Área de mensajes */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-6 scrollbar-hide">

            {/* Estado de carga del mensaje de bienvenida */}
            {welcomeLoading && (
              <div className="flex justify-start">
                <div className="bg-[#111827] border border-white/10 px-5 py-4 rounded-[24px] flex items-center gap-3 text-slate-400 text-sm shadow-xl">
                  <Loader2 className="w-4 h-4 animate-spin text-[#8b5cf6]" />
                  Preparando tu tutor personalizado...
                </div>
              </div>
            )}

            {/* Lista de mensajes */}
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {m.role === 'assistant' && (
                  <div className="w-8 h-8 bg-dominia-gradient rounded-full flex items-center justify-center mr-3 shrink-0 mt-2 shadow-[0_0_15px_rgba(139,92,246,0.3)] border border-white/20">
                    <BrainCircuit className="text-white w-4 h-4" />
                  </div>
                )}
                <div className={`max-w-[85%] sm:max-w-[75%] p-5 rounded-[24px] shadow-sm ${m.role === 'user'
                  ? 'bg-dominia-gradient text-white !rounded-tr-sm shadow-[0_10px_30px_rgba(236,72,153,0.2)]'
                  : m.isError
                    ? 'bg-red-500/10 border border-red-500/20 text-red-400 !rounded-tl-sm'
                    : m.isModeIntro
                      ? 'bg-black/40 border border-[#8b5cf6]/30 text-slate-300 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]'
                      : 'bg-[#111827] border border-white/10 text-slate-300 !rounded-tl-sm shadow-xl'
                  }`}>
                  <div className="text-[15px] leading-relaxed whitespace-pre-wrap"><MathRenderer text={m.content} /></div>
                </div>
              </div>
            ))}

            {/* Indicador de "escribiendo..." */}
            {loading && (
              <div className="flex justify-start">
                <div className="w-8 h-8 bg-dominia-gradient rounded-full flex items-center justify-center mr-3 shrink-0 mt-2 shadow-[0_0_15px_rgba(139,92,246,0.3)] border border-white/20">
                  <BrainCircuit className="text-white w-4 h-4" />
                </div>
                <div className="bg-[#111827] border border-white/10 px-5 py-4 rounded-[24px] !rounded-tl-sm flex gap-2 items-center shadow-xl">
                  <div className="w-2 h-2 bg-[#ec4899] rounded-full animate-bounce.shadow-[0_0_8px_rgba(236,72,153,0.6)]" />
                  <div className="w-2 h-2 bg-[#d946ef] rounded-full animate-bounce [animation-delay:100ms]" />
                  <div className="w-2 h-2 bg-[#8b5cf6] rounded-full animate-bounce [animation-delay:200ms]" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input de chat */}
          <div className="p-4 sm:p-6 bg-transparent from-black/80 to-transparent pb-6 relative">
            {/* Gradient mask for smooth edge above input */}
            <div className="absolute top-[-40px] left-0 w-full h-[40px] bg-gradient-to-t from-[#030712] to-transparent pointer-events-none" />
            
            {/* Indicador del modo activo */}
            {activeMode && activeMode !== 'formulas' && (
              <div className="max-w-4xl mx-auto mb-3 flex items-center justify-between">
                <span className="text-[11px] text-white font-semibold bg-dominia-gradient px-3 py-1 rounded-full shadow-[0_2px_10px_rgba(139,92,246,0.3)] tracking-wide">
                  MODO ACTIVO: {activeMode === 'vf' ? 'VERDADERO / FALSO' : activeMode === 'multiple' ? 'MÚLTIPLE OPCIÓN' : activeMode === 'demo' ? 'DEMOSTRACIONES' : 'TEÓRICO'}
                </span>
                <button
                  onClick={() => setActiveMode(null)}
                  className="text-xs text-slate-400 hover:text-white transition-colors flex items-center gap-1 bg-white/5 px-2 py-1 rounded-full border border-white/5 hover:border-white/20"
                >
                  <X className="w-3 h-3" />
                  Cerrar modo
                </button>
              </div>
            )}
            <div className="max-w-4xl mx-auto relative group">
              {/* Outer glow effect for input focus */}
              <div className="absolute -inset-0.5 bg-dominia-gradient rounded-[28px] opacity-0 group-focus-within:opacity-20 transition duration-500 blur" />
              <textarea
                rows={1}
                placeholder={`Preguntame sobre ${subject.name} - ${category.name}...`}
                className="w-full pl-6 pr-16 py-[18px] bg-[#111827] relative z-10 rounded-[24px] border border-white/10 focus:border-[#8b5cf6]/50 focus:bg-[#111827]/80 text-white outline-none resize-none text-[15px] shadow-2xl transition-all placeholder:text-slate-500"
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
                onClick={handleSend}
                disabled={!input.trim() || loading || welcomeLoading}
                className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-[42px] h-[42px] flex items-center justify-center bg-dominia-gradient text-white rounded-full hover:shadow-[0_0_20px_rgba(139,92,246,0.5)] disabled:opacity-40 disabled:grayscale transition-all duration-300"
              >
                <Send className="w-4 h-4 translate-x-px translate-y-px" />
              </button>
            </div>
            <p className="text-center text-[10px] text-slate-500 mt-4 uppercase tracking-widest font-bold">
              TutorIA · Gemini Flash · {subject.name}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const Admin = ({ onBack }: any) => {
  const [subjects, setSubjects] = useState<any[]>([]);
  const [newSubject, setNewSubject] = useState({ name: '', description: '', code: '', faculty: 'FING' });
  const [newCategory, setNewCategory] = useState({ name: '', subjectId: '', type: 'practico', order: '0' });
  const [selectedCat, setSelectedCat] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    dataService.getSubjects().then(setSubjects);
  }, []);

  const handleCreateSubject = async () => {
    if (!newSubject.name) return alert("El nombre es obligatorio");
    await adminService.createSubject(newSubject);
    dataService.getSubjects().then(setSubjects);
    setNewSubject({ name: '', description: '', code: '', faculty: 'FING' });
  };

  const handleCreateCategory = async () => {
    if (!newCategory.name || !newCategory.subjectId) return alert("Nombre y materia son obligatorios");
    await adminService.createCategory({
      ...newCategory,
      order: parseInt(newCategory.order) || 0
    });
    dataService.getSubjects().then(setSubjects);
    setNewCategory({ name: '', subjectId: '', type: 'practico', order: '0' });
  };

  const handleUpload = async () => {
    if (!file || !selectedCat) return alert("Selecciona un archivo y una categoría");
    setLoading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('categoryId', selectedCat);
    const result = await adminService.uploadKnowledge(formData);
    setLoading(false);
    alert(`✅ Conocimiento cargado: ${result.chunks} fragmentos procesados`);
  };

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <button onClick={onBack} className="text-gray-400 hover:text-gray-600 mb-8 flex items-center gap-2">
        <ChevronRight className="rotate-180 w-4 h-4" /> Salir del Panel
      </button>
      <h2 className="text-4xl font-bold mb-12">Panel de Administración</h2>

      <div className="grid md:grid-cols-2 gap-12 mb-12">
        {/* Crear materia */}
        <section>
          <h3 className="text-xl font-bold mb-6">Nueva Materia</h3>
          <Card className="space-y-4">
            <input placeholder="Nombre (ej: Cálculo 1)" className="w-full p-3 rounded-xl border text-sm"
              value={newSubject.name} onChange={e => setNewSubject({ ...newSubject, name: e.target.value })} />
            <input placeholder="Código (ej: calculo1)" className="w-full p-3 rounded-xl border text-sm"
              value={newSubject.code} onChange={e => setNewSubject({ ...newSubject, code: e.target.value })} />
            <input placeholder="Facultad (ej: FING)" className="w-full p-3 rounded-xl border text-sm"
              value={newSubject.faculty} onChange={e => setNewSubject({ ...newSubject, faculty: e.target.value })} />
            <textarea placeholder="Descripción" className="w-full p-3 rounded-xl border text-sm"
              value={newSubject.description} onChange={e => setNewSubject({ ...newSubject, description: e.target.value })} />
            <Button className="w-full" onClick={handleCreateSubject}>Crear Materia</Button>
          </Card>
        </section>

        {/* Crear instancia/categoría */}
        <section>
          <h3 className="text-xl font-bold mb-6">Nueva Instancia</h3>
          <Card className="space-y-4">
            <select className="w-full p-3 rounded-xl border text-sm"
              value={newCategory.subjectId} onChange={e => setNewCategory({ ...newCategory, subjectId: e.target.value })}>
              <option value="">Seleccionar Materia</option>
              {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
            <input placeholder="Nombre (ej: Primer Parcial)" className="w-full p-3 rounded-xl border text-sm"
              value={newCategory.name} onChange={e => setNewCategory({ ...newCategory, name: e.target.value })} />
            <select className="w-full p-3 rounded-xl border text-sm"
              value={newCategory.type} onChange={e => setNewCategory({ ...newCategory, type: e.target.value })}>
              <option value="practico">Práctico</option>
              <option value="primer_parcial">Primer Parcial</option>
              <option value="segundo_parcial">Segundo Parcial</option>
              <option value="examen">Examen Final</option>
            </select>
            <input placeholder="Orden (0, 1, 2...)" type="number" className="w-full p-3 rounded-xl border text-sm"
              value={newCategory.order} onChange={e => setNewCategory({ ...newCategory, order: e.target.value })} />
            <Button className="w-full" onClick={handleCreateCategory}>Crear Instancia</Button>
          </Card>
        </section>
      </div>

      {/* Cargar conocimiento */}
      <section>
        <h3 className="text-xl font-bold mb-6">Cargar Base de Conocimiento (PDF / TXT)</h3>
        <Card className="space-y-4 max-w-lg">
          <select className="w-full p-3 rounded-xl border text-sm" onChange={e => setSelectedCat(e.target.value)}>
            <option value="">Seleccionar Instancia</option>
            {subjects.flatMap(s => s.categories.map((c: any) => (
              <option key={c.id} value={c.id}>{s.name} — {c.name}</option>
            )))}
          </select>
          <input type="file" accept=".pdf,.txt" className="w-full p-3 rounded-xl border text-sm"
            onChange={e => setFile(e.target.files?.[0] || null)} />
          <Button className="w-full" onClick={handleUpload} loading={loading}>Procesar y Cargar</Button>
          <p className="text-xs text-gray-400">El texto se dividirá en fragmentos de ~1000 caracteres que la IA usará como contexto (RAG).</p>
        </Card>
      </section>
    </div>
  );
};

// --- APP PRINCIPAL ---

export default function App() {
  const [view, setView] = useState('landing');
  const [user, setUser] = useState<any>(authService.getUser());
  const [activeSubject, setActiveSubject] = useState<any>(null);

  useEffect(() => {
    if (user) setView('dashboard');
  }, []);

  const handleAuthSuccess = () => {
    setUser(authService.getUser());
    setView('dashboard');
  };

  const handleAction = (type: string, data?: any) => {
    if (type === 'chat') {
      setActiveSubject(data);
      setView('chat');
    }
  };

  return (
    <div className="min-h-screen font-sans text-gray-900">
      {/* Sidebar para usuarios logueados */}
      {user && (
        <aside className="fixed left-0 top-0 h-full w-56 bg-white border-r flex flex-col py-6 px-3 gap-1 z-50">
          <div className="flex items-center gap-3 px-3 mb-8">
            <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center shrink-0">
              <BrainCircuit className="text-white w-5 h-5" />
            </div>
            <span className="text-lg font-bold text-gray-900 tracking-tight">TutorIA</span>
          </div>

          <NavBtn
            onClick={() => setView('dashboard')}
            active={view === 'dashboard'}
            icon={<LayoutDashboard className="w-5 h-5" />}
            label="Dashboard"
          />
          <NavBtn
            onClick={() => setView('subjects')}
            active={view === 'subjects' || view === 'chat'}
            icon={<MessageSquare className="w-5 h-5" />}
            label="Chat con Tutor"
          />
          {user.role === 'ADMIN' && (
            <NavBtn
              onClick={() => setView('admin')}
              active={view === 'admin'}
              icon={<Settings className="w-5 h-5" />}
              label="Administración"
            />
          )}

          <div className="mt-auto space-y-1">
            <div className="px-3 py-2 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
                <span className="text-xs font-bold text-indigo-600">
                  {(user.name?.[0] || user.email[0]).toUpperCase()}
                </span>
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-gray-800 truncate">{user.name || user.email}</p>
                <p className="text-[10px] text-gray-400 truncate">{user.email}</p>
              </div>
            </div>
            <NavBtn
              onClick={() => authService.logout()}
              active={false}
              icon={<LogOut className="w-5 h-5" />}
              label="Cerrar sesión"
              danger
            />
          </div>
        </aside>
      )}

      <main className={user ? 'pl-56' : ''}>
        <AnimatePresence mode="wait">
          {view === 'landing' && (
            <motion.div key="landing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <Landing onStart={(mode: string) => setView(mode)} />
            </motion.div>
          )}
          {(view === 'login' || view === 'register') && (
            <motion.div key="auth" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <Auth mode={view} onBack={() => setView('landing')} onSuccess={handleAuthSuccess} />
            </motion.div>
          )}
          {view === 'dashboard' && (
            <motion.div key="dashboard" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <Dashboard user={user} onAction={handleAction} />
            </motion.div>
          )}
          {view === 'subjects' && (
            <motion.div key="subjects" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <SubjectSelector onAction={handleAction} />
            </motion.div>
          )}
          {view === 'chat' && (
            <motion.div key="chat" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <Chat subject={activeSubject} onBack={() => setView('subjects')} />
            </motion.div>
          )}
          {view === 'admin' && (
            <motion.div key="admin" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <Admin onBack={() => setView('dashboard')} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}