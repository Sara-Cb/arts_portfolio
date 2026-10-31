<script setup>
import { computed, onMounted } from "vue";
import { useUiStore } from "@/stores/ui";
import { useProjectsStore } from "@/stores/projects";
import { useSeo } from "@/composables/useSeo";
import { useVerticalNavigator, makeSectionId } from "@/composables/useVerticalNavigator";
import PerformanceDetail from "@/components/projects/PerformanceDetail.vue";

const ui = useUiStore();
const projectsStore = useProjectsStore();

useSeo({
  title: "Performance | Ræhm",
  description:
    "Performance art works by Ræhm. Live art, body art, and video documentation. Mature content (18+).",
  keywords: ["performance art", "contemporary performance", "live art", "body art"],
});

const projects = computed(() => projectsStore.performances);

const isReady = computed(
  () => projectsStore.loaded && projects.value.length > 0
);

const sectionId = (slug) => makeSectionId("performance-project", slug);

onMounted(async () => {
  await projectsStore.ensureLoaded();
  ui.setSectionList(
    "performance",
    projects.value.map((p) => ({
      name: "performance-project",
      params: { slug: p.slug },
    }))
  );
});

useVerticalNavigator({
  pageKey: "performance",
  containerSelector: ".page#performance",
  keydownEnabled: true,
  initialAlignFirst: true,
  ioThreshold: 0.6,
});
</script>

<template>
  <div class="page page--projects" id="performance">
    <template v-if="!isReady">
      <section v-for="n in 2" :key="n" class="snapSection">
        <div class="pf-skeleton"></div>
      </section>
    </template>

    <template v-else>
      <section
        v-for="p in projects"
        :key="p.slug"
        class="snapSection"
        :id="sectionId(p.slug)"
        :data-slug="p.slug"
      >
        <PerformanceDetail :project="p" />
      </section>
    </template>
  </div>
</template>

<style scoped lang="scss">
@use "@/style/partials/colors" as *;
@use "@/style/partials/variables" as *;

.pf-skeleton {
  width: 100%;
  height: 100%;
  background: $night;
  animation: shimmer 1.1s infinite linear;
  background: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0.04) 25%,
    rgba(255, 255, 255, 0.08) 37%,
    rgba(255, 255, 255, 0.04) 63%
  );
  background-size: 400% 100%;
}

@keyframes shimmer {
  0% { background-position: 100% 0; }
  100% { background-position: -100% 0; }
}
</style>
