<!-- src/views/components/ScrollIndicator.vue -->
<script setup>
import { computed } from "vue";
import { useRoute } from "vue-router";
import { useUiStore } from "@/stores/ui";
import { useVerticalNavigator } from "@/composables/useVerticalNavigator";

const route = useRoute();
const ui = useUiStore();

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
</script>

<template>
  <div class="scrollbar">
    <div
      v-for="(section, index) in sections"
      :key="sectionId(section)"
      class="dot"
      :id="sectionId(section) + '-dot'"
      :class="{ active: index === activeIndex }"
      @click="goToSection(section)"
    >
      <div class="dot-inner"></div>
    </div>
  </div>
</template>
