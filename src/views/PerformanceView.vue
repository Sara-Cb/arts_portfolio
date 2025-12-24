<script setup>
import { computed, onMounted } from "vue";
import { useUiStore } from "@/stores/ui";
import { useProjectsStore } from "@/stores/projects";
import PerformanceDetail from "@/views/components/projects/PerformanceDetail.vue";

const ui = useUiStore();
const projectsStore = useProjectsStore();
const projects = computed(() => projectsStore.getByCategory("performance"));

// Genera ID sezione
function sectionId(slug) {
  return `performance-project-${slug}`.replace(/[^a-z0-9_-]+/gi, "-");
}

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
</script>

<template>
  <div class="page page--projects" id="performance">
    <section class="snapSection" id="performance" data-route="performance">
      <h1>Performance</h1>
    </section>

    <section
      v-for="p in projects"
      :key="p.slug"
      class="snapSection"
      :id="sectionId(p.slug)"
      :data-slug="p.slug"
    >
      <PerformanceDetail :project="p" />
    </section>
  </div>
</template>
