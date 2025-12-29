<script setup>
import { computed, onMounted } from "vue";
import { useUiStore } from "@/stores/ui";
import { useProjectsStore } from "@/stores/projects";
import MusicDetail from "@/components/projects/MusicDetail.vue";

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
@use "@/style/partials/variables" as *;

.wip-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100dvh;
  gap: 1.5rem;
  padding: 1rem;

  h1 {
    font-size: 2.5rem;
    color: $ghost;
    text-align: center;
  }

  .wip-message {
    font-size: 1.2rem;
    color: $cool;
    font-style: italic;
    text-align: center;
  }

  @media screen and (min-width: $breakpoint-sm) {
    gap: 2rem;

    h1 {
      font-size: 3.5rem;
    }

    .wip-message {
      font-size: 1.4rem;
    }
  }

  @media screen and (min-width: $breakpoint-md) {
    h1 {
      font-size: 4rem;
    }

    .wip-message {
      font-size: 1.5rem;
    }
  }
}
</style>
