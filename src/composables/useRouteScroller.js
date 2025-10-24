// src/composables/useRouteScroller.js
import { onMounted, onBeforeUnmount, ref } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useRouteMetaStore } from "@/stores/routeMeta";

/**
 * Snap navigator tra sezioni.
 *
 * Modalità:
 * - 'programmatic' (DEFAULT): intercetta wheel/touch e scatta sezione per sezione (Home-style)
 * - 'native'               : lascia scorrere nativo (CSS scroll-snap) e usa IntersectionObserver per sync URL (Materical)
 */
export function useRouteScroller({
  mode = "programmatic", // 'programmatic' | 'native'
  containerSelector = "main",
  sectionSelector = ".snapSection",
  delay = 1500, // cooldown per bloccare ingressi ripetuti
} = {}) {
  const router = useRouter();
  const route = useRoute();
  const metaStore = useRouteMetaStore();

  const isTransitioning = ref(false);
  let scrolling = false;
  const lastScrollTime = ref(0);

  // --------------------------------------------------------------------------
  // Helpers
  // --------------------------------------------------------------------------
  const getPageKey = () => route.name?.split("-")[0];

  const getSectionList = () => {
    // Compat con store: può essere ref(...) nel nuovo modello
    const map = metaStore.sectionMap?.value || metaStore.sectionMap || {};
    const page = getPageKey();
    return map[page] || [];
  };

  const isObjectEntry = (e) => typeof e === "object" && e !== null;
  const entryToRoute = (e) => (isObjectEntry(e) ? e : { name: e });

  const sameParams = (a = {}, b = {}) => {
    const ka = Object.keys(a);
    const kb = Object.keys(b);
    if (ka.length !== kb.length) return false;
    for (const k of ka) if (a[k] !== b[k]) return false;
    return true;
  };

  const equalsRoute = (entry, r) => {
    if (!r?.name) return false;
    if (!isObjectEntry(entry)) return entry === r.name;
    return entry.name === r.name && sameParams(entry.params, r.params);
  };

  const getCurrentIndex = () => {
    const list = getSectionList();
    return list.findIndex((e) => equalsRoute(e, route));
  };

  const sectionsEls = () =>
    Array.from(document.querySelectorAll(sectionSelector));

  const scrollToIndex = (i) => {
    const els = sectionsEls();
    els[i]?.scrollIntoView({ block: "start", behavior: "smooth" });
  };

  const pushByIndex = (i) => {
    const list = getSectionList();
    const target = list[i];
    if (target) router.push(entryToRoute(target));
  };

  const unlockAfterDelay = () => {
    setTimeout(() => {
      isTransitioning.value = false;
      scrolling = false;
    }, delay);
  };

  // --------------------------------------------------------------------------
  // Movimenti next/prev (tasti/bottoni e usati anche dal wheel handler)
  // --------------------------------------------------------------------------
  const next = () => {
    if (scrolling || isTransitioning.value) return;
    const list = getSectionList();
    const idx = getCurrentIndex();
    if (idx < list.length - 1) {
      scrolling = true;
      isTransitioning.value = true;
      scrollToIndex(idx + 1);
      pushByIndex(idx + 1);
      unlockAfterDelay();
    }
  };

  const prev = () => {
    if (scrolling || isTransitioning.value) return;
    const idx = getCurrentIndex();
    if (idx > 0) {
      scrolling = true;
      isTransitioning.value = true;
      scrollToIndex(idx - 1);
      pushByIndex(idx - 1);
      unlockAfterDelay();
    }
  };

  // --------------------------------------------------------------------------
  // Tastiera (valida in entrambe le modalità)
  // --------------------------------------------------------------------------
  const handleKey = (e) => {
    if (e.key === "ArrowDown" || e.key === "PageDown") {
      e.preventDefault();
      next();
    }
    if (e.key === "ArrowUp" || e.key === "PageUp") {
      e.preventDefault();
      prev();
    }
  };

  // --------------------------------------------------------------------------
  // TOUCH (per 'programmatic')
  // --------------------------------------------------------------------------
  let touchStartY = 0;
  const handleTouchStart = (e) => {
    touchStartY = e.changedTouches[0].screenY;
  };
  const handleTouchEnd = (e) => {
    if (scrolling || isTransitioning.value) return;
    const delta = touchStartY - e.changedTouches[0].screenY;
    if (Math.abs(delta) > 20) {
      delta > 0 ? next() : prev();
    }
  };

  // --------------------------------------------------------------------------
  // WHEEL (per 'programmatic') — FIX TRACKPAD: coalesce + gesture-lock
  // --------------------------------------------------------------------------
  let wheelAccum = 0;
  let wheelTimer = null;
  let gestureLock = false;

  const GESTURE_WINDOW = 90; // ms: finestra di accorpamento eventi wheel
  const GESTURE_LOCK = 500; // ms: lock per assorbire inerzia del trackpad
  const THRESHOLD = 60; // soglia in "pixel" normalizzati

  const normalizeDeltaY = (e) => {
    // 0=pixel, 1=line, 2=page
    if (e.deltaMode === 1) return e.deltaY * 40; // ≈ 1 riga ~40px
    if (e.deltaMode === 2) return e.deltaY * 800; // molto raro
    return e.deltaY; // pixel
  };

  const handleWheel = (e) => {
    e.preventDefault();
    e.stopPropagation();

    // blocchi rapidi
    const now = Date.now();
    if (scrolling || isTransitioning.value || gestureLock) return;
    if (now - lastScrollTime.value < 50) return; // mini anti-bounce

    // accorpa eventi entro una finestra breve
    wheelAccum += normalizeDeltaY(e);
    clearTimeout(wheelTimer);
    wheelTimer = setTimeout(() => {
      const val = wheelAccum;
      wheelAccum = 0;

      if (Math.abs(val) < THRESHOLD) return;

      gestureLock = true; // evita doppio scatto per inerzia
      lastScrollTime.value = Date.now();
      val > 0 ? next() : prev();

      setTimeout(() => {
        gestureLock = false;
      }, GESTURE_LOCK);
    }, GESTURE_WINDOW);
  };

  // --------------------------------------------------------------------------
  // Modalità 'native': IntersectionObserver per sync URL con sezione attiva
  // --------------------------------------------------------------------------
  let observer = null;

  const setupObserver = () => {
    const els = sectionsEls();
    if (!els.length) return;

    observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((en) => en.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (!visible) return;

        const idx = els.indexOf(visible.target);
        if (idx < 0) return;

        const list = getSectionList();
        const target = list[idx];
        if (!target) return;

        const r = entryToRoute(target);
        if (!equalsRoute(target, route)) {
          router.replace(r); // no history spam durante lo scroll
        }
      },
      { threshold: [0.6] } // attiva quando ~60% in viewport
    );

    els.forEach((el) => observer.observe(el));
  };

  const cleanupObserver = () => {
    if (observer) {
      observer.disconnect();
      observer = null;
    }
  };

  // --------------------------------------------------------------------------
  // Mount / Unmount
  // --------------------------------------------------------------------------
  onMounted(() => {
    const container = document.querySelector(containerSelector);

    window.addEventListener("keydown", handleKey);

    if (mode === "programmatic") {
      if (container) {
        container.addEventListener("touchstart", handleTouchStart, {
          passive: false,
          capture: true,
        });
        container.addEventListener("touchend", handleTouchEnd, {
          passive: false,
          capture: true,
        });
        container.addEventListener("wheel", handleWheel, {
          passive: false,
          capture: true,
        });
      }
    } else {
      // Modalità nativa: nessun prevent sullo scroll
      setupObserver();
    }
  });

  onBeforeUnmount(() => {
    const container = document.querySelector(containerSelector);

    window.removeEventListener("keydown", handleKey);

    if (mode === "programmatic") {
      if (container) {
        container.removeEventListener("touchstart", handleTouchStart, true);
        container.removeEventListener("touchend", handleTouchEnd, true);
        container.removeEventListener("wheel", handleWheel, true);
      }
    } else {
      cleanupObserver();
    }
  });

  return { next, prev, isTransitioning };
}
