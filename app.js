/**
 * ROMPEHIELO - ENGINE DE CONVERSACIÓN ORACULAR & LÚDICO
 * Inteligencia contextual libre: lugar, vibra, dinámica real.
 * Zero encuestas, zero preguntas técnicas.
 */

// 1. CHIPS DE VIBE INMEDIATA PARA EL HEADER
const VIBE_CHIPS = [
  { id: "quimica", label: "👀 ¿Hay onda o no?", icon: "✨" },
  { id: "casa_depto", label: "🏠 En casa / depto", icon: "🍷" },
  { id: "cita_tinder", label: "🔥 Primera cita", icon: "🍸" },
  { id: "parque_paseo", label: "🌳 Caminando / Parque", icon: "☕" },
  { id: "pareja_anos", label: "💑 Pareja de años", icon: "🛋️" },
  { id: "amigos_locos", label: "🍻 Amigos de siempre", icon: "🍕" },
  { id: "gente_nueva", label: "🧊 Gente desconocida", icon: "👥" },
  { id: "silencio_incomodo", label: "😶 Matar el silencio", icon: "⚡" },
  { id: "carrete_copas", label: "🎉 Fiesta / Carrete", icon: "🥃" },
  { id: "primos_reunion", label: "⚡ Mesa de primos", icon: "🍔" }
];

// 2. MATRIZ DE COMPAÑÍA LÚDICA EN EL MODAL
const SITUATIONS = [
  { key: "tinder_primera_cita", title: "Primera Cita", icon: "🔥", desc: "Química, miradas y cero entrevista de trabajo" },
  { key: "cita_ambigua", title: "¿Cita o solo amigos?", icon: "👀", desc: "¿Hay onda o somos amigos? Para descifrar intenciones con picardía" },
  { key: "cita_no_romantica", title: "Salida de 2 compas", icon: "☕", desc: "Proyectos, anécdotas de vida y curiosidad genuina" },
  { key: "pareja_reciente", title: "Pareja nueva (< 1 año)", icon: "❤️", desc: "Primeras manías, secretos tiernos y planes a futuro" },
  { key: "pareja_estable", title: "Pareja de años / convivencia", icon: "💑", desc: "Salir del piloto automático, recuerdos y humor de convivencia" },
  { key: "desconocidos_mesa", title: "Gente que recién se ve", icon: "🧊", desc: "Opiniones inútiles universales y anécdotas para reír" },
  { key: "amigos_antiguos", title: "Amigos de toda la vida", icon: "🍻", desc: "Nostalgia, peores anécdotas y debates acalorados" },
  { key: "amigos_recientes", title: "Nuevos amigos", icon: "🤝", desc: "Pasar de la charla superficial a confianza real" },
  { key: "parejas_amigos", title: "Parejas + Amigos solteros", icon: "👥", desc: "Balance perfecto: anécdotas de citas vs convivencia" },
  { key: "doble_cita", title: "Doble Cita (Parejas x 2)", icon: "🍷", desc: "Complicidad de a cuatro, viajes y mañas domésticas" },
  { key: "familia_reunion", title: "Familia general", icon: "🏠", desc: "Padres, tíos, abuelos, tradiciones y recuerdos de infancia" },
  { key: "familia_hermanos", title: "Juntada de hermanos", icon: "🍕", desc: "Secretos no contados a los viejos y lealtades" },
  { key: "familia_primos", title: "La mesa de los primos", icon: "⚡", desc: "La mejor mesa de la fiesta: historias prohibidas" },
  { key: "carrete_fiesta", title: "Fiesta / Previa con copas", icon: "🎉", desc: "Alta energía, confesiones y bajones épicos" }
];

