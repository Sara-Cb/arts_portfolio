// Direttiva per mostrare loader durante il caricamento delle immagini
import { createApp, h } from "vue";
import LoaderOuroboros from "@/components/LoaderOuroboros.vue";

function showLoader(el) {
  // Assicurati che il parent dell'immagine sia posizionato
  const parent = el.parentNode;
  if (!parent) return null;

  const parentPosition = window.getComputedStyle(parent).position;
  if (parentPosition === "static") {
    parent.style.position = "relative";
  }

  // Crea container per il loader come sibling dell'immagine
  const loaderContainer = document.createElement("div");
  loaderContainer.style.position = "absolute";
  loaderContainer.style.inset = "0";
  loaderContainer.style.zIndex = "10";
  loaderContainer.style.pointerEvents = "none";

  // Inserisci loader dopo l'immagine
  parent.insertBefore(loaderContainer, el.nextSibling);

  // Monta il componente Vue nel container
  const loaderApp = createApp({
    render() {
      return h(LoaderOuroboros);
    },
  });
  loaderApp.mount(loaderContainer);

  return { loaderContainer, loaderApp };
}

function hideLoader(loaderData) {
  if (!loaderData) return;
  const { loaderContainer, loaderApp } = loaderData;

  if (loaderContainer && loaderContainer.parentNode) {
    loaderApp.unmount();
    loaderContainer.remove();
  }
}

function setupImageLoader(el) {
  // Solo per elementi img
  if (el.tagName !== "IMG") return;

  // Mostra loader
  const loaderData = showLoader(el);
  if (!loaderData) return;

  // Nascondi loader quando l'immagine è caricata
  const onLoad = () => {
    hideLoader(loaderData);
  };

  const onError = () => {
    hideLoader(loaderData);
    console.warn("Image failed to load:", el.src);
  };

  // Se l'immagine è già caricata (cache)
  if (el.complete && el.naturalHeight !== 0) {
    hideLoader(loaderData);
  } else {
    el.addEventListener("load", onLoad, { once: true });
    el.addEventListener("error", onError, { once: true });
  }

  // Store cleanup function
  el._loaderData = loaderData;
}

export default {
  mounted(el, binding) {
    setupImageLoader(el);
  },

  updated(el, binding) {
    // Quando il src cambia, pulisci il vecchio loader e creane uno nuovo
    if (el._loaderData) {
      hideLoader(el._loaderData);
      el._loaderData = null;
    }
    setupImageLoader(el);
  },

  beforeUnmount(el) {
    if (el._loaderData) {
      hideLoader(el._loaderData);
      el._loaderData = null;
    }
  },
};
