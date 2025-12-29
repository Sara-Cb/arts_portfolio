/**
 * Gestisce navigazione verticale scroll-snap sincronizzata con route.
 * Coordina tre elementi: scroll nativo, route Vue, input utente (frecce/click).
 *
 * Sistema anti-bounce: previene loop infiniti route↔scroll usando lock temporanei.
 * IntersectionObserver monitora visibilità sezioni e aggiorna route automaticamente.
 * Keydown globale (singleton) permette navigazione con frecce da qualsiasi componente.
 */
import {
  onMounted,
  onBeforeUnmount,
  watch,
  nextTick,
  ref,
  computed,
  isRef,
  getCurrentInstance,
} from "vue";
import { useRoute, useRouter } from "vue-router";
import { useUiStore } from "@/stores/ui";

// ========== KEYDOWN GLOBAL SINGLETON ==========
// Gestisce listener keyboard condiviso tra più istanze del composable.
// Una sola istanza di event listener per l'intera applicazione,
// ogni componente registra il proprio callback nella Set.
const _keySubscribers = new Set();
let _keyBound = false;
function _globalKeyHandler(e) {
  if (e.key === "ArrowDown" || e.key === "PageDown") {
    e.preventDefault();
    _keySubscribers.forEach((cb) => cb(+1));
  } else if (e.key === "ArrowUp" || e.key === "PageUp") {
    e.preventDefault();
    _keySubscribers.forEach((cb) => cb(-1));
  }
}
function _ensureGlobalKeys() {
  if (_keyBound) return;
  window.addEventListener("keydown", _globalKeyHandler, { capture: true });
  document.addEventListener("keydown", _globalKeyHandler, { capture: true });
  _keyBound = true;
}
function _maybeRemoveGlobalKeys() {
  if (_keySubscribers.size > 0 || !_keyBound) return;
  window.removeEventListener("keydown", _globalKeyHandler, true);
  document.removeEventListener("keydown", _globalKeyHandler, true);
  _keyBound = false;
}
/* -------------------------------------------------------------- */

