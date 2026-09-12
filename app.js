/**
 * ROMPEHIELO — Motor conversacional inteligente + juego de cartas con turnos
 * 
 * FLUJO: Welcome → Chat conversacional (recoge contexto) → Juego con turnos
 * 
 * La "IA" es un motor de inferencia local: decision tree + keyword matching
 * que se siente inteligente sin necesitar API keys ni conexión.
 */

// ===== SISTEMA DE INFERENCIA CONTEXTUAL =====

const CONTEXT_MAP = {
  tinder_primera_cita: {
    label: "Primera cita de app",
    emoji: "💘",
    keywords: ["tinder", "bumble", "hinge", "app de citas", "match", "nos conocimos por app", "cita de app", "primera vez que nos vemos", "nos matcheamos"]
  },
  cita_ambigua: {
    label: "Cita ambigua",
    emoji: "🌙",
    keywords: ["no sé si es cita", "ambigua", "no sé qué somos", "algo raro", "tensión", "no sé si le gusto", "amigos o algo más", "confuso", "no sé qué onda"]
  },
  cita_no_romantica: {
    label: "Cita no romántica",
    emoji: "☕",
    keywords: ["café", "no es cita", "solo amigos", "networking", "trabajo", "profesional", "conocido", "compañero"]
  },
  pareja_reciente: {
    label: "Pareja reciente",
    emoji: "🦋",
    keywords: ["novios hace poco", "pareja nueva", "recién empezamos", "llevamos poco", "meses", "empezamos a salir", "novios nuevos", "pololeando"]
  },
  pareja_estable: {
    label: "Pareja de años",
    emoji: "💎",
    keywords: ["años juntos", "pareja estable", "casados", "mucho tiempo", "convivimos", "vivimos juntos", "matrimonio", "esposa", "esposo", "marido"]
  },
  desconocidos_mesa: {
    label: "Personas nuevas",
    emoji: "👋",
    keywords: ["no nos conocemos", "desconocidos", "primera vez", "recién nos presentaron", "no conozco a nadie", "gente nueva"]
  },
  amigos_antiguos: {
    label: "Amigos de siempre",
    emoji: "🍻",
    keywords: ["amigos de años", "amigos de toda la vida", "hace mucho", "nos conocemos hace", "cabros", "la pandilla", "el grupo de siempre", "mejores amigos"]
  },
  amigos_recientes: {
    label: "Amigos recientes",
    emoji: "✌️",
    keywords: ["amigos nuevos", "nos conocemos hace poco", "recién nos juntamos", "del trabajo", "de la u", "compañeros"]
  },
  parejas_amigos: {
    label: "Parejas de amigos",
    emoji: "💑",
    keywords: ["parejas", "con nuestras parejas", "los cuatro", "doble cita", "amigos con pareja", "todos en pareja"]
  },
  doble_cita: {
    label: "Doble cita",
    emoji: "🥂",
    keywords: ["doble cita", "dos parejas", "salimos los cuatro", "cita doble"]
  },
  familia_reunion: {
    label: "Reunión familiar",
    emoji: "🏡",
    keywords: ["familia", "reunión familiar", "navidad", "año nuevo", "cumpleaños", "almuerzo familiar", "asado familiar"]
  },
  familia_hermanos: {
    label: "Hermanos",
    emoji: "👫",
    keywords: ["hermanos", "hermano", "hermana", "con mi hermano", "con mi hermana"]
  },
  familia_primos: {
    label: "Primos",
    emoji: "🤙",
    keywords: ["primos", "primo", "prima", "con mis primos"]
  },
  carrete_fiesta: {
    label: "Carrete / Fiesta",
    emoji: "🎉",
    keywords: ["carrete", "fiesta", "party", "previa", "after", "tomando", "borrachos", "copas", "tragos", "juntarnos a tomar"]
  }
};

