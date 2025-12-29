<script setup>
import { onMounted, nextTick } from "vue";
import { useRoute } from "vue-router";
import { useUiStore } from "@/stores/ui";
import { useVerticalNavigator } from "@/composables/useVerticalNavigator";
import Hero from "@/components/home/Hero.vue";
import Projects from "@/components/home/Projects.vue";
import VisitCard from "@/components/home/VisitCard.vue";

const ui = useUiStore();
const route = useRoute();

ui.setSectionList("rahem", [
  { name: "rahem" },
  { name: "works" },
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
  if (hint === "works" || hint === "visit-card") {
    const el = document.querySelector(`.page#home > .snapSection#${hint}`);
    el?.scrollIntoView({ block: "start", behavior: "auto" });
    sessionStorage.removeItem("homeInstantAlign");
    return;
  }

  if (route.name === "works" || route.name === "visit-card") {
    const el = document.querySelector(
      `.page#home > .snapSection#${route.name}`
    );
    el?.scrollIntoView({ block: "start", behavior: "auto" });
  }
});
</script>

<template>
  <div class="page" id="home">
    <section class="snapSection" id="rahem" data-route="rahem">
      <Hero />
    </section>
    <section class="snapSection" id="works" data-route="works">
      <Projects />
    </section>
    <section class="snapSection" id="visit-card" data-route="visit-card">
      <VisitCard />
    </section>
  </div>
</template>
