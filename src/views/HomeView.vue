<script setup>
import { onMounted, nextTick } from "vue";
import { useRoute } from "vue-router";
import { useUiStore } from "@/stores/ui";
import { useVerticalNavigator } from "@/composables/useVerticalNavigator";
import Hero from "@/views/components/home/Hero.vue";
import Projects from "@/views/components/home/Projects.vue";
import VisitCard from "@/views/components/home/VisitCard.vue";

const ui = useUiStore();
const route = useRoute();

ui.setSectionList("rahem", [
  { name: "rahem" },
  { name: "projects" },
  { name: "visit-card" },
]);

useVerticalNavigator({
  pageKey: "rahem",
  containerSelector: ".page#home",
  keydownEnabled: true,
  initialAlignFirst: false, // we'll do our own first align below
  ioThreshold: 0.55,
  debug: false,
});

onMounted(async () => {
  await nextTick();

  const hint = sessionStorage.getItem("homeInstantAlign");
  if (hint === "projects" || hint === "visit-card") {
    const el = document.querySelector(`.page#home > .snapSection#${hint}`);
    el?.scrollIntoView({ block: "start", behavior: "auto" });
    sessionStorage.removeItem("homeInstantAlign");
    return;
  }

  if (route.name === "projects" || route.name === "visit-card") {
    const el = document.querySelector(
      `.page#home > .snapSection#${route.name}`
    );
    el?.scrollIntoView({ block: "start", behavior: "auto" });
  }
});
</script>

<template>
  <div class="page" id="home">
    <section class="snapSection" id="rahem" data-route="rahem"><Hero /></section>
    <section class="snapSection" id="projects" data-route="projects"><Projects /></section>
    <section class="snapSection" id="visit-card" data-route="visit-card"><VisitCard /></section>
  </div>
</template>