// Relationship type inference from keywords
const RELATIONSHIP_PATTERNS = [
  { pattern: /cita|date|saliendo|tinder|bumble|hinge|match/i, type: "romantic" },
  { pattern: /pareja|novi[oa]|polol[oa]|espos[oa]|casad[oa]|marido|mujer/i, type: "couple" },
  { pattern: /amig[oa]s?|cabros|pandilla|grupo|compadre/i, type: "friends" },
  { pattern: /familia|herman[oa]|prim[oa]|tí[oa]|abuel[oa]|papá|mamá|padre|madre/i, type: "family" },
  { pattern: /desconocid|no conoz|primera vez|gente nueva|extrañ/i, type: "strangers" },
  { pattern: /carrete|fiesta|party|previa|tomar|copas/i, type: "party" }
];

// How they met inference
const MEETING_PATTERNS = [
  { pattern: /tinder|bumble|hinge|app|online|internet/i, how: "por una app de citas" },
  { pattern: /trabajo|pega|oficina|empresa|colega/i, how: "en el trabajo" },
  { pattern: /universidad|u |facu|carrera|clase/i, how: "en la universidad" },
  { pattern: /colegio|escuela/i, how: "en el colegio" },
  { pattern: /amig[oa] en común|nos presentaron|me lo presentó/i, how: "por amigos en común" },
  { pattern: /fiesta|carrete|salida|bar|disco/i, how: "en una fiesta" },
  { pattern: /gym|deporte|fútbol|yoga/i, how: "haciendo deporte" }
];

// ===== ESTADO GLOBAL =====

let BANK = {};
let STATE = {
  phase: "welcome", // welcome | onboarding | ready | game
  step: 0,
  players: [],
  contextKey: null,
  contextLabel: "",
  contextEmoji: "",
  relationshipType: null,
  howMet: null,
  mood: null,
  extraInfo: {},
  deck: [],
  cardIndex: 0,
  currentTurn: 0,
  isFlipped: false,
  celebrationShown: new Set()
};

// ===== ONBOARDING: CONVERSACIÓN INTELIGENTE =====

const ONBOARDING_FLOW = {
  welcome: {
    botMessages: [
      "¡Hola! 👋 Soy tu rompehielo personal.",
      "Voy a prepararte un mazo de preguntas perfecto para tu situación. Cuéntame un poquito..."
    ],
    question: "¿Cómo describirías lo que está pasando ahora?",
    placeholder: "Ej: estamos en una primera cita...",
    options: [
      { text: "🍷 Primera cita", value: "primera cita" },
      { text: "💑 Con mi pareja", value: "con mi pareja de años" },
      { text: "🍻 Con amigos", value: "con mis amigos de siempre" },
      { text: "👋 Gente nueva", value: "con gente que no conozco" },
      { text: "🏡 Familia", value: "reunión familiar" },
      { text: "🎉 Carrete", value: "carrete con amigos" }
    ],
    process: processInitialContext
  },

  names: {
    question: null, // Se genera dinámicamente
    placeholder: "Ej: Camila y Diego",
    options: [],
    process: processNames
  },

  detail: {
    question: null,
    placeholder: "",
    options: [],
    process: processDetail
  },

  mood: {
    question: "¿Cómo quieren que sea la conversación?",
    placeholder: "",
    options: [
      { text: "😊 Suave y divertida", value: "suave" },
      { text: "🔥 Intensa y profunda", value: "profunda" },
      { text: "🎲 Sorpréndeme", value: "mix" }
    ],
    process: processMood
  }
};

// ===== INIT =====

async function init() {
  try {
    const res = await fetch("data/questions.json");
    BANK = await res.json();
  } catch (e) {
    console.error("Error cargando banco de preguntas:", e);
  }

  setupEventListeners();
  startOnboarding();

  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("sw.js").catch(() => {});
  }
}

function setupEventListeners() {
  // Chat input
  document.getElementById("chatSendBtn").onclick = handleChatSend;
  document.getElementById("chatInput").onkeydown = (e) => {
    if (e.key === "Enter") handleChatSend();
  };

  // Game controls
  document.getElementById("card3D").onclick = toggleFlip;
  document.getElementById("btnNext").onclick = nextCard;
  document.getElementById("btnRestart").onclick = restartGame;
}

// ===== CHAT ENGINE =====

