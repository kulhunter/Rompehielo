# 🧊 ROMPEHIELO

> **El motor de conversación contextual para citas, parejas, amigos, grupos, familia y fiestas.**  
> Basado en la ingeniería inversa de los mejores productos del género (*The AND*, *We're Not Really Strangers*, *Peelr*).  
> **100% web, PWA offline, sin dependencias, con más de 1.050 preguntas únicas en español.**

---

## ✨ Características Principales

1. **Segmentación Hiper-Contextual (14 Sub-Contextos)**:
   - **Salidas de a Dos**:
     - *Cita Tinder / Primera Cita* (química, humor, sin interrogatorio laboral)
     - *Cita sin saber si es romántica o no* (el dilema "¿hay onda o somos amigos?")
     - *Salida no romántica de 2 compas/colegas* (curiosidad, proyectos, vida)
     - *Pareja que lleva poco (< 1 año)* (descubrimiento, ternura, primeras manías)
     - *Pareja de muchos años / convivencia* (salir de la rutina, revivir complicidad, humor doméstico)
   - **Grupos y Amistad**:
     - *Gente que por primera vez se ve* (desconocidos en cenas, cowork, opiniones inútiles universales)
     - *Amigos de toda la vida* (nostalgia, peores anécdotas, debates acalorados sanos)
     - *Amigos recientes* (pasar de conocidos a amistad real)
     - *Parejas + Amigos solteros* (equilibrio perfecto sin exclusión ni incomodidades)
     - *Doble Cita (Parejas con parejas)* (complicidad de a 4, alianzas y comparaciones divertidas)
   - **Familia y Raíces**:
     - *Reunión familiar general* (padres, tíos, abuelos, tradiciones, recuerdos de infancia)
     - *Juntada de Hermanos* (secretos ocultados a los papás, lealtades, quién era el regalón)
     - *La Mesa de los Primos* (la mejor mesa de la fiesta, anécdotas prohibidas)
   - **Fiesta y Carrete**:
     - *Carrete / Fiesta / Previa con copas* (alta energía, confesiones, bajones épicos)

2. **Progresión Psicológica de Profundidad (3 Niveles)**:
   - **Nivel 1: Suave 🧊** (Icebreaker, percepción, humor, cero riesgo).
   - **Nivel 2: Medio 💬** (Conexión, anécdotas, historias y opiniones).
   - **Nivel 3: Profundo 🔥** (Vulnerabilidad sana, valores, reflexión y emoción).

3. **Mecánica "🔥 Tira del Hilo" & Rondas Especiales**:
   - Cada carta cuenta con repreguntas diseñadas para profundizar en la historia.
   - Cada 5 rondas se activa una dinámica sorpresa: *Silla Caliente (Hot Seat)*, *Votación Simultánea* o *Ronda Relámpago*.

4. **Módulo Print & Play (Tarjetas Imprimibles Físicas)**:
   - Generador integrado de planchas en formato A4 / Carta con líneas de corte.
   - Listas para imprimir en papel opalina o cartulina couche en tu casa o imprenta.
   - Diseñado para jugar offline en cabañas, campings, fogatas o la mesa del velador.

5. **Estrategia de Monetización Integrada**:
   - Acceso web gratuito sin registro para máxima viralidad en redes (TikTok / Reels).
   - Banner de reserva para el mazo físico de naipe coleccionista (350g con barniz mate y caja rígida).
   - Listo para integrar pasarelas de pago (MercadoPago, Flow, Stripe, Gumroad).

---

## 🚀 Despliegue en GitHub Pages

El proyecto incluye el workflow automatizado de GitHub Actions en `.github/workflows/pages.yml`.

Para desplegarlo en tu repositorio [`kulhunter/Rompehielo`](https://github.com/kulhunter/Rompehielo):

1. Clona o añade el remoto:
   ```bash
   git remote add origin https://github.com/kulhunter/Rompehielo.git
   ```
2. Sube los cambios a la rama principal:
   ```bash
   git branch -M main
   git push -u origin main
   ```
3. En tu repositorio de GitHub, ve a **Settings** → **Pages** → en *Build and deployment* selecciona **GitHub Actions**.
4. ¡Listo! Tu app estará en línea inmediatamente en `https://kulhunter.github.io/Rompehielo/`.

---

## 💻 Ejecución Local

Dado que es una aplicación web pura (HTML5, CSS3, JS ES6 Vanilla y Service Workers):

```bash
# Con Python 3:
python3 -m http.server 8080

# O con Node:
npx serve .
```

Abre en tu navegador `http://localhost:8080`.

---

## 📄 Licencia

Código bajo licencia MIT. Las preguntas y estructura contextual son una creación original para Rompehielo.
