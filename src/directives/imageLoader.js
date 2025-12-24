// Direttiva ottimizzata per mostrare loader durante il caricamento delle immagini
// Usa DOM puro invece di creare istanze Vue per migliori performance

const SVG_LOADER = `
<svg class="ouroboros-svg" viewBox="0 0 50 50" xmlns="http://www.w3.org/2000/svg">
  <circle class="ouroboros-circle" cx="25" cy="25" r="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-dasharray="125.6" />
  <circle cx="25" cy="5" r="2.5" fill="currentColor" />
</svg>
`;

const LOADER_STYLES = `
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(13, 13, 14, 0.5);
  z-index: 5;
`;

const SVG_STYLES = `
  width: 48px;
  height: 48px;
  color: rgb(229, 229, 229);
  animation: spin 1.5s linear infinite;
`;

// Inject keyframes only once
let keyframesInjected = false;
function injectKeyframes() {
  if (keyframesInjected) return;

  const style = document.createElement('style');
  style.textContent = `
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    @keyframes dash {
      0% { stroke-dashoffset: 125.6; }
      50% { stroke-dashoffset: 0; }
      100% { stroke-dashoffset: -125.6; }
    }
    .ouroboros-circle {
      stroke-dashoffset: 0;
      transform-origin: center;
      animation: dash 1.5s ease-in-out infinite;
    }
  `;
  document.head.appendChild(style);
  keyframesInjected = true;
}

function showLoader(el) {
  // Assicurati che il parent dell'immagine sia posizionato
  const parent = el.parentNode;
  if (!parent) return null;

  const parentPosition = window.getComputedStyle(parent).position;
  if (parentPosition === "static") {
    parent.style.position = "relative";
  }

  // Crea container per il loader
  const loaderContainer = document.createElement("div");
  loaderContainer.className = "ouroboros-loader";
  loaderContainer.style.cssText = LOADER_STYLES;
  loaderContainer.innerHTML = SVG_LOADER;

  // Apply SVG styles
  const svg = loaderContainer.querySelector('.ouroboros-svg');
  if (svg) {
    svg.style.cssText = SVG_STYLES;
  }

  // Inserisci loader dopo l'immagine
  parent.insertBefore(loaderContainer, el.nextSibling);

  return loaderContainer;
}

function hideLoader(loaderContainer) {
  if (!loaderContainer || !loaderContainer.parentNode) return;
  loaderContainer.remove();
}

function setupImageLoader(el) {
  // Solo per elementi img
  if (el.tagName !== "IMG") return;

  // Inject keyframes if not already done
  injectKeyframes();

  // Mostra loader
  const loaderContainer = showLoader(el);
  if (!loaderContainer) return;

  // Nascondi loader quando l'immagine è caricata
  const onLoad = () => {
    hideLoader(loaderContainer);
  };

  const onError = () => {
    hideLoader(loaderContainer);
    console.warn("Image failed to load:", el.src);
  };

  // Se l'immagine è già caricata (cache)
  if (el.complete && el.naturalHeight !== 0) {
    hideLoader(loaderContainer);
  } else {
    el.addEventListener("load", onLoad, { once: true });
    el.addEventListener("error", onError, { once: true });
  }

  // Store cleanup reference
  el._loaderContainer = loaderContainer;
}

export default {
  mounted(el) {
    setupImageLoader(el);
  },

  updated(el) {
    // Quando il src cambia, pulisci il vecchio loader e creane uno nuovo
    if (el._loaderContainer) {
      hideLoader(el._loaderContainer);
      el._loaderContainer = null;
    }
    setupImageLoader(el);
  },

  beforeUnmount(el) {
    if (el._loaderContainer) {
      hideLoader(el._loaderContainer);
      el._loaderContainer = null;
    }
  },
};
