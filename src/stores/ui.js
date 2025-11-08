// src/stores/ui.js
import { defineStore } from "pinia";
import { ref, computed } from "vue";

export const useUiStore = defineStore("ui", () => {
  // ------- ORDINAMENTO PAGINE (orizzontale tra view) -------
  const pageOrder = ref([
    "rahem", // home = "/"
    "materical",
    "visual",
    "performance",
    "music",
  ]);
  const pageIndexOf = (name) => pageOrder.value.indexOf(name);

  // Direzione e flag per App.vue
  const horizontalDirection = ref("left"); // 'left' | 'right'
  const isCrossPageTransition = ref(false);
  const setHorizontalDirection = (dir) =>
    (horizontalDirection.value = dir === "right" ? "right" : "left");
  const setCrossPageTransition = (flag) =>
    (isCrossPageTransition.value = !!flag);

  // ------- SEZIONI PER PAGINA (verticale nelle view) -------
  // Esempio: 'rahem' → [{name:'rahem'},{name:'projects'},{name:'visit-card'}]
  const sectionMap = ref({});
  const setSectionList = (page, list) => {
    sectionMap.value[page] = Array.isArray(list) ? list : [];
  };
  const getSectionList = (page) => sectionMap.value[page] || [];
  const clearSectionList = (page) => {
    delete sectionMap.value[page];
  };

  // ------- opzionale: player / snap lock -------
  const isPlayerOpen = ref(false);
  const isSnapLocked = ref(false);
  const snapScrollEnabled = computed(
    () => !isSnapLocked.value && !isPlayerOpen.value
  );
  const openPlayer = () => (isPlayerOpen.value = true);
  const closePlayer = () => (isPlayerOpen.value = false);
  const lockSnap = () => (isSnapLocked.value = true);
  const unlockSnap = () => (isSnapLocked.value = false);

  // ------- helpers per il guard orizzontale -------
  function sameParams(a = {}, b = {}) {
    const ak = Object.keys(a),
      bk = Object.keys(b);
    if (ak.length !== bk.length) return false;
    return ak.every((k) => a[k] === b[k]);
  }
  function equalsEntry(entry, name, params) {
    if (!entry) return false;
    if (typeof entry === "string") return entry === name;
    return entry.name === name && sameParams(entry.params || {}, params || {});
  }
  /** Trova la pageKey (chiave in sectionMap) che contiene la rotta {name, params} */
  function findPageKeyForRoute(name, params = {}) {
    const map = sectionMap.value || {};
    for (const key of Object.keys(map)) {
      const list = map[key] || [];
      if (list.some((e) => equalsEntry(e, name, params))) return key;
    }
    return null;
  }

  return {
    // orizzontale
    pageOrder,
    pageIndexOf,
    horizontalDirection,
    isCrossPageTransition,
    setHorizontalDirection,
    setCrossPageTransition,

    // verticale
    sectionMap,
    setSectionList,
    getSectionList,
    clearSectionList,

    // opzionale
    isPlayerOpen,
    isSnapLocked,
    snapScrollEnabled,
    openPlayer,
    closePlayer,
    lockSnap,
    unlockSnap,

    // helpers per router guard / indicator
    findPageKeyForRoute,
    // sameParams, equalsEntry,
  };
});
