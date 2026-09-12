/**
 * ROMPEHIELO VERSION 2 — 100% CARDS UX & INTELIGENCIA GENERATIVA REAL
 */

let BANK = {};
let V2_STATE = {
  introSlide: 1,
  contextData: {
    locationAndVibe: "",
    players: [],
    extraDetails: ""
  },
  deck: [],
  currentCardIndex: 0,
  currentTurnIndex: 0,
  isFlipped: false
};

// INITIALIZATION & SPLASH SCREEN
async function initV2() {
  // 1. Mostrar Splash Futurista 1.8 segundos
  const splash = document.getElementById("splashOverlay");
  setTimeout(() => {
    splash.classList.remove("active");
    switchScreen("", "screenWelcome");
  }, 1800);

  // 2. Cargar banco de preguntas
  try {
    const res = await fetch("data/questions.json");
    BANK = await res.json();
  } catch (e) {
    console.error("Error al cargar banco:", e);
  }

  setupV2Listeners();
}

function setupV2Listeners() {
  // Navegación en Cards de Intro (Tocar para rotar / avanzar slide)
  const introCard = document.getElementById("introCard");
  if (introCard) {
    introCard.onclick = advanceIntroSlide;
  }

  document.getElementById("btnStartV2").onclick = () => {
    switchScreen("screenWelcome", "screenChat");
    startChatFlow();
  };

  document.getElementById("v2SendBtn").onclick = handleV2InputSubmit;
  document.getElementById("v2ChatInput").onkeydown = (e) => {
    if (e.key === "Enter") handleV2InputSubmit();
  };

  // Controles de Juego 3D
  document.getElementById("v2Card3D").onclick = toggleV2Flip;
  document.getElementById("v2FlipBtn").onclick = toggleV2Flip;
  document.getElementById("v2NextBtn").onclick = nextV2Card;
  document.getElementById("v2RestartBtn").onclick = () => {
    localStorage.removeItem("rh_v2_session");
    location.reload();
  };
}

function switchScreen(fromId, toId) {
  if (fromId) document.getElementById(fromId).classList.remove("active");
  if (toId) document.getElementById(toId).classList.add("active");
}

// SLIDER DE CARDS DE BIENVENIDA
function advanceIntroSlide() {
  triggerHaptic();
  V2_STATE.introSlide++;

  const slide1 = document.getElementById("introSlide1");
  const slide2 = document.getElementById("introSlide2");
  const slide3 = document.getElementById("introSlide3");
  const introCard = document.getElementById("introCard");
  const dots = document.querySelectorAll("#introDots .dot");

  dots.forEach(d => d.className = "dot");

  if (V2_STATE.introSlide === 2) {
    slide1.style.display = "none";
    slide2.style.display = "flex";
    dots[1].classList.add("active");
  } else if (V2_STATE.introSlide === 3) {
    introCard.classList.add("is-flipped");
    setTimeout(() => {
      slide2.style.display = "none";
      slide3.style.display = "flex";
    }, 200);
    dots[2].classList.add("active");
  } else {
    // Reset back to slide 1
    introCard.classList.remove("is-flipped");
    V2_STATE.introSlide = 1;
    slide3.style.display = "none";
    slide1.style.display = "flex";
    dots[0].classList.add("active");
  }
}

function startChatFlow() {
  const box = document.getElementById("v2ChatMessages");
  if (box) box.innerHTML = ""; // Ensure clean state

  const saved = localStorage.getItem("rh_v2_session");
  if (saved) {
    try {
      const data = JSON.parse(saved);
      if (data.contextData && data.deck && data.deck.length > 0) {
        V2_STATE = data;
        switchScreen("screenWelcome", "screenGameV2");
        renderV2Card();
        return;
      }
    } catch (e) {}
  }

  V2_STATE.turnCount = 0;
  addBotBubble("¡Hola! ✦ Soy tu anfitrión de Rompehielo. Cuéntame: ¿con quién estás hoy y cuál es el ambiente del lugar?");
}

