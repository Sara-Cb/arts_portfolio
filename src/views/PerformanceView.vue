<script setup>
import { computed, onMounted } from "vue";
import { useUiStore } from "@/stores/ui";
import { useProjectsStore } from "@/stores/projects";
import { useSnapRouter } from "@/composables/useSnapRouter";
import PerformanceDetail from "@/views/components/projects/PerformanceDetail.vue";

const ui = useUiStore();
const projectsStore = useProjectsStore();
const projects = computed(() => projectsStore.getByCategory("performance"));

onMounted(async () => {
  await projectsStore.ensureLoaded();
  ui.setSectionList("performance", [
    { name: "performance" },
    ...projects.value.map((p) => ({
      name: "performance-project",
      params: { slug: p.slug },
    })),
  ]);
});

useSnapRouter({ pageId: "performance", threshold: 0.75 });
</script>

<template>
  <div class="page" id="performance">
    <section class="snapSection" data-route="performance">
      <h1>Performance</h1>
    </section>

    <section
      v-for="p in projects"
      :key="p.slug"
      class="snapSection"
      :data-slug="p.slug"
    >
      <PerformanceDetail :project="p" />
    </section>
  </div>
</template>
