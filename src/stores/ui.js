// src/stores/ui.js
import { defineStore } from "pinia";
import { ref, computed } from "vue";

export const useUiStore = defineStore("ui", () => {
  /* ------------------------------------------------------------
   * Stato già esistente (NON toccato)
   * ---------------------------------------------------------- */
  const isPlayerOpen = ref(false);
  const isSnapLocked = ref(false);

  const snapScrollEnabled = computed(
    () => !isSnapLocked.value && !isPlayerOpen.value
  );

  function openPlayer() {
    isPlayerOpen.value = true;
  }
  function closePlayer() {
    isPlayerOpen.value = false;
  }
  function lockSnap() {
    isSnapLocked.value = true;
  }
  function unlockSnap() {
    isSnapLocked.value = false;
  }

  /* ------------------------------------------------------------
   * NUOVO: direzione transizione orizzontale tra pagine
   *  - 'left'  : entri da destra → pagina scorre verso sinistra
   *  - 'right' : entri da sinistra → pagina scorre verso destra
   * ---------------------------------------------------------- */
  const horizontalDirection = ref("left"); // default neutro

  function setHorizontalDirection(dir) {
    // piccola guardia per evitare valori strani
    horizontalDirection.value = dir === "right" ? "right" : "left";
  }

  return {
    // esistente
    isPlayerOpen,
    isSnapLocked,
    snapScrollEnabled,
    openPlayer,
    closePlayer,
    lockSnap,
    unlockSnap,

    // nuovo
    horizontalDirection,
    setHorizontalDirection,
  };
});
