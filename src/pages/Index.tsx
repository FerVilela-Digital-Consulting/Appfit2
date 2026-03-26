import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import {
  Activity,
  BarChart3,
  ArrowRight,
  CheckCircle2,
  Dumbbell,
  Flame,
  HeartPulse,
  Loader2,
  Menu,
  MoonStar,
  ShieldCheck,
  Sparkles,
  Target,
  Trophy
} from "lucide-react";

const highlights = [
  { value: "8.2k", label: "Usuarios activos" },
  { value: "120+", label: "Planes completados" },
  { value: "97%", label: "Retencion mensual" },
];

const serviceCards = [
  {
    icon: Dumbbell,
    title: "Entrenamiento inteligente",
    text: "Rutinas por objetivos, historial por ejercicio y seguimiento de consistencia.",
  },
  {
    icon: Flame,
    title: "Nutricion accionable",
    text: "Control de calorias, macros y libreria de comidas para resultados sostenibles.",
  },
  {
    icon: MoonStar,
    title: "Recuperacion real",
    text: "Sueno, hidratacion y biofeedback en un mismo tablero para prevenir desgaste.",
  },
];

const process = [
  { step: "01", title: "Configura", text: "Define objetivo, nivel y disponibilidad." },
  { step: "02", title: "Entrena", text: "Sigue tu plan con bloques diarios claros." },
  { step: "03", title: "Ajusta", text: "Revisa progreso y optimiza semana a semana." },
];

const trustPills = [
  "Planes personalizados",
  "Datos seguros",
  "Sin complejidad tecnica",
];

const workCards = [
  {
    title: "Dashboard Diario",
    subtitle: "Control total de hoy",
    gradient: "from-zinc-900 to-zinc-700",
    icon: Activity,
  },
  {
    title: "Training Logbook",
    subtitle: "Progresion por rutina",
    gradient: "from-neutral-800 to-neutral-600",
    icon: Dumbbell,
  },
  {
    title: "Nutrition Hub",
    subtitle: "Comidas y macros",
    gradient: "from-zinc-800 to-zinc-600",
    icon: HeartPulse,
  },
  {
    title: "Progress Analytics",
    subtitle: "Tendencias semanales",
    gradient: "from-neutral-900 to-zinc-700",
    icon: BarChart3,
  },
];

