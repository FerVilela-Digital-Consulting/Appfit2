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
    itemDescriptions: string[];
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
      switchLabel: "Cambiar a inglés",
    },
    hero: {
      badge: "Producto real hoy",
      title: "Gestiona tu operación fitness con",
      titleHighlight: "Appfit",
      titleSuffix: "",
      description:
        "Centro operativo, nutrición, entrenamiento, cuerpo, calendario, biofeedback y panel admin conectados en un solo sistema.",
      primary: "Entrar a Appfit",
      howItWorks: "Cómo funciona",
    },
    how: {
      title: "Cómo funciona",
      description: "Un flujo único: registra, compara y decide con datos reales del día a día.",
      steps: ["Registra tu día", "Coordina módulos clave", "Revisa progreso semanal"],
      itemDescriptions: [
        "Registra agua, sueño, nutrición, biofeedback y notas para construir un contexto diario confiable.",
        "Conecta centro operativo, nutrición, entrenamiento y cuerpo para decidir con una sola lectura.",
        "Evalúa tendencias, cumplimiento de metas y observaciones para ajustar la siguiente semana.",
      ],
    },
    featureRows: {
      firstTitle: "Centro operativo + calendario en una sola vista",
      firstDescription:
        "Abre el día con prioridades claras y timeline real de agua, sueño, nutrición, biofeedback, peso y notas.",
      firstButton: "Ver centro operativo",
      secondTitle: "Nutrición, entrenamiento y cuerpo conectados",
      secondDescription:
        "Plan nutricional, rutinas, progreso corporal y revisión semanal en un mismo flujo. Incluye vista admin para equipos.",
      secondButton: "Explorar módulos",
    },
    metrics: {
      items: [
        { value: "8", label: "Modulos operativos reales" },
        { value: "1", label: "Idioma de interfaz (ES)" },
        { value: "2", label: "Modos de acceso (cuenta/invitado)" },
        { value: "1", label: "Panel admin integrado" },
      ],
      title: "Módulos disponibles hoy",
      bullets: [
        "Centro operativo diario",
        "Nutrición",
        "Entrenamiento",
        "Cuerpo (peso + mediciones)",
        "Calendario operativo",
        "Biofeedback diario",
        "Progreso y revisión semanal",
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
        { title: "Recursos", items: ["Guía de App", "Foro", "Soporte", "Eventos"] },
        { title: "Tutoriales", items: ["Configurar entrenamiento", "Base nutricional", "Revisión semanal", "Ver guías"] },
      ],
      terms: "Términos y Condiciones",
      privacy: "Política de Privacidad",
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
      itemDescriptions: [
        "Log water, sleep, nutrition, biofeedback, and notes to build reliable daily context.",
        "Connect operations hub, nutrition, training, and body data to make decisions from one view.",
        "Review trends, goal adherence, and observations to adjust your next week with clarity.",
      ],
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
