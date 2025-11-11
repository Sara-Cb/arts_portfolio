// src/composables/useNavigator.js
import { useRouter } from "vue-router";
import { useUiStore } from "@/stores/ui";

export function useNavigator() {
  const router = useRouter();
  const ui = useUiStore();

  async function navigateTo(name, params = {}, { instantHome = false } = {}) {
    const toKey = ui.findPageKeyForRoute(name, params);
    const fromRoute = router.currentRoute.value;
    const fromKey = ui.findPageKeyForRoute(fromRoute.name, fromRoute.params);

    // calcola la direzione orizzontale (lo store resta “puro”)
    if (fromKey && toKey && fromKey !== toKey) {
      const fi = ui.pageIndexOf(fromKey);
      const ti = ui.pageIndexOf(toKey);
      ui.setHorizontalDirection(ti > fi ? "left" : "right");
      ui.setCrossPageTransition(true);
    } else {
      ui.setCrossPageTransition(false);
    }

    if (toKey === "rahem" && instantHome && name !== "rahem") {
      sessionStorage.setItem("homeInstantAlign", name);
    }

    return router.push({ name, params });
  }

  return { navigateTo };
}
