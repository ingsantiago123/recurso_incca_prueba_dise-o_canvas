/*!
 * UNINCCA · Visor V2 "Canvas" — vanilla JS, sin frameworks, sin dependencias.
 * ---------------------------------------------------------------------
 * TODO el contenido del curso (título de cada eje, pregunta detonante,
 * video, recursos) llega como UN SOLO objeto JSON leído desde
 * `window.name` — no desde la URL (evita el límite de longitud/HTTP 414
 * cuando hay muchos recursos). Mismo patrón que el visor original de
 * UNINCCA: ver README.md para el contrato completo del JSON.
 *
 * FORMA RECOMENDADA (HTML estático generado por PHP, sin JS):
 *
 *   <iframe id="incca-hero-section" title="Visor de recurso UNINCCA"
 *     src="https://TU-USUARIO.github.io/TU-REPO/"
 *     name='{"curso":"...", "secciones":{"inicio":{...}, "eje1":{...}}}'>
 *   </iframe>
 *
 * ALTERNATIVA (si el padre arma el iframe por JS): fijar
 * `iframe.contentWindow.name` (NO `iframe.name`) ANTES de fijar el src.
 * Ver test-iframe.html para un ejemplo completo del patrón estático.
 *
 * Lo que es DISEÑO fijo (no contenido): los 6 ejes en sí (INICIO, EJE
 * 1-4, CIERRE), sus colores/íconos/orden, y su micro-copy de estado
 * ("Pregunta", "Conceptualicemos"...). Lo que es CONTENIDO (viene del
 * JSON, con placeholder por campo si falta): el nombre del curso, el
 * título grande de cada eje, la pregunta detonante, el video y los
 * recursos.
 * ------------------------------------------------------------------- */
