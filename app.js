/**
 * ROMPEHIELO - Engine de Conversación Contextual (+1.050 preguntas)
 * Arquitectura modular: State machine, LocalStorage, Haptic feedback, PWA offline, Print sheet.
 */

// 1. DEFINICIÓN DE LOS 14 SUB-CONTEXTOS HIPER-ESPECÍFICOS
const CONTEXTS = {
  // SALIDAS DE A DOS
  tinder_primera_cita: {
    title: "Cita Tinder / Primera cita",
    icon: "🔥",
    tag: "Solo 2 personas",
    desc: "Romper la tensión inicial, humor, filtros sutiles de química y anécdotas sin caer en entrevista laboral."
  },
  cita_ambigua: {
    title: "Cita sin saber si es romántica",
    icon: "👀",
    tag: "Solo 2 personas",
    desc: "¿Somos amigos o hay onda? Preguntas de doble lectura y sutileza para descifrar intenciones sin incomodar."
  },
  cita_no_romantica: {
    title: "Salida de 2 compas / colegas",
    icon: "☕",
    tag: "Solo 2 personas",
    desc: "Curiosidad mutua, anécdotas de proyectos, pega, vida y sueños sin roces románticos forzados."
  },
  pareja_reciente: {
    title: "Pareja que lleva poco (< 1 año)",
    icon: "❤️",
    tag: "Pareja",
    desc: "Descubrimiento de manías, primeras impresiones, pequeñas revelaciones tiernas y planes a futuro."
  },
  pareja_estable: {
    title: "Pareja de muchos años",
    icon: "💑",
    tag: "Pareja",
    desc: "Salir de la rutina, revivir recuerdos de oro, complicidad profunda y humor sobre la convivencia diaria."
  },

  // GRUPOS Y AMISTADES
  desconocidos_mesa: {
    title: "Gente que por primera vez se ve",
    icon: "🧊",
    tag: "Mesa / Grupo",
    desc: "Eventos, cenas o cowork. Opiniones inútiles, anécdotas universales y temas divertidos para conectar sin juzgar."
  },
  amigos_antiguos: {
    title: "Amigos de toda la vida",
    icon: "🍻",
    tag: "Amigos",
    desc: "Nostalgia noventera/dosmilera, peores cagazos sanos, debates ridículos y verdades con cariño fraternal."
  },
  amigos_recientes: {
    title: "Nuevos amigos / Conocidos",
    icon: "🤝",
    tag: "Amigos",
    desc: "Pasar de la charla superficial de carrete a amistad real: gustos culposos, anécdotas y risas garantizadas."
  },
  parejas_amigos: {
    title: "Parejas + Amigos solteros",
    icon: "👥",
    tag: "Grupo Mixto",
    desc: "Equilibrio perfecto: anécdotas de citas vs convivencia, sin dejar a los solteros fuera ni incomodar a las parejas."
  },
  doble_cita: {
    title: "Doble Cita (Parejas con parejas)",
    icon: "🍷",
    tag: "Grupo 4 personas",
    desc: "Complicidad de a cuatro: cómo se conocieron, mañas de cada pareja, alianzas de viaje y consejos de vida."
  },

  // FAMILIA
  familia_reunion: {
    title: "Reunión familiar general",
    icon: "🏠",
    tag: "Familia",
    desc: "Padres, tíos y abuelos. Recuerdos de infancia, recetas sagradas, tradiciones y afecto intergeneracional."
  },
  familia_hermanos: {
    title: "Juntada de Hermanos",
    icon: "🍕",
    tag: "Familia",
    desc: "Secretos no contados a los papás, lealtades, quién era el regalón y complicidad fraterna de infancia."
  },
  familia_primos: {
    title: "La Mesa de los Primos",
    icon: "⚡",
    tag: "Familia",
    desc: "La mesa más entretenida de la fiesta familiar: historias prohibidas, carretes de primos y recuerdos de los abuelos."
  },

  // FIESTA
  carrete_fiesta: {
    title: "Fiesta / Previa / Carrete",
    icon: "🎉",
    tag: "Alta Energía",
    desc: "Dinámicas rápidas, confesiones divertidas, anécdotas de resacas épicas y preguntas para prender la mesa."
  }
};

