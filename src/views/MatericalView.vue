<!-- src/views/MatericalView.vue -->
<script setup>
import { computed, onMounted, onBeforeUnmount, nextTick, watch } from "vue";
import { useRoute } from "vue-router";

import { useProjectsStore } from "@/stores/projects";
import { useRouteMetaStore } from "@/stores/routeMeta";
import { useRouteScroller } from "@/composables/useRouteScroller";

// Componenti sezione
import MatericalDetail from "@/views/components/projects/MatericalDetail.vue";

const route = useRoute();
const metaStore = useRouteMetaStore();
const projectsStore = useProjectsStore();

// Lista progetti "materical" dal nuovo store
const projects = computed(() => projectsStore.matericals);

// Snap-scroll: modalità "native" (niente preventDefault, usa IntersectionObserver per sync URL)
useRouteScroller({
  mode: "native",
  containerSelector: "page#materical",
  sectionSelector: ".snapSection",
});

// Popola la sectionList (intro + ogni progetto come rotta “materical-project” con slug)
// e gestisce il deep-link scroll se arrivo su /materical/:slug
async function setupSectionsAndDeepLink() {
  // Assicura i dati caricati
  await projectsStore.ensureLoaded();

  // Costruisci la lista sezioni in ordine (intro → progetti)
  const list = [
    { name: "materical" },
    ...projects.value.map((p) => ({
      name: "materical-project",
      params: { slug: p.slug },
    })),
  ];
  metaStore.setSectionList("materical", list);

  // Deep-link: se atterro su /materical/:slug, scroll alla sezione
  if (route.name === "materical-project" && route.params.slug) {
    await nextTick();
    const el = document.querySelector(`[data-slug="${route.params.slug}"]`);
    el?.scrollIntoView({ block: "start", behavior: "smooth" });
  }
}

// Se cambia lo slug (es. da dot o link diretto), allinea lo scroll alla sezione corretta
watch(
  () => route.fullPath,
  async () => {
    if (route.name === "materical-project" && route.params.slug) {
      await nextTick();
      const el = document.querySelector(`[data-slug="${route.params.slug}"]`);
      el?.scrollIntoView({ block: "start", behavior: "smooth" });
    }
    if (route.name === "materical") {
      await nextTick();
      const el = document.querySelector(`[data-intro="true"]`);
      el?.scrollIntoView({ block: "start", behavior: "smooth" });
    }
  }
);

onMounted(setupSectionsAndDeepLink);

onBeforeUnmount(() => {
  // pulizia mappa sezioni per evitare “inquinamenti” su altre pagine
  metaStore.clearSectionList("materical");
});
</script>

<template>
  <div class="page" id="materical">
    <section class="snapSection" data-intro="true">
      <header class="intro-hero">
        <h1 class="title">Materical</h1>
        <p class="subtitle">Textures, matter, process.</p>
      </header>

      <!-- contenuto libero: testo, immagini hero, CTA, ecc. -->
      <div class="intro-body">
        <p>Breve introduzione…</p>
      </div>
    </section>

    <!-- Progetti -->
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
