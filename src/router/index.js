import { createRouter, createWebHistory } from "vue-router";
import { useRouteMetaStore } from "@/stores/routeMeta";
import { useRouteScroller } from "@/composables/useRouteScroller";

// views
import HomeView from "@/views/HomeView.vue";
import PerformanceView from "@/views/PerformanceView.vue";
import VisualView from "@/views/VisualView.vue";
import MatericalView from "@/views/MatericalView.vue";
import MusicView from "@/views/MusicView.vue";

// components
import Hero from "@/views/components/home/Hero.vue";
import Projects from "@/views/components/home/Projects.vue";
import VisitCard from "@/views/components/home/VisitCard.vue";
import PerformanceDetail from "@/views/components/projects/PerformanceDetail.vue";
import VisualDetail from "@/views/components/projects/VisualDetail.vue";
import MatericalDetail from "@/views/components/projects/MatericalDetail.vue";
import MusicDetail from "@/views/components/projects/MusicDetail.vue";

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: "/",
      component: HomeView,
      children: [
        {
          path: "",
          name: "home-default",
          component: Hero,
          meta: { pageIndex: 0, sectionIndex: 0 },
        },
        {
          path: "projects",
          name: "home-projects",
          component: Projects,
          meta: { pageIndex: 0, sectionIndex: 1 },
        },
        {
          path: "visit-card",
          name: "home-visit",
          component: VisitCard,
          meta: { pageIndex: 0, sectionIndex: 2 },
        },
      ],
    },
    {
      path: "/performance",
      component: PerformanceView,
      children: [
        {
          path: "",
          name: "performance",
          component: PerformanceDetail,
          meta: { pageIndex: 1, sectionIndex: 0 },
        },
        {
          path: ":slug",
          name: "performance-project",
          component: PerformanceDetail,
          props: true,
          meta: { pageIndex: 1, sectionIndex: 1 },
        },
      ],
    },
    {
      path: "/visual",
      component: VisualView,
      children: [
        {
          path: "",
          name: "visual",
          component: VisualDetail,
          meta: { pageIndex: 2, sectionIndex: 0 },
        },
        {
          path: ":slug",
          name: "visual-project",
          component: VisualDetail,
          props: true,
          meta: { pageIndex: 2, sectionIndex: 1 },
        },
      ],
    },
    {
      path: "/materical",
      name: "materical",
      component: () => import("@/views/MatericalView.vue"),
    },
    {
      path: "/materical/:slug",
      name: "materical-project",
      component: () => import("@/views/MatericalView.vue"),
      props: true,
    },
    {
      path: "/music",
      component: MusicView,
      children: [
        {
          path: "",
          name: "music",
          component: MusicDetail,
          meta: { pageIndex: 4, sectionIndex: 0 },
        },
        {
          path: ":slug",
          name: "music-project",
          component: MusicDetail,
          props: true,
          meta: { pageIndex: 4, sectionIndex: 1 },
        },
      ],
    },
    {
      path: "/:pathMatch(.*)*",
      name: "not-found",
      component: () => import("@/views/NotFoundView.vue"),
    },
  ],
});

router.beforeEach((to, from, next) => {
  if (useRouteScroller.isTransitioning) return;
  const metaStore = useRouteMetaStore();
  metaStore.updateMetaFromRoute(to);
  next();
});

export default router;
