// Genera la web de contratitular.es en español (index.html) e inglés (en/index.html) desde una sola plantilla.
//   node construir.mjs
// Los textos están en T.es y T.en; el diseño, en estilos.css. Sin dependencias.
import fs from 'node:fs';

const CLIPS = [
  { id: 'endurance', completo: true, dur: '0:54', estilo: { es: 'papel', en: 'paper' }, es: { tema: 'Los 28 del Endurance', cat: 'Historia', rasgos: ['mapa con ruta', 'contador', 'corte en el giro'] }, en: { tema: 'The 28 men of the Endurance', cat: 'History', rasgos: ['route map', 'counter', 'hard cut on the twist'] } },
  { id: 'petricor', completo: true, dur: '0:40', estilo: { es: 'pizarra', en: 'chalkboard' }, es: { tema: 'Por qué huele la lluvia', cat: 'Ciencia', rasgos: ['narración continua', 'efectos sincronizados'] }, en: { tema: 'Why rain has a smell', cat: 'Science', rasgos: ['continuous narration', 'synced sound effects'] } },
  { id: 'huesos', completo: true, dur: '0:31', estilo: { es: 'pop', en: 'pop' }, es: { tema: 'Naciste con más huesos', cat: 'Cuerpo humano', rasgos: ['hecho por un Claude sin contexto', 'instalación limpia'] }, en: { tema: 'You were born with more bones', cat: 'Human body', rasgos: ['made by a fresh Claude session', 'clean install'] } },
  { id: 'datos', completo: false, dur: { es: 'fragmento', en: 'excerpt' }, estilo: { es: 'neón', en: 'neon' }, es: { tema: 'Escenas de datos', cat: 'Datos', rasgos: ['Banco Mundial', 'línea, barras y mapas'] }, en: { tema: 'Data scenes', cat: 'Data', rasgos: ['World Bank data', 'line, bars and maps'] } },
];

// Retención real (TikTok, primer vídeo publicado de la cuenta, nov-2026): % de espectadores en cada segundo
const RETENCION = [100, 69, 55, 44, 36, 24, 17, 13, 10, 9, 8];