const INTENTS = [
  { id: "Reírnos", label: "😂 Morir de la risa", tags: ["humor", "juego"] },
  { id: "Conversar", label: "💬 Conversar relajado", tags: ["cotidiano", "curiosidad", "conexion"] },
  { id: "Conocernos", label: "👀 Química y Conexión", tags: ["conocerse", "quimica", "afecto"] },
  { id: "Historias", label: "📖 Anécdotas e Historias", tags: ["historias", "recuerdos"] },
  { id: "Profundizar", label: "🧠 Profundizar de verdad", tags: ["vulnerabilidad", "reflexion", "valores", "emociones"] },
  { id: "Cualquiera", label: "🎲 De todo un poco", tags: [] }
];

// ESTADO GLOBAL
let BANK = {};
let STATE = {
  ctxKey: null,
  intent: "Cualquiera",
  depthMode: "auto", // "auto" (escala con las rondas), o 1, 2, 3 fijado
  round: 0,
  currentCard: null,
  history: [],
  favorites: JSON.parse(localStorage.getItem("rh_favs") || "[]"),
  hapticEnabled: localStorage.getItem("rh_haptic") !== "false"
};

// 2. INICIALIZACIÓN
async function initApp() {
  try {
    const res = await fetch("data/questions.json");
    BANK = await res.json();
  } catch (err) {
    console.error("Error al cargar data/questions.json", err);
  }

  updateFavCountUI();
  setupTopNavEvents();
  renderHomeScreen();

  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("sw.js").catch(() => {});
  }
}

// 3. PANTALLAS
const screenEl = document.getElementById("screen");

function renderHomeScreen() {
  const badge = document.getElementById("navCtxBadge");
  badge.style.display = "none";

  screenEl.innerHTML = `
    <section class="hero">
      <div class="eyebrow">Motor de Conversación Contextual</div>
      <h1>¿De qué hablamos?</h1>
      <p>Elige con quién estás sentado ahora. Rompehielo calibra las preguntas exactas para romper la tensión, generar risas y conectar de verdad.</p>
    </section>

    <div class="section-title">
      👫 Salidas de a Dos <span>(Citas y Parejas)</span>
    </div>
    <div class="group-cards-grid">
      ${renderCtxButton("tinder_primera_cita")}
      ${renderCtxButton("cita_ambigua")}
      ${renderCtxButton("cita_no_romantica")}
      ${renderCtxButton("pareja_reciente")}
      ${renderCtxButton("pareja_estable")}
    </div>

    <div class="section-title">
      🍻 Mesas, Amigos y Grupos <span>(Desconocidos o Amistad)</span>
    </div>
    <div class="group-cards-grid">
      ${renderCtxButton("desconocidos_mesa")}
      ${renderCtxButton("amigos_antiguos")}
      ${renderCtxButton("amigos_recientes")}
      ${renderCtxButton("parejas_amigos")}
      ${renderCtxButton("doble_cita")}
      ${renderCtxButton("carrete_fiesta", true)}
    </div>

    <div class="section-title">
      🏠 Familia y Raíces <span>(Recuerdos y Afecto)</span>
    </div>
    <div class="group-cards-grid">
      ${renderCtxButton("familia_reunion")}
      ${renderCtxButton("familia_hermanos")}
      ${renderCtxButton("familia_primos")}
    </div>
  `;

  // Attach event listeners
  screenEl.querySelectorAll("[data-ctx]").forEach(btn => {
    btn.onclick = () => showSetupScreen(btn.dataset.ctx);
  });
}

function renderCtxButton(key, isHighlight = false) {
  const ctx = CONTEXTS[key];
  if (!ctx) return "";
  const count = (BANK[key] || []).length || 75;
  return `
    <button class="ctx-card ${isHighlight ? "highlight" : ""}" data-ctx="${key}">
      <div class="ctx-header">
        <span class="ctx-icon">${ctx.icon}</span>
        <div>
          <div class="ctx-title">${ctx.title}</div>
          <div class="ctx-desc">${ctx.desc}</div>
        </div>
      </div>
      <div class="ctx-meta">
        <span>${ctx.tag}</span>
        <span>${count} cartas</span>
      </div>
    </button>
  `;
}

