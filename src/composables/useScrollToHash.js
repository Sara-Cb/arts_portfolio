import { onMounted, watch } from "vue";
import { useRoute } from "vue-router";

export function useScrollToHashOrId(customId = null, delay = 300) {
  const route = useRoute();

  const scroll = () => {
    const targetSelector = customId ? `#${customId}` : route.hash;
    if (targetSelector) {
      const target = document.querySelector(targetSelector);
      if (target) {
        target.scrollIntoView({ behavior: "smooth" });

        window.history.replaceState(history.state, "", "/");
      }
    }
  };

  onMounted(() => {
    setTimeout(scroll, delay);
  });

  if (!customId) {
    watch(
      () => route.hash,
      () => {
        setTimeout(scroll, delay);
      }
    );
  }
}