const T = {
  es: {
    lang: 'es', ruta: '', otro: { href: '/en/', txt: 'EN' },
    title: 'Contratitular · Skill de Claude Code para vídeos verticales explicativos',
    desc: 'Una skill para Claude Code que investiga un tema, lo convierte en historia, ilustra y anima cada escena, pone voz y entrega un MP4 vertical. En tu ordenador y con tu plan de Claude.',
    nav: ['Cómo funciona', 'Para quién', 'Ejemplos', 'Ficha técnica', 'Preguntas'], navCta: 'Reservar',
    tPara: 'Para quién es', hPara: 'Si tienes algo que explicar, tienes un vídeo.',
    pPara: 'Nació para una cuenta de curiosidades, pero sirve para cualquiera que necesite contar algo claro, rápido y con gancho. Tú le das el tema o tu material; la skill lo convierte en historia.',
    para: [
      ['Proyectos e ideas', 'Emprendedores, startups, TFG, candidaturas a ayudas: tu idea explicada en 45 segundos para inversores, jurados o clientes.', 'Explica mi app de reciclaje para inversores, con estos datos'],
      ['Educación', 'Profesores, academias y divulgadores: una lección en un vídeo corto que los alumnos sí terminan de ver, con mapas, gráficos y fuentes.', 'Un vídeo de la fotosíntesis para 2.º de ESO'],
      ['Negocios y marcas', 'Cuenta qué te hace distinto, cómo funciona tu servicio o la historia de tu producto, con tus colores y tu estilo, sin agencia ni rodaje.', 'Cuenta por qué nuestro aceite es de primera presión en frío'],
      ['Creadores de contenido', 'Curiosidades, historia, ciencia o efemérides para publicar cada día en Instagram, TikTok, YouTube y Facebook sin quemarte.', 'Hazme tres vídeos de historia para esta semana'],
      ['Instituciones y ONG', 'Ayuntamientos, asociaciones y fundaciones: explica un servicio, una norma o una campaña a la gente, con datos oficiales y sin tecnicismos.', 'Explica a los vecinos la nueva recogida de residuos'],
      ['Formación en empresas', 'Procedimientos, seguridad, bienvenida a nuevos empleados o resultados del trimestre: píldoras de vídeo que se entienden a la primera.', 'Resume este procedimiento de seguridad en un vídeo de un minuto'],
    ],
    eyebrow: 'Skill para Claude Code · v2.4',
    h1: 'Cualquier idea, contada en un vídeo vertical que se ve hasta el final.',
    lead: 'Una curiosidad, tu proyecto, una lección o tu negocio. Contratitular investiga el tema con fuentes (o parte de tu información), lo estructura como una historia, ilustra y anima cada escena, la narra y renderiza un MP4 de 1080×1920 listo para Reels, TikTok y Shorts. Funciona en tu ordenador, con tu propio plan de Claude.',
    cta1: 'Reservar plaza · 29 €', cta2: 'Ver ejemplos',
    nota: 'Pago único. Sin cuotas por vídeo ni créditos de generación.',
    sonido: ['Activar sonido', 'Silenciar'],
    datos: [['0 €', 'por vídeo'], ['1080×1920', '30 fps · H.264'], ['−14 LUFS', 'volumen de redes'], ['2+ fuentes', 'por cada dato']],
    tProceso: 'Cómo funciona', hProceso: 'Seis etapas, una orden.',
    pProceso: 'Le pides un tema en lenguaje normal. Claude sigue el proceso de la skill y usa un motor de render local para todo lo que no debe improvisarse: tiempos, cifras, mapas y sonido.',
    etapas: [
      ['Investigación', 'Búsqueda web y contraste de cada cifra, fecha y nombre en al menos dos fuentes. Lo dudoso se marca como hipótesis o se descarta.'],
      ['Historia', 'Apuestas, gran pregunta, giro y reenganche. Autoevaluación con diez criterios: si la media baja de 7,5, el guion se reescribe.'],
      ['Guion y storyboard', 'Narración continua a ~3 palabras por segundo, ajustada a la duración pedida. Cámara, transición y sonido por escena.'],
      ['Escenas', 'Ilustración vectorial dibujada para cada frase. Gráficos y mapas con datos reales (Banco Mundial, Our World in Data, Natural Earth, IGN).'],
      ['Voz y sonido', 'Voz neuronal, alineación palabra a palabra y efectos generados por código que suenan cuando se nombra cada elemento.'],
      ['Render', 'Remotion local: MP4 H.264, volumen normalizado, portada, texto del post con fuentes y storyboard.'],
    ],
    tEjemplos: 'Ejemplos', hEjemplos: 'Salidas reales de la skill, sin retocar.',
    pEjemplos: 'Cada uno se generó con una sola petición. Pulsa un vídeo para verlo completo y con sonido.',
    verCompleto: 'Ver completo con sonido', soloBucle: 'Fragmento',
    tTerminal: 'Instalación', hTerminal: 'Se instala como un plugin y se usa en lenguaje normal.',
    pTerminal: 'Las actualizaciones llegan con /plugin update. La configuración y las claves del usuario viven fuera del plugin, en su propia carpeta.',
    terminal: ['/plugin marketplace add <dirección de tu compra>', '/plugin install contratitular@contratitular', '', '> Hazme un vídeo de 45 segundos sobre la expedición del Endurance', '', '  ✓ Historia: apuestas · pregunta · giro · reenganche (evaluación 8,4)', '  ✓ Guion correcto · 9 escenas · 164 palabras', '  ✓ Voz · subtítulos · 23/32 elementos sincronizados', '  ✓ Listo (53,8 s): video.mp4 · portada.png · texto.txt · storyboard.md'],
    tMedido: 'Medido, no supuesto', hMedido: 'Cada versión incorpora lo que dicen los datos.',
    pMedido: 'Publicamos a diario con la propia skill y medimos la retención de cada vídeo en cada red. Lo que se aprende entra en la siguiente versión como reglas de guion, sonido y estilo.',
    medidoPie: 'Retención segundo a segundo · TikTok · primer vídeo publicado (noviembre de 2026)',
    medidoNota: '−31 puntos en el primer segundo: el algoritmo lo mostraba, pero el gancho tardaba demasiado. Desde la v2.3, la primera frase pone lo importante en sus primeras palabras.',
    ejeS: 's', tFicha: 'Ficha técnica', hFicha: 'Especificaciones.',
    ficha: [
      ['Formato', '1080×1920, 30 fps, MP4 H.264 + AAC, volumen −14 LUFS'],
      ['Duración', '15 a 90 s, según se pida (por defecto ~40 s)'],
      ['Estilos', 'Papel, neón, pop, pizarra y limpio'],
      ['Escenas de datos', 'Barras, línea, contador y mapas (mundo, Europa, España por provincias o comunidades)'],
      ['Voz', 'Azure Neural HD (nivel gratuito), Kokoro local o tu propia voz con ElevenLabs'],
      ['Idioma de la narración', 'Español'],
      ['Entregables', 'Vídeo, portada, texto del post con fuentes, storyboard y ganchos alternativos'],
      ['Requisitos', 'Plan Pro o Max de Claude, Claude Code (app de escritorio o terminal), Windows 10/11 · macOS en beta'],
      ['Coste por vídeo', 'Ninguno: usa el plan de Claude del usuario; la skill no llama a la API de pago'],
    ],
    tPrecio: 'Lanzamiento', hPrecio: 'Pago único de 29 €.',
    pPrecio: 'Estamos cerrando la primera versión pública. Reserva tu plaza por mensaje directo y te avisamos con el precio de lanzamiento garantizado.',
    precioLetra: 'El plan de Claude no está incluido. No garantizamos visualizaciones ni ingresos.', reservar: 'Reservar por Instagram',
    tFaq: 'Preguntas',
    faq: [
      ['¿Usa la API de Claude?', 'No. Se ejecuta dentro de Claude Code con tu suscripción (Pro o Max). Cada vídeo consume parte del límite de uso de tu plan, no una factura aparte.'],
      ['¿Cuánto tarda un vídeo?', 'Entre 15 y 30 minutos desde la petición, casi todo investigación y dibujo. El render en sí son 2-3 minutos en un portátil normal.'],
      ['¿Cuántos vídeos puedo hacer?', 'Con el plan Pro, normalmente 1-2 al día. Con Max, bastantes más.'],
      ['¿Los datos son fiables?', 'Cada cifra se contrasta en al menos dos fuentes, lo incierto se marca como hipótesis y las fuentes van en el texto del post. Aun así, revisa cada vídeo antes de publicarlo.'],
      ['¿Se publica solo?', 'No. La skill entrega los archivos; tú decides dónde y cuándo publicarlos.'],
      ['¿Necesito saber programar?', 'No. El instalador se encarga de las dependencias y luego se pide todo en lenguaje normal.'],
    ],
    pie: 'Contratitular · Esta web no usa cookies ni guarda datos personales.',
  },
  en: {
    lang: 'en', ruta: '/en', otro: { href: '/', txt: 'ES' },
    title: 'Contratitular · Claude Code skill for vertical explainer videos',
    desc: 'A Claude Code skill that researches a topic, turns it into a story, illustrates and animates every scene, narrates it and delivers a vertical MP4. On your machine, with your own Claude plan.',
    nav: ['How it works', "Who it's for", 'Examples', 'Specs', 'FAQ'], navCta: 'Reserve',
    tPara: "Who it's for", hPara: 'If you have something to explain, you have a video.',
    pPara: 'It was born for a fun-facts account, but it works for anyone who needs to explain something clearly, quickly and with a hook. You give it the topic or your material; the skill turns it into a story.',
    para: [
      ['Projects and ideas', 'Founders, startups, theses, grant applications: your idea explained in 45 seconds for investors, juries or customers.', 'Explain my recycling app to investors, using these numbers'],
      ['Education', 'Teachers, academies and science communicators: a lesson in a short video students actually finish, with maps, charts and sources.', 'A video on photosynthesis for 13-year-olds'],
      ['Businesses and brands', 'Show what makes you different, how your service works or the story behind your product, in your colours and style, with no agency and no shoot.', 'Tell why our olive oil is cold-pressed'],
      ['Content creators', 'Fun facts, history, science or on-this-day stories to post every day on Instagram, TikTok, YouTube and Facebook without burning out.', 'Make me three history videos for this week'],
      ['Public bodies and NGOs', 'Councils, associations and foundations: explain a service, a rule or a campaign to the public, with official data and no jargon.', 'Explain the new waste collection to residents'],
      ['Corporate training', 'Procedures, safety, onboarding or quarterly results: bite-sized videos people understand the first time.', 'Sum up this safety procedure in a one-minute video'],
    ],
    eyebrow: 'Claude Code skill · v2.4',
    h1: 'Any idea, told in a vertical video people watch to the end.',
    lead: 'A fun fact, your project, a lesson or your business. Contratitular researches the topic with sources (or starts from your own material), structures it as a story, illustrates and animates every scene, narrates it and renders a 1080×1920 MP4 ready for Reels, TikTok and Shorts. It runs on your machine, with your own Claude plan.',
    cta1: 'Reserve a seat · €29', cta2: 'See examples',
    nota: 'One-time payment. No per-video fees or generation credits.',
    sonido: ['Turn sound on', 'Mute'],
    datos: [['€0', 'per video'], ['1080×1920', '30 fps · H.264'], ['−14 LUFS', 'social loudness'], ['2+ sources', 'per fact']],
    tProceso: 'How it works', hProceso: 'Six stages, one request.',
    pProceso: 'You ask for a topic in plain language. Claude follows the skill\'s process and uses a local rendering engine for everything that must not be improvised: timing, figures, maps and sound.',
    etapas: [
      ['Research', 'Web search and cross-checking of every figure, date and name against at least two sources. Anything uncertain is flagged as a hypothesis or dropped.'],
      ['Story', 'Stakes, big question, twist and rehook. A ten-criterion self-review: if the average drops below 7.5, the script is rewritten.'],
      ['Script & storyboard', 'Continuous narration at ~3 words per second, fitted to the requested length. Camera, transition and sound per scene.'],
      ['Scenes', 'Vector illustration drawn for every line. Charts and maps built from real data (World Bank, Our World in Data, Natural Earth, IGN).'],
      ['Voice & sound', 'Neural voice, word-level alignment and procedurally generated sound effects that play when each element is mentioned.'],
      ['Render', 'Local Remotion: H.264 MP4, normalised loudness, cover image, post copy with sources, and a storyboard.'],
    ],
    tEjemplos: 'Examples', hEjemplos: 'Unedited output from the skill.',
    pEjemplos: 'Each one came from a single request. The narration is in Spanish. Click a video to watch it in full with sound.',
    verCompleto: 'Watch in full with sound', soloBucle: 'Excerpt',
    tTerminal: 'Installation', hTerminal: 'Installs as a plugin, used in plain language.',
    pTerminal: 'Updates arrive with /plugin update. User settings and keys live outside the plugin, in the user\'s own folder.',
    terminal: ['/plugin marketplace add <your purchase link>', '/plugin install contratitular@contratitular', '', '> Make a 45-second video about the Endurance expedition', '', '  ✓ Story: stakes · question · twist · rehook (score 8.4)', '  ✓ Script valid · 9 scenes · 164 words', '  ✓ Voice · captions · 23/32 elements synced', '  ✓ Done (53.8 s): video.mp4 · portada.png · texto.txt · storyboard.md'],
    tMedido: 'Measured, not assumed', hMedido: 'Every release incorporates what the data says.',
    pMedido: 'We publish daily with the skill itself and track the retention of every video on every network. What we learn ships in the next release as rules for scripts, sound and style.',
    medidoPie: 'Second-by-second retention · TikTok · first published video (November 2026)',
    medidoNota: '−31 points in the first second: the algorithm was distributing it, but the hook took too long. Since v2.3 the opening line puts the key fact in its first few words.',
    ejeS: 's', tFicha: 'Specs', hFicha: 'Technical specifications.',
    ficha: [
      ['Format', '1080×1920, 30 fps, H.264 + AAC MP4, −14 LUFS loudness'],
      ['Length', '15 to 90 s, on request (default ~40 s)'],
      ['Styles', 'Paper, neon, pop, chalkboard and clean'],
      ['Data scenes', 'Bars, line, counter and maps (world, Europe, Spain by province or region)'],
      ['Voice', 'Azure Neural HD (free tier), local Kokoro, or your own voice via ElevenLabs'],
      ['Narration language', 'Spanish'],
      ['Deliverables', 'Video, cover, post copy with sources, storyboard and alternative hooks'],
      ['Requirements', 'Claude Pro or Max plan, Claude Code (desktop app or terminal), Windows 10/11 · macOS in beta'],
      ['Cost per video', 'None: it runs on the user\'s Claude plan; the skill does not call the paid API'],
    ],
    tPrecio: 'Launch', hPrecio: 'One-time payment of €29.',
    pPrecio: 'We are finalising the first public release. Reserve your seat by direct message and we will let you know, with the launch price guaranteed.',
    precioLetra: 'Claude plan not included. No views or revenue are guaranteed.', reservar: 'Reserve on Instagram',
    tFaq: 'FAQ',
    faq: [
      ['Does it use the Claude API?', 'No. It runs inside Claude Code on your subscription (Pro or Max). Each video uses part of your plan\'s usage limit, not a separate bill.'],
      ['How long does a video take?', '15 to 30 minutes from the request, mostly research and drawing. Rendering itself takes 2-3 minutes on an ordinary laptop.'],
      ['How many videos can I make?', 'On the Pro plan, usually 1-2 a day. On Max, considerably more.'],
      ['Are the facts reliable?', 'Every figure is cross-checked against at least two sources, uncertain claims are flagged, and sources are listed in the post copy. Still, review each video before publishing.'],
      ['Does it publish automatically?', 'No. The skill delivers the files; you decide where and when to post them.'],
      ['Do I need to code?', 'No. The installer handles dependencies, and everything else is requested in plain language.'],
    ],
    pie: 'Contratitular · This site uses no cookies and stores no personal data.',
  },
};

