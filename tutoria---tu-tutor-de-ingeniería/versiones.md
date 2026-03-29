# Versiones y Progreso de TutorIA

Este archivo mantiene un registro de todas las actualizaciones importantes, cambios de arquitectura y decisiones de diseño tomadas durante la evolución de la aplicación. Es esencial leer este archivo para obtener contexto al momento de iterar la app.

## [2026-03-28] - Estilo Visual "Duolingo" y Libertad de Progreso

### Cambios Realizados:
- **Rediseño Completo de `TopicRoadmap.tsx`**:
  - Se cambió el diseño original de tarjetas horizontales y líneas tenues por una "ruta" (wobble/zigzag path) central, estilo Duolingo.
  - Los nodos (temas) ahora son botones circulares con relieve profundo `shadow-[0_8px_0_...]` simulando botones físicos (3D) que se aplastan al hacer clic (`whileTap` de Framer Motion).
  - Se integró un estilo visual bloqueado (tonos grises) vs activo (colores vibrantes: esmeralda para completado, púrpura radiante para actual).
- **Backgrounds Unificados**:
  - Se agregó el efecto de luz de fondo (blur circles) púrpura y magenta usando posiciones `fixed` en el componente `TopicRoadmap.tsx`, unificando el estilo estético para igualar el de `Landing`.
- **Navegación sin Restricciones (Tema Abierto)**:
  - Inicialmente, los nodos "Locked" (grises) no permitían interacción para ser fieles a la mecánica de un juego. 
  - *Decisión Iterativa*: Se decidió remover la lógica que impedía el clic en estos nodos en gris. El estilo visual "bloqueado/gris" se mantiene semánticamente para indicar lo que falta en el flujo ideal, pero el usuario puede adelantar temas libremente si lo desea (+ `cursor-pointer`).
- **Iconos Semánticos Dinámicos**:
  - En lugar de usar un icono de candado (`<Lock />`), los temas conservan iconos predictivos. 
  - Se reescribió la lógica `ICON_MAP` a una función inteligente `getTopicIcon(topicName)` que infiere el ícono (e.g. `TrendigUp` para Aplicaciones de Derivadas, `Zap` para Derivadas, `Sigma` para Integrales, `Activity` para Funciones) independientemente de su estado de bloqueo, aumentando la predictibilidad estática.
- **Botón Home Global**:
  - Se hizo clickeable el logotipo principal de "TutorIA" de la barra lateral (`App.tsx`) para redirigir siempre a la página de "Landing/Home", facilitando un escape visual.

### Notas para la siguiente iteración:
- Mantener en consideración que si bien visualmente la interfaz tiene elementos "gamificados" (bloqueos visuales, barras de vida redonda o coronas), la aplicación se debe enfocar en **NO restringir la libertad del alumno**. Priorizar accesibilidad al estudio sobre gating (bloqueo) duro.
- Si se agregan nuevos componentes, recuerde usar las utilidades compartidas y variables de Tailwind (e.g., `bg-dominia-gradient`) ya predefinidas.
