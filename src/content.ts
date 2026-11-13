/**
 * Todo el texto de la página vive aquí.
 * Cambia los textos sin tocar los componentes.
 */

export type Block = { type: "p" | "quote"; text: string };

export const site = {
  title: "Dije que sí",
  description:
    "Cómo pasé de no saber programar a construir proyectos que usan miles de personas.",
  author: "Sebastian Ordoñez Gonzalez",
  authorLine: "Ingeniería de Sistemas · cuarto semestre · Barranquilla",
  /** Foto (en /public) que aparece en el cierre. Pon null para ocultarla. */
  photo: "/sebastian.webp" as string | null,
  photoAlt: "Foto de Sebastian Ordoñez Gonzalez",
  keyboardHint: "Avanza con las flechas o la barra espaciadora",
  fullscreenHint: "F para pantalla completa",
};

export const hero = {
  id: "inicio",
  navLabel: "Inicio",
  /** La última palabra se resalta con el color de acento. */
  title: ["Dije", "que", "sí."],
  accentIndex: 2,
  subtitle:
    "Cómo pasé de no saber programar a construir proyectos que usan miles de personas.",
};

export const idea = {
  id: "idea",
  navLabel: "La idea",
  kicker: "La idea",
  /** Las frases entre *asteriscos* se resaltan (serif itálica + subrayado). */
  text: "Llegué *sin saber programar*. Mientras aprendía, aparecieron *oportunidades* que no tenía planeadas. Aceptarlas me llevó de sentirme *perdido en una clase* a proyectos que hoy usan *miles de personas*.",
  /** Texto gigante que se desliza de fondo. */
  marquee: ["aprender", "intentar", "dije que sí"],
};

export const chapter1 = {
  id: "capitulo-1",
  navLabel: "Yo estaba ahí",
  number: "01",
  title: "Hace unos semestres, yo estaba ahí",
  blocks: [
    {
      type: "quote",
      text: "Hace unos semestres yo estaba sentado donde ustedes están. No sabía si había escogido bien y, para ser sincero, entré a Ingeniería de Sistemas sin saber programar.",
    },
    {
      type: "p",
      text: "También me llamaba la gastronomía. Me atraía trabajar remoto y con libertad.",
    },
  ] as Block[],
  seatLabel: "yo",
  /** Etiquetas de la ilustración del camino que se bifurca. */
  fork: { left: "Gastronomía", right: "Sistemas", note: "Remoto · libertad" },
  sceneAlt:
    "Filas de asientos de un salón vistas en perspectiva. Uno de ellos se ilumina: era mi lugar.",
};

export const chapter2 = {
  id: "capitulo-2",
  navLabel: "La primera clase",
  number: "02",
  title: "Mi primera clase me puso a dudar",
  blocks: [
    {
      type: "p",
      text: "Algoritmia y Programación: algunos ya sabían Python, uno trabajaba con blockchain. Yo dije que no sabía nada.",
    },
    {
      type: "quote",
      text: "Escuché todo eso y pensé: “¿Qué hago yo aquí?”. Me dio miedo sentir que iba atrasado, pero también me dieron ganas de aprender.",
    },
  ] as Block[],
  /** Lo que sabían otros (burbujas grandes). */
  others: ["Python", "blockchain", "Java", "PSeInt", "JavaScript", "C++"],
  /** Mi burbuja: empieza así... */
  mine: "nada",
  /** ...y termina así cuando crece. */
  mineGrown: "ganas de aprender",
  /** Pensamiento que flota en la ilustración. */
  thought: "¿Qué hago yo aquí?",
  sceneAlt:
    "Burbujas con lo que sabían otros, como Python, Java o blockchain, rodean una burbuja pequeña que dice «nada». Al avanzar, la pequeña crece y pasa a decir «ganas de aprender».",
};

export const chapter3 = {
  id: "capitulo-3",
  navLabel: "La oportunidad",
  number: "03",
  title: "La oportunidad apareció en la universidad",
  blocks: [
    {
      type: "p",
      text: "Conocí a CooWeb en una actividad de la U. Sin computador propio, busqué cómo participar.",
    },
    {
      type: "quote",
      text: "Se me metió en la cabeza que quería intentarlo. Cuando se me acabaron los tokens de Bolt, hice una landing sencilla con HTML y CSS y mandé el ZIP.",
    },
  ] as Block[],
  tokenLabel: "Tokens de Bolt",
  tokenEmpty: "Se acabaron",
  editorFile: "index.html",
  /** Código de ejemplo que se “escribe” en el editor. */
  code: [
    '<section class="hero">',
    "  <h1>Mi primera landing</h1>",
    "  <p>Hecha con HTML y CSS.</p>",
    "</section>",
    "",
    ".hero {",
    "  display: grid;",
    "  place-items: center;",
    "}",
  ],
  zipName: "landing.zip",
  sentLabel: "Enviado",
  sceneAlt:
    "Una barra de tokens se vacía. Luego un editor escribe una landing en HTML y CSS, se comprime en un archivo ZIP y sale volando.",
};

