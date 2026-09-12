/**
 * ROMPEHIELO - Game Card Engine
 * UX Directo: Entras y ya estás jugando.
 * Sin menús eternos, sin jerga de backend, 100% cartas y conversación.
 */

const CONTEXTS = {
  tinder_primera_cita: { title: "Cita Tinder", icon: "🔥", desc: "Química, humor y cero entrevista laboral" },
  cita_ambigua: { title: "¿Cita o amigos?", icon: "👀", desc: "¿Hay onda o somos amigos? Doble lectura" },
  cita_no_romantica: { title: "Salida de 2 compas", icon: "☕", desc: "Proyectos, anécdotas de vida y curiosidad mutua" },
  pareja_reciente: { title: "Pareja nueva (< 1 año)", icon: "❤️", desc: "Descubrir manías, primeras impresiones y ternura" },
  pareja_estable: { title: "Pareja de años", icon: "💑", desc: "Salir de la rutina, complicidad y humor de convivencia" },
  desconocidos_mesa: { title: "Gente nueva", icon: "🧊", desc: "Opiniones inútiles y anécdotas para romper el hielo" },
  amigos_antiguos: { title: "Amigos de siempre", icon: "🍻", desc: "Nostalgia, peores anécdotas y debates ridículos" },
  amigos_recientes: { title: "Nuevos amigos", icon: "🤝", desc: "Pasar de conocidos de carrete a amigos reales" },
  parejas_amigos: { title: "Parejas + Solteros", icon: "👥", desc: "Balance perfecto: citas vs convivencia sin exclusión" },
  doble_cita: { title: "Doble Cita", icon: "🍷", desc: "Complicidad de a cuatro, viajes y mañas de pareja" },
  familia_reunion: { title: "Familia general", icon: "🏠", desc: "Padres, tíos, abuelos y recuerdos de infancia" },
  familia_hermanos: { title: "Hermanos", icon: "🍕", desc: "Secretos no contados a los papás y lealtades" },
  familia_primos: { title: "Mesa de los Primos", icon: "⚡", desc: "La mejor mesa: anécdotas prohibidas y complicidad" },
  carrete_fiesta: { title: "Fiesta / Previa", icon: "🎉", desc: "Alta energía, confesiones y bajones épicos" }
};

let BANK = {};
let STATE = {
  ctxKey: localStorage.getItem("rh_ctx") || "tinder_primera_cita",
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
    console.error("Error loading questions:", e);
  }

  setupEventListeners();
  buildContextGrid();
  updateUIContextBadge();
  nextCard();

  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("sw.js").catch(() => {});
  }
}

// OBTENER SIGUIENTE CARTA SEGÚN NIVEL PROGRESIVO
function pickCard() {
  const pool = BANK[STATE.ctxKey] || [];
  if (!pool.length) {
    return ["¿Qué es lo mejor que te ha pasado hoy y por qué?", "suave", "ROMPEHIELO", "¿Por qué?"];
  }

  // Progresión psicológica limpia:
  // Rondas 1-4: Nivel 1 (suave)
  // Rondas 5-8: Nivel 2 (medio)
  // Rondas 9+: Nivel 3 (profundo)
  let targetDepth = "suave";
  if (STATE.round > 8) targetDepth = "profundo";
  else if (STATE.round > 4) targetDepth = "medio";

  const unused = pool.filter(q => !STATE.history.includes(q[0]));
  const candidatePool = unused.length ? unused : pool;

  let filtered = candidatePool.filter(q => q[1] === targetDepth);
  if (!filtered.length) filtered = candidatePool;

  return filtered[Math.floor(Math.random() * filtered.length)];
}

