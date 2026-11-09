// Genera la web de contratitular.es en español (index.html) e inglés (en/index.html) desde una sola plantilla.
//   node construir.mjs
// Textos en T.es y T.en (en inglés, usa comillas dobles si hay apóstrofos); diseño en estilos.css; interacción en web.js.
// Afirmaciones verificadas (no cambiarlas sin comprobar): narración solo en español, Windows (macOS en beta), la skill no
// llama a la API de pago, 15-30 min por vídeo (render 2-3 min), cada dato con 2+ fuentes.
import fs from 'node:fs';

const CLIPS = [
  { id: 'endurance', completo: true, dur: '0:54', estilo: { es: 'papel', en: 'paper' }, es: { tema: 'Los 28 del Endurance', cat: 'Historia', rasgos: ['mapa con ruta', 'contador', 'giro'] }, en: { tema: 'The 28 men of the Endurance', cat: 'History', rasgos: ['route map', 'counter', 'twist'] } },
  { id: 'petricor', completo: true, dur: '0:40', estilo: { es: 'pizarra', en: 'chalkboard' }, es: { tema: 'Por qué huele la lluvia', cat: 'Ciencia', rasgos: ['narración continua', 'efectos sincronizados'] }, en: { tema: 'Why rain has a smell', cat: 'Science', rasgos: ['continuous narration', 'synced sound'] } },
  { id: 'huesos', completo: true, dur: '0:31', estilo: { es: 'pop', en: 'pop' }, es: { tema: 'Naciste con más huesos', cat: 'Cuerpo humano', rasgos: ['instalación limpia', 'una sola petición'] }, en: { tema: 'You were born with more bones', cat: 'Human body', rasgos: ['clean install', 'single request'] } },
  { id: 'datos', completo: false, dur: { es: 'fragmento', en: 'excerpt' }, estilo: { es: 'neón', en: 'neon' }, es: { tema: 'Escenas de datos', cat: 'Datos', rasgos: ['Banco Mundial', 'líneas, barras, mapas'] }, en: { tema: 'Data scenes', cat: 'Data', rasgos: ['World Bank', 'lines, bars, maps'] } },
];

// Retención real (TikTok, primer vídeo publicado de la cuenta, nov-2026): % de espectadores en cada segundo
const RETENCION = [100, 69, 55, 44, 36, 24, 17, 13, 10, 9, 8];

// Storyboard real del vídeo del Endurance (tiempos y fases de storyboard.md)
const STORY = [
  ['0,0-5,1', 'apuestas'], ['5,1-11,0', 'apuestas'], ['11,0-14,2', 'pregunta'], ['14,2-21,1', 'desarrollo'], ['21,1-28,5', 'desarrollo'],
  ['28,5-34,3', 'desarrollo'], ['34,3-40,8', 'giro'], ['40,8-45,4', 'reenganche'], ['45,4-53,8', 'resolucion'],
];

const ICO = {
  flecha: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  play: '<path d="M7 5v14l11-7z" fill="currentColor" stroke="none"/>',
  ok: '<path d="M20 6 9 17l-5-5"/>',
  no: '<path d="M6 12h12"/>',
  aula: '<path d="M22 10 12 5 2 10l10 5 10-5z"/><path d="M6 12v5c3 2 9 2 12 0v-5"/>',
  idea: '<path d="M9 18h6M10 22h4M12 2a7 7 0 0 0-4 12.7V17h8v-2.3A7 7 0 0 0 12 2z"/>',
  tienda: '<path d="M3 9l1.5-5h15L21 9M3 9h18v11H3zM9 20v-6h6v6"/>',
  equipo: '<circle cx="9" cy="7" r="3"/><path d="M3 21v-2a5 5 0 0 1 5-5h2a5 5 0 0 1 5 5v2M16 4a3 3 0 0 1 0 6M21 21v-2a5 5 0 0 0-3-4.6"/>',
  edificio: '<path d="M3 21h18M5 21V10l7-5 7 5v11M9 21v-6h6v6"/>',
  movil: '<rect x="6" y="2" width="12" height="20" rx="2.5"/><path d="M11 18h2"/>',
  historia: '<path d="M4 19V5M4 19h16M8 15l4-4 3 3 5-6"/>',
  voz: '<path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v4"/>',
  sincro: '<path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>',
  mapa: '<path d="M9 4 3 6v14l6-2 6 2 6-2V4l-6 2z"/><path d="M9 4v14M15 6v14"/>',
  pincel: '<path d="M18.4 2.6a2 2 0 0 1 2.8 2.8L12 14.6 9.4 12z"/><path d="M9.4 12c-2 0-3.4 1.4-3.4 3.4 0 1.6-1 2.6-3 2.6 1.4 2 3.4 3 5.4 3a5 5 0 0 0 5-5c0-.8-.2-1.6-.6-2.4"/>',
  tablero: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
  lupa: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
  grafica: '<path d="M3 3v18h18"/><path d="M7 14l4-4 4 4 5-6"/>',
  archivo: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/>',
  chispa: '<path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M5.6 18.4l2.8-2.8M15.6 8.4l2.8-2.8"/>',
  mudo: '<path d="M11 5 6 9H2v6h4l5 4V5z"/><path class="ondas" d="M23 9l-6 6M17 9l6 6"/>',
};
const ic = (n, cls = 'ic') => `<svg class="${cls}" viewBox="0 0 24 24" aria-hidden="true">${ICO[n]}</svg>`;

