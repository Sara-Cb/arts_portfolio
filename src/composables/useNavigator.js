// src/composables/useNavigator.js
import { useRouter, useRoute } from "vue-router";
import { useUiStore } from "@/stores/ui";

export function useNavigator() {
  const router = useRouter();
  const route = useRoute();
  const ui = useUiStore();

  async function navigateTo(name, params = {}, { instantHome = false } = {}) {
    const toKey = ui.findPageKeyForRoute(name, params);

    // Hint per HomeView: scroll istantaneo alla sezione corretta
    if (toKey === "rahem" && instantHome && name !== "rahem") {
      sessionStorage.setItem("homeInstantAlign", name);
    }

    // Usa metodo centralizzato dello store per calcolare direzione
    ui.prepareHorizontalNavigation(route.name, route.params, name, params);

    return router.push({ name, params });
  }

  return { navigateTo };
}
