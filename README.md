# ROMPEHIELO

Juego web de conversación para citas, parejas, amigos, grupos, familia, gente nueva y fiestas.

## Qué contiene

- UX de cartas y selección de contexto.
- Progresión de profundidad por ronda.
- Selección por intención: reírse, conversar, conocerse, historias o libre.
- "Tira del hilo" para preguntas de seguimiento.
- Rondas especiales cada 5 preguntas.
- PWA instalable y cache local.
- Banco de preguntas separado en `data/questions.json`.
- Cero backend y cero dependencias para esta versión.
- Preparado para crecer hacia mazos importables, favoritos, historial, Hot Seat, Timed, multimedia e IA.

## Ejecutar

La app es estática. Para que el Service Worker funcione debes servirla por HTTP(S), no abrir `index.html` directamente.

Con Python:

    python3 -m http.server 8080

Luego abre:

    http://localhost:8080

También puedes publicarla directamente con GitHub Pages.

## Publicar en GitHub Pages

1. Crea un repositorio, por ejemplo `rompehielo`.
2. Sube todo el contenido de esta carpeta a la raíz.
3. En GitHub: Settings → Pages.
4. Source: GitHub Actions o Deploy from branch.
5. Si usas branch, selecciona `main` + `/root`.

## Fuentes y decisiones de producto

Esta implementación NO copia literalmente contenido de terceros. Consolida patrones y características observadas en proyectos open-source y productos del género.

Referencias revisadas:

- remarkablegames/icebreaker — https://github.com/remarkablegames/icebreaker
- ParabolInc/icebreakers — https://github.com/ParabolInc/icebreakers
- michaelsboost/CoupleCards — https://github.com/michaelsboost/CoupleCards
- LuisReinoso/family-talk — https://github.com/LuisReinoso/family-talk
- qiaeru/couplecards — https://github.com/qiaeru/couplecards
- sweetmeats83/questions — https://github.com/sweetmeats83/questions
- michaelsboost/the-deck — https://github.com/michaelsboost/the-deck

### Patrones incorporados

- Icebreaker generator / selección rápida.
- Diseño de cartas y flip.
- PWA / offline.
- Progresión de profundidad.
- Selección de jugadores/contexto.
- Banco de preguntas estructurado.
- Arquitectura orientada a mazos.
- Posibilidad futura de audio, respuestas y multimedia.

## Licencias

Esta implementación propia no incorpora código de esos repositorios.

Los repositorios de referencia deben conservar sus respectivos avisos/licencias si en una futura versión se reutiliza código literalmente. Antes de redistribuir fragmentos, revisar el LICENSE del commit exacto y conservar copyright/notice cuando corresponda.

No se incluyen aquí preguntas copiadas de productos comerciales como THE AND o We're Not Really Strangers.

## Roadmap recomendado

### V1
- [x] Contextos
- [x] Intenciones
- [x] Profundidad
- [x] Progresión
- [x] Seguimientos
- [x] PWA

### V2
- [ ] 500–1.000 preguntas originales
- [ ] 15–20 mazos
- [ ] Hot Seat
- [ ] Timed mode
- [ ] modo 1 jugador
- [ ] favoritos
- [ ] historial
- [ ] nombres/jugadores
- [ ] import/export de mazos
- [ ] editor de preguntas
- [ ] filtros por edad/situación

### V3
- [ ] motor adaptativo basado en respuestas
- [ ] IA para "tira del hilo"
- [ ] audio/TTS
- [ ] respuestas de voz
- [ ] fotos
- [ ] compartir sesión
- [ ] multiplayer
- [ ] mazos imprimibles generados desde la misma fuente JSON