const T = {
  es: {
    lang: 'es', ruta: '/', otro: { href: '/en/', txt: 'EN', nombre: 'English' },
    title: 'Contratitular · Explica cualquier idea en un vídeo vertical, con Claude',
    desc: 'Para proyectos, clases, empresas, instituciones y creadores. Contratitular investiga, construye la historia, ilustra cada escena, pone la voz y entrega el vídeo vertical terminado. Dentro de Claude, en tu ordenador, sin pagar por vídeo.',
    nav: [['#usos', 'Casos de uso'], ['#como', 'Cómo funciona'], ['#ejemplos', 'Ejemplos'], ['#precio', 'Precio'], ['#faq', 'Preguntas']], navCta: 'Reservar plaza',
    pill: ['Nuevo', 'Historias que enganchan, con voz natural'],
    h1: ['Explica cualquier idea', 'en un vídeo de 45 segundos.'],
    lead: 'Un proyecto, una clase, un producto o una curiosidad. Lo pides con tus palabras y recibes el vídeo terminado: con su historia, sus dibujos animados, voz y subtítulos. Sin rodar, sin editar y sin pagar por cada vídeo.',
    cta1: 'Reservar plaza · 29 €', cta2: 'Ver un ejemplo',
    confianza: ['Sin cuotas por vídeo', 'Sin saber de vídeo', 'Para redes, web o clase'],
    sonido: ['Activar sonido', 'Silenciar'],
    prompts: ['Explica mi startup a inversores en 45 segundos, con estos datos', 'Un vídeo sobre la fotosíntesis para 2.º de ESO', 'Cuenta por qué nuestro aceite es de primera presión en frío', 'Resume este protocolo de seguridad en un minuto', 'Explica a los vecinos la nueva recogida de residuos', 'Hazme tres vídeos de historia para esta semana'],
    promptBtn: 'Crear vídeo', promptEtiqueta: 'Lo pides así, con tus palabras',
    redes: ['Instagram Reels', 'TikTok', 'YouTube Shorts', 'LinkedIn', 'Facebook', 'Tu web o tu aula'], redesTxt: 'Un formato, todas las pantallas',
    tUsos: 'Casos de uso', hUsos: 'Si tienes algo que explicar, tienes un vídeo.',
    pUsos: 'Nació para una cuenta de curiosidades que publica cada día. Hoy sirve a cualquiera que necesite contar algo claro, rápido y con gancho: tú pones el tema o tu material, la skill lo convierte en una historia que se ve hasta el final.',
    aportas: 'Tú aportas', recibes: 'Recibes', escenaReal: 'Escena de un vídeo real hecho con la skill',
    usos: [
      { ico: 'aula', tab: 'Educación', img: '/media/clips/petricor.jpg', h: 'Lecciones que los alumnos terminan de ver.', p: 'Profesores, academias, autoescuelas y divulgadores: convierte un tema del temario en una historia corta con su pregunta, su explicación y su desenlace. Con mapas, gráficos y las fuentes citadas.',
        puntos: ['Un concepto difícil, explicado en menos de un minuto', 'Mapas y gráficos exactos para geografía, historia o ciencias', 'Para repasar en clase, en el aula virtual o en redes del centro'],
        ej: 'Un vídeo de la fotosíntesis para 2.º de ESO, en estilo pizarra', aporta: 'El tema o tus apuntes', recibe: 'Vídeo, guion y fuentes para el alumnado' },
      { ico: 'idea', tab: 'Proyectos e ideas', img: '/media/clips/datos.jpg', h: 'Tu idea, entendida a la primera.', p: 'Emprendedores, startups, investigadores, TFG y candidaturas a ayudas o concursos: el problema, tu solución y por qué importa ahora, contado como una historia y no como una lista de diapositivas.',
        puntos: ['Pitch de 45 segundos para inversores, jurados o clientes', 'Tus cifras convertidas en gráficos animados', 'Una pieza que se comparte por WhatsApp, LinkedIn o correo'],
        ej: 'Explica mi app de reciclaje para inversores, con estos datos', aporta: 'Tu resumen, tu dossier o tus cifras', recibe: 'Vídeo de pitch, guion y storyboard' },
      { ico: 'tienda', tab: 'Empresas y marcas', img: '/media/clips/huesos.jpg', h: 'Lo que te hace distinto, en un vídeo.', p: 'Cuenta cómo funciona tu servicio, la historia de tu producto o el dato que te diferencia, con tus colores y tu estilo. Sin agencia, sin rodaje y sin pagar por pieza.',
        puntos: ['Contenido constante para redes sin depender de nadie', 'Estilo y colores adaptables a tu marca', 'Texto del post incluido, listo para publicar'],
        ej: 'Cuenta por qué nuestro aceite es de primera presión en frío', aporta: 'Tu web, tu ficha de producto o tus notas', recibe: 'Vídeo, portada y texto del post' },
      { ico: 'equipo', tab: 'Formación interna', img: '/media/endurance-5.jpg', h: 'Procedimientos que se entienden y se recuerdan.', p: 'Bienvenida a nuevas incorporaciones, seguridad, calidad o resultados del trimestre: píldoras de vídeo cortas que la plantilla ve de verdad, en lugar de un PDF que nadie abre.',
        puntos: ['Un procedimiento largo, resumido en un minuto', 'Pasos y cifras en pantalla, sincronizados con la voz', 'Fácil de rehacer cuando cambie el procedimiento'],
        ej: 'Resume este protocolo de seguridad en un vídeo de un minuto', aporta: 'El procedimiento o el documento interno', recibe: 'Vídeo y storyboard para revisar' },
      { ico: 'edificio', tab: 'Instituciones y ONG', img: '/media/endurance-7.jpg', h: 'Comunicación pública clara, con datos oficiales.', p: 'Ayuntamientos, asociaciones y fundaciones: explica un servicio, una norma, una ayuda o una campaña a la ciudadanía, sin tecnicismos y con las fuentes a la vista.',
        puntos: ['Información pública explicada para todos los públicos', 'Datos oficiales en mapas y gráficos', 'Las fuentes van citadas en el vídeo y en el texto'],
        ej: 'Explica a los vecinos la nueva recogida de residuos', aporta: 'La nota de prensa o la norma', recibe: 'Vídeo, texto para redes y fuentes' },
      { ico: 'movil', tab: 'Creadores', img: '/media/clips/endurance.jpg', h: 'Publica cada día sin quemarte.', p: 'Curiosidades, historia, ciencia o efemérides para Instagram, TikTok, YouTube y Facebook. La skill propone temas, los contrasta y te deja el vídeo y el texto listos.',
        puntos: ['Ideas de temas si no se te ocurre ninguno', 'Cinco estilos visuales para variar', 'Aprende de lo que funciona en tu cuenta'],
        ej: 'Hazme tres vídeos de historia para esta semana', aporta: 'Nada, o un tema que te guste', recibe: 'Vídeos, portadas y textos con fuentes' },
    ],
    tComo: 'Cómo funciona', hComo: 'De una frase a un vídeo terminado.',
    pComo: 'Sin rodajes, sin programas de edición y sin conocimientos técnicos.',
    pasos: [
      { n: '01', h: 'Lo pides', p: 'Con tus palabras, como se lo pedirías a una persona. Basta con el tema, o le das tus apuntes, un documento o tus datos.' },
      { n: '02', h: 'Se hace solo', p: 'Busca la información, escribe la historia, dibuja y anima cada escena y le pone voz y subtítulos.' },
      { n: '03', h: 'Lo publicas', p: 'Recibes el vídeo listo, con su portada y el texto para acompañarlo. Tú decides dónde y cuándo.' },
    ],
    tHistoria: 'Anatomía de un vídeo', hHistoria: 'No hace vídeos de datos. Hace historias.',
    pHistoria: 'Cada vídeo tiene un gancho, una pregunta, un giro y un final. Así se construyó el del Endurance, escena a escena.',
    fases: [['El gancho', 'Quién, qué está en juego y por qué importa.'], ['La pregunta', 'La duda que hace que te quedes a ver.'], ['El giro', 'Lo que no te esperabas.'], ['El final', 'La respuesta, y a veces otra pregunta.']],
    faseNombre: { apuestas: 'gancho', pregunta: 'pregunta', desarrollo: 'historia', giro: 'giro', reenganche: 'otra pregunta', resolucion: 'final' },
    escenas: ['28 hombres atrapados en el hielo de la Antártida, sin barco y sin forma de pedir ayuda:', 'era 1915, el hielo había aplastado su barco, el Endurance, y lo vieron hundirse,', 'así que la pregunta era sencilla: ¿cómo sales vivo de allí?', 'Primero, acampando meses sobre el hielo, hasta que en tres botes llegaron a una isla helada y deshabitada: Elefante.', 'Pero allí nadie los iba a buscar, así que seis de ellos cruzaron más de 1.200 kilómetros de océano en un bote de siete metros,', 'y llegaron a Georgia del Sur… por el lado equivocado, y aún tuvieron que cruzar a pie sus montañas heladas.', 'Y cuando por fin volvieron a por los que esperaban en la isla, no faltaba nadie: los 28 sobrevivieron.', 'Pero el barco se quedó en el fondo del mar, y durante más de un siglo nadie supo dónde estaba,', 'hasta que en 2022 lo encontraron a 3.008 metros de profundidad, tan entero que todavía se lee su nombre.'],
    deslizar: 'Desliza para recorrer las 9 escenas',
    tEjemplos: 'Ejemplos', hEjemplos: 'Salidas reales de la skill, sin retocar.',
    pEjemplos: 'Cada uno salió de una sola petición. Pulsa para verlo completo y con sonido.',
    verCompleto: 'Ver con sonido', soloBucle: 'Fragmento',
    tFunciones: 'Por qué funciona', hFunciones: 'Vídeos que la gente ve hasta el final.',
    funciones: [
      ['historia', 'Historias que enganchan', 'Cada vídeo tiene gancho, pregunta, giro y final. Nada de listas de datos.', 'ancho'],
      ['lupa', 'Información fiable', 'Cada dato se comprueba en varias fuentes, y te las da citadas.', ''],
      ['voz', 'Voz natural, gratis', 'Una narración que suena a persona. O con tu propia voz.', ''],
      ['mapa', 'Mapas y gráficos', 'Tus cifras, convertidas en gráficos y mapas animados.', ''],
      ['pincel', 'Con tu estilo', 'Cinco estilos visuales, adaptables a tus colores.', ''],
      ['sincro', 'Todo a su tiempo', 'Cada dibujo aparece justo cuando la voz lo nombra, con su sonido.', 'ancho'],
    ],
    tMedido: 'Medido, no supuesto', hMedido: 'Cada versión incorpora lo que dicen los datos.',
    pMedido: 'Publicamos a diario con la propia skill y medimos la retención de cada vídeo en cada red. Lo aprendido entra en la siguiente versión como reglas de guion, sonido y estilo.',
    medidoPie: 'Retención segundo a segundo · TikTok · primer vídeo publicado (noviembre de 2026)',
    medidoNota: '−31 puntos en el primer segundo: el algoritmo lo mostraba, pero el gancho tardaba demasiado. Desde la v2.3, la primera frase pone lo importante en sus primeras palabras.',
    ejeS: 's',
    tCompara: 'Comparativa', hCompara: 'Calidad de productora, sin su precio.',
    compCols: ['Contratitular', 'Agencia', 'Editor con IA', 'Hacerlo tú'],
    compFilas: [
      ['Coste por vídeo', ['0 €', 'Presupuesto por pieza', 'Créditos o suscripción', 'Tus horas']],
      ['Tiempo', ['Minutos', 'Días o semanas', 'Horas', 'Horas o días']],
      ['Una historia que engancha', [1, 1, 0, '·']],
      ['Información con fuentes', [1, '·', 0, '·']],
    ],
    compNota: '',
    tFicha: 'Ficha técnica', hFicha: 'Especificaciones.',
    ficha: [
      ['Formato', '1080×1920, 30 fps, MP4 H.264 + AAC, volumen −14 LUFS'],
      ['Duración', '15 a 90 s, según se pida (por defecto ~40 s)'],
      ['Material de partida', 'Un tema, o tu propio texto, apuntes, documento o datos'],
      ['Estilos', 'Papel, neón, pop, pizarra y limpio'],
      ['Escenas de datos', 'Barras, línea, contador y mapas (mundo, Europa, España por provincias o comunidades)'],
      ['Voz', 'Azure Neural HD (nivel gratuito), Kokoro local o tu propia voz con ElevenLabs'],
      ['Idioma de la narración', 'Español'],
      ['Entregables', 'Vídeo, portada, texto del post con fuentes, storyboard y ganchos alternativos'],
      ['Requisitos', 'Plan Pro o Max de Claude, Claude Code (app de escritorio o terminal), Windows 10/11 · macOS en beta'],
      ['Coste por vídeo', 'Ninguno: usa el plan de Claude del usuario; la skill no llama a la API de pago'],
    ],
    tPrecio: 'Precio', hPrecio: 'Un solo pago. Sin cuotas por vídeo.',
    pPrecio: 'Reserva tu plaza y te avisamos en cuanto salga, con el precio de lanzamiento garantizado.',
    tNecesitas: 'Qué necesitas', necesitas: ['Un ordenador con Windows o Mac', 'Tu plan de Claude (desde 20 $ al mes)', 'Nada más: la guía te lleva paso a paso'],
    planes: [
      { nombre: 'Individual', precio: '29 €', sufijo: 'pago único', destacado: true, lista: ['Todos los vídeos que permita tu plan', 'Todos los estilos y las mejoras futuras', 'Voz natural incluida', 'Guía de instalación paso a paso'], cta: 'Reservar por Instagram', href: 'https://ig.me/m/contratitular_es', gc: 'reservar-instagram-es' },
      { nombre: 'Centros y empresas', precio: 'A medida', sufijo: '', destacado: false, lista: ['Para todo tu equipo o claustro', 'Con los colores de tu marca o centro', 'Te contamos cómo usarlo en tu sector'], cta: 'Escríbenos', href: 'https://ig.me/m/contratitular_es', gc: 'contacto-centros-es' },
    ],
    precioLetra: 'Pago único. El plan de Claude va aparte. No garantizamos visualizaciones.',
    tFaq: 'Preguntas frecuentes',
    faq: [
      ['¿Sirve para explicar mi proyecto, mi clase o mi empresa?', 'Sí. Le das tu información y la convierte en una historia corta y clara.'],
      ['¿Tengo que pagar algo por cada vídeo?', 'No. Pagas la skill una vez y usas tu plan de Claude, que seguramente ya tienes.'],
      ['¿Necesito saber de vídeo o de programación?', 'No. Todo se pide con tus palabras, y la instalación tiene una guía paso a paso.'],
      ['¿Cuánto tarda?', 'Entre 15 y 30 minutos por vídeo, sin que tengas que hacer nada.'],
      ['¿La información es fiable?', 'Cada dato se comprueba en varias fuentes y te las da citadas. Aun así, échale un vistazo antes de publicar.'],
      ['¿En qué idioma habla?', 'En español.'],
    ],
    finalH: 'Tu próxima idea merece algo mejor que otra diapositiva.', finalP: 'Reserva tu plaza al precio de lanzamiento.', finalCta: 'Reservar plaza · 29 €',
    pie: 'Esta web no usa cookies ni guarda datos personales.',
  },
  en: {
    lang: 'en', ruta: '/en/', otro: { href: '/', txt: 'ES', nombre: 'Español' },
    title: 'Contratitular · Explain any idea in a vertical video, with Claude',
    desc: 'For projects, lessons, companies, public bodies and creators. Contratitular researches, builds the story, illustrates every scene, adds the voice-over and delivers the finished vertical video. Inside Claude, on your computer, with no per-video cost.',
    nav: [['#usos', 'Use cases'], ['#como', 'How it works'], ['#ejemplos', 'Examples'], ['#precio', 'Pricing'], ['#faq', 'FAQ']], navCta: 'Reserve a seat',
    pill: ['New', 'Stories that hook, with a natural voice'],
    h1: ['Explain any idea', 'in a 45-second video.'],
    lead: 'A project, a lesson, a product or a fun fact. Ask in your own words and get the finished video: with its story, animated drawings, voice-over and captions. No filming, no editing and no per-video fees.',
    cta1: 'Reserve a seat · €29', cta2: 'Watch an example',
    confianza: ['No per-video fees', 'No video skills needed', 'For social, web or class'],
    sonido: ['Turn sound on', 'Mute'],
    prompts: ['Explain my startup to investors in 45 seconds, using these numbers', 'A video on photosynthesis for 13-year-olds', 'Tell why our olive oil is cold-pressed', 'Sum up this safety protocol in one minute', 'Explain the new waste collection to residents', 'Make me three history videos for this week'],
    promptBtn: 'Create video', promptEtiqueta: 'Just ask, in your own words',
    redes: ['Instagram Reels', 'TikTok', 'YouTube Shorts', 'LinkedIn', 'Facebook', 'Your site or classroom'], redesTxt: 'One format, every screen',
    tUsos: 'Use cases', hUsos: 'If you have something to explain, you have a video.',
    pUsos: 'It was born for a fun-facts account that posts every day. Today it serves anyone who needs to explain something clearly, quickly and with a hook: you bring the topic or your material, the skill turns it into a story people watch to the end.',
    aportas: 'You bring', recibes: 'You get', escenaReal: 'Scene from a real video made with the skill',
    usos: [
      { ico: 'aula', tab: 'Education', img: '/media/clips/petricor.jpg', h: 'Lessons students actually finish.', p: 'Teachers, academies, driving schools and science communicators: turn a syllabus topic into a short story with its question, its explanation and its payoff. With maps, charts and cited sources.',
        puntos: ['A hard concept explained in under a minute', 'Exact maps and charts for geography, history or science', 'For class, your virtual classroom or your school’s social media'],
        ej: 'A video on photosynthesis for 13-year-olds, chalkboard style', aporta: 'The topic or your notes', recibe: 'Video, script and sources for students' },
      { ico: 'idea', tab: 'Projects & ideas', img: '/media/clips/datos.jpg', h: 'Your idea, understood the first time.', p: 'Founders, startups, researchers, theses and grant or competition entries: the problem, your solution and why it matters now, told as a story instead of a list of slides.',
        puntos: ['A 45-second pitch for investors, juries or customers', 'Your figures turned into animated charts', 'A piece people share on WhatsApp, LinkedIn or email'],
        ej: 'Explain my recycling app to investors, using these numbers', aporta: 'Your summary, deck or figures', recibe: 'Pitch video, script and storyboard' },
      { ico: 'tienda', tab: 'Companies & brands', img: '/media/clips/huesos.jpg', h: 'What makes you different, in one video.', p: 'Show how your service works, the story behind your product or the fact that sets you apart, in your colours and style. No agency, no shoot, no per-piece fees.',
        puntos: ['Steady social content without depending on anyone', 'Style and colours that match your brand', 'Post copy included, ready to publish'],
        ej: 'Tell why our olive oil is cold-pressed', aporta: 'Your website, product sheet or notes', recibe: 'Video, cover and post copy' },
      { ico: 'equipo', tab: 'Internal training', img: '/media/endurance-5.jpg', h: 'Procedures people understand and remember.', p: 'Onboarding, safety, quality or quarterly results: short video pills your staff actually watch, instead of a PDF nobody opens.',
        puntos: ['A long procedure summed up in a minute', 'Steps and figures on screen, synced to the voice', 'Easy to redo when the procedure changes'],
        ej: 'Sum up this safety protocol in a one-minute video', aporta: 'The procedure or internal document', recibe: 'Video and a storyboard to review' },
      { ico: 'edificio', tab: 'Public bodies & NGOs', img: '/media/endurance-7.jpg', h: 'Clear public communication, with official data.', p: 'Councils, associations and foundations: explain a service, a rule, a grant or a campaign to the public, with no jargon and the sources in plain sight.',
        puntos: ['Public information explained for every audience', 'Official data in maps and charts', 'Sources cited in the video and in the copy'],
        ej: 'Explain the new waste collection to residents', aporta: 'The press release or the rule', recibe: 'Video, social copy and sources' },
      { ico: 'movil', tab: 'Creators', img: '/media/clips/endurance.jpg', h: 'Post every day without burning out.', p: 'Fun facts, history, science or on-this-day stories for Instagram, TikTok, YouTube and Facebook. The skill suggests topics, fact-checks them and leaves the video and copy ready.',
        puntos: ['Topic ideas when you have none', 'Five visual styles to keep it fresh', 'Learns from what works on your account'],
        ej: 'Make me three history videos for this week', aporta: 'Nothing, or a topic you like', recibe: 'Videos, covers and copy with sources' },
    ],
    tComo: 'How it works', hComo: 'From one sentence to a finished video.',
    pComo: 'No filming, no editing software and no technical knowledge.',
    pasos: [
      { n: '01', h: 'You ask', p: 'In your own words, as you would ask a person. The topic is enough, or give it your notes, a document or your data.' },
      { n: '02', h: 'It makes itself', p: 'It finds the information, writes the story, draws and animates every scene and adds voice and captions.' },
      { n: '03', h: 'You post it', p: 'You get the finished video, with its cover and the text to go with it. You decide where and when.' },
    ],
    tHistoria: 'Anatomy of a video', hHistoria: 'It doesn’t make fact videos. It tells stories.',
    pHistoria: 'Every video has a hook, a question, a twist and an ending. This is how the Endurance one was built, scene by scene (narration in Spanish, translated here).',
    fases: [['The hook', 'Who, what’s at stake and why it matters.'], ['The question', 'The doubt that keeps you watching.'], ['The twist', 'What you didn’t see coming.'], ['The ending', 'The answer, and sometimes a new question.']],
    faseNombre: { apuestas: 'hook', pregunta: 'question', desarrollo: 'story', giro: 'twist', reenganche: 'new question', resolucion: 'ending' },
    escenas: ['28 men trapped in the Antarctic ice, with no ship and no way to call for help:', 'it was 1915, the ice had crushed their ship, the Endurance, and they watched it sink,', 'so the question was simple: how do you get out of there alive?', 'First, by camping on the ice for months, until three boats got them to a frozen, empty island: Elephant.', 'But nobody would look for them there, so six of them crossed more than 1,200 kilometres of ocean in a seven-metre boat,', 'and reached South Georgia… on the wrong side, and still had to cross its frozen mountains on foot.', 'And when they finally went back for the ones waiting on the island, nobody was missing: all 28 survived.', 'But the ship stayed at the bottom of the sea, and for over a century nobody knew where it was,', 'until in 2022 it was found 3,008 metres down, so intact you can still read its name.'],
    deslizar: 'Swipe through all 9 scenes',
    tEjemplos: 'Examples', hEjemplos: 'Unedited output from the skill.',
    pEjemplos: 'Each one came from a single request. The narration is in Spanish. Click to watch in full with sound.',
    verCompleto: 'Watch with sound', soloBucle: 'Excerpt',
    tFunciones: 'Why it works', hFunciones: 'Videos people watch to the end.',
    funciones: [
      ['historia', 'Stories that hook', 'Every video has a hook, a question, a twist and an ending. No lists of facts.', 'ancho'],
      ['lupa', 'Reliable information', 'Every fact is checked against several sources, and you get them cited.', ''],
      ['voz', 'Natural voice, free', 'Narration that sounds like a person. Or use your own voice.', ''],
      ['mapa', 'Maps and charts', 'Your figures, turned into animated charts and maps.', ''],
      ['pincel', 'Your style', 'Five visual styles, adaptable to your colours.', ''],
      ['sincro', 'Perfect timing', 'Every drawing appears exactly when the voice names it, with its sound.', 'ancho'],
    ],
    tMedido: 'Measured, not assumed', hMedido: 'Every release incorporates what the data says.',
    pMedido: 'We publish daily with the skill itself and track the retention of every video on every network. What we learn ships in the next release as rules for scripts, sound and style.',
    medidoPie: 'Second-by-second retention · TikTok · first published video (November 2026)',
    medidoNota: '−31 points in the first second: the algorithm was showing it, but the hook took too long. Since v2.3 the opening line puts the key fact in its first few words.',
    ejeS: 's',
    tCompara: 'Comparison', hCompara: 'Studio quality, without the price.',
    compCols: ['Contratitular', 'Agency', 'AI editor', 'Doing it yourself'],
    compFilas: [
      ['Cost per video', ['€0', 'Quote per piece', 'Credits or subscription', 'Your hours']],
      ['Time', ['Minutes', 'Days or weeks', 'Hours', 'Hours or days']],
      ['A story that hooks', [1, 1, 0, '·']],
      ['Information with sources', [1, '·', 0, '·']],
    ],
    compNota: '',
    tFicha: 'Specs', hFicha: 'Technical specifications.',
    ficha: [
      ['Format', '1080×1920, 30 fps, H.264 + AAC MP4, −14 LUFS loudness'],
      ['Length', '15 to 90 s, on request (default ~40 s)'],
      ['Starting material', 'A topic, or your own text, notes, document or data'],
      ['Styles', 'Paper, neon, pop, chalkboard and clean'],
      ['Data scenes', 'Bars, line, counter and maps (world, Europe, Spain by province or region)'],
      ['Voice', 'Azure Neural HD (free tier), local Kokoro, or your own voice via ElevenLabs'],
      ['Narration language', 'Spanish'],
      ['Deliverables', 'Video, cover, post copy with sources, storyboard and alternative hooks'],
      ['Requirements', 'Claude Pro or Max plan, Claude Code (desktop app or terminal), Windows 10/11 · macOS in beta'],
      ['Cost per video', 'None: it runs on the user’s Claude plan; the skill does not call the paid API'],
    ],
    tPrecio: 'Pricing', hPrecio: 'Pay once. No per-video fees.',
    pPrecio: 'Reserve your seat and we will let you know as soon as it is out, with the launch price guaranteed.',
    tNecesitas: 'What you need', necesitas: ['A Windows or Mac computer', 'Your Claude plan (from $20 a month)', 'Nothing else: the guide walks you through it'],
    planes: [
      { nombre: 'Individual', precio: '€29', sufijo: 'one-time', destacado: true, lista: ['As many videos as your plan allows', 'Every style and all future updates', 'Natural voice included', 'Step-by-step install guide'], cta: 'Reserve on Instagram', href: 'https://ig.me/m/contratitular_es', gc: 'reservar-instagram-en' },
      { nombre: 'Schools & companies', precio: 'Custom', sufijo: '', destacado: false, lista: ['For your whole team or staff', 'In your brand or school colours', 'We show you how to use it in your sector'], cta: 'Get in touch', href: 'https://ig.me/m/contratitular_es', gc: 'contacto-centros-en' },
    ],
    precioLetra: 'One-time payment. Claude plan not included. Narration is in Spanish. No views guaranteed.',
    tFaq: 'Frequently asked questions',
    faq: [
      ['Can I use it to explain my project, lesson or company?', 'Yes. Give it your information and it turns it into a short, clear story.'],
      ['Do I pay anything per video?', 'No. You pay for the skill once and use your Claude plan, which you probably already have.'],
      ['Do I need video or coding skills?', 'No. You ask for everything in your own words, and installation comes with a step-by-step guide.'],
      ['How long does it take?', '15 to 30 minutes per video, without you doing anything.'],
      ['Is the information reliable?', 'Every fact is checked against several sources and you get them cited. Still, take a look before posting.'],
      ['What language does it speak?', 'Spanish, for now.'],
    ],
    finalH: 'Your next idea deserves better than another slide.', finalP: 'Reserve your seat at the launch price.', finalCta: 'Reserve a seat · €29',
    pie: 'This site uses no cookies and stores no personal data.',
  },
};

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

