/**
 * ROMPEHIELO - GAMEPLAY ORACULAR INTELIGENTE
 * Flip 3D Real, Tipografía Editorial Bold, Cero Encuestas, Motor de Inferencia Contextual.
 */

// 1. DICCIONARIO SEMÁNTICO DE INFERENCIA DE SITUACIÓN
const AI_CONTEXT_RULES = [
  {
    keywords: ["casa", "depto", "sillón", "cama", "living", "vino", "pieza", "cocina"],
    mood: "INTIMIDAD EN CASA",
    deckKey: "cita_ambigua",
    specialCards: [
      ["Si pudieras quedarte con un solo objeto de esta habitación para siempre, ¿cuál te llevas?", "¿Por qué precisamente ese?"],
      ["¿Qué canción pondrías tú en este living ahora mismo si tuvieras el control total?", "¿Qué vibra buscas provocar?"],
      ["¿Qué manía tuya cuando estás solo en casa te daría pudor si alguien la viera?", "¿Desde cuándo la tienes?"],
      ["Si esta conversación se quedara en silencio total 30 segundos ahora, ¿te incomoda o te gusta?", "¿Hacemos la prueba mirándonos?"],
      ["¿Eres de los que se queda en el sillón toda la noche o necesitas cambiar de ambiente?", "¿Y qué prefieres hacer ahora?"]
    ]
  },
  {
    keywords: ["noche", "caminar", "parque", "calle", "paseo", "plaza", "auto", "viaje"],
    mood: "EN RUTA / NOCHE",
    deckKey: "tinder_primera_cita",
    specialCards: [
      ["De toda la gente que se cruzó con nosotros recién, ¿cuál crees que tiene la vida más secreta?", "¿Qué historia le inventamos?"],
      ["¿Qué canción suena en tu cabeza cuando caminas de noche sintiéndote en una película?", "¿La ponemos ahora con un audífono cada uno?"],
      ["¿Cuál ha sido la caminata más larga o surrealista de tu vida y cómo terminó?", "¿Con quién ibas esa noche?"],
      ["¿Prefieres perderte sin rumbo o necesitas saber exactamente hacia dónde vamos?", "¿Y hacia dónde sientes que vamos nosotros?"]
    ]
  },
  {
    keywords: ["silencio", "aburrido", "murió", "nada de que hablar", "incomodo", "bloqueo", "lata"],
    mood: "ROMPER EL SILENCIO",
    deckKey: "desconocidos_mesa",
    specialCards: [
      ["¿Cuál es una opinión completamente estúpida que defenderías a muerte contra cualquiera?", "¿Quién te metió esa idea en la cabeza?"],
      ["Dime la primera palabra que se te venga a la cabeza en 3, 2, 1... ¡ya!", "¿Por qué pensaste en eso?"],
      ["¿Qué es lo peor que te ha pasado en una salida donde la conversación murió?", "¿Cómo zafaste de esa?"],
      ["Si pudieras hacerme cualquier pregunta sin filtro sabiendo que no te puedo juzgar, ¿cuál me haces?", "¿Te atreves a soltarla ya?"]
    ]
  },
  {
    keywords: ["tensión", "química", "sex", "ganas", "onda", "beso", "atracción", "caliente", "picante"],
    mood: "TENSIÓN Y QUÍMICA",
    deckKey: "cita_ambigua",
    specialCards: [
      ["¿Qué detalle sutil mío te ha llamado más la atención desde que nos vimos hoy?", "¿Te diste cuenta de inmediato?"],
      ["¿Prefieres que las cosas pasen de forma espontánea o que la tensión se cocine a fuego lento?", "¿En qué etapa sientes que estamos?"],
      ["Si pudieras leer mi mente exactamente en este segundo, ¿te atreverías a mirar?", "¿Qué crees que encontrarías?"],
      ["¿Qué harías si me acerco un poco más a ti en este momento?", "¿Te alejas o te dejas llevar?"]
    ]
  },
  {
    keywords: ["amigo", "amigos", "cerveza", "bar", "carrete", "mesa", "junta", "grupo"],
    mood: "AMIGOS DE SIEMPRE",
    deckKey: "amigos_antiguos",
    specialCards: [
      ["¿Cuál ha sido nuestro peor cagazo colectivo que hoy recordamos con lágrimas de risa?", "¿Cómo no terminamos castigados?"],
      ["¿Quién de esta mesa sobreviviría menos tiempo en un apocalipsis zombi?", "¿Quién sería el primero en traicionar al grupo?"],
      ["¿Qué anécdota nuestra no podemos contar jamás delante de nuestras familias?", "¿Queda bajo juramento en esta mesa?"]
    ]
  }
];

