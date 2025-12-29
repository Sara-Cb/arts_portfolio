<script setup>
import { computed, onMounted } from "vue";
import { useUiStore } from "@/stores/ui";
import { useProjectsStore } from "@/stores/projects";
import VisualDetail from "@/components/projects/VisualDetail.vue";
import { useVerticalNavigator } from "@/composables/useVerticalNavigator";

const ui = useUiStore();
const projectsStore = useProjectsStore();

const projects = computed(() => projectsStore.visuals);

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

// Genera ID sezione
function sectionId(slug) {
  return `visual-project-${slug}`.replace(/[^a-z0-9_-]+/gi, "-");
}

onMounted(async () => {
  await projectsStore.ensureLoaded();
  ui.setSectionList(
    "visual",
    projects.value.map((p) => ({
      name: "visual-project",
      params: { slug: p.slug },
    }))
  );
});

useVerticalNavigator({
  pageKey: "visual",
  containerSelector: ".page#visual",
  keydownEnabled: true,
  initialAlignFirst: true,
  ioThreshold: 0.6,
  debug: false,
});
</script>

<template>
  <div class="page page--projects" id="visual">
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
        <VisualDetail :project="p" />
      </section>
    </template>
  </div>
</template>
