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
      <div class="wip-container">
        <h1>Performance</h1>
        <p class="wip-message">Work in progress...</p>
      </div>
    </section>
  </div>
</template>

<style scoped lang="scss">
@use "@/style/partials/colors" as *;

.wip-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  gap: 2rem;

  h1 {
    font-size: 4rem;
    color: $ghost;
  }

  .wip-message {
    font-size: 1.5rem;
    color: $cool;
    font-style: italic;
  }
}
</style>
