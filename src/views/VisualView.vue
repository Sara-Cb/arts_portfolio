<script setup>
import { computed, onMounted } from "vue";
import { useUiStore } from "@/stores/ui";
import { useProjectsStore } from "@/stores/projects";
import { useSnapRouter } from "@/composables/useSnapRouter";
import VisualDetail from "@/views/components/projects/VisualDetail.vue";

const ui = useUiStore();
const projectsStore = useProjectsStore();
const projects = computed(() => projectsStore.visuals);

onMounted(async () => {
  await projectsStore.ensureLoaded();
  ui.setSectionList("visual", [
    { name: "visual" },
    ...projects.value.map((p) => ({
      name: "visual-project",
      params: { slug: p.slug },
    })),
  ]);
});

useSnapRouter({ pageId: "visual", threshold: 0.75 });
</script>

<template>
  <div class="page" id="visual">
    <section class="snapSection" data-route="visual">
      <h1>Visual</h1>
    </section>

    <section
      v-for="p in projects"
      :key="p.slug"
      class="snapSection"
      :data-slug="p.slug"
    >
      <VisualDetail :project="p" />
    </section>
  </div>
</template>
