import { ref, onMounted, onBeforeUnmount } from "vue";

export function useSnapScroll(
  containerSelector = ".scrollContainer",
  sectionSelector = ".snapSection",
  scrollDelay = 700
) {
  const currentIndex = ref(0);
  const scrollEnabled = ref(true); // ⬅️ NEW
  let isScrolling = false;
  let sections = [];

  // Touch handling
  let touchStartY = 0;
  let touchEndY = 0;

  const scrollToSection = (index) => {
    if (index >= 0 && index < sections.length) {
      isScrolling = true;
      sections[index].scrollIntoView({ behavior: "smooth" });
      currentIndex.value = index;
      setTimeout(() => (isScrolling = false), scrollDelay);
    }
  };

  const scrollNext = () => scrollToSection(currentIndex.value + 1);
  const scrollPrev = () => scrollToSection(currentIndex.value - 1);

  const handleWheel = (e) => {
    if (!scrollEnabled.value) return; // ⬅️ Only run if scrollEnabled
    e.preventDefault();
    if (isScrolling) return;
    if (e.deltaY > 50) scrollNext();
    else if (e.deltaY < -50) scrollPrev();
  };

  const handleKeyDown = (e) => {
    if (!scrollEnabled.value) return;
    e.preventDefault();
    if (isScrolling) return;
    if (e.key === "ArrowDown") scrollNext();
    if (e.key === "ArrowUp") scrollPrev();
  };

  const handleTouchStart = (e) => {
    if (!scrollEnabled.value) return;
    e.preventDefault();
    touchStartY = e.changedTouches[0].screenY;
  };

  const handleTouchEnd = (e) => {
    if (!scrollEnabled.value) return;
    e.preventDefault();
    touchEndY = e.changedTouches[0].screenY;
    const delta = touchStartY - touchEndY;
    if (Math.abs(delta) > 50) {
      if (delta > 0) scrollNext();
      else scrollPrev();
    }
  };

  onMounted(() => {
    const container = document.querySelector(containerSelector);
    if (!container) return;
    sections = Array.from(container.querySelectorAll(sectionSelector));
    window.addEventListener("wheel", handleWheel, { passive: false });
    window.addEventListener("keydown", handleKeyDown);
    container.addEventListener("touchstart", handleTouchStart, {
      passive: false,
    });
    container.addEventListener("touchend", handleTouchEnd, { passive: false });
  });

  onBeforeUnmount(() => {
    const container = document.querySelector(containerSelector);
    window.removeEventListener("wheel", handleWheel);
    window.removeEventListener("keydown", handleKeyDown);
    if (container) {
      container.removeEventListener("touchstart", handleTouchStart);
      container.removeEventListener("touchend", handleTouchEnd);
    }
  });

  return {
    scrollToSection,
    currentIndex,
    scrollEnabled,
  };
}