(function () {
  "use strict";

  const $ = (sel, ctx) => (ctx || document).querySelector(sel);
  const $$ = (sel, ctx) => Array.from((ctx || document).querySelectorAll(sel));

  /* ---------------------------------------------------------------------
   * 1. Metadata fija de los 6 ejes (diseño, no contenido)
   * ------------------------------------------------------------------- */
  const EJES = [
    { id: "inicio", numero: null, etiqueta: "INICIO", estado: "Pregunta", color: "amarillo", filtro: "filtro-amarillo", icon: "question", watermark: "NUESTRA PREGUNTA" },
    { id: "eje1", numero: "1", etiqueta: "EJE 1", estado: "Conceptualicemos", color: "naranja", filtro: "filtro-naranja", icon: "notebook", watermark: "CONCEPTUALICEMOS" },
    { id: "eje2", numero: "2", etiqueta: "EJE 2", estado: "Analicemos", color: "azul-claro", filtro: "filtro-azul-claro", icon: "gears", watermark: "ANALICEMOS" },
    { id: "eje3", numero: "3", etiqueta: "EJE 3", estado: "Apliquemos", color: "azul-oscuro", filtro: "filtro-azul-oscuro", icon: "lego", watermark: "APLIQUEMOS" },
    { id: "eje4", numero: "4", etiqueta: "EJE 4", estado: "Evaluemos", color: "verde-claro", filtro: "filtro-verde-claro", icon: "bulb", watermark: "EVALUEMOS" },
    { id: "cierre", numero: null, etiqueta: "CIERRE", estado: "Cerremos", color: "verde-oscuro", filtro: "filtro-verde-oscuro", icon: "doc-search", watermark: "CERREMOS" }
  ];

  /* ---------------------------------------------------------------------
   * 2. Placeholders — SOLO se usan campo por campo cuando ese campo en
   *    particular no llegó en el JSON, para que sea obvio en pruebas qué
   *    es real y qué sigue pendiente (nunca un curso de ejemplo completo
   *    que parezca información real).
   * ------------------------------------------------------------------- */
  const SIN_DATOS_SECCION = {
    titulo_header: "Título de esta sección",
    pregunta: "Aquí aparecerá la pregunta detonante de esta sección.",
    video: "",
    recursos: []
  };
  const SIN_DATOS = { curso: "Nombre del curso", secciones: {} };

  function leerDatosDesdeWindowName() {
    try {
      if (!window.name) return null;
      const recibidos = JSON.parse(window.name);
      if (!recibidos || typeof recibidos !== "object") return null;
      return recibidos;
    } catch (e) {
      return null;
    }
  }

  function obtenerDatos() {
    const recibidos = leerDatosDesdeWindowName() || {};
    const seccionesRecibidas = (recibidos && typeof recibidos.secciones === "object" && recibidos.secciones) || {};
    const secciones = {};
    EJES.forEach((ej) => {
      const s = seccionesRecibidas[ej.id] || {};
      secciones[ej.id] = {
        titulo_header: s.titulo_header || SIN_DATOS_SECCION.titulo_header,
        pregunta: s.pregunta || SIN_DATOS_SECCION.pregunta,
        video: s.video || SIN_DATOS_SECCION.video,
        recursos: Array.isArray(s.recursos) ? s.recursos : SIN_DATOS_SECCION.recursos
      };
    });
    return {
      curso: recibidos.curso || SIN_DATOS.curso,
      secciones
    };
  }

  function toEmbedUrl(url) {
    if (!url) return "";
    const yt = url.match(/(?:youtu\.be\/|youtube\.com\/watch\?v=|youtube\.com\/embed\/)([\w-]{11})/);
    if (yt) return `https://www.youtube.com/embed/${yt[1]}?autoplay=1`;
    const vimeo = url.match(/vimeo\.com\/(\d+)/);
    if (vimeo) return `https://player.vimeo.com/video/${vimeo[1]}?autoplay=1`;
    const drive = url.match(/drive\.google\.com\/file\/d\/([\w-]+)/);
    if (drive) return `https://drive.google.com/file/d/${drive[1]}/preview`;
    return url;
  }

  /* ---------------------------------------------------------------------
   * 3. Iconografía "line-art" en SVG inline (sin dependencias externas)
   * ------------------------------------------------------------------- */
  const ICONS = {
    question: `<svg viewBox="0 0 100 100" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"><path d="M32 36c0-11 8-18 18-18s18 7 18 16c0 12-16 13-16 26"/><circle cx="50" cy="78" r="1.5" fill="#fff" stroke="none"/></svg>`,
    notebook: `<svg viewBox="0 0 100 100" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"><rect x="24" y="14" width="52" height="72" rx="4"/><line x1="24" y1="28" x2="12" y2="28"/><line x1="24" y1="42" x2="12" y2="42"/><line x1="24" y1="56" x2="12" y2="56"/><line x1="24" y1="70" x2="12" y2="70"/><line x1="36" y1="34" x2="64" y2="34"/><line x1="36" y1="46" x2="64" y2="46"/><line x1="36" y1="58" x2="56" y2="58"/></svg>`,
    gears: `<svg viewBox="0 0 100 100" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"><circle cx="38" cy="40" r="15"/><circle cx="38" cy="40" r="4" fill="#fff" stroke="none"/><g>${[0,45,90,135].map(a=>`<line x1="38" y1="17" x2="38" y2="9" transform="rotate(${a} 38 40)"/>`).join("")}</g><circle cx="68" cy="68" r="11"/><circle cx="68" cy="68" r="3" fill="#fff" stroke="none"/><g>${[0,60,120].map(a=>`<line x1="68" y1="51" x2="68" y2="45" transform="rotate(${a} 68 68)"/>`).join("")}</g></svg>`,
    lego: `<svg viewBox="0 0 100 100" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"><rect x="18" y="40" width="64" height="42" rx="4"/><circle cx="34" cy="26" r="8"/><circle cx="58" cy="26" r="8"/><line x1="34" y1="34" x2="34" y2="40"/><line x1="58" y1="34" x2="58" y2="40"/></svg>`,
    bulb: `<svg viewBox="0 0 100 100" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"><path d="M50 14c-14 0-24 10-24 23 0 9 5 14 9 19 3 3 5 6 5 11h20c0-5 2-8 5-11 4-5 9-10 9-19 0-13-10-23-24-23z"/><line x1="42" y1="79" x2="58" y2="79"/><line x1="44" y1="87" x2="56" y2="87"/></svg>`,
    "doc-search": `<svg viewBox="0 0 100 100" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"><path d="M28 12h30l14 14v52a4 4 0 0 1-4 4H28a4 4 0 0 1-4-4V16a4 4 0 0 1 4-4z"/><line x1="34" y1="34" x2="60" y2="34"/><line x1="34" y1="46" x2="52" y2="46"/><circle cx="66" cy="66" r="12"/><line x1="75" y1="75" x2="86" y2="86"/></svg>`
  };

  function isometricIllustration() {
    return `<svg viewBox="0 0 400 320" fill="none" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="200" cy="270" rx="150" ry="26" fill="#0E2A82" opacity=".5"/>
      <polygon points="200,120 320,180 200,240 80,180" fill="#2E9BE6"/>
      <polygon points="80,180 200,240 200,270 80,210" fill="#1E77BE"/>
      <polygon points="320,180 200,240 200,270 320,210" fill="#155C99"/>
      <g>
        <rect x="150" y="70" width="10" height="46" rx="3" fill="#146C43"/>
        <circle cx="155" cy="62" r="26" fill="#3FBF7F"/>
        <circle cx="140" cy="78" r="16" fill="#33A86C"/>
      </g>
      <g>
        <rect x="248" y="90" width="8" height="34" rx="3" fill="#146C43"/>
        <circle cx="252" cy="80" r="20" fill="#3FBF7F"/>
      </g>
      <g transform="translate(90,130)">
        <rect x="0" y="0" width="46" height="34" rx="10" fill="#fff"/>
        <polygon points="8,34 8,46 22,34" fill="#fff"/>
        <circle cx="14" cy="17" r="3.4" fill="#0B2A6B"/>
        <circle cx="23" cy="17" r="3.4" fill="#0B2A6B"/>
        <circle cx="32" cy="17" r="3.4" fill="#0B2A6B"/>
      </g>
      <g transform="translate(250,150)">
        <rect x="0" y="0" width="40" height="30" rx="9" fill="#FFC629"/>
        <polygon points="30,30 30,41 18,30" fill="#FFC629"/>
        <circle cx="12" cy="15" r="3" fill="#0B2A6B"/>
        <circle cx="20" cy="15" r="3" fill="#0B2A6B"/>
        <circle cx="28" cy="15" r="3" fill="#0B2A6B"/>
      </g>
      <g transform="translate(178,150)">
        <circle cx="22" cy="22" r="22" fill="#fff"/>
        <path d="M13 15c0-5 4-8 9-8s9 3 9 7c0 5-7 6-7 12" stroke="#0B2A6B" stroke-width="3.4" fill="none" stroke-linecap="round"/>
        <circle cx="22" cy="34" r="1.6" fill="#0B2A6B"/>
      </g>
    </svg>`;
  }

  function modalIllustration() {
    return `<svg viewBox="0 0 400 220" fill="none" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="200" cy="196" rx="150" ry="16" fill="#fff" opacity=".06"/>
      <polygon points="200,40 300,90 200,140 100,90" fill="#3862C7" opacity=".9"/>
      <polygon points="100,90 200,140 200,168 100,118" fill="#2A4EA0"/>
      <polygon points="300,90 200,140 200,168 300,118" fill="#1F3C82"/>
      <g transform="translate(150,4)">
        <circle cx="20" cy="20" r="20" fill="#FFC629"/>
        <circle cx="13" cy="17" r="2.6" fill="#0B2A6B"/>
        <circle cx="27" cy="17" r="2.6" fill="#0B2A6B"/>
        <path d="M12 26c3 3 13 3 16 0" stroke="#0B2A6B" stroke-width="2.4" fill="none" stroke-linecap="round"/>
      </g>
      <g transform="translate(70,60)">
        <rect width="34" height="26" rx="8" fill="#3FBF7F"/>
        <polygon points="26,26 26,36 14,26" fill="#3FBF7F"/>
      </g>
      <g transform="translate(300,64)">
        <rect width="30" height="24" rx="8" fill="#D6007F"/>
        <polygon points="6,24 6,33 16,24" fill="#D6007F"/>
      </g>
    </svg>`;
  }

  function mascotIllustration() {
    return "data:image/svg+xml;utf8," + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 110">
      <rect x="30" y="34" width="40" height="42" rx="12" fill="#21C15E"/>
      <circle cx="50" cy="18" r="16" fill="#21C15E"/>
      <circle cx="43" cy="16" r="4" fill="#0A1440"/>
      <circle cx="57" cy="16" r="4" fill="#0A1440"/>
      <rect x="44" y="25" width="12" height="3" rx="1.5" fill="#0A1440"/>
      <rect x="14" y="42" width="10" height="26" rx="5" fill="#21C15E"/>
      <rect x="76" y="42" width="10" height="26" rx="5" fill="#21C15E"/>
      <rect x="38" y="80" width="10" height="20" rx="5" fill="#0E9A48"/>
      <rect x="52" y="80" width="10" height="20" rx="5" fill="#0E9A48"/>
      <circle cx="50" cy="2" r="3" fill="#21C15E"/>
      <line x1="50" y1="2" x2="50" y2="6" stroke="#21C15E" stroke-width="2"/>
    </svg>`);
  }

  /* ---------------------------------------------------------------------
   * 4. Utilidades: toast, focus, scroll suave
   * ------------------------------------------------------------------- */
  let toastTimer = null;
  function showToast(message, iconSvg) {
    const toast = $("#toast");
    if (!toast) return;
    toast.innerHTML = `${iconSvg || `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><polyline points="20 6 9 17 4 12"/></svg>`}<span>${message}</span>`;
    toast.classList.add("is-visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("is-visible"), 3200);
  }

  function unlockScrollAndGoTo(targetEl) {
    document.body.classList.remove("scroll-locked");
    if (targetEl) {
      setTimeout(() => targetEl.scrollIntoView({ behavior: "smooth", block: "start" }), 60);
    }
  }

  /* ---------------------------------------------------------------------
   * 5. Hero — acordeón horizontal de 6 ejes
   * ------------------------------------------------------------------- */
  function renderHero(datos) {
    const hero = $("#hero");
    hero.innerHTML = EJES.map((ej) => `
      <div class="panel" role="button" tabindex="0" data-eje="${ej.id}" aria-label="${ej.etiqueta}">
        ${ej.id === "inicio"
          ? `<div class="panel-question-mark" aria-hidden="true">?</div>`
          : `<div class="panel-icon" aria-hidden="true">${ICONS[ej.icon]}</div>`}
        <div class="panel-footer">
          <div class="panel-footer-shape"><span class="panel-footer-label">${ej.etiqueta}</span></div>
        </div>
        <div class="panel-active-content">
          <div class="panel-watermark" aria-hidden="true"><span>${ej.watermark} ${ej.watermark} ${ej.watermark}</span></div>
          <span class="panel-active-tag">${ej.etiqueta}</span>
          <h2 class="panel-active-title">${datos.secciones[ej.id].titulo_header}</h2>
          <div class="panel-active-illustration">${isometricIllustration()}</div>
          <button class="panel-cta" type="button" data-cta="${ej.id}">
            ${ej.id === "inicio" ? "INICIAR MÓDULO" : "IR A ESTA SECCIÓN"}
            <span class="cta-arrow"><svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg></span>
          </button>
        </div>
      </div>
    `).join("");

    $$(".panel", hero).forEach((panelEl) => {
      panelEl.addEventListener("click", (e) => {
        if (e.target.closest("[data-cta]")) return; // el CTA maneja su propio click
        activateEje(panelEl.dataset.eje);
      });
      panelEl.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); activateEje(panelEl.dataset.eje); }
      });
    });
    $$("[data-cta]", hero).forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const id = btn.dataset.cta;
        activateEje(id);
        setActiveSection(id);
        unlockScrollAndGoTo($("#courseBody"));
      });
    });
  }

  function activateEje(id) {
    const hero = $("#hero");
    hero.classList.add("has-active");
    $$(".panel", hero).forEach((p) => p.classList.toggle("is-active", p.dataset.eje === id));
  }

  /* ---------------------------------------------------------------------
   * 6. Stepper persistente
   * ------------------------------------------------------------------- */
  function renderStepper() {
    $("#stepperNodes").innerHTML = EJES.map((ej) => `
      <button class="stepper-node" type="button" data-goto="${ej.id}" role="tab" aria-selected="false" aria-label="${ej.etiqueta}">
        <span class="stepper-node-label">${ej.etiqueta}</span>
      </button>
    `).join("");
    $$("[data-goto]", $("#stepper")).forEach((btn) => {
      btn.addEventListener("click", () => {
        setActiveSection(btn.dataset.goto);
        activateEje(btn.dataset.goto);
      });
    });
  }

  function updateStepper(id) {
    $$(".stepper-node").forEach((btn) => {
      const isCurrent = btn.dataset.goto === id;
      btn.classList.toggle("is-current", isCurrent);
      btn.setAttribute("aria-selected", String(isCurrent));
    });
  }

  /* ---------------------------------------------------------------------
   * 7. Dynamic Header + Split content + Recursos — según sección activa
   * ------------------------------------------------------------------- */
  let DATOS = null;
  let seccionActual = "inicio";

  function setActiveSection(id) {
    seccionActual = id;
    const ej = EJES.find((e) => e.id === id);
    const seccion = DATOS.secciones[id];

    updateStepper(id);

    const header = $("#dynamicHeader");
    header.className = "dynamic-header " + ej.filtro;
    $("#dynamicHeaderWatermark").textContent = ej.numero || "";
    $("#dynamicHeaderTag").textContent = `${ej.etiqueta} · ${ej.estado}`;
    $("#dynamicHeaderTitle").textContent = seccion.titulo_header;

    $("#splitQuestion").textContent = seccion.pregunta;

    const videoWrap = $("#splitVideo");
    const frame = $("#splitVideoFrame");
    videoWrap.classList.remove("is-playing");
    frame.classList.remove("is-visible");
    frame.src = "";
    frame.dataset.src = toEmbedUrl(seccion.video);
    $("#splitVideoPlay").hidden = !seccion.video;
    if (!seccion.video) videoWrap.classList.add("is-playing"); // oculta el play si no hay video

    renderResourceList(seccion.recursos, ej);
  }

  function initVideoPlay() {
    $("#splitVideoPlay").addEventListener("click", () => {
      const frame = $("#splitVideoFrame");
      if (!frame.dataset.src) return;
      frame.src = frame.dataset.src;
      frame.classList.add("is-visible");
      $("#splitVideo").classList.add("is-playing");
    });
  }

  /* ---------------------------------------------------------------------
   * 8. Lista de recursos + Modal
   * ------------------------------------------------------------------- */
  function renderResourceList(recursos, ej) {
    const list = $("#resourceList");
    if (!recursos.length) {
      list.innerHTML = `<div class="resource-empty">Esta sección todavía no tiene recursos.</div>`;
      return;
    }
    list.innerHTML = recursos.map((r, i) => `
      <button class="resource-card" type="button" data-resource-index="${i}">
        <span class="resource-num"><svg viewBox="0 0 100 100" fill="none" stroke="#fff" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"><path d="M20 18h40l20 20v46a4 4 0 0 1-4 4H20a4 4 0 0 1-4-4V22a4 4 0 0 1 4-4z"/></svg>${i + 1}</span>
        <span class="resource-title">${r.titulo || "Recurso sin título"}</span>
        <span class="resource-plus"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg></span>
      </button>
    `).join("");

    $$("[data-resource-index]", list).forEach((btn) => {
      btn.addEventListener("click", () => openResourceModal(recursos[Number(btn.dataset.resourceIndex)], ej));
    });
  }

  function openResourceModal(recurso, ej) {
    $("#resourceModalIllustration").innerHTML = modalIllustration();
    $("#resourceModalEyebrow").textContent = `${ej.etiqueta} · ${DATOS.curso}`;
    $("#resourceModalTitle").textContent = recurso.titulo || "Recurso sin título";
    $("#resourceModalSubtitle").textContent = recurso.resumen || "";
    $("#resourceModalSubtitle").hidden = !recurso.resumen;
    $("#resourceModalBody").innerHTML = (recurso.cuerpo && recurso.cuerpo.length)
      ? recurso.cuerpo.map((p) => `<p>${p}</p>`).join("")
      : `<p>El contenido detallado de este recurso aparecerá aquí.</p>`;
    $("#resourceModalMascot").src = mascotIllustration();
    $("#resourceModalOverlay").classList.add("is-open");
    document.body.classList.add("scroll-locked");
  }

  function closeResourceModal() {
    $("#resourceModalOverlay").classList.remove("is-open");
    document.body.classList.remove("scroll-locked");
  }

  function initModal() {
    $("#resourceModalClose").addEventListener("click", closeResourceModal);
    $("#resourceModalOverlay").addEventListener("click", (e) => {
      if (e.target.id === "resourceModalOverlay") closeResourceModal();
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && $("#resourceModalOverlay").classList.contains("is-open")) closeResourceModal();
    });
  }

  /* ---------------------------------------------------------------------
   * 9. Top bar: menú lateral, "ver como estudiante", lector inmersivo
   * ------------------------------------------------------------------- */
  function renderSideMenu() {
    $("#sideMenuItems").innerHTML = EJES.map((ej) => `
      <button class="side-menu-item" type="button" data-goto="${ej.id}">
        <span class="dot" style="background:var(--${ej.color})"></span>
        ${ej.etiqueta} · ${ej.estado}
      </button>
    `).join("");
    $$("[data-goto]", $("#sideMenuItems")).forEach((btn) => {
      btn.addEventListener("click", () => {
        activateEje(btn.dataset.goto);
        setActiveSection(btn.dataset.goto);
        unlockScrollAndGoTo($("#courseBody"));
        closeSideMenu();
      });
    });
  }

  function openSideMenu() { $("#sideMenuOverlay").classList.add("is-open"); $("#menuToggle").setAttribute("aria-expanded", "true"); }
  function closeSideMenu() { $("#sideMenuOverlay").classList.remove("is-open"); $("#menuToggle").setAttribute("aria-expanded", "false"); }

  function initTopbar() {
    $("#menuToggle").addEventListener("click", () => {
      $("#sideMenuOverlay").classList.contains("is-open") ? closeSideMenu() : openSideMenu();
    });
    $("#sideMenuClose").addEventListener("click", closeSideMenu);
    $("#sideMenuOverlay").addEventListener("click", (e) => { if (e.target.id === "sideMenuOverlay") closeSideMenu(); });

    $("#studentViewBtn").addEventListener("click", () => {
      const btn = $("#studentViewBtn");
      const active = btn.classList.toggle("is-active");
      showToast(active ? "Vista de estudiante activada." : "Vista de estudiante desactivada.");
    });

    $("#immersiveReaderBtn").addEventListener("click", () => {
      const btn = $("#immersiveReaderBtn");
      if (!("speechSynthesis" in window)) {
        showToast("El lector inmersivo no está disponible en este navegador.");
        return;
      }
      if (window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
        btn.classList.remove("is-active");
        return;
      }
      const titulo = $("#dynamicHeaderTitle").textContent;
      const pregunta = $("#splitQuestion").textContent;
      const utter = new SpeechSynthesisUtterance(`${titulo}. ${pregunta}`);
      utter.lang = "es-ES";
      utter.onend = () => btn.classList.remove("is-active");
      btn.classList.add("is-active");
      window.speechSynthesis.speak(utter);
      showToast("Leyendo en voz alta la sección actual…");
    });
  }

  /* ---------------------------------------------------------------------
   * Init
   * ------------------------------------------------------------------- */
  document.addEventListener("DOMContentLoaded", () => {
    DATOS = obtenerDatos();
    document.title = `${DATOS.curso} — UNINCCA`;

    renderHero(DATOS);
    renderStepper();
    renderSideMenu();
    setActiveSection("inicio");
    initVideoPlay();
    initModal();
    initTopbar();
  });
})();
