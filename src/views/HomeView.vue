<script setup>
import { onMounted } from "vue";
import { useUiStore } from "@/stores/ui";
import { useSnapRouter } from "@/composables/useSnapRouter";

import Hero from "@/views/components/home/Hero.vue";
import Projects from "@/views/components/home/Projects.vue";
import VisitCard from "@/views/components/home/VisitCard.vue";

const ui = useUiStore();

// sezione list per Home (pageKey = 'rahem')
onMounted(() => {
  ui.setSectionList("rahem", [
    { name: "rahem" },
    { name: "projects" },
    { name: "visit-card" },
  ]);
});

// snap-router: pageKey 'rahem', container '.page#home'
useSnapRouter({
  pageKey: "rahem",
  containerSelector: ".page#home",
  threshold: 0.75,
});
</script>

<template>
  <div class="page" id="home">
    <section class="snapSection" data-route="rahem"><Hero /></section>
    <section class="snapSection" data-route="projects"><Projects /></section>
    <section class="snapSection" data-route="visit-card"><VisitCard /></section>
  </div>
</template>
