/**
 * ROMPEHIELO VERSION 2 - MOTOR LÚDICO & CONVERSACIONAL
 * Recolección dinámica de datos (contexto, nombres, edades, extras) + Juego con turnos 3D
 */

let BANK = {};
let V2_STATE = {
  stepIndex: 0,
  contextData: {
    locationAndVibe: "",
    playerCount: 2,
    players: [], // [{ name: "", age: "" }]
    extraDetails: ""
  },
  deck: [],
  currentCardIndex: 0,
  currentTurnIndex: 0,
  isFlipped: false
};

// Pasos de recolección conversacional
const CHAT_STEPS = [
  {
    progress: "PASO 1 DE 4",
    botMessage: "¡Hola! 👋 Soy tu anfitrión de Rompehielo. Cuéntame en detalle: **¿dónde están y qué situación o vibra hay en el lugar?** (Ej: en mi depto con vino y tensión, o en un parque tomando café)",
    pills: ["🍷 En mi depto con vino", "☕ En un café tranquilos", "🍻 En un bar con amigos", "🌙 Caminando de noche"],
    placeholder: "Ej: En el sillón escuchando música...",
    key: "locationAndVibe"
  },
  {
    progress: "PASO 2 DE 4",
    botMessage: "¡Excelente lugar! 🎯 Ahora cuéntame: **¿Cuántas personas van a jugar y cómo se llaman?** (Ej: Somos 2: Camila y Matías)",
    pills: ["Somos 2: ", "Somos 3: ", "Somos 4: ", "Grupo de 5: "],
    placeholder: "Ej: Camila y Matías",
    key: "playerNames"
  },
  {
    progress: "PASO 3 DE 4",
    botMessage: "¡Buenísimo! ¿Qué **edades** tienen aproximadamente o en qué etapa de la vida están? (Ej: 25 y 28 años, o todos universitarios)",
    pills: ["20 a 25 años", "25 a 30 años", "30 a 40 años", "Edades variadas"],
    placeholder: "Ej: 26 y 29 años",
    key: "playerAges"
  },
  {
    progress: "PASO 4 DE 4",
    botMessage: "¡Última pregunta! 🔥 ¿Hay algún **dato extra o historia especial** entre ustedes que deba considerar? (Ej: nos conocemos hace 5 años, o es nuestra 1era cita de Tinder)",
    pills: ["Es nuestra 1era cita", "Nos conocemos hace años", "Somos parejas de amigos", "Sin datos extra"],
    placeholder: "Ej: Es primera cita...",
    key: "extraDetails"
  }
];

// Inicialización
async function initV2() {
  try {
    const res = await fetch("data/questions.json");
    BANK = await res.json();
  } catch (e) {
    console.error("Error al cargar banco:", e);
  }

  setupV2Listeners();
}

function setupV2Listeners() {
  // Navegación de pantallas
  document.getElementById("btnStartV2").onclick = () => {
    switchScreen("screenWelcome", "screenChat");
    startChatFlow();
  };

  document.getElementById("v2SendBtn").onclick = handleV2InputSubmit;
  document.getElementById("v2ChatInput").onkeydown = (e) => {
    if (e.key === "Enter") handleV2InputSubmit();
  };

  document.getElementById("btnStartGameV2").onclick = () => {
    switchScreen("screenTutorial", "screenGameV2");
    launchGameV2();
  };

  // Flip de demostración en tutorial
  const demoCard = document.getElementById("demoCard");
  if (demoCard) {
    demoCard.onclick = () => demoCard.classList.toggle("is-flipped");
  }

  // Controles de juego V2
  document.getElementById("v2Card3D").onclick = toggleV2Flip;
  document.getElementById("v2FlipBtn").onclick = toggleV2Flip;
  document.getElementById("v2NextBtn").onclick = nextV2Card;
  document.getElementById("v2RestartBtn").onclick = () => location.reload();
}

