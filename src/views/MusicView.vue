<script setup>
import { computed, onMounted } from "vue";
import { useUiStore } from "@/stores/ui";
import { useProjectsStore } from "@/stores/projects";
import { useSnapRouter } from "@/composables/useSnapRouter";
import MusicDetail from "@/views/components/projects/MusicDetail.vue";

const ui = useUiStore();
const projectsStore = useProjectsStore();
const projects = computed(() => projectsStore.getByCategory("music") || []);

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

useSnapRouter({ pageId: "music", threshold: 0.75 });
</script>

<template>
  <div class="page" id="music">
    <section class="snapSection" data-route="music">
      <h1>Music</h1>
    </section>

    <section
      v-for="p in projects"
      :key="p.slug"
      class="snapSection"
      :data-slug="p.slug"
    >
      <MusicDetail :project="p" />
    </section>
  </div>
</template>