// ESTADO GLOBAL
let BANK = {};
let STATE = {
  currentMood: "QUÍMICA & ONDA",
  currentDeck: "cita_ambigua",
  customList: [],
  round: 0,
  currentCard: null,
  isFlipped: false,
  history: [],
  favorites: JSON.parse(localStorage.getItem("rh_favs") || "[]")
};

// 2. INICIALIZACIÓN
async function init() {
  try {
    const res = await fetch("data/questions.json");
    BANK = await res.json();
  } catch (e) {
    console.error("Error loading questions bank:", e);
  }

  setupEventListeners();
  drawNextCard();

  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("sw.js").catch(() => {});
  }
}

// 3. OBTENER PREGUNTA CONTEXTUAL
function pickNextCard() {
  // 1. Si hay preguntas contextuales activas por la IA
  if (STATE.customList.length > 0) {
    const custom = STATE.customList.shift();
    return [custom[0], "profundo", STATE.currentMood, custom[1]];
  }

  // 2. Banco general adaptado
  const pool = BANK[STATE.currentDeck] || BANK["cita_ambigua"] || [];
  if (!pool.length) {
    return ["¿Qué es lo más auténtico que has visto hoy?", "medio", "CONEXIÓN", "¿Por qué?"];
  }

  // Progresión por rondas:
  let depth = "suave";
  if (STATE.round > 6) depth = "profundo";
  else if (STATE.round > 3) depth = "medio";

  const unused = pool.filter(q => !STATE.history.includes(q[0]));
  const candidates = unused.length ? unused : pool;

  let filtered = candidates.filter(q => q[1] === depth);
  if (!filtered.length) filtered = candidates;

  return filtered[Math.floor(Math.random() * filtered.length)];
}

function drawNextCard() {
  triggerHaptic();
  STATE.round++;

  // Si estaba volteada, regresar al frente antes del swipe
  const card3D = document.getElementById("card3D");
  if (STATE.isFlipped) {
    card3D.classList.remove("is-flipped");
    STATE.isFlipped = false;
  }

  // Efecto de deslizamiento
  card3D.classList.add("is-swiping");

  const card = pickNextCard();
  STATE.currentCard = card;
  STATE.history.push(card[0]);

  setTimeout(() => {
    // Actualizar frente
    document.getElementById("cardMood").textContent = STATE.currentMood;
    document.getElementById("cardQuestion").textContent = card[0];
    document.getElementById("cardLevel").textContent = `NIVEL ${card[1] === "suave" ? "1" : card[1] === "medio" ? "2" : "3"}`;
    document.getElementById("cardIndex").textContent = `#${String(STATE.round).padStart(2, "0")}`;

    // Actualizar reverso (Tira del hilo)
    const followUpText = card[3] || "¿Por qué crees que pensaste eso exactamente?";
    document.getElementById("cardFollowUp").textContent = `"${followUpText}"`;

    // Actualizar estado del corazón
    updateFavHeartUI();

    card3D.classList.remove("is-swiping");
  }, 180);
}

function toggleFlipCard() {
  triggerHaptic();
  const card3D = document.getElementById("card3D");
  STATE.isFlipped = !STATE.isFlipped;
  if (STATE.isFlipped) {
    card3D.classList.add("is-flipped");
  } else {
    card3D.classList.remove("is-flipped");
  }
}

