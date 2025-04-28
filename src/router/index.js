import { createRouter, createWebHistory } from "vue-router";
import HomeView from "@/views/HomeView.vue";
import PerformanceView from "@/views/PerformanceView.vue";
import VisualView from "@/views/VisualView.vue";
import MatericalView from "@/views/MatericalView.vue";

function sameView(to, from) {
  return (
    to.matched[0]?.components?.default === from.matched[0]?.components?.default
  );
}

export const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: "/", name: "home", component: HomeView },

    { path: "/raehm", redirect: { path: "/", hash: "#raehm" } },
    { path: "/projects", redirect: { path: "/", hash: "#projects" } },
    { path: "/visit-card", redirect: { path: "/", hash: "#visit-card" } },

    { path: "/performance", name: "performance", component: PerformanceView },
    {
      path: "/performance/:slug",
      name: "performance-project",
      component: PerformanceView,
      props: true,
    },

    { path: "/visual", name: "visual", component: VisualView },
    {
      path: "/visual/:slug",
      name: "visual-project",
      component: VisualView,
      props: true,
    },

    { path: "/materical", name: "materical", component: MatericalView },
    {
      path: "/materical/:slug",
      name: "materical-project",
      component: MatericalView,
      props: true,
    },

    {
      path: "/:pathMatch(.*)*",
      name: "not-found",
      component: () => import("@/views/NotFoundView.vue"),
    },
  ],

  scrollBehavior(to, from) {
    if (to.hash) {
      return {
        el: to.hash,
        behavior: sameView(to, from) ? "smooth" : "auto",
      };
    }

    if (to.params.slug) {
      return {
        el: `#${to.params.slug}`,
        behavior: sameView(to, from) ? "smooth" : "auto",
      };
    }

    return { top: 0 };
  },
});

export default router;
