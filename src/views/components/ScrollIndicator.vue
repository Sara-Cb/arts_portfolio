<!-- src/views/components/ScrollIndicator.vue -->
<script setup>
import { computed } from "vue";
import { useRoute } from "vue-router";
import { useUiStore } from "@/stores/ui";
import { useProjectsStore } from "@/stores/projects";
import { useVerticalNavigator } from "@/composables/useVerticalNavigator";

const route = useRoute();
const ui = useUiStore();
const projectsStore = useProjectsStore();

// PageKey corrente
const pageKey = computed(
  () => ui.findPageKeyForRoute(route.name, route.params) || null
);

// Istanza "passiva": niente keydown qui
const { sections, activeIndex, sectionId, pushToEntry } = useVerticalNavigator({
  pageKey,
  containerSelector: ".page", // la page attuale
  keydownEnabled: false, // le frecce le gestiscono le view
});

function goToSection(entry) {
  pushToEntry(entry); // cambia route; lo scroll lo farà la view
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
      <span class="dot-tooltip">{{ getSectionTitle(section) }}</span>
    </div>
  </div>
</template>
