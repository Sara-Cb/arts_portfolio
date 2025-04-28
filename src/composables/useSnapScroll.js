import { ref, onMounted, onBeforeUnmount, watch, nextTick } from "vue";
import { useRoute } from "vue-router";
import { storeToRefs } from "pinia";
import { useEnvironmentStore } from "@/stores/environment";
import { useUiStore } from "@/stores/ui";

/**
 * Snap‑scroll composable (v5)
 * — Wheel listener sul container con accumulator → 1 sola sezione per gesto.
 * — `passive:false` confermato, previene lo scroll nativo.
 */
export function useSnapScroll({
  containerSelector = ".scrollContainer",
  sectionSelector = ".snapSection",
  scrollDelay = 700,
  externalEnabled = ref(true),
} = {}) {
  /* ------------------------------------------------------------
   *  STORES
   * ---------------------------------------------------------- */
  const { snapScrollEnabled } = storeToRefs(useUiStore());
  const envStore = useEnvironmentStore();
  const { isMobile, isTouch } = storeToRefs(envStore);

  /* ------------------------------------------------------------
   *  STATE
   * ---------------------------------------------------------- */
  const currentIndex = ref(0);
  const scrollEnabled = ref(true);
  let isScrolling = false;
  let sections = [];
  let containerEl = null;

  const route = useRoute();

  /* ------------------------------------------------------------
   *  HELPERS
   * ---------------------------------------------------------- */
  const enabled = () =>
    scrollEnabled.value && externalEnabled.value && snapScrollEnabled.value;

  function unlockScroll() {
    isScrolling = false;
  }

  function scrollToSection(index) {
    if (index < 0 || index >= sections.length) return;
    isScrolling = true;
    sections[index].scrollIntoView({ behavior: "smooth" });
    currentIndex.value = index;
    setTimeout(unlockScroll, scrollDelay);
  }

  const scrollNext = () => scrollToSection(currentIndex.value + 1);
  const scrollPrev = () => scrollToSection(currentIndex.value - 1);

  /* ------------------------------------------------------------
   *  EVENT HANDLERS
   * ---------------------------------------------------------- */
  const normalizeDelta = (e) => (e.deltaMode === 1 ? e.deltaY * 30 : e.deltaY); // Firefox line‑mode fix

  let wheelAccum = 0;
  const WHEEL_THRESHOLD = 500; // px equivalenti

  const handleWheel = (e) => {
    if (!enabled() || isScrolling || isMobile.value) return;
    e.preventDefault();

    wheelAccum += normalizeDelta(e);

    if (Math.abs(wheelAccum) < WHEEL_THRESHOLD) return;

    const dir = Math.sign(wheelAccum);
    wheelAccum = 0; // reset per il prossimo gesto
    dir > 0 ? scrollNext() : scrollPrev();
  };

  const handleKeyDown = (e) => {
    if (!enabled() || isScrolling || isMobile.value) return;
    if (e.key === "ArrowDown" || e.key === "PageDown") {
      e.preventDefault();
      scrollNext();
    }
    if (e.key === "ArrowUp" || e.key === "PageUp") {
      e.preventDefault();
      scrollPrev();
    }
  };

  /* Touch */
  let touchStartY = 0;
  const handleTouchStart = (e) => {
    if (!enabled() || !isTouch.value) return;
    touchStartY = e.changedTouches[0].screenY;
  };
  const handleTouchEnd = (e) => {
    if (!enabled() || !isTouch.value || isScrolling) return;
    const delta = touchStartY - e.changedTouches[0].screenY;
    if (Math.abs(delta) > 50) (delta > 0 ? scrollNext : scrollPrev)();
  };

  /* ------------------------------------------------------------
   *  HASH -> INDEX sync (solo in Home)
   * ---------------------------------------------------------- */
  watch(
    () => route.hash,
    (hash) => {
      if (route.name !== "home" || !hash) return;
      nextTick(() => {
        const idx = sections.findIndex((s) => `#${s.id}` === hash);
        if (idx !== -1) currentIndex.value = idx;
      });
    },
    { immediate: true }
  );

  /* ------------------------------------------------------------
   *  LIFECYCLE
   * ---------------------------------------------------------- */
  onMounted(() => {
    containerEl = document.querySelector(containerSelector);
    if (!containerEl) return;

    sections = Array.from(containerEl.querySelectorAll(sectionSelector));

    // Wheel sul container
    containerEl.addEventListener("wheel", handleWheel, { passive: false });

    window.addEventListener("keydown", handleKeyDown);

    containerEl.addEventListener("touchstart", handleTouchStart, {
      passive: false,
    });
    containerEl.addEventListener("touchend", handleTouchEnd, {
      passive: false,
    });
  });

  onBeforeUnmount(() => {
    if (containerEl) {
      containerEl.removeEventListener("wheel", handleWheel);
      containerEl.removeEventListener("touchstart", handleTouchStart);
      containerEl.removeEventListener("touchend", handleTouchEnd);
    }
    window.removeEventListener("keydown", handleKeyDown);
  });

  /* ------------------------------------------------------------ */
  return {
    scrollToSection,
    currentIndex,
    scrollEnabled,
  };
}