// 3. GENERADOR LOCAL DE PREGUNTAS HIPER-ADAPTADAS (ORÁCULO IA LUDICO)
// Si el usuario escribe una situación libre (ej: "en el sillón de su casa con vino"),
// este motor genera dinámicamente preguntas que encajan exactamente en ese momento.
const AI_ORACLE_TEMPLATES = {
  casa_depto: [
    "Si pudieras robarte un solo objeto de este espacio para llevártelo a tu casa sin consecuencias, ¿cuál te llevas?",
    "¿Qué es lo primero en lo que te fijas discretamente cuando entras por primera vez a la casa de alguien?",
    "¿Qué música pondrías tú en este living ahora mismo si tuvieras el control total de los parlantes?",
    "¿Qué hábito tuyo estando solo en tu casa te daría vergüenza si alguien te viera por una ventana?",
    "Si tuviéramos que cocinar algo improvisado con lo que hay ahora en la cocina, ¿qué inventaríamos?",
    "¿Eres más de quedarte en el sillón regaloneando o te da inquietud no salir a la calle?",
    "¿Cuál es el mejor secreto o rincón escondido que tiene tu propia casa?",
    "Si esta conversación se quedara en silencio total durante 1 minuto ahora mismo, ¿qué harías?"
  ],
  parque_paseo: [
    "De toda la gente que ha pasado cerca de nosotros en los últimos 5 minutos, ¿cuál tiene la vida más misteriosa?",
    "¿Prefieres perderte caminando sin rumbo o eres de los que necesita saber exactamente hacia dónde va?",
    "¿Cuál es el mejor recuerdo que tienes de una caminata donde no tenías que volver a ninguna hora?",
    "Si pudieras comprar cualquier casa de las que vemos alrededor, ¿cuál elegirías y por qué?",
    "¿Qué canción escuchas cuando caminas solo/a por la calle sintiéndote el protagonista de tu película?",
    "¿Cuál ha sido la conversación más importante que has tenido caminando con alguien?"
  ],
  silencio_incomodo: [
    "¿Qué es lo más ridículo que pasó por tu cabeza en los últimos 30 segundos mientras había silencio?",
    "Dime la primera palabra que se te venga a la mente en 3, 2, 1... ¡ya!",
    "¿El silencio entre nosotros te pone nervioso/a o te da tranquilidad?",
    "¿Qué pregunta te gustaría hacerme ahora mismo pero te estás frenando por pudor?",
    "Si tuviéramos que romper el hielo haciendo algo absurdo juntos en este segundo, ¿qué haríamos?"
  ],
  tension_sexual: [
    "¿Qué detalle sutil mío te ha puesto más nervioso/a desde que nos vimos hoy?",
    "¿Prefieres que las cosas pasen de forma inesperada o que la tensión se cocine a fuego lento?",
    "Si pudieras leer mi mente exactamente en este segundo, ¿te atreverías a mirar?",
    "¿Cuál es tu debilidad absoluta cuando alguien te atrae mucho físicamente?",
    "¿Qué harías si me acerco un poco más a ti en este momento?"
  ]
};

// ESTADO GLOBAL
let BANK = {};
let STATE = {
  currentVibeId: "quimica",
  customSituation: "",
  activeLocationLabel: "📍 Situación libre",
  round: 0,
  currentCard: null,
  history: [],
  favorites: JSON.parse(localStorage.getItem("rh_favs") || "[]")
};

// INICIALIZACIÓN
async function init() {
  try {
    const res = await fetch("data/questions.json");
    BANK = await res.json();
  } catch (e) {
    console.error("Error al cargar questions.json:", e);
  }

  renderVibeChips();
  renderSituationsGrid();
  setupEventListeners();
  updateFavBadgeCount();

  // Empezar de inmediato con una carta entretenida
  drawNextCard();

  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("sw.js").catch(() => {});
  }
}

// 4. RENDER DE CHIPS EN EL HEADER
function renderVibeChips() {
  const container = document.getElementById("vibeChipsContainer");
  container.innerHTML = VIBE_CHIPS.map(chip => `
    <button class="vibe-chip ${chip.id === STATE.currentVibeId ? "active" : ""}" data-vibe="${chip.id}">
      ${chip.icon} ${chip.label}
    </button>
  `).join("");

  container.querySelectorAll("[data-vibe]").forEach(btn => {
    btn.onclick = () => {
      container.querySelectorAll(".vibe-chip").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      applyVibe(btn.dataset.vibe);
    };
  });
}

function applyVibe(vibeId) {
  STATE.currentVibeId = vibeId;
  STATE.customSituation = "";
  STATE.round = 0;
  STATE.history = [];

  // Mapear vibe a contexto base o modo libre
  const chip = VIBE_CHIPS.find(c => c.id === vibeId);
  if (chip) {
    document.getElementById("statusLocationBadge").textContent = `${chip.icon} ${chip.label}`;
  }

  triggerHaptic();
  drawNextCard();
}

