<script setup>
import { computed, onMounted } from "vue";
import { useUiStore } from "@/stores/ui";
import { useProjectsStore } from "@/stores/projects";
import MatericalDetail from "@/views/components/projects/MatericalDetail.vue";
import { useVerticalNavigator } from "@/composables/useVerticalNavigator";

const ui = useUiStore();
const projectsStore = useProjectsStore();

const projects = computed(() => projectsStore.matericals);

// pronto = projectsStore.loaded + ogni progetto ha gallery con items
const isReady = computed(
  () =>
    projectsStore.loaded &&
    projects.value.length > 0 &&
    projects.value.every(
      (p) =>
        p.gallery &&
        Array.isArray(p.gallery.items) &&
        p.gallery.items.length > 0
    )
);

// Genera ID sezione (stesso pattern di useVerticalNavigator)
function sectionId(slug) {
  return `materical-project-${slug}`.replace(/[^a-z0-9_-]+/gi, "-");
}

onMounted(async () => {
  await projectsStore.ensureLoaded();
  ui.setSectionList(
    "materical",
    projects.value.map((p) => ({
      name: "materical-project",
      params: { slug: p.slug },
    }))
  );
});

useVerticalNavigator({
  pageKey: "materical",
  containerSelector: ".page#materical",
  keydownEnabled: true,
  initialAlignFirst: true,
  ioThreshold: 0.6,
  debug: false,
});
</script>

<template>
  <div class="page page--projects" id="materical">
    <!-- LOADER a snap finché non ho le gallery -->
    <template v-if="!isReady">
      <section v-for="n in 3" :key="n" class="snapSection">
        <div class="md-skeleton">
          <div class="sk-hero"></div>
          <div class="sk-row"></div>
          <div class="sk-row"></div>
        </div>
      </section>
    </template>

    <!-- CONTENUTO quando pronto -->
    <template v-else>
      <section
        v-for="p in projects"
        :key="p.slug"
        class="snapSection"
        :id="sectionId(p.slug)"
        :data-slug="p.slug"
      >
        <MatericalDetail :project="p" />
      </section>
    </template>
  </div>
</template>