function saveSession() {
  try {
    localStorage.setItem("rh_v2_session", JSON.stringify(V2_STATE));
  } catch (e) {}
}

async function fetchPollinationsAI(prompt, fallbackText) {
  try {
    const encoded = encodeURIComponent(prompt);
    const res = await fetch(`https://text.pollinations.ai/${encoded}?model=openai`);
    if (!res.ok) return fallbackText;
    const text = await res.text();
    return text.trim() || fallbackText;
  } catch (e) {
    console.warn("Pollinations AI fetch error:", e);
    return fallbackText;
  }
}

// MODERACIÓN Y SEGURIDAD CONTRA PROMPTS MALICIOSOS O FUERA DE LUGAR
function checkModerationAndJailbreak(text) {
  const lower = text.toLowerCase();

  // Intentos de Jailbreak / pedir código / prompt maestro
  if (lower.includes("prompt maestro") || lower.includes("instrucciones de sistema") || lower.includes("código python") || lower.includes("script") || lower.includes("hack") || lower.includes("quién te programó") || lower.includes("cómo estás programado")) {
    return "Soy Rompehielo IA, programado exclusivamente para ser el anfitrión de tu juego y ayudarte a romper el hielo. ¡No realizo tareas de programación ni entrego prompts! 😉 Cuéntame: ¿con quién estás jugando hoy?";
  }

  // Comentarios ordinarios / fuera de lugar / explícitos
  if (lower.includes("masturba") || lower.includes("pene") || lower.includes("vagina") || lower.includes("sexo anal") || lower.includes("porno") || lower.includes("puta") || lower.includes("ctm")) {
    return "¡Epa! ✋ Mantengamos la conversación en un tono divertido y respetuoso. No hablo de esos temas. Dime: ¿con quién estás o en qué tipo de lugar te encuentras?";
  }

  return null;
}

async function handleV2InputSubmit() {
  const input = document.getElementById("v2ChatInput");
  const val = input.value.trim();
  if (!val) return;

  addUserBubble(val);
  input.value = "";

  // 1. Verificar Moderación / Off-topic
  const modReply = checkModerationAndJailbreak(val);
  if (modReply) {
    addBotBubble(modReply);
    return;
  }

  analyzeUserMessage(val);
  V2_STATE.turnCount = (V2_STATE.turnCount || 0) + 1;

  // Mostrar typing indicator
  const box = document.getElementById("v2ChatMessages");
  const typingDiv = document.createElement("div");
  typingDiv.className = "v2-bubble bot";
  typingDiv.innerHTML = `<span class="bot-tag">HOST IA</span><div style="font-style:italic; opacity:0.8;">Escuchando y analizando... ✦</div>`;
  box.appendChild(typingDiv);
  box.scrollTop = box.scrollHeight;

  const players = V2_STATE.contextData.players;
  const hasNames = players.length >= 2 || (players.length === 1 && players[0].name !== "Jugador 1");

  // Si aún falta información, la IA indaga e interactúa en lugar de saltar directo
  let promptHost;
  if (!hasNames && V2_STATE.turnCount < 2) {
    promptHost = `Eres el anfitrión inteligente del juego Rompehielo. El usuario dijo: "${val}". Responde de forma muy amigable (1-2 frases cortas) en español latino, validando su lugar/ambiente e indagando cortésmente cómo se llaman las personas que van a jugar.`;
  } else {
    promptHost = `Eres el anfitrión del juego Rompehielo. El usuario dijo: "${val}". Responde en 2 frases amables comentando su vibra/lugar y dándoles la bienvenida para empezar a jugar las cartas.`;
  }

  const fallback = `¡Entendido! Me encanta esa vibra. He calibrado tu mazo personalizado.`;
  const aiHostReply = await fetchPollinationsAI(promptHost, fallback);

  typingDiv.remove();
  addBotBubble(aiHostReply);

  // Si ya tenemos suficiente información o llevamos más de 2 turnos, ofrecemos avanzar o avanzamos
  if (hasNames || V2_STATE.turnCount >= 2) {
    setTimeout(() => {
      finishChatFlow();
    }, 1500);
  }
}

