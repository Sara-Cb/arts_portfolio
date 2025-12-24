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
      <h1>Music</h1>
    </section>

    <section
      v-for="p in projects"
      :key="p.slug"
      class="snapSection"
      :id="sectionId(p.slug)"
      :data-slug="p.slug"
    >
      <MusicDetail :project="p" />
    </section>
  </div>
</template>
