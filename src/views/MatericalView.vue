<script setup>
import { computed, onMounted } from "vue";
import { useRoute } from "vue-router";
import { useUiStore } from "@/stores/ui";
import { useProjectsStore } from "@/stores/projects";
import MatericalDetail from "@/views/components/projects/MatericalDetail.vue";

const route = useRoute();
const ui = useUiStore();
const store = useProjectsStore();

const projects = computed(() => store.matericals);

onMounted(async () => {
  await store.ensureLoaded();
  ui.setSectionList("materical", [
    { name: "materical" },
    ...projects.value.map((p) => ({
      name: "materical-project",
      params: { slug: p.slug },
    })),
  ]);
});
</script>

<template>
  <div class="page" id="materical">
    <section class="snapSection" data-route="materical">
      <!-- intro -->
      <h1>Materical</h1>
    </section>

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