const ICO = {
  flecha: '<svg class="ic" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
  play: '<svg class="ic" viewBox="0 0 24 24" aria-hidden="true"><path d="M7 5v14l11-7z"/></svg>',
  mudo: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M11 5 6 9H2v6h4l5 4V5z"/><path class="ondas" d="M23 9l-6 6M17 9l6 6"/></svg>',
};
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function grafica(t) {
  // Curva de retención en SVG (sin librerías): eje 0-100 %, 0-10 s
  const W = 520, H = 240, x0 = 44, y0 = 16, w = W - x0 - 16, h = H - y0 - 34;
  const px = (i) => x0 + (w * i) / (RETENCION.length - 1), py = (v) => y0 + h - (h * v) / 100;
  const d = RETENCION.map((v, i) => `${i ? 'L' : 'M'}${px(i).toFixed(1)} ${py(v).toFixed(1)}`).join(' ');
  const rejilla = [0, 25, 50, 75, 100].map((v) => `<line x1="${x0}" x2="${x0 + w}" y1="${py(v)}" y2="${py(v)}"/><text x="${x0 - 8}" y="${py(v) + 4}" text-anchor="end">${v}%</text>`).join('');
  const ejeX = RETENCION.map((_, i) => (i % 2 ? '' : `<text x="${px(i)}" y="${H - 10}" text-anchor="middle">${i} ${t.ejeS}</text>`)).join('');
  return `<svg class="grafica" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(t.medidoPie)}"><g class="rejilla">${rejilla}</g><g class="eje">${ejeX}</g>` +
    `<path d="${d} L${px(RETENCION.length - 1)} ${py(0)} L${px(0)} ${py(0)} Z" class="area"/><path d="${d}" class="linea"/>` +
    `<circle cx="${px(1)}" cy="${py(RETENCION[1])}" r="5" class="punto"/><text x="${px(1) + 12}" y="${py(RETENCION[1]) - 8}" class="anota">−31</text></svg>`;
}