// 5. MOTOR DE SELECCIÓN DE PREGUNTAS (ORÁCULO ADAPTATIVO)
function getQuestionPool() {
  // 1. Si hay una situación personalizada por el usuario o vibe específica de lugar
  if (STATE.customSituation) {
    const text = STATE.customSituation.toLowerCase();
    if (text.includes("casa") || text.includes("depto") || text.includes("sillón") || text.includes("living") || text.includes("vino")) {
      return AI_ORACLE_TEMPLATES.casa_depto.map(q => [q, "medio", "LUGAR & INTIMIDAD", "¿Qué harías después?"]);
    }
    if (text.includes("parque") || text.includes("camin") || text.includes("plaza") || text.includes("calle")) {
      return AI_ORACLE_TEMPLATES.parque_paseo.map(q => [q, "suave", "EN CAMINO", "¿Por qué ese lugar?"]);
    }
    if (text.includes("silencio") || text.includes("nervios") || text.includes("murió")) {
      return AI_ORACLE_TEMPLATES.silencio_incomodo.map(q => [q, "suave", "ROMPER SILENCIO", "Dilo sin filtro"]);
    }
    if (text.includes("tensión") || text.includes("onda") || text.includes("gusto") || text.includes("sex")) {
      return AI_ORACLE_TEMPLATES.tension_sexual.map(q => [q, "profundo", "TENSIÓN Y QUÍMICA", "¿Te atreves?"]);
    }
  }

  // 2. Mapeo inteligente según el vibe seleccionado
  let dbKey = "cita_ambigua";
  if (STATE.currentVibeId === "cita_tinder") dbKey = "tinder_primera_cita";
  else if (STATE.currentVibeId === "casa_depto") {
    return AI_ORACLE_TEMPLATES.casa_depto.map(q => [q, "medio", "EN CASA", "¿Por qué?"]);
  }
  else if (STATE.currentVibeId === "parque_paseo") {
    return AI_ORACLE_TEMPLATES.parque_paseo.map(q => [q, "suave", "PASEO", "¿Qué sientes?"]);
  }
  else if (STATE.currentVibeId === "silencio_incomodo") {
    return AI_ORACLE_TEMPLATES.silencio_incomodo.map(q => [q, "suave", "CERO FILTRO", "Respóndeme ya"]);
  }
  else if (STATE.currentVibeId === "pareja_anos") dbKey = "pareja_estable";
  else if (STATE.currentVibeId === "amigos_locos") dbKey = "amigos_antiguos";
  else if (STATE.currentVibeId === "gente_nueva") dbKey = "desconocidos_mesa";
  else if (STATE.currentVibeId === "carrete_copas") dbKey = "carrete_fiesta";
  else if (STATE.currentVibeId === "primos_reunion") dbKey = "familia_primos";

  return BANK[dbKey] || BANK["cita_ambigua"] || [];
}

function drawNextCard() {
  triggerHaptic();
  STATE.round++;

  const pool = getQuestionPool();
  if (!pool || !pool.length) return;

  // Progresión de nivel limpia
  let targetDepth = "suave";
  if (STATE.round > 8) targetDepth = "profundo";
  else if (STATE.round > 4) targetDepth = "medio";

  const unused = pool.filter(q => !STATE.history.includes(q[0]));
  const candidates = unused.length ? unused : pool;

  let chosen = candidates.filter(q => q[1] === targetDepth);
  if (!chosen.length) chosen = candidates;

  const card = chosen[Math.floor(Math.random() * chosen.length)];
  STATE.currentCard = card;
  STATE.history.push(card[0]);

  // Animación háptica y visual de la carta
  const cardEl = document.getElementById("playingCard");
  cardEl.classList.add("card-flip-anim");

  setTimeout(() => {
    document.getElementById("threadBox").style.display = "none";
    document.getElementById("cardBadge").textContent = (card[2] || "ROMPEHIELO").toUpperCase();
    document.getElementById("questionText").textContent = card[0];
    document.getElementById("cardTag").textContent = (card[1] || "SUAVE").toUpperCase();

    // Actualizar badge de profundidad
    const depthBadge = document.getElementById("statusDepthBadge");
    if (card[1] === "suave") depthBadge.textContent = "🧊 Nivel 1: Rompehielo";
    else if (card[1] === "medio") depthBadge.textContent = "💬 Nivel 2: Conexión";
    else depthBadge.textContent = "🔥 Nivel 3: Profundo";

    updateFavHeartIcon();
    cardEl.classList.remove("card-flip-anim");
  }, 160);
}

