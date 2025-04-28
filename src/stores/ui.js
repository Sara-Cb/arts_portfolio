import { defineStore } from "pinia";
import { ref, computed } from "vue";

export const useUiStore = defineStore("ui", () => {
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

  return {
    isPlayerOpen,
    isSnapLocked,
    snapScrollEnabled,
    openPlayer,
    closePlayer,
    lockSnap,
    unlockSnap,
  };
});