function finishChatFlow() {
  addBotBubble("¡Perfecto! Tu mazo está 100% calibrado y listo. ¡Empecemos a jugar! 🎴");
  setTimeout(() => {
    switchScreen("screenChat", "screenGameV2");
    launchGameV2();
  }, 1200);
}

// JUEGO DE CARTAS V2
function launchGameV2() {
  generateV2Deck();
  V2_STATE.currentCardIndex = 0;
  V2_STATE.currentTurnIndex = 0;
  saveSession();
  renderV2Card();
}

function generateV2Deck() {
  const vibe = V2_STATE.contextData.locationAndVibe.toLowerCase();
  const extra = V2_STATE.contextData.extraDetails.toLowerCase();

  let deckKey = "cita_ambigua";
  if (vibe.includes("tinder") || extra.includes("tinder") || extra.includes("1era cita") || extra.includes("primera cita")) {
    deckKey = "tinder_primera_cita";
  } else if (vibe.includes("bar") || vibe.includes("amigos") || extra.includes("amigos")) {
    deckKey = "amigos_antiguos";
  } else if (vibe.includes("pareja") || extra.includes("pareja")) {
    deckKey = "pareja_estable";
  }

  let rawList = BANK[deckKey] || BANK["cita_ambigua"] || [];
  let smoothQuestions = rawList.filter(q => q[1] === "suave" || q[1] === "medio");
  if (smoothQuestions.length < 15) smoothQuestions = rawList;

  V2_STATE.deck = smoothQuestions.map(q => {
    return {
      question: q[0],
      level: q[1] || "medio",
      category: q[2] || "CONEXIÓN",
      followUp: q[3] || "¿Por qué sientes que pensaste eso en ese momento?"
    };
  });

  V2_STATE.deck.sort(() => Math.random() - 0.5);
}

function renderV2Card() {
  if (!V2_STATE.deck.length) return;

  const players = V2_STATE.contextData.players;
  const currentPlayer = players[V2_STATE.currentTurnIndex % players.length].name;
  document.getElementById("v2PlayerTurn").textContent = currentPlayer;

  const card = V2_STATE.deck[V2_STATE.currentCardIndex % V2_STATE.deck.length];

  document.getElementById("v2CardMood").textContent = card.category.toUpperCase();
  document.getElementById("v2CardLevel").textContent = `NIVEL ${card.level.toUpperCase()}`;
  document.getElementById("v2QuestionText").textContent = card.question;
  document.getElementById("v2FollowUpText").textContent = `"${card.followUp}"`;
  document.getElementById("v2CardIndex").textContent = `${String(V2_STATE.currentCardIndex + 1).padStart(2, "0")}/${V2_STATE.deck.length}`;

  const card3D = document.getElementById("v2Card3D");
  card3D.classList.remove("is-flipped");
  V2_STATE.isFlipped = false;
  saveSession();
}

function toggleV2Flip() {
  triggerHaptic();
  const card3D = document.getElementById("v2Card3D");
  V2_STATE.isFlipped = !V2_STATE.isFlipped;
  card3D.classList.toggle("is-flipped", V2_STATE.isFlipped);
}

function nextV2Card() {
  triggerHaptic();
  const card3D = document.getElementById("v2Card3D");
  card3D.classList.add("is-swiping");

  setTimeout(() => {
    V2_STATE.currentCardIndex++;
    V2_STATE.currentTurnIndex++;
    renderV2Card();
    card3D.classList.remove("is-swiping");
  }, 220);
}

function triggerHaptic() {
  if ("vibrate" in navigator) {
    try { navigator.vibrate(10); } catch (e) {}
  }
}

window.addEventListener("DOMContentLoaded", initV2);