// 6. TIRA DEL HILO (REPUNTA ADAPTATIVA)
function toggleThread() {
  triggerHaptic();
  const box = document.getElementById("threadBox");
  if (box.style.display === "none") {
    const custom = STATE.currentCard ? STATE.currentCard[3] : null;
    const generic = [
      "¿Por qué pensaste exactamente eso?",
      "¿Qué pasó después de eso?",
      "¿Tienes una anécdota que lo demuestre?",
      "¿Cómo ha cambiado esa opinión con los años?",
      "¿Quién más estuvo ahí cuando ocurrió?"
    ];
    document.getElementById("threadQuestionText").textContent = custom || generic[Math.floor(Math.random() * generic.length)];
    box.style.display = "block";
  } else {
    box.style.display = "none";
  }
}

// 7. FAVORITAS
function toggleFavorite() {
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
  updateFavHeartIcon();
  updateFavBadgeCount();
}

function updateFavHeartIcon() {
  const svg = document.getElementById("favSvg");
  if (!svg || !STATE.currentCard) return;
  const isFav = STATE.favorites.includes(STATE.currentCard[0]);
  if (isFav) {
    svg.setAttribute("fill", "#ff3b30");
    svg.setAttribute("stroke", "#ff3b30");
  } else {
    svg.setAttribute("fill", "none");
    svg.setAttribute("stroke", "currentColor");
  }
}

function updateFavBadgeCount() {
  const badge = document.getElementById("favsBadgeCount");
  if (badge) badge.textContent = STATE.favorites.length;
}

// 8. RENDER DE SITUACIONES HUMANAS EN EL MODAL
function renderSituationsGrid() {
  const grid = document.getElementById("vibeGrid");
  grid.innerHTML = SITUATIONS.map(s => `
    <button class="vibe-row-card" data-situation="${s.key}">
      <span class="vibe-icon">${s.icon}</span>
      <div>
        <div class="vibe-title">${s.title}</div>
        <div class="vibe-desc">${s.desc}</div>
      </div>
    </button>
  `).join("");

  grid.querySelectorAll("[data-situation]").forEach(btn => {
    btn.onclick = () => {
      const key = btn.dataset.situation;
      const sit = SITUATIONS.find(s => s.key === key);
      STATE.customSituation = "";
      STATE.currentVibeId = key;
      STATE.round = 0;
      STATE.history = [];
      document.getElementById("statusLocationBadge").textContent = `${sit.icon} ${sit.title}`;
      closeModal("modalVibePicker");
      triggerHaptic();
      drawNextCard();
    };
  });
}

// 9. MOTOR ORÁCULO IA LIBRE (INPUT CUSTOM)
function handleCustomSituationTrigger() {
  const input = document.getElementById("inputCustomSituation");
  const val = (input.value || "").trim();
  if (!val) return;

  STATE.customSituation = val;
  STATE.round = 0;
  STATE.history = [];
  document.getElementById("statusLocationBadge").textContent = `✨ "${val.slice(0, 22)}${val.length > 22 ? "..." : ""}"`;
  closeModal("modalVibePicker");
  triggerHaptic();
  drawNextCard();
}

// 10. MÓDULO PRINT & PLAY (CARTAS RECORTABLES)
function setupPrintModule() {
  const select = document.getElementById("selectPrintMazo");
  select.innerHTML = SITUATIONS.map(s => `
    <option value="${s.key}">${s.icon} ${s.title}</option>
  `).join("");

  select.onchange = renderPrintCards;
  renderPrintCards();
}

function renderPrintCards() {
  const key = document.getElementById("selectPrintMazo").value || "cita_ambigua";
  const questions = (BANK[key] || []).slice(0, 18);
  const container = document.getElementById("printRenderGrid");

  container.innerHTML = questions.map((q, idx) => `
    <div class="print-card-box">
      <div class="print-card-header">ROMPEHIELO · ${q[1].toUpperCase()}</div>
      <div class="print-card-body">${q[0]}</div>
      <div class="print-card-footer">
        <span>#${idx + 1}</span>
        <span>rompehielo.cl</span>
      </div>
    </div>
  `).join("");
}

