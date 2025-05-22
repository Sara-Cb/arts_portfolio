import { defineStore } from "pinia";
import { ref } from "vue";

export const useRouteMetaStore = defineStore("routeMeta", () => {
  const currentPageIndex = ref(null);
  const currentSectionIndex = ref(null);
  const transitionDirection = ref("forward"); // or "backward", "up", "down"
  const transitionType = ref("horizontal"); // or "vertical"

  let lastPageIndex = null;
  let lastSectionIndex = null;

  const sectionMap = {
    home: ["home-default", "home-projects", "home-visit"],
    performance: ["performance", "performance-project"],
    visual: ["visual", "visual-project"],
    materical: ["materical", "materical-project"],
    music: ["music", "music-project"],
  };

  function updateMetaFromRoute(route) {
    const pageIndex = route.meta.pageIndex;
    const sectionIndex = route.meta.sectionIndex;

    if (pageIndex != null && sectionIndex != null) {
      transitionType.value =
        pageIndex === lastPageIndex ? "vertical" : "horizontal";

      if (transitionType.value === "vertical") {
        transitionDirection.value =
          sectionIndex > lastSectionIndex ? "down" : "up";
      } else {
        transitionDirection.value =
          pageIndex > lastPageIndex ? "forward" : "backward";
      }

      currentPageIndex.value = pageIndex;
      currentSectionIndex.value = sectionIndex;
      lastPageIndex = pageIndex;
      lastSectionIndex = sectionIndex;
    }
  }

  return {
    currentPageIndex,
    currentSectionIndex,
    transitionDirection,
    transitionType,
    updateMetaFromRoute,
    sectionMap,
  };
});