function addBotMessage(text, delay = 0) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const chatArea = document.getElementById("chatArea");

      // Add typing indicator first
      const typing = document.createElement("div");
      typing.className = "chat-bubble bot";
      typing.innerHTML = `<span class="bot-name">ROMPEHIELO</span><div class="typing-dots"><span></span><span></span><span></span></div>`;
      chatArea.appendChild(typing);
      chatArea.scrollTop = chatArea.scrollHeight;

      // Replace with actual message after typing delay
      setTimeout(() => {
        typing.innerHTML = `<span class="bot-name">ROMPEHIELO</span>${text}`;
        chatArea.scrollTop = chatArea.scrollHeight;
        resolve();
      }, 600 + Math.random() * 400);
    }, delay);
  });
}

function addUserMessage(text) {
  const chatArea = document.getElementById("chatArea");
  const bubble = document.createElement("div");
  bubble.className = "chat-bubble user";
  bubble.textContent = text;
  chatArea.appendChild(bubble);
  chatArea.scrollTop = chatArea.scrollHeight;
}

function showOptions(options) {
  const container = document.getElementById("quickOptions");
  container.innerHTML = "";
  options.forEach(opt => {
    const pill = document.createElement("button");
    pill.className = "quick-pill";
    pill.textContent = opt.text;
    pill.onclick = () => {
      addUserMessage(opt.text);
      container.innerHTML = "";
      // Process the option value through current step
      processUserInput(opt.value);
    };
    container.appendChild(pill);
  });
}

function clearOptions() {
  document.getElementById("quickOptions").innerHTML = "";
}

function setInputPlaceholder(text) {
  document.getElementById("chatInput").placeholder = text;
}

function handleChatSend() {
  const input = document.getElementById("chatInput");
  const text = input.value.trim();
  if (!text) return;

  addUserMessage(text);
  input.value = "";
  clearOptions();
  processUserInput(text);
}

function processUserInput(text) {
  const phase = STATE.phase;
  if (phase === "welcome" || phase === "onboarding") {
    const currentStep = getCurrentStep();
    if (currentStep && currentStep.process) {
      currentStep.process(text);
    }
  }
}

function getCurrentStep() {
  const steps = ["welcome", "names", "detail", "mood"];
  return ONBOARDING_FLOW[steps[STATE.step]] || null;
}

// ===== ONBOARDING FLOW =====

async function startOnboarding() {
  STATE.phase = "welcome";
  STATE.step = 0;

  // Compact the header after initial display
  setTimeout(() => {
    document.getElementById("brandHeader").classList.add("compact");
  }, 2000);

  // Welcome messages
  await addBotMessage("¡Hola! 👋 Soy tu rompehielo personal.");
  await addBotMessage("Voy a prepararte un mazo de preguntas perfecto para tu situación. Cuéntame un poquito...", 300);
  await addBotMessage("¿Cómo describirías lo que está pasando ahora?", 300);

  setInputPlaceholder("Ej: estamos en una primera cita...");
  showOptions(ONBOARDING_FLOW.welcome.options);
}

// STEP 1: Initial context
function processInitialContext(text) {
  const lower = text.toLowerCase();

  // Infer context key
  let bestMatch = null;
  let bestScore = 0;
  for (const [key, ctx] of Object.entries(CONTEXT_MAP)) {
    let score = 0;
    for (const kw of ctx.keywords) {
      if (lower.includes(kw)) score += kw.length; // Longer matches = better
    }
    if (score > bestScore) {
      bestScore = score;
      bestMatch = key;
    }
  }

  // Fallback: infer from relationship patterns
  if (!bestMatch || bestScore < 3) {
    for (const rp of RELATIONSHIP_PATTERNS) {
      if (rp.pattern.test(lower)) {
        const defaults = {
          romantic: "cita_ambigua",
          couple: "pareja_estable",
          friends: "amigos_antiguos",
          family: "familia_reunion",
          strangers: "desconocidos_mesa",
          party: "carrete_fiesta"
        };
        bestMatch = defaults[rp.type] || "desconocidos_mesa";
        break;
      }
    }
  }

  if (!bestMatch) bestMatch = "desconocidos_mesa";

  STATE.contextKey = bestMatch;
  STATE.contextLabel = CONTEXT_MAP[bestMatch].label;
  STATE.contextEmoji = CONTEXT_MAP[bestMatch].emoji;

  // Infer relationship type
  for (const rp of RELATIONSHIP_PATTERNS) {
    if (rp.pattern.test(lower)) {
      STATE.relationshipType = rp.type;
      break;
    }
  }

  // Infer how they met
  for (const mp of MEETING_PATTERNS) {
    if (mp.pattern.test(lower)) {
      STATE.howMet = mp.how;
      break;
    }
  }

  // Store raw context for personalization
  STATE.extraInfo.rawContext = text;

  STATE.phase = "onboarding";
  STATE.step = 1;
  askNames();
}

