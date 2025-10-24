// src/stores/routeMeta.js
import { defineStore } from "pinia";
import { ref, computed } from "vue";

export const useRouteMetaStore = defineStore("routeMeta", () => {
  /* ------------------------------------------------------------
   * COMPATIBILITÀ CON HOME (CAMBIARE QUI ROMPEREBBE HOME)
   * ---------------------------------------------------------- */
  const currentPageIndex = ref(null);
  const currentSectionIndex = ref(null);
  const transitionDirection = ref("forward"); // 'backward' | 'up' | 'down'
  const transitionType = ref("horizontal"); // 'vertical' | 'none'

  let lastPageIndex = null;
  let lastSectionIndex = null;

  // 🔴 ATTENZIONE: Home si aspetta queste chiavi e questi nomi.
  //   Non rimuoverle. Le pagine con "-project" sono solo segnaposto legacy:
  //   per Materical useremo una sectionList dinamica separata (vedi più sotto).
  const legacySectionMap = {
    home: ["home-default", "home-projects", "home-visit"],
    performance: ["performance", "performance-project"],
    visual: ["visual", "visual-project"],
    materical: ["materical", "materical-project"],
    music: ["music", "music-project"],
  };

  function updateMetaFromRoute(route) {
    // Usato da Home (meta.pageIndex / meta.sectionIndex)
    const pageIndex = route.meta.pageIndex;
    const sectionIndex = route.meta.sectionIndex;

    if (pageIndex != null && sectionIndex != null) {
      if (lastPageIndex === null && lastSectionIndex === null) {
        transitionType.value = "none";
        transitionDirection.value = "forward";
      } else {
        transitionType.value =
          pageIndex === lastPageIndex ? "vertical" : "horizontal";

        if (transitionType.value === "vertical") {
          transitionDirection.value =
            sectionIndex > lastSectionIndex ? "down" : "up";
        } else {
          transitionDirection.value =
            pageIndex > lastPageIndex ? "forward" : "backward";
        }
      }

      currentPageIndex.value = pageIndex;
      currentSectionIndex.value = sectionIndex;
      lastPageIndex = pageIndex;
      lastSectionIndex = sectionIndex;
    }
  }

  /* ------------------------------------------------------------
   * NUOVE API (MATERICAL & FUTURO): ORDER PAGINE + SECTION LIST DINAMICHE
   * ---------------------------------------------------------- */

  // Ordine globale delle PAGINE (non delle sezioni)
  // Usato dal guard del router per decidere la direzione orizzontale.
  const pageOrder = ref([
    "home",
    "materical",
    "visual",
    "performance",
    "music",
  ]);

  // Getter per ottenere l'indice di una pagina
  const pageIndexOf = (pageName) => pageOrder.value.indexOf(pageName);

  // Variante computed se preferisci usarla come getter Pinia
  const pageIndex = computed(() => (pageName) => pageIndexOf(pageName));

  // Section lists dinamiche per lo SNAP VERTICALE:
  // - chiave: root page (es. 'materical')
  // - valore: array ORDINATO di stringhe o oggetti { name, params }
  //   Esempio Materical: [{ name:'materical' }, { name:'materical-project', params:{slug:'p1'} }, ...]
  const sectionMap = ref({
    // pre-seediamo con le info legacy così Home continua a funzionare anche se legge qui
    home: legacySectionMap.home.slice(),
    performance: legacySectionMap.performance.slice(),
    visual: legacySectionMap.visual.slice(),
    materical: legacySectionMap.materical.slice(),
    music: legacySectionMap.music.slice(),
  });

  // API: sostituisci completamente la lista sezioni per una pagina
  function setSectionList(page, list) {
    sectionMap.value[page] = Array.isArray(list) ? list : [];
  }

  // API: pulisci la lista sezioni per una pagina (usato su beforeUnmount della view)
  function clearSectionList(page) {
    delete sectionMap.value[page];
  }

  // API: leggi la lista sezioni per una pagina (fallback a array vuoto)
  function getSectionList(page) {
    return sectionMap.value[page] || [];
  }

  /* ------------------------------------------------------------
   * EXPORT
   * ---------------------------------------------------------- */
  return {
    // Legacy per Home (non toccare)
    currentPageIndex,
    currentSectionIndex,
    transitionDirection,
    transitionType,
    updateMetaFromRoute,

    // Legacy map (esposta solo se qualche componente vecchio la usa esplicitamente)
    // Non usarla nel nuovo codice; usa 'sectionMap' reattiva + API.
    legacySectionMap,

    // Nuovo modello
    pageOrder,
    pageIndex, // computed getter: pageIndex(pageName)
    pageIndexOf, // funzione utility (stesso scopo, forma diversa)
    sectionMap, // reattiva (Record<page, array>)
    setSectionList,
    clearSectionList,
    getSectionList,
  };
});