const Index = () => {
  const { user, isGuest, loading: authLoading, continueAsGuest } = useAuth();
  const navigate = useNavigate();

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white [font-family:'Space_Grotesk',sans-serif]">
      <header className="sticky top-0 z-20 border-b border-white/10 bg-black/90 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-4">
          <div className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-[0.18em]">
            <Sparkles className="h-4 w-4 text-[#fbbc05]" />
            Appfit
          </div>
          <nav className="hidden items-center gap-6 text-sm text-white/80 md:flex">
            <a className="hover:text-white" href="#about">Sobre Appfit</a>
            <a className="hover:text-white" href="#features">Funciones</a>
            <a className="hover:text-white" href="#pricing">Planes</a>
          </nav>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              className="hidden text-white hover:bg-white/10 hover:text-white sm:inline-flex"
              onClick={() => navigate(user || isGuest ? "/today" : "/auth")}
            >
              {user || isGuest ? "Dashboard" : "Log In"}
            </Button>
            <Button
              className="bg-[#fbbc05] text-black hover:bg-[#f5b000]"
              onClick={() => navigate(user || isGuest ? "/today" : "/auth")}
            >
              {user || isGuest ? "Continuar" : "Get Started"}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/10 md:hidden"
              onClick={() => navigate(user || isGuest ? "/today" : "/auth")}
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      <main>
        <section className="relative mx-auto grid w-full max-w-6xl gap-10 px-5 pb-16 pt-12 lg:grid-cols-[1.08fr_0.92fr] lg:pt-20">
          <div className="space-y-7">
            <p className="inline-flex items-center gap-2 rounded-full border border-[#fbbc05]/40 bg-[#fbbc05]/10 px-3 py-1 text-xs uppercase tracking-[0.15em] text-[#fbbc05]">
              <Trophy className="h-3.5 w-3.5" />
              Plataforma fitness todo-en-uno
            </p>
            <h1 className="text-4xl font-bold leading-[1.05] sm:text-5xl lg:text-6xl">
              TU PROGRESO
              <span className="block text-[#fbbc05]">EN MODO SERIO</span>
            </h1>
            <p className="max-w-xl text-base text-white/75 sm:text-lg">
              Appfit unifica entrenamiento, nutricion, recuperacion y analitica para que cada
              semana se sienta como avance real, no como intentos sueltos.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button
                className="group bg-[#fbbc05] px-7 py-6 text-base text-black hover:bg-[#f5b000]"
                onClick={() => navigate(user || isGuest ? "/today" : "/auth")}
              >
                {user || isGuest ? "Ir a mi dashboard" : "Comenzar ahora"}
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
              <Button
                variant="outline"
                className="border-white/25 bg-transparent px-7 py-6 text-base text-white hover:bg-white/10"
                onClick={() => {
                  continueAsGuest();
                  navigate("/today");
                }}
              >
                Probar como invitado
              </Button>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              {highlights.map((item) => (
                <article key={item.label} className="border border-white/15 bg-white/5 p-4">
                  <p className="text-3xl font-bold text-[#fbbc05]">{item.value}</p>
                  <p className="mt-1 text-sm text-white/70">{item.label}</p>
                </article>
              ))}
            </div>
          </div>

          <div className="relative flex items-center justify-center py-4">
            <div className="absolute h-48 w-full max-w-sm -rotate-12 bg-[#fbbc05]/50 blur-[110px]" />
            <div className="relative w-[280px] rounded-[2.25rem] border-4 border-white/20 bg-zinc-950 p-3 shadow-[0_24px_80px_rgba(0,0,0,0.55)] sm:w-[315px]">
              <div className="rounded-[1.65rem] border border-white/10 bg-gradient-to-b from-zinc-800 to-zinc-900 p-4">
                <div className="mb-4 flex items-center justify-between">
                  <p className="text-xs uppercase tracking-[0.16em] text-white/60">Hoy</p>
                  <p className="text-xs text-[#fbbc05]">Consistencia 92%</p>
                </div>
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between rounded-xl bg-white/5 p-3">
                    <span className="text-sm">Entrenamiento</span>
                    <span className="text-xs text-[#fbbc05]">Completado</span>
                  </div>
                  <div className="flex items-center justify-between rounded-xl bg-white/5 p-3">
                    <span className="text-sm">Nutricion</span>
                    <span className="text-xs text-[#fbbc05]">1450 kcal</span>
                  </div>
                  <div className="flex items-center justify-between rounded-xl bg-white/5 p-3">
                    <span className="text-sm">Sueno</span>
                    <span className="text-xs text-[#fbbc05]">7h 42m</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="absolute -left-2 top-[12%] hidden items-center gap-2 bg-[#fbbc05] px-3 py-2 text-xs text-black shadow-lg sm:inline-flex">
              <CheckCircle2 className="h-4 w-4" />
              Rutina del dia lista
            </div>
            <div className="absolute -bottom-1 right-0 hidden items-center gap-2 bg-[#ec5c2e] px-3 py-2 text-xs text-white shadow-lg sm:inline-flex">
              <Target className="h-4 w-4" />
              Meta semanal en progreso
            </div>
          </div>
        </section>

        <section id="about" className="mx-auto w-full max-w-6xl px-5 py-14">
          <div className="grid gap-8 lg:grid-cols-2">
            <div className="space-y-5">
              <p className="text-xs uppercase tracking-[0.22em] text-[#fbbc05]">Sobre Appfit</p>
              <h2 className="text-3xl font-bold leading-tight sm:text-4xl">
                Una sola plataforma para entrenar mejor, no mas complicado.
              </h2>
            </div>
            <p className="text-base leading-relaxed text-white/75">
              Diseñamos Appfit para que cualquier persona pueda convertir objetivos difusos en un
              plan concreto: hoy entrenas, mañana ajustas, y al final de la semana entiendes por que
              mejoraste. Sin hojas sueltas, sin apps desconectadas.
            </p>
          </div>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {serviceCards.map((feature) => (
              <article key={feature.title} className="border border-white/15 bg-white/5 p-6">
                <feature.icon className="h-8 w-8 text-[#fbbc05]" />
                <h3 className="mt-4 text-xl font-semibold">{feature.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/70">{feature.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="features" className="mx-auto w-full max-w-6xl px-5 py-14">
          <div className="mb-8 text-center">
            <p className="text-xs uppercase tracking-[0.2em] text-[#fbbc05]">Selected Work</p>
            <h2 className="mt-2 text-3xl font-bold sm:text-4xl">Experiencia Appfit</h2>
          </div>
          <div className="grid gap-5 md:grid-cols-2">
            {workCards.map((card) => (
              <article key={card.title} className="space-y-3">
                <div className={`flex h-64 items-center justify-center bg-gradient-to-br ${card.gradient} border border-white/10`}>
                  <card.icon className="h-12 w-12 text-[#fbbc05]" />
                </div>
                <h3 className="text-2xl font-semibold">{card.title}</h3>
                <p className="text-white/70">{card.subtitle}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="mx-auto w-full max-w-6xl px-5 py-14">
          <div className="grid gap-4 md:grid-cols-3">
            {process.map((item) => (
              <article key={item.step} className="border border-white/15 bg-white/5 p-6">
                <p className="text-5xl font-bold text-[#fbbc05]">{item.step}</p>
                <h3 className="mt-3 text-2xl font-semibold">{item.title}</h3>
                <p className="mt-2 text-white/70">{item.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="pricing" className="mx-auto w-full max-w-6xl px-5 py-14">
          <div className="mb-8 text-center">
            <p className="text-xs uppercase tracking-[0.2em] text-[#fbbc05]">Planes</p>
            <h2 className="mt-2 text-3xl font-bold sm:text-4xl">Escoge tu ritmo</h2>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            <article className="border border-white/15 bg-white/5 p-6">
              <p className="text-sm text-white/70">Basic</p>
              <p className="mt-2 text-4xl font-bold">$9</p>
              <p className="mt-1 text-sm text-white/60">/ mes</p>
            </article>
            <article className="border-2 border-[#fbbc05] bg-[#fbbc05] p-6 text-black">
              <p className="text-sm text-black/70">Pro</p>
              <p className="mt-2 text-4xl font-bold">$24</p>
              <p className="mt-1 text-sm text-black/70">/ mes</p>
            </article>
            <article className="border border-white/15 bg-white/5 p-6">
              <p className="text-sm text-white/70">Team</p>
              <p className="mt-2 text-4xl font-bold">$49</p>
              <p className="mt-1 text-sm text-white/60">/ mes</p>
            </article>
          </div>
        </section>

        <section className="mx-auto w-full max-w-6xl px-5 py-16">
          <div className="border border-[#fbbc05] bg-[#fbbc05] px-6 py-12 text-center text-black sm:px-10">
            <h2 className="mx-auto max-w-3xl text-3xl font-bold leading-tight sm:text-5xl">
              Construye resultados medibles en 30 dias
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-sm sm:text-base">
              El mismo look del Figma, aterrizado a tu producto: Appfit para entrenamiento,
              nutricion y progreso diario.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
              {trustPills.map((pill) => (
                <span
                  key={pill}
                  className="inline-flex items-center gap-1 bg-black px-3 py-1 text-xs font-medium text-white"
                >
                  <ShieldCheck className="h-3.5 w-3.5 text-[#fbbc05]" />
                  {pill}
                </span>
              ))}
            </div>
            <Button
              className="mt-8 bg-black px-7 py-6 text-base text-white hover:bg-zinc-900"
              onClick={() => navigate(user || isGuest ? "/today" : "/auth")}
            >
              {user || isGuest ? "Abrir mi panel" : "Crear cuenta gratis"}
            </Button>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Index;
