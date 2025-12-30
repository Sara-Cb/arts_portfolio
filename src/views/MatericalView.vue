<script setup>
import { computed, onMounted, watch } from "vue";
import { useRoute } from "vue-router";
import { useUiStore } from "@/stores/ui";
import { useProjectsStore } from "@/stores/projects";
import { useSeo, useStructuredData, getCreativeWorkStructuredData } from "@/composables/useSeo";
import MatericalDetail from "@/components/projects/MatericalDetail.vue";
import { useVerticalNavigator } from "@/composables/useVerticalNavigator";

const ui = useUiStore();
const projectsStore = useProjectsStore();
const route = useRoute();

const projects = computed(() => projectsStore.matericals);

// SEO dinamico basato sul progetto corrente
const currentProject = computed(() => {
  if (!route.params.slug) return null;
  return projectsStore.getMaterical(route.params.slug);
});

// SEO per lista o progetto specifico
const seoOptions = computed(() => {
  if (currentProject.value) {
    return {
      title: `${currentProject.value.title} | Materical`,
      description: currentProject.value.description || currentProject.value.subtitle || `Explore "${currentProject.value.title}" - Material art and sculpture by Ræhm. Mature content (18+).`,
      keywords: ["sculpture", "material art", "contemporary sculpture", currentProject.value.title, "Raehm"],
      type: "article",
    };
  }
  return {
    title: "Materical | Ræhm",
    description: "Explore material art and sculptural works by Ræhm. Contemporary sculptures exploring form, texture, and materiality. Mature content (18+).",
    keywords: ["sculpture", "material art", "contemporary sculpture", "3D art", "sculptural works"],
  };
});

useSeo(seoOptions);

// Structured data per progetto corrente
watch(currentProject, (project) => {
  if (project) {
    useStructuredData(getCreativeWorkStructuredData(project, "materical"));
  }
}, { immediate: true });

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