function nextCard() {
  triggerHaptic();
  STATE.round++;

  const card = pickCard();
  STATE.currentCard = card;
  STATE.history.push(card[0]);

  // Animación visual suave de carta
  const cardEl = document.getElementById("cardElement");
  cardEl.classList.add("swiping");

  setTimeout(() => {
    // Ocultar tira del hilo anterior
    document.getElementById("threadDrawer").style.display = "none";

    // Textos de la carta
    document.getElementById("cardCategory").textContent = (card[2] || "ROMPEHIELO").toUpperCase();
    document.getElementById("cardQuestion").textContent = card[0];

    // Actualizar indicador de Nivel
    updateLevelUI(card[1]);

    // Estado de favorito
    updateFavHeartUI();

    cardEl.classList.remove("swiping");
  }, 160);
}

function updateLevelUI(depth) {
  const d1 = document.getElementById("dot1");
  const d2 = document.getElementById("dot2");
  const d3 = document.getElementById("dot3");
  const label = document.getElementById("levelLabel");

  d1.classList.remove("active");
  d2.classList.remove("active");
  d3.classList.remove("active");

  if (depth === "suave") {
    d1.classList.add("active");
    label.textContent = "Nivel 1: Rompehielo 🧊";
  } else if (depth === "medio") {
    d1.classList.add("active");
    d2.classList.add("active");
    label.textContent = "Nivel 2: Conexión 💬";
  } else {
    d1.classList.add("active");
    d2.classList.add("active");
    d3.classList.add("active");
    label.textContent = "Nivel 3: Profundo 🔥";
  }
}

function toggleThread() {
  triggerHaptic();
  const drawer = document.getElementById("threadDrawer");
  if (drawer.style.display === "none") {
    const customFollow = STATE.currentCard ? STATE.currentCard[3] : null;
    const generic = [
      "¿Por qué crees que pensaste eso en ese momento?",
      "¿Qué pasó exactamente después?",
      "¿Tienes una anécdota que lo demuestre?",
      "¿Cómo ha cambiado esa opinión con los años?",
      "¿Quién más estuvo ahí cuando ocurrió?"
    ];
    document.getElementById("threadText").textContent = customFollow || generic[Math.floor(Math.random() * generic.length)];
    drawer.style.display = "block";
  } else {
    drawer.style.display = "none";
  }
}

// FAVORITAS
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
  const icon = document.getElementById("favHeartIcon");
  if (!icon || !STATE.currentCard) return;
  const isFav = STATE.favorites.includes(STATE.currentCard[0]);
  if (isFav) {
    icon.setAttribute("fill", "#ff4757");
    icon.setAttribute("stroke", "#ff4757");
  } else {
    icon.setAttribute("fill", "none");
    icon.setAttribute("stroke", "currentColor");
  }
  document.getElementById("menuFavCount").textContent = STATE.favorites.length;
}

// CONTEXTOS
function updateUIContextBadge() {
  const ctx = CONTEXTS[STATE.ctxKey] || CONTEXTS["tinder_primera_cita"];
  document.getElementById("headerContextBadge").textContent = `${ctx.icon} ${ctx.title}`;
}

function buildContextGrid() {
  const container = document.getElementById("contextGridContainer");
  container.innerHTML = Object.entries(CONTEXTS).map(([key, item]) => `
    <button class="context-row-btn ${key === STATE.ctxKey ? "selected" : ""}" data-key="${key}">
      <span class="context-row-icon">${item.icon}</span>
      <div>
        <div class="context-row-title">${item.title}</div>
        <div class="context-row-desc">${item.desc}</div>
      </div>
    </button>
  `).join("");

  container.querySelectorAll("[data-key]").forEach(btn => {
    btn.onclick = () => {
      STATE.ctxKey = btn.dataset.key;
      localStorage.setItem("rh_ctx", STATE.ctxKey);
      STATE.round = 0;
      STATE.history = [];
      updateUIContextBadge();
      buildContextGrid();
      closeModal("modalContext");
      nextCard();
    };
  });
}