export const chapter4 = {
  id: "capitulo-4",
  navLabel: "Aprender haciendo",
  number: "04",
  title: "Aprender haciendo",
  blocks: [
    {
      type: "quote",
      text: "Yo no llegué sabiendo hacerlo todo. Fui aprendiendo mientras construíamos.",
    },
  ] as Block[],
  /** Roles por los que pasé (ilustración de escalones). */
  roles: ["QA", "PM", "Full Stack AI", "Liderazgo de desarrollo"],
  /** Captura de DerbiPlay (en /public). Pon null para ocultarla. */
  screenshot: "/derbiplay.webp" as string | null,
  screenshotAlt: "Página de inicio de DerbiPlay, la app del fútbol amateur",
  screenshotUrl: "derbiplay",
  milestones: [
    { label: "Semillero", note: "De CooWeb" },
    { label: "Bootcamp", note: "Más retos" },
    { label: "DerbiPlay", note: "Empezó hace unos diez meses" },
  ],
  stat: {
    value: 4000,
    suffix: "+",
    label: "personas usuarias de DerbiPlay hoy",
  },
  sceneAlt:
    "Una línea de tiempo se dibuja: Semillero, Bootcamp y DerbiPlay. Un contador sube hasta más de 4.000 personas usuarias.",
};

export const chapter5 = {
  id: "capitulo-5",
  navLabel: "Algo mío",
  number: "05",
  title: "Ahora estoy construyendo algo mío",
  blocks: [
    {
      type: "p",
      text: "Una app de finanzas personales para iPhone. Te dice cuánto te queda, no cuánto gastaste.",
    },
    {
      type: "quote",
      text: "Y ahora estoy construyendo algo que nació de una necesidad mía. Hace unos semestres, yo ni siquiera sabía que podía llegar a crear este tipo de cosas.",
    },
  ] as Block[],
  app: {
    name: "Saldo",
    tagline: "Tu plata, a la vista",
    remaining: "Quedan X de Y",
    /**
     * Pon la captura en /public (p. ej. /public/saldo.png) y escribe aquí "/saldo.png".
     * Mientras sea null se muestra un placeholder marcado.
     */
    screenshot: "/saldo.png" as string | null,
    screenshotAlt: "Captura de la app Saldo en un iPhone",
    placeholderLabel: "Placeholder",
    placeholderHint: "Aquí va la captura de Saldo",
  },
  sceneAlt:
    "Un iPhone entra girando en 3D y muestra la app Saldo con el texto «Quedan X de Y».",
};

export const chapter6 = {
  id: "capitulo-6",
  navLabel: "Volver",
  number: "06",
  title: "Volver a donde empezó la historia",
  blocks: [
    {
      type: "quote",
      text: "Hace unos semestres yo estaba sentado ahí, creyendo que todos sabían más que yo. No tenía el camino resuelto. Fui aprendiendo y, cuando apareció una oportunidad que me interesaba, dije que sí.",
    },
  ] as Block[],
  seatLabel: "yo",
  sceneAlt:
    "Vuelven los asientos del primer capítulo. Mi asiento sigue iluminado y, poco a poco, se iluminan también los demás.",
};

export const closing = {
  id: "cierre",
  navLabel: "Cierre",
  kicker: "Cierre",
  quote:
    "Si aparece una oportunidad que te interesa, atrévete a aceptarla, incluso si todavía estás aprendiendo. No tienes que tener todo resuelto para dar el primer paso.",
  finalTitle: ["Dije", "que", "sí."],
  finalAccentIndex: 2,
  /** Etiqueta junto a la foto del cierre. */
  photoLabel: "Este soy yo",
  finalLine:
    "Con motivación y buen uso de la IA se puede empezar, aunque todavía estés aprendiendo.",
};

/** Orden del índice de capítulos. */
export const navItems = [
  hero,
  idea,
  chapter1,
  chapter2,
  chapter3,
  chapter4,
  chapter5,
  chapter6,
  closing,
].map(({ id, navLabel }) => ({ id, label: navLabel }));
