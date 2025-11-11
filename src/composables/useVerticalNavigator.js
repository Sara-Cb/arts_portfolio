// src/composables/useVerticalNavigator.js
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

/* ------------------ KEYDOWN GLOBAL SINGLETON ------------------ */
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

  // ---- stato anti-bounce ----
  let lockRouteDrivenScroll = false;
  let unlockTimer = null;
  let programmaticRouteChange = false;

  // ---- IO: route <- scroll nativo ----
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
  function alignToRoute() {
    const idx = activeIndex.value;
    if (idx < 0) return;

    // se la target è già ben visibile: skip
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

  // ---- API per nav/dots ----
  function pushToEntry(entry) {
    if (!entry) return;
    if (sameLocation(entry, route)) return;
    programmaticRouteChange = true;
    router.push(toRouteLocation(entry));
  }

  // ---- STEP da frecce (singleton) ----
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
        // allineo PRIMA e copro l’IO con un lock breve
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

  // route -> scroll (solo se programmatica)
  watch(
    () => route.fullPath,
    () => {
      if (programmaticRouteChange) {
        programmaticRouteChange = false;
        alignToRoute();
      }
    }
  );

  // lista sezioni cambia -> riallinea e riaccendi IO (una volta sola)
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