// STEP 2: Names
async function askNames() {
  const type = STATE.relationshipType;
  let question;

  if (type === "romantic") {
    question = "¡Qué lindo! ¿Cómo se llaman? Así personalizo las cartas 💕";
  } else if (type === "couple") {
    question = "¡Genial! ¿Cómo se llaman ustedes dos? Así las preguntas van con nombre 💎";
  } else if (type === "friends" || type === "party") {
    question = "¡Dale! ¿Cómo se llaman los que juegan? Escriban los nombres separados por coma";
  } else if (type === "family") {
    question = "¡Buena! ¿Quiénes van a jugar? Escriban los nombres separados por coma";
  } else {
    question = "¡Perfecto! ¿Cómo se llaman las personas que van a jugar?";
  }

  await addBotMessage(question, 200);
  setInputPlaceholder("Ej: Camila, Diego");
}

function processNames(text) {
  // Parse names from text
  const raw = text.replace(/\by\b/gi, ",").replace(/\bcon\b/gi, ",");
  const names = raw.split(/[,\n]+/)
    .map(n => n.trim())
    .filter(n => n.length > 0 && n.length < 30)
    .map(n => n.charAt(0).toUpperCase() + n.slice(1).toLowerCase());

  if (names.length === 0) {
    names.push("Jugador 1", "Jugador 2");
  } else if (names.length === 1) {
    names.push("Jugador 2");
  }

  STATE.players = names;
  STATE.step = 2;
  askDetail();
}

// STEP 3: Contextual detail question
async function askDetail() {
  const type = STATE.relationshipType;
  const ctx = STATE.contextKey;
  let question;
  let options = [];
  let placeholder = "";

  if (type === "romantic" && !STATE.howMet) {
    question = `${STATE.players[0]} y ${STATE.players[1]}, ¿cómo se conocieron?`;
    options = [
      { text: "📱 Por app de citas", value: "por app de citas" },
      { text: "👥 Amigos en común", value: "por amigos en común" },
      { text: "🎉 En una fiesta", value: "en una fiesta" },
      { text: "💼 En el trabajo/U", value: "en el trabajo" }
    ];
    placeholder = "Cuéntame...";
  } else if (type === "couple") {
    question = `¿Cuánto tiempo llevan juntos ${STATE.players[0]} y ${STATE.players[1]}?`;
    options = [
      { text: "🦋 Menos de 6 meses", value: "poco" },
      { text: "💛 1-3 años", value: "medio" },
      { text: "💎 Más de 3 años", value: "mucho" }
    ];
    placeholder = "Ej: 2 años";
    // Adjust context based on couple duration
    ONBOARDING_FLOW.detail.process = (text) => {
      const lower = text.toLowerCase();
      if (lower.includes("poco") || lower.includes("mes") || lower.includes("recién")) {
        STATE.contextKey = "pareja_reciente";
      } else {
        STATE.contextKey = "pareja_estable";
      }
      STATE.contextLabel = CONTEXT_MAP[STATE.contextKey].label;
      STATE.contextEmoji = CONTEXT_MAP[STATE.contextKey].emoji;
      STATE.step = 3;
      askMood();
    };
  } else if (type === "friends") {
    question = `¿Hace cuánto se conocen ${STATE.players.length > 2 ? "los cabros" : STATE.players[0] + " y " + STATE.players[1]}?`;
    options = [
      { text: "✌️ Recién", value: "poco" },
      { text: "📅 Un par de años", value: "medio" },
      { text: "🍻 Toda la vida", value: "mucho" }
    ];
    placeholder = "Ej: nos conocemos del colegio";
    ONBOARDING_FLOW.detail.process = (text) => {
      const lower = text.toLowerCase();
      if (lower.includes("poco") || lower.includes("recién") || lower.includes("nuevo")) {
        STATE.contextKey = "amigos_recientes";
      } else {
        STATE.contextKey = "amigos_antiguos";
      }
      STATE.contextLabel = CONTEXT_MAP[STATE.contextKey].label;
      STATE.contextEmoji = CONTEXT_MAP[STATE.contextKey].emoji;
      STATE.step = 3;
      askMood();
    };
  } else {
    // For family, strangers, party — skip to mood directly
    STATE.step = 3;
    askMood();
    return;
  }

  await addBotMessage(question, 200);
  if (options.length > 0) showOptions(options);
  if (placeholder) setInputPlaceholder(placeholder);
}

