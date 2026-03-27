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
      login: "Entrar",
      startFree: "Crear cuenta",
      switchLabel: "Cambiar a ingles",
    },
    hero: {
      badge: "Producto real hoy",
      title: "Gestiona tu operacion fitness con",
      titleHighlight: "Appfit",
      titleSuffix: "",
      description:
        "Centro operativo, nutricion, entrenamiento, cuerpo, calendario, biofeedback y panel admin conectados en un solo sistema.",
      primary: "Entrar a Appfit",
      howItWorks: "Como funciona",
    },
    how: {
      title: "Como funciona",
      description: "Un flujo unico: registra, compara y decide con datos reales del dia a dia.",
      steps: ["Registra tu dia", "Coordina modulos clave", "Revisa progreso semanal"],
      itemDescription:
        "Todo en una misma plataforma: centro operativo, nutricion, entrenamiento, cuerpo, calendario y biofeedback.",
    },
    featureRows: {
      firstTitle: "Centro operativo + calendario en una sola vista",
      firstDescription:
        "Abre el dia con prioridades claras y timeline real de agua, sueno, nutricion, biofeedback, peso y notas.",
      firstButton: "Ver centro operativo",
      secondTitle: "Nutricion, entrenamiento y cuerpo conectados",
      secondDescription:
        "Plan nutricional, rutinas, progreso corporal y revision semanal en un mismo flujo. Incluye vista admin para equipos.",
      secondButton: "Explorar modulos",
    },
    metrics: {
      items: [
        { value: "8", label: "Modulos operativos reales" },
        { value: "2", label: "Idiomas de interfaz (ES/EN)" },
        { value: "2", label: "Modos de acceso (cuenta/invitado)" },
        { value: "1", label: "Panel admin integrado" },
      ],
      title: "Modulos disponibles hoy",
      bullets: [
        "Centro operativo diario",
        "Nutricion",
        "Entrenamiento",
        "Cuerpo (peso + mediciones)",
        "Calendario operativo",
        "Biofeedback diario",
        "Progreso y revision semanal",
        "Admin (usuarios, roles y uso)",
      ],
    },
    footer: {
      title: "Appfit para operar tu proceso completo",
      description: "Sin roadmap inflado: solo funciones activas que ya puedes usar hoy.",
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
      startFree: "Create account",
      switchLabel: "Switch to Spanish",
    },
    hero: {
      badge: "Real product today",
      title: "Run your fitness operations with",
      titleHighlight: "Appfit",
      titleSuffix: "",
      description:
        "Operations hub, nutrition, training, body, calendar, biofeedback, and admin panel connected in one system.",
      primary: "Enter Appfit",
      howItWorks: "How it works",
    },
    how: {
      title: "How it works",
      description: "One connected flow: log, compare, and decide with real day-to-day data.",
      steps: ["Log your day", "Coordinate key modules", "Review weekly progress"],
      itemDescription:
        "Everything in one platform: operations hub, nutrition, training, body, calendar, and biofeedback.",
    },
    featureRows: {
      firstTitle: "Operations hub + calendar in one view",
      firstDescription:
        "Start with clear priorities and a real timeline for water, sleep, nutrition, biofeedback, weight, and notes.",
      firstButton: "Open operations hub",
      secondTitle: "Nutrition, training, and body connected",
      secondDescription:
        "Nutrition planning, routines, body progress, and weekly review in one flow. Includes admin views for teams.",
      secondButton: "Explore modules",
    },
    metrics: {
      items: [
        { value: "8", label: "Real operational modules" },
        { value: "2", label: "Interface languages (ES/EN)" },
        { value: "2", label: "Access modes (account/guest)" },
        { value: "1", label: "Integrated admin panel" },
      ],
      title: "Modules available today",
      bullets: [
        "Daily operations hub",
        "Nutrition",
        "Training",
        "Body (weight + measurements)",
        "Operational calendar",
        "Daily biofeedback",
        "Progress and weekly review",
        "Admin (users, roles, and usage)",
      ],
    },
    footer: {
      title: "Appfit to run your full process",
      description: "No inflated roadmap claims: only active capabilities you can use today.",
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