function pagina(t) {
  const L = t.lang;
  return `<!doctype html>
<html lang="${L}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(t.title)}</title>
<meta name="description" content="${esc(t.desc)}">
<meta property="og:title" content="${esc(t.title)}">
<meta property="og:description" content="${esc(t.desc)}">
<meta property="og:image" content="https://contratitular.es/media/clips/endurance.jpg">
<link rel="alternate" hreflang="es" href="https://contratitular.es/">
<link rel="alternate" hreflang="en" href="https://contratitular.es/en/">
<link rel="preload" href="/fuentes/ibm-plex-sans-600-latin.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="/fuentes/fuentes.css">
<link rel="stylesheet" href="/estilos.css">
<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' rx='7' fill='%230B1220'/%3E%3Crect x='7' y='8' width='18' height='4' rx='1.5' fill='%23E6E9EF'/%3E%3Crect x='7' y='14' width='11' height='4' rx='1.5' fill='%23E6E9EF'/%3E%3Crect x='7' y='20' width='18' height='4' rx='1.5' fill='%23E6E9EF'/%3E%3Crect x='20' y='14' width='2' height='4' fill='%232E9BF0'/%3E%3Crect x='23' y='12' width='2' height='6' fill='%232E9BF0'/%3E%3C/svg%3E">
</head>
<body>
<header class="barra">
  <div class="caja barra-in">
    <a class="marca" href="${t.ruta || '/'}"><span class="logo" aria-hidden="true"><i></i><i></i><i></i></span>Contratitular</a>
    <nav aria-label="${L === 'es' ? 'Secciones' : 'Sections'}">
      <a href="#proceso">${t.nav[0]}</a><a href="#para-quien">${t.nav[1]}</a><a href="#ejemplos">${t.nav[2]}</a><a href="#ficha">${t.nav[3]}</a><a href="#faq">${t.nav[4]}</a>
      <a class="idioma" href="${t.otro.href}" hreflang="${L === 'es' ? 'en' : 'es'}">${t.otro.txt}</a>
      <a class="btn btn-claro btn-mini" href="#precio">${t.navCta}</a>
    </nav>
  </div>
</header>

<main>
<section class="portada oscura">
  <div class="caja portada-in">
    <div>
      <p class="ceja">${esc(t.eyebrow)}</p>
      <h1>${esc(t.h1)}</h1>
      <p class="entrada">${esc(t.lead)}</p>
      <div class="acciones"><a class="btn btn-azul" href="#precio">${esc(t.cta1)} ${ICO.flecha}</a><a class="btn btn-borde" href="#ejemplos">${esc(t.cta2)}</a></div>
      <p class="letra">${esc(t.nota)}</p>
    </div>
    <figure class="movil">
      <video id="portada-video" src="/media/clips/endurance.mp4" poster="/media/clips/endurance.jpg" autoplay muted loop playsinline preload="metadata"></video>
      <button class="sonido" id="portada-sonido" type="button" aria-label="${esc(t.sonido[0])}" data-on="${esc(t.sonido[1])}" data-off="${esc(t.sonido[0])}">${ICO.mudo}</button>
    </figure>
  </div>
  <div class="caja cifras">${t.datos.map(([a, b]) => `<div><strong>${esc(a)}</strong><span>${esc(b)}</span></div>`).join('')}</div>
</section>

<section id="proceso" class="seccion">
  <div class="caja">
    <p class="ceja">${esc(t.tProceso)}</p><h2>${esc(t.hProceso)}</h2><p class="sub">${esc(t.pProceso)}</p>
    <ol class="etapas">${t.etapas.map(([h, p], i) => `<li><span class="num">${String(i + 1).padStart(2, '0')}</span><h3>${esc(h)}</h3><p>${esc(p)}</p></li>`).join('')}</ol>
  </div>
</section>

<section id="para-quien" class="seccion gris">
  <div class="caja">
    <p class="ceja">${esc(t.tPara)}</p><h2>${esc(t.hPara)}</h2><p class="sub">${esc(t.pPara)}</p>
    <div class="usos">${t.para.map(([h, p, ej]) => `<article><h3>${esc(h)}</h3><p>${esc(p)}</p><code>› ${esc(ej)}</code></article>`).join('')}</div>
  </div>
</section>

<section id="ejemplos" class="seccion">
  <div class="caja">
    <p class="ceja">${esc(t.tEjemplos)}</p><h2>${esc(t.hEjemplos)}</h2><p class="sub">${esc(t.pEjemplos)}</p>
    <div class="clips">${CLIPS.map((c) => { const x = c[L]; return `<figure class="clip"${c.completo ? ` data-completo="/media/clips/${c.id}.mp4"` : ''}>
      <div class="clip-video"><video src="/media/clips/${c.id}-bucle.mp4" poster="/media/clips/${c.id}.jpg" muted loop playsinline preload="none"></video>${c.completo ? `<button class="clip-play" type="button">${ICO.play}<span>${esc(t.verCompleto)}</span></button>` : `<span class="clip-marca">${esc(t.soloBucle)}</span>`}</div>
      <figcaption><span class="mono">${esc(x.cat)} · ${esc(c.estilo[L])} · ${esc(typeof c.dur === 'string' ? c.dur : c.dur[L])}</span><strong>${esc(x.tema)}</strong><span class="rasgos">${x.rasgos.map((r) => `<em>${esc(r)}</em>`).join('')}</span></figcaption></figure>`; }).join('')}</div>
  </div>
</section>

<section class="seccion">
  <div class="caja dos">
    <div><p class="ceja">${esc(t.tTerminal)}</p><h2>${esc(t.hTerminal)}</h2><p class="sub">${esc(t.pTerminal)}</p></div>
    <pre class="terminal" aria-label="Terminal"><span class="puntos" aria-hidden="true"><i></i><i></i><i></i></span><code>${t.terminal.map((l) => l.startsWith('>') ? `<b>${esc(l)}</b>` : l.startsWith('  ✓') ? `<span class="ok">${esc(l)}</span>` : esc(l)).join('\n')}</code></pre>
  </div>
</section>

<section class="seccion oscura">
  <div class="caja dos">
    <div><p class="ceja">${esc(t.tMedido)}</p><h2>${esc(t.hMedido)}</h2><p class="sub">${esc(t.pMedido)}</p><p class="nota-dato">${esc(t.medidoNota)}</p></div>
    <figure class="panel-grafica">${grafica(t)}<figcaption>${esc(t.medidoPie)}</figcaption></figure>
  </div>
</section>

<section id="ficha" class="seccion">
  <div class="caja">
    <p class="ceja">${esc(t.tFicha)}</p><h2>${esc(t.hFicha)}</h2>
    <dl class="ficha">${t.ficha.map(([a, b]) => `<div><dt>${esc(a)}</dt><dd>${esc(b)}</dd></div>`).join('')}</dl>
  </div>
</section>

<section id="precio" class="seccion gris">
  <div class="caja precio">
    <div><p class="ceja">${esc(t.tPrecio)}</p><h2>${esc(t.hPrecio)}</h2><p class="sub">${esc(t.pPrecio)}</p></div>
    <div class="tarifa">
      <span class="mono">${L === 'es' ? 'Pago único' : 'One-time'}</span>
      <div class="importe">${L === 'es' ? '29 €' : '€29'}</div>
      <a class="btn btn-azul" href="https://ig.me/m/contratitular_es" target="_blank" rel="noopener" data-goatcounter-click="reservar-instagram-${L}" data-goatcounter-title="Reservar por Instagram (${L})">${esc(t.reservar)}</a>
      <p class="letra">${esc(t.precioLetra)}</p>
    </div>
  </div>
</section>

<section id="faq" class="seccion">
  <div class="caja estrecha">
    <p class="ceja">${esc(t.tFaq)}</p>
    <div class="faq">${t.faq.map(([q, a]) => `<details><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`).join('')}</div>
  </div>
</section>
</main>

<footer class="pie">
  <div class="caja pie-in">
    <span>© 2026 ${esc(t.pie)}</span>
    <span class="redes"><a href="https://www.instagram.com/contratitular_es/" target="_blank" rel="noopener">Instagram</a><a href="https://www.tiktok.com/@contratitular" target="_blank" rel="noopener">TikTok</a><a href="https://www.youtube.com/@contratitular" target="_blank" rel="noopener">YouTube</a><a href="${t.otro.href}" hreflang="${L === 'es' ? 'en' : 'es'}">${L === 'es' ? 'English' : 'Español'}</a></span>
  </div>
</footer>

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
