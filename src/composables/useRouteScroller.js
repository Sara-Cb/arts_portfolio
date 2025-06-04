import { onMounted, onBeforeUnmount, ref } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useRouteMetaStore } from "@/stores/routeMeta";

export function useRouteScroller() {
  const router = useRouter();
  const route = useRoute();
  const metaStore = useRouteMetaStore();
  const sectionMap = metaStore.sectionMap;
  const isTransitioning = ref(false);
  const delay = 1500;
  let scrolling = false;
  let lastScrollTime = ref(0);

  const getRouteList = () => {
    const page = route.name?.split("-")[0];
    return sectionMap[page] || [];
  };

  const getCurrentIndex = () => getRouteList().indexOf(route.name);

  const next = () => {
    if (scrolling || isTransitioning.value) return;
    const list = getRouteList();
    const idx = getCurrentIndex();
    if (idx < list.length - 1) {
      scrolling = true;
      isTransitioning.value = true;
      router.push({ name: list[idx + 1] });
      unlockAfterDelay();
    }
  };

  const prev = () => {
    if (scrolling || isTransitioning.value) return;
    const list = getRouteList();
    const idx = getCurrentIndex();
    if (idx > 0) {
      scrolling = true;
      isTransitioning.value = true;
      router.push({ name: list[idx - 1] });
      unlockAfterDelay();
    }
  };

  const unlockAfterDelay = () => {
    setTimeout(() => {
      isTransitioning.value = false;
      scrolling = false;
    }, delay);
  };

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

  const handleWheel = (e) => {
    e.preventDefault();
    const now = Date.now();
    if (scrolling || isTransitioning.value) return;
    if (now - lastScrollTime.value < delay) return;
    if (Math.abs(e.deltaY) < 20) return;

    lastScrollTime.value = now;
    e.deltaY > 0 ? next() : prev();
  };

  onMounted(() => {
    window.addEventListener("keydown", handleKey);
    window.addEventListener("touchstart", handleTouchStart, { passive: false });
    window.addEventListener("touchend", handleTouchEnd, { passive: false });
    window.addEventListener("wheel", handleWheel, { passive: false });
  });

  onBeforeUnmount(() => {
    window.removeEventListener("keydown", handleKey);
    window.removeEventListener("touchstart", handleTouchStart);
    window.removeEventListener("touchend", handleTouchEnd);
    window.removeEventListener("wheel", handleWheel);
  });

  return { next, prev, isTransitioning };
}