function switchScreen(fromId, toId) {
  document.getElementById(fromId).classList.remove("active");
  document.getElementById(toId).classList.add("active");
}

// --- FLOW DEL CHAT ---
function startChatFlow() {
  V2_STATE.stepIndex = 0;
  renderCurrentChatStep();
}

function renderCurrentChatStep() {
  const step = CHAT_STEPS[V2_STATE.stepIndex];
  if (!step) {
    finishChatFlow();
    return;
  }

  document.getElementById("chatStepProgress").textContent = step.progress;
  addBotBubble(step.botMessage);

  // Pills
  const pillsBox = document.getElementById("v2QuickPills");
  pillsBox.innerHTML = "";
  step.pills.forEach(text => {
    const btn = document.createElement("button");
    btn.className = "v2-pill-btn";
    btn.textContent = text;
    btn.onclick = () => {
      document.getElementById("v2ChatInput").value = text;
      handleV2InputSubmit();
    };
    pillsBox.appendChild(btn);
  });

  const input = document.getElementById("v2ChatInput");
  input.placeholder = step.placeholder;
  input.value = "";
  input.focus();
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

function handleV2InputSubmit() {
  const input = document.getElementById("v2ChatInput");
  const val = input.value.trim();
  if (!val) return;

  addUserBubble(val);
  const step = CHAT_STEPS[V2_STATE.stepIndex];

  // Guardar datos
  if (step.key === "locationAndVibe") V2_STATE.contextData.locationAndVibe = val;
  else if (step.key === "playerNames") parsePlayerNames(val);
  else if (step.key === "playerAges") parsePlayerAges(val);
  else if (step.key === "extraDetails") V2_STATE.contextData.extraDetails = val;

  V2_STATE.stepIndex++;
  setTimeout(() => {
    renderCurrentChatStep();
  }, 400);
}

function parsePlayerNames(text) {
  // Remove prefixes like "Somos 2:", "Somos 2", "Somos 3 personas:" etc.
  let clean = text.replace(/^somos\s*\d+[:\s]*/i, "")
                  .replace(/^somos\s+/i, "")
                  .replace(/\by\b/gi, ",")
                  .replace(/\bcon\b/gi, ",");
  
  let parts = clean.split(/[,\n]+/)
                   .map(s => s.trim().replace(/^\d+[\s\.\)]*/, "").trim()) // Remove any leading digit like "1." or "2"
                   .filter(s => s.length > 0 && !/^\d+$/.test(s)); // Filter out purely numeric strings
  
  if (parts.length > 0) {
    V2_STATE.contextData.players = parts.map(name => ({ 
      name: name.charAt(0).toUpperCase() + name.slice(1), 
      age: "" 
    }));
  } else {
    V2_STATE.contextData.players = [{ name: "Jugador 1", age: "" }, { name: "Jugador 2", age: "" }];
  }
}

function parsePlayerAges(text) {
  const players = V2_STATE.contextData.players;
  players.forEach(p => p.age = text);
}

function finishChatFlow() {
  addBotBubble("¡Perfecto! He calibrado tu mazo personalizado con tus nombres y el contexto. Te mostraré cómo funcionan las cartas 🎴");
  setTimeout(() => {
    switchScreen("screenChat", "screenTutorial");
  }, 1200);
}

// --- JUEGO DE CARTAS V2 ---
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
  
  // Prioritize "suave" and "medio" to ensure questions generate connection and fun without being abrasive
  let smoothQuestions = rawList.filter(q => q[1] === "suave" || q[1] === "medio");
  if (smoothQuestions.length < 15) smoothQuestions = rawList;

  // Personalización con nombres
  V2_STATE.deck = smoothQuestions.map(q => {
    let text = q[0];
    let followUp = q[3] || "¿Por qué sientes que pensaste eso en ese momento?";

    return {
      question: text,
      level: q[1] || "medio",
      category: q[2] || "CONEXIÓN",
      followUp: followUp
    };
  });

  // Mezclar mazo
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

  // Reset flip
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