function showSetupScreen(ctxKey) {
  STATE.ctxKey = ctxKey;
  const ctx = CONTEXTS[ctxKey];

  screenEl.innerHTML = `
    <div class="panel">
      <button class="btn-back" id="btnBackToHome">← Elegir otra situación</button>
      
      <div>
        <div class="eyebrow">${ctx.icon} ${ctx.tag.toUpperCase()}</div>
        <h2 style="font-size:1.6rem; margin-top:4px;">${ctx.title}</h2>
        <p class="muted text-sm" style="margin-top:6px;">${ctx.desc}</p>
      </div>

      <div>
        <label><b>¿Qué onda quieren provocar hoy?</b></label>
        <div class="option-group" id="intentGroup">
          ${INTENTS.map((item, idx) => `
            <button class="pill-option ${idx === 0 ? "active" : ""}" data-intent="${item.id}">
              ${item.label}
            </button>
          `).join("")}
        </div>
      </div>

      <div>
        <label><b>Profundidad de la conversación:</b></label>
        <div class="option-group" id="depthGroup">
          <button class="pill-option active" data-depth="auto">🌊 Progresivo (Suave → Profundo)</button>
          <button class="pill-option" data-depth="1">🧊 Solo Rompehielo (Liviano)</button>
          <button class="pill-option" data-depth="2">💬 Conexión y Anécdotas</button>
          <button class="pill-option" data-depth="3">🔥 Sin Filtro (Profundo)</button>
        </div>
      </div>

      <button class="btn-primary" id="btnStartGame" style="margin-top:12px;">
        Empezar Juego →
      </button>
    </div>
  `;

  document.getElementById("btnBackToHome").onclick = renderHomeScreen;

  const intentBtns = screenEl.querySelectorAll("#intentGroup .pill-option");
  intentBtns.forEach(btn => {
    btn.onclick = () => {
      intentBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      STATE.intent = btn.dataset.intent;
    };
  });

  const depthBtns = screenEl.querySelectorAll("#depthGroup .pill-option");
  depthBtns.forEach(btn => {
    btn.onclick = () => {
      depthBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      STATE.depthMode = btn.dataset.depth;
    };
  });

  document.getElementById("btnStartGame").onclick = startGameSession;
}

// 4. SESIÓN DE JUEGO Y SELECCIÓN DE PREGUNTAS
function startGameSession() {
  STATE.round = 0;
  STATE.history = [];
  renderGameScreen();
  nextCard();
}

function renderGameScreen() {
  const ctx = CONTEXTS[STATE.ctxKey];
  const badge = document.getElementById("navCtxBadge");
  badge.textContent = `${ctx.icon} ${ctx.title}`;
  badge.style.display = "inline-block";

  screenEl.innerHTML = `
    <section class="game-view">
      <div class="game-top-bar">
        <button class="btn-back" id="btnAdjust">← Ajustar</button>
        <div class="round-indicator">Ronda <span id="roundNum">1</span></div>
        <div class="depth-badge depth-suave" id="depthBadge">SUAVE</div>
      </div>

      <div class="card-stage">
        <article class="card-item" id="cardItem">
          <div class="card-top">
            <span class="card-tag" id="cardCategory">ROMPEHIELO</span>
            <button class="btn-card-fav" id="btnToggleFav" title="Guardar en favoritas">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
            </button>
          </div>

          <div class="card-body-text" id="cardQuestion">
            Cargando pregunta...
          </div>

          <div class="card-footer-tip">
            Toca para siguiente · La mejor respuesta es una historia
          </div>
        </article>
      </div>

      <div class="game-controls">
        <div class="primary-actions">
          <button class="btn-secondary" id="btnThread">🔥 Tira del hilo</button>
          <button class="btn-primary" id="btnNext">Siguiente Carta →</button>
        </div>
      </div>

      <div id="threadArea" class="thread-container"></div>
      <div id="specialRoundArea"></div>
    </section>
  `;

  document.getElementById("btnAdjust").onclick = () => showSetupScreen(STATE.ctxKey);
  document.getElementById("btnNext").onclick = nextCard;
  document.getElementById("btnThread").onclick = revealThread;
  document.getElementById("cardItem").onclick = nextCard;
  document.getElementById("btnToggleFav").onclick = (e) => {
    e.stopPropagation();
    toggleCurrentFavorite();
  };
}

function getEffectiveDepth() {
  if (STATE.depthMode !== "auto") {
    const d = parseInt(STATE.depthMode);
    return d === 1 ? "suave" : d === 2 ? "medio" : "profundo";
  }
  // Progresivo: Rondas 1-4 = suave, 5-8 = medio, 9+ = profundo
  if (STATE.round <= 4) return "suave";
  if (STATE.round <= 8) return "medio";
  return "profundo";
}