function grafica(t) {
  const W = 520, H = 240, x0 = 44, y0 = 16, w = W - x0 - 16, h = H - y0 - 34;
  const px = (i) => x0 + (w * i) / (RETENCION.length - 1), py = (v) => y0 + h - (h * v) / 100;
  const d = RETENCION.map((v, i) => `${i ? 'L' : 'M'}${px(i).toFixed(1)} ${py(v).toFixed(1)}`).join(' ');
  const rejilla = [0, 25, 50, 75, 100].map((v) => `<line x1="${x0}" x2="${x0 + w}" y1="${py(v)}" y2="${py(v)}"/><text x="${x0 - 8}" y="${py(v) + 4}" text-anchor="end">${v}%</text>`).join('');
  const ejeX = RETENCION.map((_, i) => (i % 2 ? '' : `<text x="${px(i)}" y="${H - 10}" text-anchor="middle">${i} ${t.ejeS}</text>`)).join('');
  return `<svg class="grafica" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(t.medidoPie)}"><g class="rejilla">${rejilla}</g><g class="eje">${ejeX}</g>` +
    `<path d="${d} L${px(RETENCION.length - 1)} ${py(0)} L${px(0)} ${py(0)} Z" class="area"/><path d="${d}" class="linea"/>` +
    `<circle cx="${px(1)}" cy="${py(RETENCION[1])}" r="5" class="punto"/><text x="${px(1) + 12}" y="${py(RETENCION[1]) - 8}" class="anota">−31</text></svg>`;
}

