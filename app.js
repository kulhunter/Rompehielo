const MODES={
 cita:["❤️ Una cita","Recién conociéndose o primera cita"],
 pareja:["💑 Mi pareja","Conexión, recuerdos y curiosidad"],
 amigos:["🍻 Amigos","Risas, historias y opiniones inútiles"],
 desconocidos:["🧊 Gente nueva","Romper el hielo sin incomodar"],
 mixto:["👥 Grupo mixto","Amigos, parejas y gente nueva"],
 familia:["🏠 Familia","Historias y recuerdos compartidos"],
 fiesta:["🎉 Fiesta / carrete","Preguntas rápidas para activar la mesa"]
};
const INTENTS=["Reírnos","Conversar","Conocernos","Historias","Cualquier cosa"];
const DEPTHS=["Suave","Normal","Profundo"];
let BANK={}, state={mode:null,intent:"Conversar",depth:2,round:0,used:[],current:null,history:[]};

async function boot(){
  BANK=await fetch("data/questions.json").then(r=>r.json());
  renderHome();
  if("serviceWorker" in navigator) navigator.serviceWorker.register("sw.js").catch(()=>{});
}
function esc(s){return s.replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]));}
function renderHome(){
  screen.innerHTML=`<section class="hero"><div class="eyebrow">juego de conversación</div><h1>¿De qué<br>hablamos?</h1><p>Elige quién está contigo. La app pone la primera pregunta y, si aparece una buena historia, puedes tirar del hilo.</p></section>
  <div class="grid">${Object.entries(MODES).map(([k,v])=>`<button class="choice ${k==="fiesta"?"wide":""}" data-mode="${k}"><b>${v[0]}</b><small>${v[1]}</small></button>`).join("")}</div>
  <div class="footer">Sin cuenta · sin backend · tus preferencias quedan en este dispositivo.</div>`;
  screen.querySelectorAll("[data-mode]").forEach(b=>b.onclick=()=>setup(b.dataset.mode));
}
function setup(mode){
 state.mode=mode; state.used=[]; state.round=0;
 screen.innerHTML=`<div class="panel"><button class="back" data-action="home">← Cambiar grupo</button><div class="eyebrow">${MODES[mode][0]}</div><h2>¿Qué quieren provocar?</h2><p class="muted">Elige el tono. No cambia la personalidad del juego: cambia qué tipo de conversación prioriza.</p>
 <div class="options" id="intent">${INTENTS.map((x,i)=>`<button class="option ${i===1?"selected":""}" data-intent="${x}">${x}</button>`).join("")}</div>
 <h2>¿Cuánto profundizar?</h2><p class="muted">La profundidad escala con las rondas para que nadie reciba una pregunta intensa de entrada.</p>
 <div class="options" id="depth">${DEPTHS.map((x,i)=>`<button class="option ${i===1?"selected":""}" data-depth="${i+1}">${x}</button>`).join("")}</div>
 <button class="primary" data-start>EMPEZAR →</button></div>`;
  screen.querySelectorAll("[data-intent]").forEach(b=>b.onclick=()=>{document.querySelectorAll("[data-intent]").forEach(x=>x.classList.remove("selected"));b.classList.add("selected");state.intent=b.dataset.intent});
  screen.querySelectorAll("[data-depth]").forEach(b=>b.onclick=()=>{document.querySelectorAll("[data-depth]").forEach(x=>x.classList.remove("selected"));b.classList.add("selected");state.depth=+b.dataset.depth});
  screen.querySelector("[data-start]").onclick=start;
  screen.querySelector("[data-action=home]").onclick=renderHome;
}
function pool(){
 let max=state.depth;
 if(state.round<=2) max=Math.min(max,1);
 else if(state.round<=5) max=Math.min(max,2);
 return BANK[state.mode].filter(q=>q[1] <= ["suave","medio","profundo"].indexOf(q[1])+1 && ({suave:1,medio:2,profundo:3}[q[1]]<=max) && !state.used.includes(q[0]));
}
function choose(){
 let p=pool(); if(!p.length){state.used=[];p=pool();}
 // Prioridad simple por intención: humor/historias/conocerse.
 const preferred={Reírnos:["humor"],Conversar:["cotidiano","curiosidad","conexión"],Conocernos:["conocerse","recuerdos"],Historias:["historias"],"Cualquier cosa":[]}[state.intent]||[];
 const pp=preferred.length?p.filter(q=>preferred.includes(q[2])):p;
 return (pp.length?pp:p)[Math.floor(Math.random()*(pp.length?pp:p).length)];
}
function start(){state.round=0;state.used=[];state.history=[];renderGame();next();}
function renderGame(){
 screen.innerHTML=`<section class="game"><div class="game-head"><button class="back" data-adjust>← Ajustar</button><span class="eyebrow">${MODES[state.mode][0]}</span></div><div class="progress"><span id="progress"></span></div><div class="card-wrap"><article class="card" id="card"><span class="card-type" id="type"></span><div class="question" id="question"></div><span class="card-tip">siguiente · tira del hilo · sin respuestas correctas</span></article></div><div class="actions"><button class="secondary" data-thread>↳ Tira del hilo</button><button class="primary" data-next style="margin:0">Siguiente →</button></div><div id="special"></div><div id="thread"></div><div class="footer">Ronda <span id="round"></span>. La mejor respuesta es una historia, no una respuesta perfecta.</div></section>`;
 screen.querySelector("[data-adjust]").onclick=()=>setup(state.mode);
 screen.querySelector("[data-next]").onclick=next;
 screen.querySelector("[data-thread]").onclick=thread;
}
function next(){
 state.round++; let q=choose(); state.current=q; state.used.push(q[0]); state.history.push(q);
 const card=document.getElementById("card"); card.classList.add("flipping");
 setTimeout(()=>{document.getElementById("type").textContent=q[1].toUpperCase();document.getElementById("question").textContent=q[0];document.getElementById("round").textContent=state.round;document.getElementById("progress").style.width=((state.round%10||10)*10)+"%";document.getElementById("thread").innerHTML="";renderSpecial();card.classList.remove("flipping")},180);
}
function thread(){
 if(!state.current)return;
 const q=state.current[0], follow=[
  "¿Por qué?",
  "Cuéntame un poco más.",
  "¿Qué pasó después?",
  "¿Cómo llegaste a pensar eso?",
  "¿Tienes una historia que lo demuestre?",
  "¿Y eso ha cambiado con los años?"
 ];
 const text=follow[Math.floor(Math.random()*follow.length)];
 document.getElementById("thread").innerHTML=`<div class="thread"><b>↳ TIRA DEL HILO</b><p>${text}</p></div>`;
}
function renderSpecial(){
 const s=document.getElementById("special");
 if(state.round%5===0)s.innerHTML=`<div class="special"><button onclick="next()">JUGAR</button><b>🎲 RONDA ESPECIAL</b><p>Todos responden. La persona que empezó la última ronda elige quién parte.</p></div>`;
 else s.innerHTML="";
}
document.addEventListener("click",e=>{if(e.target.dataset.action==="home")renderHome();if(e.target.dataset.action==="settings")settings();});
function settings(){
 screen.innerHTML=`<div class="panel"><button class="back" data-action="home">← Volver</button><div class="eyebrow">configuración</div><h2>ROMPEHIELO</h2><p class="muted">Esta versión es local-first: no necesitas cuenta y el juego no envía respuestas a un servidor.</p><div class="settings-list"><div class="setting"><b>Limpiar historial</b><br><button class="secondary" onclick="localStorage.removeItem('rh-history');alert('Listo')">Borrar datos locales</button></div><div class="setting"><b>Agregar tus propios mazos</b><br><span class="muted">La próxima capa será import/export de JSON y editor de cartas.</span></div></div></div>`;
}
boot();