// 4. MOTOR DE IA PARA EL PROMPT LIBRE
function applyAIInference(userText) {
  const query = (userText || "").toLowerCase().trim();
  if (!query) return;

  triggerHaptic();
  let matched = false;

  for (const rule of AI_CONTEXT_RULES) {
    if (rule.keywords.some(k => query.includes(k))) {
      STATE.currentMood = rule.mood;
      STATE.currentDeck = rule.deckKey;
      STATE.customList = [...rule.specialCards];
      matched = true;
      break;
    }
  }

  if (!matched) {
    // Inferencia por defecto para situaciones humanas abiertas
    STATE.currentMood = "ORÁCULO ADAPTADO";
    STATE.customList = [
      [`Dices que estás "${userText}": ¿qué es lo primero que harías si nadie pudiera juzgarte ahora?`, "¿Por qué te frenas?"],
      [`En este preciso momento: ¿qué es lo que más te cuesta admitir de lo que sientes?`, "¿Te animas a decirlo en voz alta?"]
    ];
  }

  // Actualizar UI
  document.getElementById("vibeName").textContent = STATE.currentMood;
  document.getElementById("oracleBtnText").textContent = userText.slice(0, 18) + (userText.length > 18 ? "..." : "");
  document.getElementById("aiInlineBox").style.display = "none";

  // Sacar inmediatamente carta calibrada
  drawNextCard();
}

// 5. FAVORITAS
function toggleFav() {
  if (!STATE.currentCard) return;
  triggerHaptic();
  const q = STATE.currentCard[0];
  const idx = STATE.favorites.indexOf(q);
  if (idx > -1) {
    STATE.favorites.splice(idx, 1);
  } else {
    STATE.favorites.push(q);
  }
  localStorage.setItem("rh_favs", JSON.stringify(STATE.favorites));
  updateFavHeartUI();
}

function updateFavHeartUI() {
  const svg = document.getElementById("favSvg");
  if (!svg || !STATE.currentCard) return;
  const isFav = STATE.favorites.includes(STATE.currentCard[0]);
  if (isFav) {
    svg.setAttribute("fill", "#ff334b");
    svg.setAttribute("stroke", "#ff334b");
  } else {
    svg.setAttribute("fill", "none");
    svg.setAttribute("stroke", "currentColor");
  }
}

// 6. EVENTOS
function setupEventListeners() {
  // Tocar la carta: si tocas, hace FLIP 3D para ver el reverso; el botón siguiente pasa de carta
  document.getElementById("card3D").onclick = toggleFlipCard;
  document.getElementById("btnFlipCard").onclick = toggleFlipCard;
  document.getElementById("btnNextCard").onclick = drawNextCard;
  document.getElementById("btnFav").onclick = toggleFav;

  // Toggle del oráculo IA
  const aiBox = document.getElementById("aiInlineBox");
  document.getElementById("btnOpenAI").onclick = () => {
    aiBox.style.display = aiBox.style.display === "none" ? "block" : "none";
    if (aiBox.style.display === "block") {
      document.getElementById("aiInput").focus();
    }
  };

  document.getElementById("aiSubmitBtn").onclick = () => {
    const val = document.getElementById("aiInput").value;
    applyAIInference(val);
  };

  document.getElementById("aiInput").onkeydown = (e) => {
    if (e.key === "Enter") {
      applyAIInference(e.target.value);
    }
  };

  // Chips rápidos de situaciones
  document.querySelectorAll(".a-chip").forEach(chip => {
    chip.onclick = () => {
      document.getElementById("aiInput").value = chip.dataset.txt;
      applyAIInference(chip.dataset.txt);
    };
  });
}

function triggerHaptic() {
  if ("vibrate" in navigator) {
    try { navigator.vibrate(12); } catch (e) {}
  }
}

window.addEventListener("DOMContentLoaded", init);
