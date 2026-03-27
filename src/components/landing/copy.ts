import type { LandingLanguage } from "@/components/landing/types";

export const landingCopy: Record<LandingLanguage, {
  header: {
    about: string;
    features: string;
    partners: string;
    pricing: string;
    contact: string;
    login: string;
    startFree: string;
    switchLabel: string;
  };
  hero: {
    badge: string;
    title: string;
    titleHighlight: string;
    titleSuffix: string;
    description: string;
    primary: string;
    howItWorks: string;
  };
  how: {
    title: string;
    description: string;
    steps: string[];
    itemDescription: string;
  };
  featureRows: {
    firstTitle: string;
    firstDescription: string;
    firstButton: string;
    secondTitle: string;
    secondDescription: string;
    secondButton: string;
  };
  metrics: {
    items: Array<{ value: string; label: string }>;
    title: string;
    bullets: string[];
  };
  footer: {
    title: string;
    description: string;
    playStore: string;
    appStore: string;
    groups: Array<{ title: string; items: string[] }>;
    terms: string;
    privacy: string;
    cookies: string;
  };
}> = {
  es: {
    header: {
      about: "Acerca",
      features: "Funciones",
      partners: "Aliados",
      pricing: "Precios",
      contact: "Contacto",
      login: "Inicia sesion",
      startFree: "Registrate",
      switchLabel: "Cambiar a ingles",
    },
    hero: {
      badge: "Bienvenido a The Prime Protocol",
      title: "Gestiona tu progreso fitness con",
      titleHighlight: "Appfit",
      titleSuffix: "",
      description:
        "Planifica entrenamientos, controla nutricion, monitorea recuperacion y revisa tu progreso semanal en un solo flujo.",
      primary: "Comenzar",
      howItWorks: "Como funciona",
    },
    how: {
      title: "Como funciona",
      description: "Construye tu semana, ejecuta cada dia y ajusta con datos reales de tu salud.",
      steps: ["Instala la app", "Crea tu plan fitness", "Sigue y mejora semanalmente"],
      itemDescription:
        "Todo en un solo lugar: entrenamiento, comidas, hidratacion, sueno y analitica de progreso.",
    },
    featureRows: {
      firstTitle: "Dashboard diario enfocado en accion",
      firstDescription:
        "Empieza cada dia con claridad: rutina, meta de hidratacion, estado de recuperacion y checkpoints de nutricion.",
      firstButton: "Abrir dashboard",
      secondTitle: "Nutricion y recuperacion sincronizadas",
      secondDescription:
        "Conecta comidas, sueno y biofeedback para que tu carga de entrenamiento se ajuste a tu capacidad real.",
      secondButton: "Empezar seguimiento",
    },
    metrics: {
      items: [
        { value: "10,000+", label: "Entrenamientos registrados" },
        { value: "89K", label: "Check-ins diarios" },
        { value: "30K", label: "Revisiones semanales" },
        { value: "2K", label: "Equipos activos" },
      ],
      title: "Funciones clave para tu progreso",
      bullets: ["Planificador de entrenamiento", "Objetivos de nutricion", "Metas de agua y sueno", "Insights de progreso"],
    },
    footer: {
      title: "Appfit disponible en todos tus dispositivos",
      description: "Sigue tus metas desde cualquier lugar y mantén tu progreso sincronizado.",
      playStore: "Google Play",
      appStore: "App Store",
      groups: [
        { title: "Inicio", items: ["Producto", "Precios", "Negocios", "Enterprise"] },
        { title: "Nosotros", items: ["Empresa", "Equipo", "Carreras", "Diversidad"] },
        { title: "Recursos", items: ["Guia de App", "Foro", "Soporte", "Eventos"] },
        { title: "Tutoriales", items: ["Configurar entrenamiento", "Base nutricional", "Revision semanal", "Ver guias"] },
      ],
      terms: "Terminos y Condiciones",
      privacy: "Politica de Privacidad",
      cookies: "Cookies",
    },
  },
  en: {
    header: {
      about: "About",
      features: "Features",
      partners: "Partners",
      pricing: "Pricing",
      contact: "Contact",
      login: "Sign in",
      startFree: "Sign up",
      switchLabel: "Switch to Spanish",
    },
    hero: {
      badge: "Welcome to The Prime Protocol",
      title: "Manage your fitness progress with",
      titleHighlight: "Appfit",
      titleSuffix: "",
      description:
        "Plan training, track nutrition, monitor recovery, and review your weekly progress in one clear workflow.",
      primary: "Get Started",
      howItWorks: "How it works",
    },
    how: {
      title: "How it works",
      description: "Build your week, execute every day, and adapt with real health feedback.",
      steps: ["Install the app", "Create your fitness plan", "Track and improve weekly"],
      itemDescription:
        "Keep everything in one workflow: training, meals, hydration, sleep, and progress analytics.",
    },
    featureRows: {
      firstTitle: "Daily dashboard focused on action",
      firstDescription:
        "Start each day with clarity: workout, hydration target, recovery status, and nutrition checkpoints.",
      firstButton: "Open dashboard",
      secondTitle: "Nutrition and recovery in sync",
      secondDescription:
        "Connect meals, sleep, and biofeedback so your training load matches your real recovery capacity.",
      secondButton: "Start tracking",
    },
    metrics: {
      items: [
        { value: "10,000+", label: "Workouts logged" },
        { value: "89K", label: "Daily check-ins" },
        { value: "30K", label: "Weekly reviews" },
        { value: "2K", label: "Active teams" },
      ],
      title: "Key features for your progress",
      bullets: ["Training Planner", "Nutrition Targets", "Water and Sleep Goals", "Progress Insights"],
    },
    footer: {
      title: "Appfit is available across your devices",
      description: "Track your goals from anywhere and keep your progress synced.",
      playStore: "Google Play",
      appStore: "App Store",
      groups: [
        { title: "Home", items: ["Product", "Pricing", "Business", "Enterprise"] },
        { title: "About", items: ["Company", "Team", "Careers", "Diversity"] },
        { title: "Resources", items: ["App Guide", "Forum", "Support", "Events"] },
        { title: "Tutorials", items: ["Training setup", "Nutrition baseline", "Weekly review", "View guides"] },
      ],
      terms: "Terms & Conditions",
      privacy: "Privacy Policy",
      cookies: "Cookies",
    },
  },
};

