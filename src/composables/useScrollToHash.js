import { onMounted, watch, nextTick } from "vue";
import { useRoute } from "vue-router";

/**
 * Sincronizza la navigazione a hash o ID con scroll "manuale".
 * Richiede `scrollToSection` (opzionale) se usi composable snap.
 */
export function useScrollToHashOrId(
  customId = null,
  delay = 300,
  scrollToSection = null
) {
  const route = useRoute();

  const scroll = () => {
    const targetSelector = customId ? `#${customId}` : route.hash;
    if (!targetSelector) return;

    nextTick(() => {
      const target = document.querySelector(targetSelector);
      if (!target) return;

      if (scrollToSection) {
        const sections = Array.from(document.querySelectorAll(".snapSection"));
        const index = sections.findIndex((s) => s.id === target.id);
        if (index !== -1) scrollToSection(index);
      } else {
        target.scrollIntoView({ behavior: "smooth" });
      }

      window.history.replaceState(history.state, "", "/");
    });
  };

  onMounted(() => {
    setTimeout(scroll, delay);
  });

  if (!customId) {
    watch(
      () => route.hash,
      () => setTimeout(scroll, delay)
    );
  }
}
