// src/router/index.js
import { createRouter, createWebHistory } from "vue-router";
import { useUiStore } from "@/stores/ui";

// Views
import HomeView from "@/views/HomeView.vue";
import MatericalView from "@/views/MatericalView.vue";
import VisualView from "@/views/VisualView.vue";
import PerformanceView from "@/views/PerformanceView.vue";
import MusicView from "@/views/MusicView.vue";

const router = createRouter({
  history: createWebHistory(),
  routes: [
    // HOME: 3 rotte, stessa view
    { path: "/", name: "rahem", component: HomeView },
    { path: "/projects", name: "projects", component: HomeView },
    { path: "/visit-card", name: "visit-card", component: HomeView },

    // MATERICAL: intro + progetto
    { path: "/materical", name: "materical", component: MatericalView },
    {
      path: "/materical/:slug",
      name: "materical-project",
      component: MatericalView,
      props: true,
    },

    // VISUAL (stessa logica di materical)
    { path: "/visual", name: "visual", component: VisualView },
    {
      path: "/visual/:slug",
      name: "visual-project",
      component: VisualView,
      props: true,
    },

    // PERFORMANCE
    { path: "/performance", name: "performance", component: PerformanceView },
    {
      path: "/performance/:slug",
      name: "performance-project",
      component: PerformanceView,
      props: true,
    },

    // MUSIC
    { path: "/music", name: "music", component: MusicView },
    {
      path: "/music/:slug",
      name: "music-project",
      component: MusicView,
      props: true,
    },

    {
      path: "/:pathMatch(.*)*",
      name: "not-found",
      component: () => import("@/views/NotFoundView.vue"),
    },
  ],
});

const rootName = (n) => String(n || "").split("-")[0];

router.beforeEach((to, from, next) => {
  const ui = useUiStore();

  // Prova con la mappa sezioni; se non c'è ancora, ripiega sul root name
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
