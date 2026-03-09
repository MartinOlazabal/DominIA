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

// --- COMPONENTES UI ---

const Button = ({ children, onClick, variant = 'primary', className = '', loading = false, disabled = false }: any) => {
  const base = "px-6 py-2.5 rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50";
  const variants: any = {
    primary: "bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-200",
    secondary: "bg-white text-indigo-600 border border-indigo-100 hover:bg-indigo-50",
    ghost: "bg-transparent text-gray-600 hover:bg-gray-100",
    danger: "bg-red-50 text-red-600 hover:bg-red-100"
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
  <div className={`bg-white rounded-2xl border border-gray-100 shadow-sm p-6 ${className}`} {...props}>
    {children}
  </div>
);

// --- COMPONENTES DE NAVEGACIÓN ---

const NavBtn = ({ onClick, active, icon, label, danger = false }: any) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left font-medium transition-all text-sm
      ${danger
        ? 'text-gray-400 hover:text-red-600 hover:bg-red-50'
        : active
          ? 'bg-indigo-50 text-indigo-600'
          : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800'
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
    <div className="p-8 max-w-5xl mx-auto">
      <h2 className="text-4xl font-bold mb-2">Materias</h2>
      <p className="text-gray-500 mb-10">Selecciona una materia para hablar con tu tutor IA</p>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {subjects.map(s => (
          <Card
            key={s.id}
            className="hover:border-indigo-200 transition-colors cursor-pointer group"
            onClick={() => onAction('chat', s)}
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center group-hover:bg-indigo-50 transition-colors">
                <BookOpen className="text-indigo-600 w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-lg">{s.name}</h4>
                <p className="text-sm text-gray-500">{s.categories.length} categorías</p>
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-6 line-clamp-2">{s.description}</p>
            <Button variant="secondary" className="w-full">
              Comenzar Chat <ChevronRight className="w-4 h-4" />
            </Button>
          </Card>
        ))}
        {subjects.length === 0 && (
          <div className="col-span-3 text-center text-gray-400 py-20">
            <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p className="text-lg font-semibold mb-1">No hay materias disponibles</p>
            <p className="text-sm">Un administrador debe crearlas desde el Panel de Administración.</p>
          </div>
        )}
      </div>
    </div>
  );
};