function processDetail(text) {
  const lower = text.toLowerCase();

  // Store how met if applicable
  if (STATE.relationshipType === "romantic") {
    for (const mp of MEETING_PATTERNS) {
      if (mp.pattern.test(lower)) {
        STATE.howMet = mp.how;
        break;
      }
    }
    if (!STATE.howMet) STATE.howMet = text;
  }

  STATE.step = 3;
  askMood();
}

// STEP 4: Mood
async function askMood() {
  const names = STATE.players;
  const pairLabel = names.length === 2
    ? `${names[0]} y ${names[1]}`
    : names.slice(0, -1).join(", ") + " y " + names[names.length - 1];

  await addBotMessage(`¡Ya casi, ${pairLabel}! Una última cosa...`, 200);
  await addBotMessage("¿Cómo quieren que sea la conversación?", 400);

  showOptions([
    { text: "😊 Suave y divertida", value: "suave" },
    { text: "🔥 Intensa y profunda", value: "profunda" },
    { text: "🎲 Sorpréndeme", value: "mix" }
  ]);
  setInputPlaceholder("Elige un estilo...");
}

function processMood(text) {
  const lower = text.toLowerCase();
  if (lower.includes("suave") || lower.includes("divertid")) {
    STATE.mood = "suave";
  } else if (lower.includes("intens") || lower.includes("profund")) {
    STATE.mood = "profunda";
  } else {
    STATE.mood = "mix";
  }

  STATE.step = 4;
  finishOnboarding();
}

// FINISH: Generate deck and transition to game
async function finishOnboarding() {
  STATE.phase = "ready";

  const names = STATE.players;
  const pairLabel = names.length === 2
    ? `${names[0]} y ${names[1]}`
    : `los ${names.length}`;

  await addBotMessage(`${STATE.contextEmoji} ¡Perfecto! Preparé un mazo especial para ${pairLabel}.`, 200);

  const label = STATE.contextLabel.toLowerCase();
  let flavorText;
  if (STATE.relationshipType === "romantic") {
    flavorText = STATE.howMet
      ? `Sé que se conocieron ${STATE.howMet}. Las preguntas van a ayudarlos a conectar de verdad.`
      : "Estas preguntas van a ayudarlos a conocerse de verdad, sin filtro.";
  } else if (STATE.relationshipType === "couple") {
    flavorText = "Después de un tiempo juntos, siempre hay cosas nuevas por descubrir del otro 💎";
  } else if (STATE.relationshipType === "friends") {
    flavorText = "Hasta los amigos de toda la vida guardan historias que nunca contaron 🍻";
  } else if (STATE.relationshipType === "family") {
    flavorText = "La familia guarda las mejores historias. Vamos a desbloquearlas 🏡";
  } else {
    flavorText = "Cada persona es un universo. Vamos a explorar un poco 🌍";
  }

  await addBotMessage(flavorText, 300);
  await addBotMessage("¡Turnos alternados, sin presión, y con mucha onda! Aquí vamos... 🚀", 400);

  // Build deck
  buildDeck();

  // Hide input
  document.getElementById("chatInputArea").classList.add("hidden");

  // Transition to game after pause
  setTimeout(() => {
    transitionToGame();
  }, 1500);
}

// ===== DECK BUILDER =====

