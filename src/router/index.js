import { createRouter, createWebHistory } from "vue-router";
import { useUiStore } from "@/stores/ui";

import HomeView from "@/views/HomeView.vue";
import MatericalView from "@/views/MatericalView.vue";
import VisualView from "@/views/VisualView.vue";
import PerformanceView from "@/views/PerformanceView.vue";
import MusicView from "@/views/MusicView.vue";
import PrivacyView from "@/views/PrivacyView.vue";

const router = createRouter({
  history: createWebHistory(),
  routes: [
    // ========== HOME ==========
    // Tre route verticali gestite dalla stessa view
    { path: "/", name: "rahem", component: HomeView },
    { path: "/works", name: "works", component: HomeView },
    { path: "/visit-card", name: "visit-card", component: HomeView },

    // ========== MATERICAL ==========
    { path: "/materical", name: "materical", component: MatericalView },
    {
      path: "/materical/:slug",
      name: "materical-project",
      component: MatericalView,
      props: true,
    },

    // ========== VISUAL ==========
    { path: "/visual", name: "visual", component: VisualView },
    {
      path: "/visual/:slug",
      name: "visual-project",
      component: VisualView,
      props: true,
    },

    // ========== PERFORMANCE ==========
    { path: "/performance", name: "performance", component: PerformanceView },
    {
      path: "/performance/:slug",
      name: "performance-project",
      component: PerformanceView,
      props: true,
    },

    // ========== MUSIC ==========
    { path: "/music", name: "music", component: MusicView },
    {
      path: "/music/:slug",
      name: "music-project",
      component: MusicView,
      props: true,
    },

    // ========== STATIC PAGES ==========
    { path: "/privacy", name: "privacy", component: PrivacyView },

    // 404
    {
      path: "/:pathMatch(.*)*",
      name: "not-found",
      component: () => import("@/views/NotFoundView.vue"),
    },
  ],
});

// Estrae "page key" dal nome route: "materical-project" → "materical"
const rootName = (n) => String(n || "").split("-")[0];

/**
 * beforeEach: gestisce direzione transizioni orizzontali tra pagine.
 *
 * Tre casi:
 * 1. Prima navigazione (from.name undefined): no transizione
 * 2. Navigazione verticale (flag isNavigatingVertically): no transizione orizzontale
 * 3. Navigazione orizzontale (cambio pagina): calcola direzione slide (left/right)
 *
 * Direzione: confronta indice pagina from vs to.
 * Se to > from: slide da sinistra (setHorizontalDirection("left"))
 * Se from > to: slide da destra (setHorizontalDirection("right"))
 */
router.beforeEach((to, from, next) => {
  const ui = useUiStore();

  // Prima navigazione: nessuna transizione
  if (from.name === undefined) {
    ui.setCrossPageTransition(false);
    next();
    return;
  }

  // Navigazione verticale preparata: skip transizione orizzontale
  if (ui.isNavigatingVertically) {
    ui.setCrossPageTransition(false);
    next();
    return;
  }

  // Navigazione orizzontale: calcola direzione per browser back/forward o URL diretti
  const fromKey =
    ui.findPageKeyForRoute(from.name, from.params) ?? rootName(from.name);
  const toKey = ui.findPageKeyForRoute(to.name, to.params) ?? rootName(to.name);

  if (fromKey && toKey && fromKey !== toKey) {
    const fi = ui.pageIndexOf(fromKey);
    const ti = ui.pageIndexOf(toKey);
    ui.setHorizontalDirection(ti > fi ? "left" : "right");
    ui.setCrossPageTransition(true);
  } else {
    ui.setCrossPageTransition(false);
  }
  next();
});

export default router;