// PRINT & PLAY (GENERADOR DE MAZO FÍSICO A4)
function setupPrintMazo() {
  const select = document.getElementById("printSelectMazo");
  select.innerHTML = Object.entries(CONTEXTS).map(([k, v]) => `
    <option value="${k}">${v.icon} ${v.title}</option>
  `).join("");

  select.onchange = renderPrintCards;
  renderPrintCards();
}

function renderPrintCards() {
  const deckKey = document.getElementById("printSelectMazo").value || "tinder_primera_cita";
  const questions = (BANK[deckKey] || []).slice(0, 18); // 2 planchas A4 listas para recortar
  const grid = document.getElementById("printCardsGrid");

  grid.innerHTML = questions.map((q, idx) => `
    <div class="printable-card-item">
      <div class="pcard-tag-print">ROMPEHIELO · ${q[1].toUpperCase()}</div>
      <div class="pcard-text-print">${q[0]}</div>
      <div class="pcard-footer-print">
        <span>#${idx + 1}</span>
        <span>rompehielo.cl</span>
      </div>
    </div>
  `).join("");
}

// EVENT LISTENERS
function setupEventListeners() {
  // Juego central
  document.getElementById("btnNextAction").onclick = nextCard;
  document.getElementById("cardWrapper").onclick = nextCard;
  document.getElementById("btnThreadAction").onclick = toggleThread;
  document.getElementById("btnFavToggle").onclick = toggleFav;

  // Modales
  document.getElementById("btnOpenSelector").onclick = () => openModal("modalContext");
  document.getElementById("btnCloseContext").onclick = () => closeModal("modalContext");

  document.getElementById("btnMenuToggle").onclick = () => openModal("modalMenu");
  document.getElementById("btnCloseMenu").onclick = () => closeModal("modalMenu");

  document.getElementById("btnOpenFavorites").onclick = () => {
    closeModal("modalMenu");
    openFavoritesModal();
  };
  document.getElementById("btnCloseFavs").onclick = () => closeModal("modalFavs");

  document.getElementById("btnOpenPrint").onclick = () => {
    closeModal("modalMenu");
    setupPrintMazo();
    openModal("modalPrint");
  };
  document.getElementById("btnClosePrint").onclick = () => closeModal("modalPrint");
  document.getElementById("btnDoPrint").onclick = () => window.print();

  document.getElementById("btnResetCards").onclick = () => {
    STATE.history = [];
    STATE.round = 0;
    closeModal("modalMenu");
    nextCard();
  };

  document.getElementById("btnReservePhysical").onclick = () => {
    alert("¡Excelente! Te avisaremos apenas despachemos la primera tirada del mazo físico de Rompehielo.");
  };
}

function openFavoritesModal() {
  const container = document.getElementById("favsListContainer");
  if (!STATE.favorites.length) {
    container.innerHTML = `<p class="empty-text">No has guardado cartas todavía. Toca el corazón en cualquier carta mientras juegas.</p>`;
  } else {
    container.innerHTML = STATE.favorites.map((q, i) => `
      <div style="background:#202024; padding:14px; border-radius:14px; margin-bottom:8px; display:flex; justify-content:space-between; align-items:center;">
        <span style="font-size:0.92rem; line-height:1.4;">${q}</span>
        <button class="icon-btn" onclick="removeFav(${i})" style="color:#ef4444; border:none; padding:4px 8px;">✕</button>
      </div>
    `).join("");
  }
  openModal("modalFavs");
}

window.removeFav = function(index) {
  STATE.favorites.splice(index, 1);
  localStorage.setItem("rh_favs", JSON.stringify(STATE.favorites));
  updateFavHeartUI();
  openFavoritesModal();
};

function openModal(id) {
  document.getElementById(id).style.display = "flex";
}

function closeModal(id) {
  document.getElementById(id).style.display = "none";
}

function triggerHaptic() {
  if ("vibrate" in navigator) {
    try { navigator.vibrate(15); } catch (e) {}
  }
}

window.addEventListener("DOMContentLoaded", init);
