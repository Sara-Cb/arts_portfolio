// src/stores/ui.js
import { defineStore } from "pinia";
import { ref, computed } from "vue";

export const useUiStore = defineStore("ui", () => {
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

  const sectionMap = ref({});
  const setSectionList = (page, list) => {
    sectionMap.value[page] = Array.isArray(list) ? list : [];
  };
  const getSectionList = (page) => sectionMap.value[page] || [];
  const clearSectionList = (page) => {
    delete sectionMap.value[page];
  };

  const isPlayerOpen = ref(false);
  const isSnapLocked = ref(false);
  const snapScrollEnabled = computed(
    () => !isSnapLocked.value && !isPlayerOpen.value
  );
  const openPlayer = () => (isPlayerOpen.value = true);
  const closePlayer = () => (isPlayerOpen.value = false);
  const lockSnap = () => (isSnapLocked.value = true);
  const unlockSnap = () => (isSnapLocked.value = false);

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
    findPageKeyForRoute,
  };
});