const celda = (v, L) => v === '·' ? `<span class="depende">${L === 'es' ? 'Depende' : 'Depends'}</span>` : v === 1 ? `<span class="si">${ic('ok')}</span>` : v === 0 ? `<span class="nada">${ic('no')}</span>` : `<span>${esc(v)}</span>`;

function pagina(t) {
  const L = t.lang;
  return `<!doctype html>
<html lang="${L}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(t.title)}</title>
<meta name="description" content="${esc(t.desc)}">
<meta name="theme-color" content="#0A0F1C">
<meta property="og:type" content="website">
<meta property="og:title" content="${esc(t.title)}">
<meta property="og:description" content="${esc(t.desc)}">
<meta property="og:image" content="https://contratitular.es/media/clips/endurance.jpg">
<link rel="alternate" hreflang="es" href="https://contratitular.es/">
<link rel="alternate" hreflang="en" href="https://contratitular.es/en/">
<link rel="preload" href="/fuentes/ibm-plex-sans-700-latin.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="/fuentes/fuentes.css">
<link rel="stylesheet" href="/estilos.css">
<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' rx='7' fill='%230A0F1C'/%3E%3Crect x='7' y='8' width='18' height='4' rx='1.5' fill='%23E6E9EF'/%3E%3Crect x='7' y='14' width='11' height='4' rx='1.5' fill='%234F8DF7'/%3E%3Crect x='7' y='20' width='18' height='4' rx='1.5' fill='%23E6E9EF'/%3E%3C/svg%3E">
</head>
<body>
<a class="saltar" href="#contenido">${L === 'es' ? 'Saltar al contenido' : 'Skip to content'}</a>
<header class="barra">
  <div class="caja barra-in">
    <a class="marca" href="${t.ruta}"><span class="logo" aria-hidden="true"><i></i><i></i><i></i></span>Contratitular</a>
    <nav aria-label="${L === 'es' ? 'Secciones' : 'Sections'}">
      ${t.nav.map(([h, x]) => `<a class="nav-enlace" href="${h}">${esc(x)}</a>`).join('')}
      <a class="idioma" href="${t.otro.href}" hreflang="${L === 'es' ? 'en' : 'es'}" lang="${L === 'es' ? 'en' : 'es'}" title="${esc(t.otro.nombre)}" data-goatcounter-click="idioma-${L === 'es' ? 'en' : 'es'}">${t.otro.txt}</a>
      <a class="btn btn-primario btn-mini" href="#precio">${esc(t.navCta)}</a>
    </nav>
  </div>
</header>

<main id="contenido">
<section class="portada">
  <div class="portada-fondo" aria-hidden="true"></div>
  <div class="caja portada-in">
    <div class="portada-texto">
      <a class="pastilla" href="#funciones"><b>${esc(t.pill[0])}</b><span>${esc(t.pill[1])}</span>${ic('flecha')}</a>
      <h1>${esc(t.h1[0])} <span class="resalte">${esc(t.h1[1])}</span></h1>
      <p class="entrada">${esc(t.lead)}</p>
      <div class="acciones"><a class="btn btn-primario" href="#precio">${esc(t.cta1)} ${ic('flecha')}</a><a class="btn btn-fantasma" href="#ejemplos">${ic('play')} ${esc(t.cta2)}</a></div>
      <ul class="confianza">${t.confianza.map((c) => `<li>${ic('ok')}${esc(c)}</li>`).join('')}</ul>
    </div>
    <div class="portada-visual">
      <figure class="movil">
        <video id="portada-video" src="/media/clips/endurance.mp4" poster="/media/clips/endurance.jpg" autoplay muted loop playsinline preload="metadata"></video>
        <button class="sonido" id="portada-sonido" type="button" aria-label="${esc(t.sonido[0])}" data-on="${esc(t.sonido[1])}" data-off="${esc(t.sonido[0])}"><svg viewBox="0 0 24 24" aria-hidden="true">${ICO.mudo}</svg></button>
      </figure>
      <div class="peticion" aria-hidden="true">
        <span class="peticion-etiqueta">${esc(t.promptEtiqueta)}</span>
        <div class="peticion-caja"><span class="peticion-texto" id="peticion" data-frases="${esc(JSON.stringify(t.prompts))}">${esc(t.prompts[0])}</span><span class="cursor"></span></div>
        <span class="peticion-btn">${ic('chispa')}${esc(t.promptBtn)}</span>
      </div>
    </div>
  </div>
  <div class="caja redes"><span class="redes-txt">${esc(t.redesTxt)}</span><ul>${t.redes.map((r) => `<li>${esc(r)}</li>`).join('')}</ul></div>
</section>

<section id="usos" class="seccion">
  <div class="caja">
    <header class="cabecera"><p class="ceja">${esc(t.tUsos)}</p><h2>${esc(t.hUsos)}</h2><p class="sub">${esc(t.pUsos)}</p></header>
    <div class="pestanas" role="tablist" aria-label="${esc(t.tUsos)}">
      ${t.usos.map((u, i) => `<button class="pestana" role="tab" id="tab-${i}" aria-controls="panel-${i}" aria-selected="${i === 0}" tabindex="${i === 0 ? 0 : -1}">${ic(u.ico)}<span>${esc(u.tab)}</span></button>`).join('')}
    </div>
    ${t.usos.map((u, i) => `<div class="panel" role="tabpanel" id="panel-${i}" aria-labelledby="tab-${i}"${i ? ' hidden' : ''}>
      <div class="panel-texto">
        <h3>${esc(u.h)}</h3><p>${esc(u.p)}</p>
        <ul class="lista-ok">${u.puntos.map((x) => `<li>${ic('ok')}${esc(x)}</li>`).join('')}</ul>
        <div class="ejemplo-peticion"><span class="mono">›</span> ${esc(u.ej)}</div>
      </div>
      <figure class="panel-visual"><img src="${u.img}" alt="" loading="lazy" width="540" height="960"><figcaption>${esc(t.escenaReal)}</figcaption></figure>
    </div>`).join('\n    ')}
  </div>
</section>

<section id="como" class="seccion gris">
  <div class="caja">
    <header class="cabecera"><p class="ceja">${esc(t.tComo)}</p><h2>${esc(t.hComo)}</h2><p class="sub">${esc(t.pComo)}</p></header>
    <ol class="pasos">${t.pasos.map((p) => `<li class="paso aparece"><span class="paso-n">${p.n}</span><h3>${esc(p.h)}</h3><p>${esc(p.p)}</p></li>`).join('')}</ol>
  </div>
</section>

<section id="historia" class="seccion oscura">
  <div class="caja">
    <header class="cabecera"><p class="ceja">${esc(t.tHistoria)}</p><h2>${esc(t.hHistoria)}</h2><p class="sub">${esc(t.pHistoria)}</p></header>
    <ol class="fases">${t.fases.map(([h, p], i) => `<li><span class="mono">0${i + 1}</span><strong>${esc(h)}</strong><span>${esc(p)}</span></li>`).join('')}</ol>
    <div class="cinta" tabindex="0" aria-label="Storyboard">
      ${STORY.map(([tc, f], i) => `<figure class="escena"><img src="/media/endurance-${i + 1}.jpg" alt="" loading="lazy" width="360" height="640"><figcaption><span class="tc"><span>${L === 'es' ? tc : tc.replace(/,/g, '.')} s</span><b class="f-${f}">${esc(t.faseNombre[f])}</b></span><q>${esc(t.escenas[i])}</q></figcaption></figure>`).join('')}
    </div>
    <p class="cinta-pie mono">← ${esc(t.deslizar)} →</p>
  </div>
</section>

<section id="ejemplos" class="seccion">
  <div class="caja">
    <header class="cabecera"><p class="ceja">${esc(t.tEjemplos)}</p><h2>${esc(t.hEjemplos)}</h2><p class="sub">${esc(t.pEjemplos)}</p></header>
    <div class="clips">${CLIPS.map((c) => { const x = c[L]; return `<figure class="clip aparece"${c.completo ? ` data-completo="/media/clips/${c.id}.mp4"` : ''}>
      <div class="clip-video"><video src="/media/clips/${c.id}-bucle.mp4" poster="/media/clips/${c.id}.jpg" muted loop playsinline preload="none"></video>${c.completo ? `<button class="clip-play" type="button">${ic('play')}<span>${esc(t.verCompleto)}</span></button>` : `<span class="clip-marca">${esc(t.soloBucle)}</span>`}</div>
      <figcaption><span class="mono">${esc(x.cat)}</span><strong>${esc(x.tema)}</strong></figcaption></figure>`; }).join('')}</div>
  </div>
</section>

<section id="funciones" class="seccion gris">
  <div class="caja">
    <header class="cabecera"><p class="ceja">${esc(t.tFunciones)}</p><h2>${esc(t.hFunciones)}</h2></header>
    <div class="bento">${t.funciones.map(([i, h, p, a]) => `<article class="celda aparece${a ? ' ' + a : ''}"><span class="celda-ico">${ic(i)}</span><h3>${esc(h)}</h3><p>${esc(p)}</p></article>`).join('')}</div>
  </div>
</section>

<section class="seccion">
  <div class="caja">
    <header class="cabecera"><p class="ceja">${esc(t.tCompara)}</p><h2>${esc(t.hCompara)}</h2></header>
    <div class="tabla-envoltura"><table class="tabla">
      <thead><tr><th></th>${t.compCols.map((c, i) => `<th${i === 0 ? ' class="nuestra"' : ''}>${esc(c)}</th>`).join('')}</tr></thead>
      <tbody>${t.compFilas.map(([f, vs]) => `<tr><th scope="row">${esc(f)}</th>${vs.map((v, i) => `<td${i === 0 ? ' class="nuestra"' : ''}>${celda(v, L)}</td>`).join('')}</tr>`).join('')}</tbody>
    </table></div>
  </div>
</section>

<section id="precio" class="seccion">
  <div class="caja">
    <header class="cabecera centro"><p class="ceja">${esc(t.tPrecio)}</p><h2>${esc(t.hPrecio)}</h2><p class="sub">${esc(t.pPrecio)}</p></header>
    <div class="planes">${t.planes.map((p) => `<article class="plan${p.destacado ? ' destacado' : ''}">
      <h3>${esc(p.nombre)}</h3><div class="plan-precio"><strong>${esc(p.precio)}</strong>${p.sufijo ? `<span>${esc(p.sufijo)}</span>` : ''}</div>
      <ul class="lista-ok">${p.lista.map((x) => `<li>${ic('ok')}${esc(x)}</li>`).join('')}</ul>
      <a class="btn ${p.destacado ? 'btn-primario' : 'btn-borde'}" href="${p.href}" target="_blank" rel="noopener" data-goatcounter-click="${p.gc}">${esc(p.cta)}</a>
    </article>`).join('')}</div>
    <div class="necesitas"><span class="mono">${esc(t.tNecesitas)}</span>${t.necesitas.map((x) => `<span>${ic('ok')}${esc(x)}</span>`).join('')}</div>
    <p class="letra centro">${esc(t.precioLetra)}</p>
  </div>
</section>

<section id="faq" class="seccion gris">
  <div class="caja estrecha">
    <header class="cabecera"><p class="ceja">${esc(t.tFaq)}</p></header>
    <div class="faq">${t.faq.map(([q, a]) => `<details><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`).join('')}</div>
  </div>
</section>

<section class="final">
  <div class="portada-fondo" aria-hidden="true"></div>
  <div class="caja final-in"><h2>${esc(t.finalH)}</h2><p>${esc(t.finalP)}</p><a class="btn btn-primario" href="#precio">${esc(t.finalCta)} ${ic('flecha')}</a></div>
</section>
</main>

<footer class="pie">
  <div class="caja pie-in">
    <a class="marca" href="${t.ruta}"><span class="logo" aria-hidden="true"><i></i><i></i><i></i></span>Contratitular</a>
    <span>© 2026 Contratitular · ${esc(t.pie)}</span>
    <span class="redes-pie"><a href="https://www.instagram.com/contratitular_es/" target="_blank" rel="noopener">Instagram</a><a href="https://www.tiktok.com/@contratitular" target="_blank" rel="noopener">TikTok</a><a href="https://www.youtube.com/@contratitular" target="_blank" rel="noopener">YouTube</a><a href="${t.otro.href}" hreflang="${L === 'es' ? 'en' : 'es'}">${esc(t.otro.nombre)}</a></span>
  </div>
</footer>

<div class="fijo"><a class="btn btn-primario" href="#precio">${esc(t.cta1)}</a></div>

<script src="/web.js" defer></script>
<!-- Estadísticas de visitas (GoatCounter: sin cookies) -->
<script data-goatcounter="https://contratitular.goatcounter.com/count" async src="//gc.zgo.at/count.js"></script>
</body>
</html>
`;
}

fs.writeFileSync('index.html', pagina(T.es), 'utf8');
fs.mkdirSync('en', { recursive: true });
fs.writeFileSync('en/index.html', pagina(T.en), 'utf8');
console.log('index.html y en/index.html generados');