function pickNextCard() {
  const pool = BANK[STATE.ctxKey] || [];
  if (!pool.length) {
    return ["¿Qué es lo mejor que te ha pasado hoy y por qué?", "suave", "general", "Cuéntame más"];
  }

  const targetDepth = getEffectiveDepth();

  // Filtrar las que no se han usado en esta sesión
  const unused = pool.filter(q => !STATE.history.includes(q[0]));
  const candidatePool = unused.length ? unused : pool;

  // Filtrar por profundidad
  let depthFiltered = candidatePool.filter(q => q[1] === targetDepth);
  if (!depthFiltered.length) depthFiltered = candidatePool;

  // Si hay filtro de intención específico
  const intentObj = INTENTS.find(i => i.id === STATE.intent);
  if (intentObj && intentObj.tags.length > 0) {
    const intentFiltered = depthFiltered.filter(q => intentObj.tags.includes(q[2]));
    if (intentFiltered.length) {
      depthFiltered = intentFiltered;
    }
  }

  return depthFiltered[Math.floor(Math.random() * depthFiltered.length)];
}

function nextCard() {
  triggerHaptic();
  STATE.round++;

  const card = pickNextCard();
  STATE.currentCard = card;
  STATE.history.push(card[0]);

  const cardEl = document.getElementById("cardItem");
  if (cardEl) {
    cardEl.classList.add("flipping");
    setTimeout(() => {
      document.getElementById("roundNum").textContent = STATE.round;
      document.getElementById("cardQuestion").textContent = card[0];
      document.getElementById("cardCategory").textContent = (card[2] || "ROMPEHIELO").toUpperCase();

      const depthBadge = document.getElementById("depthBadge");
      depthBadge.className = `depth-badge depth-${card[1]}`;
      depthBadge.textContent = card[1].toUpperCase();

      updateFavIconState();
      document.getElementById("threadArea").innerHTML = "";
      checkSpecialRound();
      cardEl.classList.remove("flipping");
    }, 180);
  }
}

function revealThread() {
  if (!STATE.currentCard) return;
  triggerHaptic();

  const customFollow = STATE.currentCard[3];
  const genericFollows = [
    "¿Por qué crees que pensaste eso en ese momento?",
    "¿Qué pasó exactamente después?",
    "¿Tienes una anécdota que lo demuestre?",
    "¿Cómo ha cambiado esa opinión con los años?",
    "¿Quién más estuvo ahí cuando ocurrió?",
    "¿Qué parte de la historia omitiste por pudor?"
  ];

  const followText = customFollow || genericFollows[Math.floor(Math.random() * genericFollows.length)];
  const threadArea = document.getElementById("threadArea");
  threadArea.innerHTML = `
    <div class="thread-box">
      <div class="thread-header">↳ TIRA DEL HILO (REPUNTA)</div>
      <p>"${followText}"</p>
    </div>
  `;
}

function checkSpecialRound() {
  const area = document.getElementById("specialRoundArea");
  if (STATE.round > 0 && STATE.round % 5 === 0) {
    const specials = [
      {
        title: "🎲 Silla Caliente (Hot Seat)",
        desc: "La persona que respondió la última carta ahora elige a otra: todos en la mesa le hacen una pregunta libre y directa."
      },
      {
        title: "🗳️ Votación Simultánea",
        desc: "A la cuenta de 3, todos en la mesa apuntan con el dedo a quién representa más la situación de la carta anterior."
      },
      {
        title: "⚡ Ronda Relámpago",
        desc: "Todos responden la misma carta en círculo en menos de 15 segundos cada uno. ¡Sin pensar tanto!"
      }
    ];
    const sp = specials[Math.floor(Math.random() * specials.length)];
    area.innerHTML = `
      <div class="special-round-banner">
        <div class="special-icon">🔥</div>
        <div class="special-content">
          <b>${sp.title}</b>
          <p>${sp.desc}</p>
        </div>
      </div>
    `;
  } else {
    area.innerHTML = "";
  }
}

// 5. FAVORITAS Y PERSISTENCIA
function toggleCurrentFavorite() {
  if (!STATE.currentCard) return;
  const q = STATE.currentCard[0];
  const idx = STATE.favorites.indexOf(q);
  if (idx > -1) {
    STATE.favorites.splice(idx, 1);
  } else {
    STATE.favorites.push(q);
  }
  localStorage.setItem("rh_favs", JSON.stringify(STATE.favorites));
  updateFavCountUI();
  updateFavIconState();
  triggerHaptic();
}

function updateFavIconState() {
  const btn = document.getElementById("btnToggleFav");
  if (!btn || !STATE.currentCard) return;
  const isFav = STATE.favorites.includes(STATE.currentCard[0]);
  if (isFav) {
    btn.classList.add("active");
    btn.querySelector("svg").setAttribute("fill", "currentColor");
  } else {
    btn.classList.remove("active");
    btn.querySelector("svg").setAttribute("fill", "none");
  }
}