function buildDeck() {
  const pool = BANK[STATE.contextKey] || BANK["desconocidos_mesa"] || [];

  // Sort by depth progression
  const suave = pool.filter(q => q[1] === "suave");
  const medio = pool.filter(q => q[1] === "medio");
  const profundo = pool.filter(q => q[1] === "profundo");

  // Shuffle within each depth
  shuffle(suave);
  shuffle(medio);
  shuffle(profundo);

  // Build progressive deck based on mood preference
  let deck;
  if (STATE.mood === "suave") {
    deck = [...suave, ...medio.slice(0, 15), ...profundo.slice(0, 5)];
  } else if (STATE.mood === "profunda") {
    deck = [...suave.slice(0, 5), ...medio, ...profundo];
  } else {
    // Mix: interleave depths progressively
    deck = [];
    const maxLen = Math.max(suave.length, medio.length, profundo.length);
    for (let i = 0; i < maxLen; i++) {
      if (i < suave.length) deck.push(suave[i]);
      if (i < medio.length) deck.push(medio[i]);
      if (i < profundo.length) deck.push(profundo[i]);
    }
  }

  // Personalize questions with names where possible
  STATE.deck = deck.map(q => {
    let text = q[0];
    let followUp = q[3] || "¿Por qué crees eso?";

    // Smart name injection — only where it fits naturally
    if (STATE.players.length >= 2) {
      text = text.replace(/\btu compañer[oa]\b/gi, STATE.players[STATE.currentTurn === 0 ? 1 : 0]);
      text = text.replace(/\bla otra persona\b/gi, STATE.players[STATE.currentTurn === 0 ? 1 : 0]);
    }

    return { text, depth: q[1], category: q[2], followUp };
  });

  STATE.cardIndex = 0;
}

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// ===== GAME ENGINE =====

function transitionToGame() {
  // Switch screens
  document.getElementById("screenOnboarding").classList.remove("active");
  document.getElementById("screenGame").classList.add("active");

  // Build progress dots
  buildProgressDots();

  // Draw first card
  STATE.currentTurn = 0;
  updateTurnIndicator();
  drawCard();
}

function buildProgressDots() {
  const container = document.getElementById("progressDots");
  container.innerHTML = "";
  const count = Math.min(STATE.deck.length, 20); // Show max 20 dots
  for (let i = 0; i < count; i++) {
    const dot = document.createElement("span");
    dot.className = "progress-dot" + (i === 0 ? " active" : "");
    container.appendChild(dot);
  }
}

function updateProgressDots() {
  const dots = document.querySelectorAll(".progress-dot");
  const idx = STATE.cardIndex;
  dots.forEach((dot, i) => {
    dot.className = "progress-dot";
    if (i === idx % dots.length) dot.classList.add("active");
    else if (i < idx % dots.length) dot.classList.add("done");
  });
}

function updateTurnIndicator() {
  const playerIdx = STATE.currentTurn % STATE.players.length;
  const name = STATE.players[playerIdx];
  document.getElementById("turnName").textContent = name;

  // Subtle animation
  const el = document.getElementById("turnIndicator");
  el.style.animation = "none";
  void el.offsetHeight;
  el.style.animation = "fadeSlideDown 0.4s ease";
}

function drawCard() {
  if (STATE.cardIndex >= STATE.deck.length) {
    showCelebration("end");
    return;
  }

  // Check for milestone celebrations
  if (STATE.cardIndex > 0 && STATE.cardIndex % 10 === 0 && !STATE.celebrationShown.has(STATE.cardIndex)) {
    STATE.celebrationShown.add(STATE.cardIndex);
    showCelebration("milestone");
    return;
  }

  const card = STATE.deck[STATE.cardIndex];

  // Depth colors & emoji
  const depthMap = {
    suave: { label: "SUAVE", emoji: "💬" },
    medio: { label: "MEDIO", emoji: "🔥" },
    profundo: { label: "PROFUNDO", emoji: "💎" }
  };
  const d = depthMap[card.depth] || depthMap.suave;

  // Update card content
  document.getElementById("cardCategory").textContent = d.emoji;
  document.getElementById("cardDepth").textContent = d.label;
  document.getElementById("cardQuestion").textContent = card.text;
  document.getElementById("cardFollowUp").textContent = `"${card.followUp}"`;
  document.getElementById("cardNumber").textContent = `#${String(STATE.cardIndex + 1).padStart(2, "0")}`;

  // Set depth data attribute for border color
  document.getElementById("cardFront").setAttribute("data-depth", card.depth);

  // Ensure card is front-facing
  const wrapper = document.getElementById("card3D");
  if (STATE.isFlipped) {
    wrapper.classList.remove("is-flipped");
    STATE.isFlipped = false;
  }
}

