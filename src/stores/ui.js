/**
 * Store UI: gestione stato interfaccia, transizioni, navigazione.
 *
 * Coordina:
 * - Ordine e direzione transizioni orizzontali tra pagine
 * - Mapping route → page per calcolo automatico direzione slide
 * - Stato snap-scroll (disabilitato quando player aperto)
 * - Preparazione navigazione verticale (no history) vs orizzontale (con transizioni)
 */
import { defineStore } from "pinia";
import { ref, computed } from "vue";

export const useUiStore = defineStore("ui", () => {
  // ========== PAGINE E TRANSIZIONI ORIZZONTALI ==========
  const pageOrder = ref([
    "rahem",
    "materical",
    "visual",
    "performance",
    "music",
  ]);
  const pageIndexOf = (name) => pageOrder.value.indexOf(name);

  const horizontalDirection = ref("left");
  const isCrossPageTransition = ref(false);
  const setHorizontalDirection = (dir) =>
    (horizontalDirection.value = dir === "right" ? "right" : "left");
  const setCrossPageTransition = (flag) =>
    (isCrossPageTransition.value = !!flag);

  // ========== SEZIONI E MAPPING ROUTE → PAGE ==========
  // Ogni pagina (rahem, materical, visual) può avere N sezioni verticali
  // sectionMap[pageKey] = [{name, params}, ...] descrive le route di quella pagina
  const sectionMap = ref({});
  const setSectionList = (page, list) => {
    sectionMap.value[page] = Array.isArray(list) ? list : [];
  };
  const getSectionList = (page) => sectionMap.value[page] || [];
  const clearSectionList = (page) => {
    delete sectionMap.value[page];
  };

  // ========== SNAP SCROLL E PLAYER ==========
  // Snap-scroll disabilitato quando player è aperto o quando lockato manualmente
  const isPlayerOpen = ref(false);
  const isSnapLocked = ref(false);
  const snapScrollEnabled = computed(
    () => !isSnapLocked.value && !isPlayerOpen.value
  );
  const openPlayer = () => (isPlayerOpen.value = true);
  const closePlayer = () => (isPlayerOpen.value = false);
  const lockSnap = () => (isSnapLocked.value = true);
  const unlockSnap = () => (isSnapLocked.value = false);

  // ========== NAVIGAZIONE VERTICALE ==========
  // Flag temporaneo (100ms) per indicare navigazione verticale in corso
  // Impedisce attivazione transizioni orizzontali durante scroll interno pagina
  const isNavigatingVertically = ref(false);

  function prepareVerticalNavigation() {
    isNavigatingVertically.value = true;
    setCrossPageTransition(false);
    setTimeout(() => {
      isNavigatingVertically.value = false;
    }, 100);
  }

  // ========== NAVIGAZIONE ORIZZONTALE ==========
  // Calcola direzione slide confrontando indici pagine from/to
  // Direzione "left" = pagina entra da destra (indice aumenta)
  // Direzione "right" = pagina entra da sinistra (indice diminuisce)
  function prepareHorizontalNavigation(fromName, fromParams, toName, toParams) {
    const fromKey = findPageKeyForRoute(fromName, fromParams);
    const toKey = findPageKeyForRoute(toName, toParams);

    if (fromKey && toKey && fromKey !== toKey) {
      const fi = pageIndexOf(fromKey);
      const ti = pageIndexOf(toKey);
      setHorizontalDirection(ti > fi ? "left" : "right");
      setCrossPageTransition(true);
    } else {
      setCrossPageTransition(false);
    }
  }

  // Trova page key cercando in sectionMap quale lista contiene la route data
  // Fallback: usa primo segmento del route name (es. "materical-project" → "materical")
  function findPageKeyForRoute(name, params = {}) {
    const sameParams = (a = {}, b = {}) => {
      const ak = Object.keys(a).sort(),
        bk = Object.keys(b).sort();
      if (ak.length !== bk.length) return false;
      return ak.every((k) => a[k] === b[k]);
    };
    for (const key of Object.keys(sectionMap.value || {})) {
      const list = sectionMap.value[key] || [];
      if (
        list.some((e) =>
          typeof e === "string"
            ? e === name
            : e?.name === name && sameParams(e.params || {}, params)
        )
      )
        return key;
    }
    return String(name).split("-")[0] || null;
  }

  return {
    pageOrder,
    pageIndexOf,
    horizontalDirection,
    isCrossPageTransition,
    setHorizontalDirection,
    setCrossPageTransition,
    sectionMap,
    setSectionList,
    getSectionList,
    clearSectionList,
    isPlayerOpen,
    isSnapLocked,
    snapScrollEnabled,
    openPlayer,
    closePlayer,
    lockSnap,
    unlockSnap,
    isNavigatingVertically,
    prepareVerticalNavigation,
    prepareHorizontalNavigation,
    findPageKeyForRoute,
  };
});