const Landing = ({ onStart }: any) => (
  <div className="min-h-screen bg-[#F8FAFC]">
    {/* Navbar */}
    <nav className="max-w-7xl mx-auto px-6 py-6 flex justify-between items-center">
      <div className="flex items-center gap-2">
        <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center">
          <BrainCircuit className="text-white w-6 h-6" />
        </div>
        <span className="text-xl font-bold text-gray-900 tracking-tight">TutorIA</span>
      </div>
      <div className="flex gap-4">
        <Button variant="ghost" onClick={() => onStart('login')}>Iniciar Sesión</Button>
        <Button onClick={() => onStart('register')}>Empezar Gratis</Button>
      </div>
    </nav>

    {/* Hero */}
    <main className="max-w-7xl mx-auto px-6 pt-20 pb-32 grid lg:grid-cols-2 gap-16 items-center">
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
      >
        <span className="inline-block px-4 py-1.5 bg-indigo-50 text-indigo-600 rounded-full text-sm font-semibold mb-6">
          Especializado en FING, Udelar
        </span>
        <h1 className="text-6xl font-bold text-gray-900 leading-[1.1] mb-8">
          Domina tus exámenes de <span className="text-indigo-600">Ingeniería</span> con IA.
        </h1>
        <p className="text-xl text-gray-600 mb-10 leading-relaxed">
          Tu tutor personal disponible 24/7. Preparación específica para Cálculo 1, CDIV, GAL y más. Basado en exámenes reales y bibliografía oficial.
        </p>
        <div className="flex gap-4">
          <Button className="px-8 py-4 text-lg" onClick={() => onStart('register')}>Comenzar Prueba de 7 Días</Button>
          <Button variant="secondary" className="px-8 py-4 text-lg">Ver Cursos</Button>
        </div>

        <div className="mt-12 flex items-center gap-6">
          <div className="flex -space-x-3">
            {[1, 2, 3, 4].map(i => (
              <img key={i} src={`https://picsum.photos/seed/user${i}/100`} className="w-10 h-10 rounded-full border-2 border-white" referrerPolicy="no-referrer" />
            ))}
          </div>
          <p className="text-sm text-gray-500">
            <span className="font-bold text-gray-900">+500 estudiantes</span> ya están aprobando con TutorIA
          </p>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative"
      >
        <div className="absolute -inset-4 bg-indigo-500/10 blur-3xl rounded-full" />
        <Card className="relative overflow-hidden border-2 border-indigo-50">
          <div className="flex items-center gap-3 mb-6 pb-4 border-bottom border-gray-50">
            <div className="w-3 h-3 rounded-full bg-red-400" />
            <div className="w-3 h-3 rounded-full bg-yellow-400" />
            <div className="w-3 h-3 rounded-full bg-green-400" />
            <span className="text-xs font-mono text-gray-400 ml-2">Tutor Virtual - Cálculo 1</span>
          </div>
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-2xl max-w-[80%]">
              <p className="text-sm text-gray-700">¿Cómo puedo resolver una integral por partes?</p>
            </div>
            <div className="bg-indigo-600 p-4 rounded-2xl text-white ml-auto max-w-[80%] shadow-lg">
              <p className="text-sm">¡Claro! Recuerda la regla <span className="font-mono bg-white/20 px-1 rounded">ILATE</span>. Para el primer parcial de Cálculo 1, solemos usarla cuando...</p>
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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-6">
      <Card className="w-full max-w-md p-8">
        <button onClick={onBack} className="text-gray-400 hover:text-gray-600 mb-6 flex items-center gap-2 text-sm">
          <ChevronRight className="rotate-180 w-4 h-4" /> Volver
        </button>
        <h2 className="text-3xl font-bold mb-2">{mode === 'login' ? 'Bienvenido' : 'Crea tu cuenta'}</h2>
        <p className="text-gray-500 mb-8">{mode === 'login' ? 'Ingresa tus credenciales para continuar' : 'Únete a la comunidad de ingeniería'}</p>

        {error && <div className="bg-red-50 text-red-600 p-3 rounded-xl mb-6 text-sm flex items-center gap-2"><AlertCircle className="w-4 h-4" /> {error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre Completo</label>
              <input
                type="text"
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                value={name}
                onChange={e => setName(e.target.value)}
              />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              required
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
            <input
              type="password"
              required
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          </div>
          <Button className="w-full py-4 mt-4" loading={loading}>
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
    <div className="p-8 max-w-7xl mx-auto">
      <header className="flex justify-between items-end mb-12">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Hola, {user.name} 👋</h1>
          <p className="text-gray-500">Tu progreso actual en la facultad</p>
        </div>
        <div className="flex gap-4">
          <Card className="py-3 px-6 flex items-center gap-3">
            <TrendingUp className="text-emerald-500 w-5 h-5" />
            <div>
              <p className="text-xs text-gray-400 uppercase font-bold tracking-wider">Nivel IA</p>
              <p className="text-lg font-bold">{data.profile.abstractionLevel}/5</p>
            </div>
          </Card>
        </div>
      </header>

      <div className="grid lg:grid-cols-3 gap-8 mb-12">
        <Card className="lg:col-span-2">
          <h3 className="text-lg font-bold mb-6">Actividad de Aprendizaje</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="#4F46E5" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 12 }} />
                <YAxis hide />
                <Tooltip
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Area type="monotone" dataKey="value" stroke="#4F46E5" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <div className="space-y-6">
          <Card>
            <h3 className="text-lg font-bold mb-4">Estadísticas</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Ejercicios Resueltos</span>
                <span className="font-bold">{data.profile.statsExercises}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Tasa de Acierto</span>
                <span className="font-bold text-emerald-600">{data.profile.statsExercises > 0 ? (data.profile.statsCorrect / data.profile.statsExercises * 100).toFixed(0) : 0}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Tiempo de Estudio</span>
                <span className="font-bold">{data.profile.statsTimeSpent} min</span>
              </div>
            </div>
          </Card>

          <Card className="bg-indigo-600 text-white border-none">
            <h3 className="font-bold mb-2">Suscripción {data.subscription.status === 'trial' ? 'Prueba' : 'Activa'}</h3>
            <p className="text-indigo-100 text-sm mb-4">Vence el {new Date(data.subscription.expiresAt).toLocaleDateString()}</p>
            <Button variant="secondary" className="w-full bg-white/10 border-white/20 text-white hover:bg-white/20">Gestionar Plan</Button>
          </Card>
        </div>
      </div>

      <h3 className="text-2xl font-bold mb-6">Tus Materias</h3>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {subjects.map(s => (
          <Card key={s.id} className="hover:border-indigo-200 transition-colors cursor-pointer group" onClick={() => onAction('chat', s)}>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center group-hover:bg-indigo-50 transition-colors">
                <BookOpen className="text-indigo-600 w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-lg">{s.name}</h4>
                <p className="text-sm text-gray-500">{s.categories.length} Categorías</p>
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-6 line-clamp-2">{s.description}</p>
            <div className="flex justify-between items-center">
              <div className="flex -space-x-2">
                {[1, 2, 3].map(i => <div key={i} className="w-6 h-6 rounded-full bg-gray-100 border-2 border-white" />)}
              </div>
              <span className="text-indigo-600 font-bold text-sm flex items-center gap-1">
                Entrar <ChevronRight className="w-4 h-4" />
              </span>
            </div>
          </Card>
        ))}
        <Card className="border-dashed border-2 flex flex-col items-center justify-center text-gray-400 hover:text-indigo-600 hover:border-indigo-200 transition-all">
          <Plus className="w-8 h-8 mb-2" />
          <p className="font-medium">Próximamente más materias</p>
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
  // Loading específico para la carga del mensaje de bienvenida
  const [welcomeLoading, setWelcomeLoading] = useState(false);
  // Mapa de progreso por categoryId: { [id]: progressData }
  const [progressMap, setProgressMap] = useState<Record<string, any>>({});
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

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMsg = { role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      // Enviar al backend con contexto de materia e instancia
      const res = await dataService.sendMessage(input, subject.id, category.id);
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
      <div className="p-8 max-w-4xl mx-auto">
        <button onClick={onBack} className="text-gray-400 hover:text-gray-600 mb-8 flex items-center gap-2">
          <ChevronRight className="rotate-180 w-4 h-4" /> Volver al Dashboard
        </button>

        <div className="flex items-center gap-4 mb-2">
          <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center">
            <BookOpen className="text-indigo-600 w-6 h-6" />
          </div>
          <div>
            <h2 className="text-4xl font-bold">{subject.name}</h2>
            <p className="text-gray-500 text-sm">{subject.faculty || 'FING'} · {subject.description}</p>
          </div>
        </div>

        <p className="text-gray-500 mb-8 mt-6">Selecciona qué instancia quieres preparar hoy</p>

        <div className="grid md:grid-cols-2 gap-6">
          {subject.categories.map((cat: any) => {
            // Configuración visual por tipo de instancia
            const typeConfig: Record<string, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
              practico: { label: 'Práctico', color: 'text-blue-600', bg: 'bg-blue-50', icon: <FlaskConical className="w-5 h-5" /> },
              primer_parcial: { label: 'Primer Parcial', color: 'text-amber-600', bg: 'bg-amber-50', icon: <Target className="w-5 h-5" /> },
              segundo_parcial: { label: 'Segundo Parcial', color: 'text-orange-600', bg: 'bg-orange-50', icon: <Target className="w-5 h-5" /> },
              examen: { label: 'Examen Final', color: 'text-red-600', bg: 'bg-red-50', icon: <Trophy className="w-5 h-5" /> }
            };
            const cfg = typeConfig[cat.type] || { label: cat.type, color: 'text-indigo-600', bg: 'bg-indigo-50', icon: <BookOpen className="w-5 h-5" /> };

            // Datos de progreso de esta instancia (si ya se cargaron)
            const prog = progressMap[cat.id];
            const interactions = prog?.interactionsCount || 0;
            const level = prog?.level || 1;

            return (
              <Card
                key={cat.id}
                className="hover:border-indigo-400 transition-all cursor-pointer p-6 group"
                onClick={() => setCategory(cat)}
              >
                {/* Encabezado con ícono del tipo */}
                <div className="flex items-center justify-between mb-4">
                  <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${cfg.bg}`}>
                    <span className={cfg.color}>{cfg.icon}</span>
                    <span className={`text-xs font-bold uppercase tracking-wider ${cfg.color}`}>{cfg.label}</span>
                  </div>
                  {/* Badge de progreso: distinto si ya interactuó */}
                  {interactions > 0 ? (
                    <div className="flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full text-xs font-bold">
                      <Flame className="w-3 h-3" />
                      {interactions} sesión{interactions !== 1 ? 'es' : ''}
                    </div>
                  ) : (
                    <span className="text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded-full">Sin iniciar</span>
                  )}
                </div>

                <h4 className="text-xl font-bold mb-1">{cat.name}</h4>
                <p className="text-gray-500 text-sm mb-5">
                  {interactions > 0
                    ? `Nivel ${level}/5 · ${interactions} interacción${interactions !== 1 ? 'es' : ''} previas`
                    : 'Preparación enfocada con base de conocimiento específica.'}
                </p>

                {/* Barra de nivel de progreso */}
                {interactions > 0 && (
                  <div className="mb-5">
                    <div className="flex justify-between text-xs text-gray-400 mb-1">
                      <span>Nivel de dominio</span>
                      <span>{level}/5</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-indigo-500 rounded-full transition-all"
                        style={{ width: `${(level / 5) * 100}%` }}
                      />
                    </div>
                  </div>
                )}

                <Button
                  variant={interactions > 0 ? 'primary' : 'secondary'}
                  className="w-full"
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

  // ── Pantalla de chat ─────────────────────────────────────────────────────────
  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header con materia, instancia y estado */}
      <header className="bg-white border-b px-8 py-4 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setCategory(null)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Volver a las instancias"
          >
            <ChevronRight className="rotate-180 w-5 h-5" />
          </button>
          <div>
            <h3 className="font-bold text-gray-900">{subject.name}</h3>
            <div className="flex items-center gap-2">
              <p className="text-xs text-indigo-600 font-bold uppercase tracking-wider">{category.name}</p>
              {/* Indicador de progreso en el header */}
              {progressMap[category.id]?.interactionsCount > 0 && (
                <span className="text-[10px] bg-indigo-50 text-indigo-500 px-2 py-0.5 rounded-full font-semibold">
                  Nivel {progressMap[category.id]?.level || 1}/5
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-sm font-medium text-gray-500">Tutor Online</span>
        </div>
      </header>

      {/* Área de mensajes */}
      <div className="flex-1 overflow-y-auto p-8 space-y-6">

        {/* Estado de carga del mensaje de bienvenida */}
        {welcomeLoading && (
          <div className="flex justify-start">
            <div className="bg-white border border-gray-100 px-5 py-4 rounded-2xl flex items-center gap-3 text-gray-500 text-sm shadow-sm">
              <Loader2 className="w-4 h-4 animate-spin text-indigo-500" />
              Preparando tu tutor personalizado...
            </div>
          </div>
        )}

        {/* Lista de mensajes */}
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {/* Avatar del asistente */}
            {m.role === 'assistant' && (
              <div className="w-8 h-8 bg-indigo-600 rounded-xl flex items-center justify-center mr-3 shrink-0 mt-1">
                <BrainCircuit className="text-white w-4 h-4" />
              </div>
            )}
            <div className={`max-w-[70%] p-4 rounded-2xl shadow-sm ${m.role === 'user'
              ? 'bg-indigo-600 text-white'
              : m.isError
                ? 'bg-red-50 border border-red-100 text-red-700'
                : m.isWelcome
                  ? 'bg-gradient-to-br from-indigo-50 to-white border border-indigo-100 text-gray-800'
                  : 'bg-white border border-gray-100 text-gray-800'
              }`}>
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{m.content}</p>
            </div>
          </div>
        ))}

        {/* Indicador de "escribiendo..." */}
        {loading && (
          <div className="flex justify-start">
            <div className="w-8 h-8 bg-indigo-600 rounded-xl flex items-center justify-center mr-3 shrink-0">
              <BrainCircuit className="text-white w-4 h-4" />
            </div>
            <div className="bg-white border border-gray-100 p-4 rounded-2xl flex gap-1.5 items-center shadow-sm">
              <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" />
              <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce [animation-delay:100ms]" />
              <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce [animation-delay:200ms]" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input de chat */}
      <div className="p-6 bg-white border-t">
        <div className="max-w-4xl mx-auto relative">
          <textarea
            rows={1}
            placeholder={`Pregúntame sobre ${subject.name} - ${category.name}...`}
            className="w-full pl-6 pr-16 py-4 bg-gray-50 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none resize-none text-sm"
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
            className="absolute right-3 top-1/2 -translate-y-1/2 p-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-40 transition-all"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        <p className="text-center text-[10px] text-gray-400 mt-3 uppercase tracking-widest font-bold">
          TutorIA · Gemini Flash · RAG Activo · {subject.name} / {category.name}
        </p>
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