function toggleFlip() {
  haptic();
  const wrapper = document.getElementById("card3D");
  STATE.isFlipped = !STATE.isFlipped;
  wrapper.classList.toggle("is-flipped", STATE.isFlipped);
}

function nextCard() {
  haptic();

  const wrapper = document.getElementById("card3D");

  // Swipe out animation
  wrapper.classList.add("is-swiping-out");

  setTimeout(() => {
    wrapper.classList.remove("is-swiping-out");

    // Advance
    STATE.cardIndex++;
    STATE.currentTurn++;

    updateTurnIndicator();
    updateProgressDots();
    drawCard();

    // Swipe in animation
    wrapper.classList.add("is-swiping-in");
    setTimeout(() => wrapper.classList.remove("is-swiping-in"), 350);
  }, 300);
}

// ===== CELEBRATIONS =====

function showCelebration(type) {
  const overlay = document.createElement("div");
  overlay.className = "celebration-overlay";

  let emoji, title, sub, btnText;

  if (type === "end") {
    emoji = "🎊";
    title = "¡Increíble!";
    sub = `Terminaron todas las cartas. ${STATE.players.join(" y ")}, eso fue intenso. ¿Otra ronda?`;
    btnText = "Jugar de nuevo";
  } else {
    const milestoneEmojis = ["🔥", "✨", "💫", "🎯", "⚡", "🌟"];
    const milestoneTexts = [
      "¡Van con todo!",
      "La conversación fluye",
      "Se está poniendo bueno",
      "¡Qué nivel!",
      "No paran más"
    ];
    emoji = milestoneEmojis[Math.floor(Math.random() * milestoneEmojis.length)];
    title = milestoneTexts[Math.floor(Math.random() * milestoneTexts.length)];
    sub = `${STATE.cardIndex} preguntas y contando. Las cosas se ponen cada vez mejor.`;
    btnText = "¡Seguimos!";
  }

  overlay.innerHTML = `
    <div class="celebration-card">
      <div class="cele-emoji">${emoji}</div>
      <div class="cele-title">${title}</div>
      <div class="cele-sub">${sub}</div>
      <button onclick="dismissCelebration(this, '${type}')">${btnText}</button>
    </div>
  `;

  document.body.appendChild(overlay);
}

function dismissCelebration(btn, type) {
  const overlay = btn.closest(".celebration-overlay");
  overlay.remove();

  if (type === "end") {
    // Rebuild and restart deck
    shuffle(STATE.deck);
    STATE.cardIndex = 0;
    STATE.currentTurn = 0;
    STATE.celebrationShown.clear();
    buildProgressDots();
    updateTurnIndicator();
    drawCard();
  } else {
    drawCard();
  }
}

function restartGame() {
  haptic();

  // Go back to onboarding
  document.getElementById("screenGame").classList.remove("active");
  document.getElementById("screenOnboarding").classList.add("active");

  // Reset state
  STATE.phase = "welcome";
  STATE.step = 0;
  STATE.players = [];
  STATE.contextKey = null;
  STATE.relationshipType = null;
  STATE.howMet = null;
  STATE.mood = null;
  STATE.extraInfo = {};
  STATE.deck = [];
  STATE.cardIndex = 0;
  STATE.currentTurn = 0;
  STATE.isFlipped = false;
  STATE.celebrationShown.clear();

  // Reset UI
  document.getElementById("chatArea").innerHTML = "";
  document.getElementById("quickOptions").innerHTML = "";
  document.getElementById("chatInputArea").classList.remove("hidden");
  document.getElementById("brandHeader").classList.remove("compact");

  // Restart
  startOnboarding();
}

// ===== UTILS =====

function haptic() {
  if ("vibrate" in navigator) {
    try { navigator.vibrate(12); } catch (e) {}
  }
}

// ===== BOOT =====
window.addEventListener("DOMContentLoaded", init);
