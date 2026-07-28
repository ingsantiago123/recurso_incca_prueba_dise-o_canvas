# Visor de recurso V2 "Canvas" — UNINCCA

Segundo visor de recursos educativos de la Universidad INCCA de Colombia,
con un diseño completamente distinto al visor original (acordeón
horizontal de ejes, encabezado dinámico, video + pregunta detonante y
recursos con visor a pantalla completa). Vive en su **propio repositorio**,
independiente del visor original.

## Qué es

SPA en HTML/CSS/JS puro (sin frameworks, sin dependencias externas más
allá de la tipografía de Google Fonts) y **genérica**: no tiene ningún
curso escrito en el código. Todo el contenido (curso, título de cada eje,
pregunta detonante, video, recursos) se lo pasa Moodle como un objeto
**JSON**, leído desde `window.name` del iframe (no desde la URL — así no
hay límite de longitud aunque el curso tenga muchos recursos).

Este es el mismo patrón de arquitectura del visor original de UNINCCA
(ver `recurso_incca_prueba_piloto`): estructura y diseño fijos en el
código, contenido siempre dinámico, con un placeholder genérico por cada
campo que no llegue en el JSON.

## Archivos

```
index.html               ← único punto de entrada
assets/css/styles.css    ← paleta y geometría del acordeón/stepper/modal
assets/js/main.js        ← lee el JSON y pinta todo (documentado al inicio del archivo)
test-iframe.html         ← ejemplo del patrón de embebido (name estático, sin JS)
```

## Qué es diseño fijo vs. qué es contenido dinámico

- **Fijo (diseño, vive en el código):** los 6 ejes del curso (INICIO,
  EJE 1-4, CIERRE), su orden, color e ícono de línea, y su micro-copy de
  estado ("Pregunta", "Conceptualicemos", "Analicemos", "Apliquemos",
  "Evaluemos", "Cerremos"); las etiquetas de interfaz que nunca cambian
  ("UNINCCA").
- **Dinámico (viene del JSON):** el nombre del curso, el título grande de
  cada eje, la pregunta detonante de cada eje, el video, la ilustración
  del panel expandido y la lista de recursos (con su contenido para el
  visor a pantalla completa).

## Cómo embeberlo en Moodle

```php
<iframe id="incca-hero-section" title="Visor de recurso UNINCCA"
  style="width:100%; height:900px; border:0;"
  src="https://ingsantiago123.github.io/recurso_incca_prueba_dise-o_canvas/"
  name='<?php echo htmlspecialchars(json_encode($datosDelRecurso), ENT_QUOTES); ?>'>
</iframe>
```

**Importante sobre la altura:** el hero (`#hero`) mide `height:100vh` — el
100% del alto que le des al iframe, no del navegador. Si el iframe mide
1400px, el hero se estira a 1400px y se ve desproporcionado. `900px` es
la misma convención que usa el visor original y el hero queda con una
proporción correcta. El resto del contenido (header dinámico, video +
pregunta, recursos) no tiene por qué caber sin scroll: el iframe hace su
propio scroll interno para revelarlo, igual que cualquier página larga
embebida en una caja de altura fija — no hace falta agrandar el iframe
para "que quepa todo".

El atributo `name` debe estar en el mismo tag que `src` desde el
principio (HTML estático generado por PHP, sin JavaScript necesario). Si
en cambio el iframe se arma por JavaScript en la página padre, hay que
fijar `iframe.contentWindow.name` (NO `iframe.name`, que solo es el
atributo HTML del tag) **antes** de fijar `iframe.src`.

Ver `test-iframe.html` para un ejemplo completo y funcional del patrón
estático, con un curso de ejemplo de Ingeniería de Sistemas.

## El JSON esperado

Todo es opcional excepto `curso`; lo que falte se muestra como un
placeholder genérico ("Título de esta sección", etc.) en vez de romper
el diseño:

```json
{
  "curso": "Nombre del curso",
  "secciones": {
    "inicio": {
      "titulo_header": "Título grande del encabezado dinámico",
      "pregunta": "Pregunta detonante de esta sección",
      "video": "url de YouTube/Vimeo/Drive",
      "ilustracion": "url de una imagen PNG/SVG con fondo transparente (opcional; si falta, se usa una ilustración isométrica genérica)",
      "recursos": [
        { "titulo": "Nombre del recurso", "resumen": "Subtítulo corto", "cuerpo": ["párrafo 1", "párrafo 2"] }
      ]
    },
    "eje1": { "...": "mismo formato que inicio" },
    "eje2": { "...": "mismo formato que inicio" },
    "eje3": { "...": "mismo formato que inicio" },
    "eje4": { "...": "mismo formato que inicio" },
    "cierre": { "...": "mismo formato que inicio" }
  }
}
```

El detalle completo de cada campo está documentado en el comentario al
inicio de `assets/js/main.js`.

## Publicar en GitHub Pages

```bash
git init
git add .
git commit -m "Publica el visor V2"
git branch -M main
git remote add origin https://github.com/ingsantiago123/recurso_incca_prueba_dise-o_canvas.git
git push -u origin main
```

Luego: **Settings → Pages → Source → Deploy from a branch → `main` / `root`**.
