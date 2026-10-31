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
// Una sola istanza di listener keyboard per tutta l'app.
// FIX: registrato solo su window (non anche su document) per evitare
// che ogni tasto scatti il callback due volte.
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
  _keyBound = true;
}
function _maybeRemoveGlobalKeys() {
  if (_keySubscribers.size > 0 || !_keyBound) return;
  window.removeEventListener("keydown", _globalKeyHandler, true);
  _keyBound = false;
}
/* -------------------------------------------------------------- */

/**
 * Genera l'id DOM di una sezione di navigazione.
 * Formula condivisa tra useVerticalNavigator, ScrollIndicator e le view.
 * @param {string} routeName - nome della route (es. "materical-project")
 * @param {string} [slug]    - slug del progetto, se presente
 */
export function makeSectionId(routeName, slug) {
  const suffix = slug ? `-${slug}` : "";
  return `${routeName}${suffix}`.replace(/[^a-z0-9_-]+/gi, "-");
}

export function useVerticalNavigator({
  pageKey,
  containerSelector,
  sectionSelector = ".snapSection",
  keydownEnabled = true,
  routeScrollDebounce = 600,
  ioThreshold = 0.6,
  initialAlignFirst = true,
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
    return makeSectionId(name, params.slug);
  };

  const scrollToIndex = (idx, behavior = "smooth") => {
    const panels = queryPanels();
    if (debug) console.info("[VN] scrollToIndex", idx, "/", panels.length);
    panels[idx]?.scrollIntoView({ block: "start", behavior });
  };

  // ========== STATO ANTI-BOUNCE ==========
  let lockRouteDrivenScroll = false;
  let unlockTimer = null;
  // FIX: traccia l'entry specifica della pushToEntry anziché un booleano generico,
  // così navigate rapide consecutive non perdono l'allineamento.
  let lastProgrammaticEntry = null;

  // ========== INTERSECTION OBSERVER ==========
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

        // FIX: non aggiornare la route se è in corso una transizione orizzontale
        // (il componente potrebbe essere ancora nella leave-animation)
        if (ui.isCrossPageTransition) return;

        // FIX: non aggiornare la route se questo componente non appartiene
        // alla pagina corrente (evita che l'IO della leave-animation forzi
        // router.replace sulla pagina di destinazione)
        const currentPageKey = ui.findPageKeyForRoute(route.name, route.params);
        if (currentPageKey !== pageKeyRef.value) return;

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
    // "instant": alignToRoute è una correzione posizionale, non navigazione utente.
    // Smooth scrolling tra snap-sections produce un frame "vuoto" (sfondo scuro)
    // mentre passa tra le sezioni, specialmente al termine di una transizione orizzontale.
    // La navigazione smooth è gestita da step() su input utente (frecce/dot).
    scrollToIndex(idx, "instant");
    clearTimeout(unlockTimer);
    unlockTimer = setTimeout(() => {
      lockRouteDrivenScroll = false;
    }, routeScrollDebounce);
  }

  // API pubblica: naviga a una entry specifica (dot ScrollIndicator, link interni)
  function pushToEntry(entry) {
    if (!entry) return;
    if (sameLocation(entry, route)) return;
    // FIX: traccia l'entry attesa per allineare solo quando la route giusta arriva
    lastProgrammaticEntry = toRouteLocation(entry);
    router.push(toRouteLocation(entry));
  }

  // Naviga di N sezioni (+1/-1) con i tasti freccia.
  function step(dir) {
    // FIX: blocca navigazione verticale durante transizioni orizzontali tra pagine
    if (ui.isCrossPageTransition) return;
    // FIX: blocca se una navigazione verticale è già in corso (evita skip multipli)
    if (lockRouteDrivenScroll) return;

    const idx = activeIndex.value;
    const next = Math.max(0, Math.min(sections.value.length - 1, idx + dir));
    if (next === idx) return;

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
    // FIX: azzera lo stato al dismount per non lasciare lock attivi
    lockRouteDrivenScroll = false;
    lastProgrammaticEntry = null;
    if (keydownEnabled) {
      _keySubscribers.delete(step);
      _maybeRemoveGlobalKeys();
    }
  });

  // Watch route: allinea lo scroll quando pushToEntry porta alla route attesa.
  // FIX: controlla l'entry specifica anziché un flag booleano generico,
  // così navigate rapide consecutive funzionano tutte correttamente.
  watch(
    () => route.fullPath,
    () => {
      if (!lastProgrammaticEntry) return;
      const expectedKey = `${lastProgrammaticEntry.name}|${JSON.stringify(
        sortObj(lastProgrammaticEntry.params || {})
      )}`;
      if (expectedKey === routeKey(route)) {
        lastProgrammaticEntry = null;
        alignToRoute();
      }
    }
  );

  // Watch sections: riallinea e riattiva IO quando la lista sezioni cambia.
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
