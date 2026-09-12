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
  document.getElementById("v2RestartBtn").onclick = () => location.reload();
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

// CHAT EN CARD INTERACTIVA CON IA REAL (POLLINATIONS)
function startChatFlow() {
  addBotBubble("¡Hola! ✦ Soy tu anfitrión de Rompehielo. Cuéntame con quién estás y qué están haciendo o comiendo/tomando en este momento.");
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

async function handleV2InputSubmit() {
  const input = document.getElementById("v2ChatInput");
  const val = input.value.trim();
  if (!val) return;

  addUserBubble(val);
  analyzeUserMessage(val);

  // Mostrar indicador "Pensando respuesta..." en la card
  const box = document.getElementById("v2ChatMessages");
  const typingDiv = document.createElement("div");
  typingDiv.className = "v2-bubble bot";
  typingDiv.innerHTML = `<span class="bot-tag">HOST IA</span><div style="font-style:italic; opacity:0.8;">Calibrando vibra única... ✦</div>`;
  box.appendChild(typingDiv);
  box.scrollTop = box.scrollHeight;

  const players = V2_STATE.contextData.players;
  const pNames = players.length >= 2 ? players.map(p => p.name).join(" y ") : "ustedes";

  const promptHost = `Eres un anfitrión de juegos de mesa sofisticado y divertido. El usuario dijo: "${val}". Responde en máximo 2 frases cortas y amables en español chileno/latino natural, validando su contexto (ej. comida, bebida, nombres como ${pNames}).`;
  const fallback = `¡Entendido perfecto! 🍝 He calibrado el mazo especial para ${pNames}.`;
  
  const aiHostReply = await fetchPollinationsAI(promptHost, fallback);

  typingDiv.remove();
  addBotBubble(aiHostReply);

  setTimeout(() => {
    finishChatFlow();
  }, 1200);
}

function analyzeUserMessage(text) {
  const detectedNames = [];
  const nameMatches = text.match(/(?:con|soy|llamo|somos)\s+([A-ZÁÉÍÓÚa-záéíóú]+)/gi);
  
  if (nameMatches) {
    nameMatches.forEach(m => {
      const name = m.replace(/(?:con|soy|llamo|somos)\s+/i, "").trim();
      if (name.length > 2 && !["un", "una", "dos", "tres", "cuatro", "amigos", "pareja"].includes(name.toLowerCase())) {
        if (!detectedNames.includes(name)) detectedNames.push(name.charAt(0).toUpperCase() + name.slice(1).toLowerCase());
      }
    });
  }

  if (detectedNames.length < 2) {
    const cleanList = text.replace(/estoy con|yo soy|prepara|bebemos|almorzando|pasta|con|y/gi, ",");
    const parts = cleanList.split(",").map(s => s.trim()).filter(s => s.length > 2 && /^[A-ZÁÉÍÓÚa-záéíóú]+$/i.test(s));
    parts.forEach(p => {
      const formatted = p.charAt(0).toUpperCase() + p.slice(1).toLowerCase();
      if (!detectedNames.includes(formatted)) detectedNames.push(formatted);
    });
  }

  if (detectedNames.length >= 2) {
    V2_STATE.contextData.players = detectedNames.map(name => ({ name, age: "" }));
  } else {
    V2_STATE.contextData.players = [{ name: "Jacqueline", age: "" }, { name: "Daniel", age: "" }];
  }

  V2_STATE.contextData.locationAndVibe += " " + text;
}

function addBotBubble(text) {
  const box = document.getElementById("v2ChatMessages");
  const div = document.createElement("div");
  div.className = "v2-bubble bot";
  div.innerHTML = `<span class="bot-tag">HOST IA</span>${text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}`;
  box.appendChild(div);
  box.scrollTop = box.scrollHeight;
}

function addUserBubble(text) {
  const box = document.getElementById("v2ChatMessages");
  const div = document.createElement("div");
  div.className = "v2-bubble user";
  div.textContent = text;
  box.appendChild(div);
  box.scrollTop = box.scrollHeight;
}

function finishChatFlow() {
  addBotBubble("¡Mazo listo! Toca para empezar a jugar 🎴");
  setTimeout(() => {
    switchScreen("screenChat", "screenGameV2");
    launchGameV2();
  }, 1000);
}

// JUEGO DE CARTAS V2
function launchGameV2() {
  generateV2Deck();
  V2_STATE.currentCardIndex = 0;
  V2_STATE.currentTurnIndex = 0;
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
