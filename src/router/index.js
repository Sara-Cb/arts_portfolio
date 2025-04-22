import { createRouter, createWebHistory } from "vue-router";
import HomeView from "@/views/HomeView.vue";
import PerformanceView from "@/views/PerformanceView.vue";
import VisualView from "@/views/VisualView.vue";
import MatericalView from "@/views/MatericalView.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "home",
      component: HomeView,
    },
    {
      path: "/raehm",
      redirect: { path: "/", hash: "#raehm" },
    },
    {
      path: "/projects",
      redirect: { path: "/", hash: "#projects" },
    },
    {
      path: "/visit-card",
      redirect: { path: "/", hash: "#visit-card" },
    } /*
    {
      path: "/performance",
      name: "performance",
      component: PerformanceView,
    },
    {
      path: "/performance/:slug",
      name: "performance-project",
      component: PerformanceView,
      props: true,
    },
    {
      path: "/visual",
      name: "visual",
      component: VisualView,
    },
    {
      path: "/visual/:slug",
      name: "visual-project",
      component: VisualView,
      props: true,
    },
    {
      path: "/materical",
      name: "materical",
      component: MatericalView,
    },
    {
      path: "/materical/:slug",
      name: "materical-project",
      component: MatericalView,
      props: true,
    },*/,
    {
      path: "/:pathMatch(.*)*",
      name: "not-found",
      component: () => import("../views/NotFoundView.vue"),
    },
  ],
  scrollBehavior(to) {
    // 1. Gestione hash (es. #projects, #hero, #visit-card)
    if (to.hash) {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            el: to.hash,
            behavior: "smooth",
          });
        }, 300);
      });
    }

    // 2. Gestione progetti dinamici con slug (es. #marmo)
    if (
      to.params.slug &&
      ["performance", "visual", "materical"].some((prefix) =>
        to.name?.startsWith(prefix)
      )
    ) {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            el: `#${to.params.slug}`,
            behavior: "smooth",
          });
        }, 300);
      });
    }

    // 3. Default scroll to top
    return { top: 0 };
  },
});

export default router;
