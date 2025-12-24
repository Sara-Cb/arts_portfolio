<script setup>
import { computed, onMounted } from "vue";
import { useUiStore } from "@/stores/ui";
import { useProjectsStore } from "@/stores/projects";
import MusicDetail from "@/views/components/projects/MusicDetail.vue";

const ui = useUiStore();
const projectsStore = useProjectsStore();
const projects = computed(() => projectsStore.getByCategory("music") || []);

// Genera ID sezione
function sectionId(slug) {
  return `music-project-${slug}`.replace(/[^a-z0-9_-]+/gi, "-");
}

onMounted(async () => {
  await projectsStore.ensureLoaded();
  ui.setSectionList("music", [
    { name: "music" },
    ...projects.value.map((p) => ({
      name: "music-project",
      params: { slug: p.slug },
    })),
  ]);
});
</script>

<template>
  <div class="page page--projects" id="music">
    <section class="snapSection" id="music" data-route="music">
      <div class="wip-container">
        <h1>Music</h1>
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