export function useVerticalNavigator({
  pageKey,
  containerSelector,
  sectionSelector = ".snapSection",
  keydownEnabled = true,
  routeScrollDebounce = 600,
  ioThreshold = 0.6,
  initialAlignFirst = true, // allinea PRIMA di attivare IO
  debug = false,
} = {}) {
  if (!getCurrentInstance()) {
    console.warn(
      "[useVerticalNavigator] Create the composable inside setup(), not in onMounted()."
    );
  }

  const route = useRoute();
  const router = useRouter();
  const ui = useUiStore();

  const pageKeyRef = isRef(pageKey) ? pageKey : ref(pageKey);

  // helpers
  const sortObj = (obj = {}) =>
    Object.keys(obj)
      .sort()
      .reduce((acc, k) => {
        acc[k] = obj[k];
        return acc;
      }, {});
  const normalizeEntry = (entry) => {
    if (!entry) return { name: "", params: {} };
    if (typeof entry === "string") return { name: entry, params: {} };
    return { name: entry.name || "", params: sortObj(entry.params || {}) };
  };
  const normalizeRoute = (r) => ({
    name: r?.name || "",
    params: sortObj(r?.params || {}),
  });
  const routeKey = (entryOrRoute) => {
    const { name, params } = normalizeEntry(entryOrRoute);
    return `${name}|${JSON.stringify(params)}`;
  };
  const sameLocation = (entry, r) =>
    routeKey(entry) === routeKey(normalizeRoute(r));
  const toRouteLocation = (entry) => {
    const { name, params } = normalizeEntry(entry);
    return { name, params };
  };

  const sections = computed(() => ui.getSectionList(pageKeyRef.value) || []);
  const queryPanels = () =>
    Array.from(
      document.querySelectorAll(`${containerSelector} > ${sectionSelector}`)
    );

  const activeIndex = computed(() =>
    sections.value.findIndex((e) => routeKey(e) === routeKey(route))
  );

  const sectionId = (entry) => {
    const { name, params } = normalizeEntry(entry);
    const slug = params.slug ? `-${params.slug}` : "";
    return (name + slug).replace(/[^a-z0-9_-]+/gi, "-");
  };

  const scrollToIndex = (idx, behavior = "smooth") => {
    const panels = queryPanels();
    if (debug) console.info("[VN] scrollToIndex", idx, "/", panels.length);
    panels[idx]?.scrollIntoView({ block: "start", behavior });
  };

  // ========== STATO ANTI-BOUNCE ==========
  // Previene loop infiniti: scroll cambia route → route cambia scroll → scroll cambia route...
  // lockRouteDrivenScroll: true mentre scroll è comandato da cambio route, blocca aggiornamento route da IO
  // programmaticRouteChange: true quando route cambia via pushToEntry/step, attiva alignToRoute nel watch
  let lockRouteDrivenScroll = false;
  let unlockTimer = null;
  let programmaticRouteChange = false;

  // ========== INTERSECTION OBSERVER ==========
  // Monitora visibilità sezioni, aggiorna route quando sezione diventa prevalente (>threshold).
  // Disabilitato (via lock) durante scroll comandato da route per evitare conflitti.
  let observer = null;

  function computeVisibilityRatio(el) {
    const r = el.getBoundingClientRect();
    const vh = window.innerHeight || document.documentElement.clientHeight;
    const visible = Math.max(0, Math.min(r.bottom, vh) - Math.max(r.top, 0));
    return visible / Math.max(1, r.height);
  }

  function setupObserver() {
    cleanupObserver();
    const panels = queryPanels();
    if (!panels.length) return;

    observer = new IntersectionObserver(
      (entries) => {
        let bestIdx = -1;
        let bestRatio = 0;
        for (const en of entries) {
          const i = panels.indexOf(en.target);
          if (i < 0) continue;
          const ratio =
            typeof en.intersectionRatio === "number"
              ? en.intersectionRatio
              : computeVisibilityRatio(en.target);
          if (ratio > bestRatio) {
            bestRatio = ratio;
            bestIdx = i;
          }
        }
        if (bestIdx < 0 || bestRatio < ioThreshold) return;
        if (lockRouteDrivenScroll) return;

        const entry = sections.value[bestIdx];
        if (entry && !sameLocation(entry, route)) {
          if (debug) console.info("[VN] IO -> router.replace", entry);
          router.replace(toRouteLocation(entry));
        }
      },
      { root: null, threshold: [0, 0.25, ioThreshold, 0.75, 1] }
    );

    panels.forEach((el) => observer.observe(el));
  }

  function cleanupObserver() {
    if (observer) {
      observer.disconnect();
      observer = null;
    }
  }

  // ---- route change (programmatico) -> scroll ----
  // Allinea scroll alla sezione corrispondente alla route attuale.
  // Ottimizzazione: skip se sezione già visibile oltre threshold, evita scroll inutili.
  // Attiva lock temporaneo per impedire che IO reagisca allo scroll appena comandato.
  function alignToRoute() {
    const idx = activeIndex.value;
    if (idx < 0) return;

    const target = queryPanels()[idx];
    if (target) {
      const ratio = computeVisibilityRatio(target);
      if (ratio >= ioThreshold) {
        if (debug)
          console.info("[VN] alignToRoute SKIP (already visible)", {
            idx,
            ratio,
          });
        return;
      }
    }

    lockRouteDrivenScroll = true;
    scrollToIndex(idx, "smooth");
    clearTimeout(unlockTimer);
    unlockTimer = setTimeout(() => {
      lockRouteDrivenScroll = false;
    }, routeScrollDebounce);
  }

  // API pubblica: naviga a una entry specifica (usata da dots, link interni)
  function pushToEntry(entry) {
    if (!entry) return;
    if (sameLocation(entry, route)) return;
    programmaticRouteChange = true;
    router.push(toRouteLocation(entry));
  }

  // Naviga di N sezioni (+1/-1) rispetto all'attuale.
  // Chiamata dal singleton keyboard per frecce ArrowUp/Down, PageUp/Down.
  // Attiva sia scroll che lock IO per coordinare cambio route successivo.
  function step(dir) {
    const idx = activeIndex.value;
    const next = Math.max(0, Math.min(sections.value.length - 1, idx + dir));
    if (next === idx) return;
    programmaticRouteChange = true;
    lockRouteDrivenScroll = true;
    scrollToIndex(next, "smooth");
    clearTimeout(unlockTimer);
    unlockTimer = setTimeout(() => {
      lockRouteDrivenScroll = false;
    }, routeScrollDebounce);
  }

  onMounted(() => {
    nextTick(() => {
      if (initialAlignFirst) {
        // Strategia: allinea scroll alla route PRIMA di attivare IO, evita flicker iniziale.
        // Lock brevissimo (50ms) impedisce che IO reagisca all'allineamento iniziale.
        lockRouteDrivenScroll = true;
        alignToRoute();
        setTimeout(() => {
          lockRouteDrivenScroll = false;
          setupObserver();
        }, 50);
      } else {
        setupObserver();
        alignToRoute();
      }
    });

    if (keydownEnabled) {
      _ensureGlobalKeys();
      _keySubscribers.add(step);
    }
  });

  onBeforeUnmount(() => {
    cleanupObserver();
    clearTimeout(unlockTimer);
    if (keydownEnabled) {
      _keySubscribers.delete(step);
      _maybeRemoveGlobalKeys();
    }
  });

  // Watch route: quando route cambia via pushToEntry/step (programmaticRouteChange=true),
  // sincronizza scroll. Altri cambi route (browser back/forward, link esterni) ignorati,
  // scroll gestito da IO oppure da router.beforeEach esterno.
  watch(
    () => route.fullPath,
    () => {
      if (programmaticRouteChange) {
        programmaticRouteChange = false;
        alignToRoute();
      }
    }
  );

  // Watch sections: quando lista sezioni cambia (progetti caricati), riallinea e riattiva IO.
  // Necessario per aggiornare DOM observer dopo mount asincrono dati.
  watch(sections, () => {
    nextTick(() => {
      alignToRoute();
      setupObserver();
    });
  });

  return {
    sections,
    activeIndex,
    sectionId,
    pushToEntry,
  };
}