function updateFavCountUI() {
  const countEl = document.getElementById("favCount");
  if (countEl) {
    countEl.textContent = STATE.favorites.length;
  }
}

function openFavsModal() {
  const listEl = document.getElementById("favsList");
  if (!STATE.favorites.length) {
    listEl.innerHTML = `<p class="muted text-center" style="padding:20px;">Aún no tienes cartas favoritas guardadas. Toca el corazón en cualquier carta para guardarla aquí.</p>`;
  } else {
    listEl.innerHTML = STATE.favorites.map((q, i) => `
      <div class="setting-item" style="gap:10px;">
        <span style="font-size:0.92rem; line-height:1.4;">${q}</span>
        <button class="btn-sm btn-outline" onclick="removeFavorite(${i})">Borrar</button>
      </div>
    `).join("");
  }
  openModal("modalFavs");
}

window.removeFavorite = function(index) {
  STATE.favorites.splice(index, 1);
  localStorage.setItem("rh_favs", JSON.stringify(STATE.favorites));
  updateFavCountUI();
  updateFavIconState();
  openFavsModal();
};

// 6. MÓDULO PRINT & PLAY (PLANCHAS IMPRIMIBLES)
function openPrintModal() {
  const select = document.getElementById("printDeckSelect");
  select.innerHTML = Object.entries(CONTEXTS).map(([k, v]) => `
    <option value="${k}">${v.icon} ${v.title} (${(BANK[k] || []).length || 75} cartas)</option>
  `).join("");

  generatePrintSheet();
  openModal("modalPrint");
}

function generatePrintSheet() {
  const select = document.getElementById("printDeckSelect");
  const deckKey = select.value || "tinder_primera_cita";
  const questions = (BANK[deckKey] || []).slice(0, 18); // Genera 2 hojas A4 completas (9 cartas por hoja)
  const container = document.getElementById("printSheetContainer");

  container.innerHTML = `
    <div style="margin-bottom:12px; font-weight:700; font-size:0.85rem; color:#18181b;">
      Plancha lista para recortar · Mazo: ${CONTEXTS[deckKey].title} (${questions.length} cartas de muestra)
    </div>
    <div class="print-grid">
      ${questions.map((q, idx) => `
        <div class="printable-card">
          <div class="pcard-tag">ROMPEHIELO · ${q[1].toUpperCase()}</div>
          <div class="pcard-q">${q[0]}</div>
          <div class="pcard-qr-box">
            <span>#${idx + 1}</span>
            <span>QR: rompehielo.cl</span>
          </div>
        </div>
      `).join("")}
    </div>
  `;
}

// 7. EVENTOS DE NAVEGACIÓN Y MODALES
function setupTopNavEvents() {
  document.getElementById("btnHome").onclick = renderHomeScreen;
  document.getElementById("btnFavs").onclick = openFavsModal;
  document.getElementById("btnPrintModalBtn").onclick = openPrintModal;
  document.getElementById("btnSettings").onclick = () => openModal("modalSettings");

  document.getElementById("btnCloseFavs").onclick = () => closeModal("modalFavs");
  document.getElementById("btnClosePrint").onclick = () => closeModal("modalPrint");
  document.getElementById("btnCloseSettings").onclick = () => closeModal("modalSettings");

  document.getElementById("btnPreviewPrint").onclick = generatePrintSheet;
  document.getElementById("btnPrintNow").onclick = () => window.print();

  document.getElementById("chkHaptic").onchange = (e) => {
    STATE.hapticEnabled = e.target.checked;
    localStorage.setItem("rh_haptic", STATE.hapticEnabled);
  };

  document.getElementById("btnResetHistory").onclick = () => {
    STATE.history = [];
    alert("Historial de preguntas reiniciado para esta sesión.");
  };

  document.getElementById("btnBuyPhysical").onclick = () => {
    alert("¡Excelente! Serás redirigido para registrar tu reserva del Mazo Físico Rompehielo (Edición Naipe Premium).");
  };
}

function openModal(id) {
  const el = document.getElementById(id);
  if (el) el.style.display = "flex";
}

function closeModal(id) {
  const el = document.getElementById(id);
  if (el) el.style.display = "none";
}

function triggerHaptic() {
  if (STATE.hapticEnabled && "vibrate" in navigator) {
    try {
      navigator.vibrate(15);
    } catch (e) {}
  }
}

// Boot
window.addEventListener("DOMContentLoaded", initApp);
