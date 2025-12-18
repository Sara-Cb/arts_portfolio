<script setup>
import { computed, onMounted } from "vue";
import { useUiStore } from "@/stores/ui";
import { useProjectsStore } from "@/stores/projects";
import MatericalDetail from "@/views/components/projects/MatericalDetail.vue";

const ui = useUiStore();
const store = useProjectsStore();

const projects = computed(() => store.matericals);

onMounted(async () => {
  await store.ensureLoaded();
  ui.setSectionList("materical", [
    ...projects.value.map((p) => ({
      name: "materical-project",
      params: { slug: p.slug },
    })),
  ]);
});
</script>

<template>
  <div class="page page--projects" id="materical">
    <section
      v-for="p in projects"
      :key="p.slug"
      class="snapSection"
      :data-slug="p.slug"
    >
      <MatericalDetail :project="p" />
    </section>
  </div>
</template>