// 11. EVENT LISTENERS
function setupEventListeners() {
  // Gameplay
  document.getElementById("btnNext").onclick = drawNextCard;
  document.getElementById("cardScene").onclick = drawNextCard;
  document.getElementById("btnThread").onclick = toggleThread;
  document.getElementById("btnFav").onclick = (e) => {
    e.stopPropagation();
    toggleFavorite();
  };

  // Modales
  document.getElementById("btnCustomSituation").onclick = () => openModal("modalVibePicker");
  document.getElementById("btnCloseVibe").onclick = () => closeModal("modalVibePicker");
  document.getElementById("backdropVibe").onclick = () => closeModal("modalVibePicker");

  document.getElementById("btnTriggerAI").onclick = handleCustomSituationTrigger;
  document.getElementById("inputCustomSituation").onkeydown = (e) => {
    if (e.key === "Enter") handleCustomSituationTrigger();
  };

  // Quick pills del oráculo
  document.querySelectorAll(".quick-pill").forEach(pill => {
    pill.onclick = () => {
      document.getElementById("inputCustomSituation").value = pill.dataset.vibe;
      handleCustomSituationTrigger();
    };
  });

  // Menú
  document.getElementById("btnMenu").onclick = () => openModal("modalMenu");
  document.getElementById("btnCloseMenu").onclick = () => closeModal("modalMenu");
  document.getElementById("backdropMenu").onclick = () => closeModal("modalMenu");

  // Favoritas
  document.getElementById("btnShowFavs").onclick = () => {
    closeModal("modalMenu");
    openFavoritesList();
  };
  document.getElementById("btnCloseFavs").onclick = () => closeModal("modalFavs");
  document.getElementById("backdropFavs").onclick = () => closeModal("modalFavs");

  // Print
  document.getElementById("btnShowPrint").onclick = () => {
    closeModal("modalMenu");
    setupPrintModule();
    openModal("modalPrint");
  };
  document.getElementById("btnClosePrint").onclick = () => closeModal("modalPrint");
  document.getElementById("backdropPrint").onclick = () => closeModal("modalPrint");
  document.getElementById("btnExecPrint").onclick = () => window.print();

  // Reset
  document.getElementById("btnResetSeen").onclick = () => {
    STATE.history = [];
    STATE.round = 0;
    closeModal("modalMenu");
    drawNextCard();
  };

  // Monetización Mazo Físico
  document.getElementById("btnReserveDeck").onclick = () => {
    alert("¡Excelente! Te avisaremos de inmediato cuando salga la preventa con despacho del mazo físico de Rompehielo.");
  };
}

function openFavoritesList() {
  const container = document.getElementById("favsScrollArea");
  if (!STATE.favorites.length) {
    container.innerHTML = `<p class="empty-msg">No has guardado cartas todavía. Toca el corazón en cualquier carta mientras juegas.</p>`;
  } else {
    container.innerHTML = STATE.favorites.map((q, idx) => `
      <div style="background:#1f1f24; padding:14px 16px; border-radius:14px; margin-bottom:8px; display:flex; justify-content:space-between; align-items:center; gap:10px;">
        <span style="font-size:0.92rem; line-height:1.4;">${q}</span>
        <button class="circle-btn" onclick="removeFavoriteItem(${idx})" style="color:#ef4444; border:none; flex-shrink:0;">✕</button>
      </div>
    `).join("");
  }
  openModal("modalFavs");
}

window.removeFavoriteItem = function(idx) {
  STATE.favorites.splice(idx, 1);
  localStorage.setItem("rh_favs", JSON.stringify(STATE.favorites));
  updateFavHeartIcon();
  updateFavBadgeCount();
  openFavoritesList();
};

function openModal(id) {
  const el = document.getElementById(id);
  if (el) el.style.display = "flex";
}

function closeModal(id) {
  const el = document.getElementById(id);
  if (el) el.style.display = "none";
}

function triggerHaptic() {
  if ("vibrate" in navigator) {
    try { navigator.vibrate(14); } catch (e) {}
  }
}

window.addEventListener("DOMContentLoaded", init);
