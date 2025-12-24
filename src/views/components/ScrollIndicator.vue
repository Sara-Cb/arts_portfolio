<!-- src/views/components/ScrollIndicator.vue -->
<script setup>
import { computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useUiStore } from "@/stores/ui";
import { useProjectsStore } from "@/stores/projects";

const route = useRoute();
const router = useRouter();
const ui = useUiStore();
const projectsStore = useProjectsStore();

// PageKey corrente
const pageKey = computed(
  () => ui.findPageKeyForRoute(route.name, route.params) || null
);

// Leggi sections direttamente dallo store (NO useVerticalNavigator per evitare doppio observer)
const sections = computed(() => ui.getSectionList(pageKey.value) || []);

// Calcola activeIndex confrontando route con sections
const activeIndex = computed(() => {
  const currentRouteKey = `${route.name}|${JSON.stringify(route.params || {})}`;
  return sections.value.findIndex(section => {
    const sectionName = typeof section === 'string' ? section : section.name;
    const sectionParams = typeof section === 'string' ? {} : (section.params || {});
    const sectionKey = `${sectionName}|${JSON.stringify(sectionParams)}`;
    return sectionKey === currentRouteKey;
  });
});

// Genera ID sezione (stesso pattern di useVerticalNavigator)
function sectionId(entry) {
  const sectionName = typeof entry === 'string' ? entry : entry.name;
  const sectionParams = typeof entry === 'string' ? {} : (entry.params || {});
  const slug = sectionParams.slug ? `-${sectionParams.slug}` : "";
  return (sectionName + slug).replace(/[^a-z0-9_-]+/gi, "-");
}

function goToSection(entry) {
  const sectionName = typeof entry === 'string' ? entry : entry.name;
  const sectionParams = typeof entry === 'string' ? {} : (entry.params || {});

  // Segnala navigazione verticale e usa replace per history pulita
  ui.prepareVerticalNavigation();
  router.replace({ name: sectionName, params: sectionParams });

  // Scroll manuale alla sezione
  requestAnimationFrame(() => {
    const id = sectionId(entry);
    const section = document.querySelector(`.snapSection#${id}`);
    section?.scrollIntoView({ block: "start", behavior: "smooth" });
  });
}

// Calcola l'altezza del dot in base alla distanza dall'active
function getDotHeight(index) {
  const distance = Math.abs(index - activeIndex.value);
  const totalSections = sections.value.length;

  // Se meno di 10 sezioni, tutti uguali
  if (totalSections <= 10) return 100;

  // Scala l'altezza in base alla distanza: più lontano = più basso
  // Distanza 0 (active) = 100%, poi scala fino a min 30%
  const minHeight = 30;
  const maxHeight = 100;
  const scale = Math.max(minHeight, maxHeight - distance * 8);

  return scale;
}

// Ottieni il titolo della sezione
function getSectionTitle(section) {
  // Se è una sezione di progetto, prendi il titolo dal progetto
  if (section.params?.slug) {
    const category = pageKey.value;
    if (category === "materical") {
      const project = projectsStore.getMaterical(section.params.slug);
      return project?.title || section.params.slug;
    }
    if (category === "visual") {
      const project = projectsStore.getVisual(section.params.slug);
      return project?.title || section.params.slug;
    }
    if (category === "performance") {
      const project = projectsStore.getPerformance(section.params.slug);
      return project?.title || section.params.slug;
    }
    if (category === "music") {
      const project = projectsStore.getMusic(section.params.slug);
      return project?.title || section.params.slug;
    }
  }

  // Altrimenti usa il nome della route
  return section.name || "";
}

// Mostra tooltip solo se NON siamo su home (rahem)
const showTooltips = computed(() => pageKey.value !== "rahem");
</script>

<template>
  <div class="scrollbar">
    <div
      v-for="(section, index) in sections"
      :key="sectionId(section)"
      class="dot"
      :id="sectionId(section) + '-dot'"
      :class="{ active: index === activeIndex }"
      :data-title="getSectionTitle(section)"
      :style="{ '--dot-height': getDotHeight(index) }"
      @click="goToSection(section)"
    >
      <div class="dot-inner"></div>
      <span v-if="showTooltips" class="dot-tooltip">{{ getSectionTitle(section) }}</span>
    </div>
  </div>
</template>
