<script setup>
import { computed, ref } from "vue";
import { useRoute } from "vue-router";
import { useUiStore } from "@/stores/ui";

const route = useRoute();
const ui = useUiStore();

const isAnimating = ref(false); // per smorzare l’hover durante lo scroll

const sameParams = (a = {}, b = {}) => {
  const ka = Object.keys(a),
    kb = Object.keys(b);
  if (ka.length !== kb.length) return false;
  return ka.every((k) => a[k] === b[k]);
};
const equalsRoute = (entry, r) =>
  typeof entry === "string"
    ? entry === r.name
    : !!entry && entry.name === r.name && sameParams(entry.params, r.params);

// Trova la pageKey che contiene la rotta corrente
const pageKey = computed(() => {
  const map = ui.sectionMap?.value || ui.sectionMap || {};
  for (const key of Object.keys(map)) {
    const list = map[key] || [];
    if (list.some((e) => equalsRoute(e, route))) return key;
  }
  return null;
});

// Sezioni della pagina corrente
const sections = computed(() => ui.getSectionList(pageKey.value) || []);

// Indice attivo (deriva dalla route, che viene aggiornata dall'IO del composable)
const activeIndex = computed(() =>
  sections.value.findIndex((s) => equalsRoute(s, route))
);

// Smooth scroll al pannello target; l’IO farà router.replace() al momento giusto
function goToSection(entry) {
  const list = sections.value;
  const idx = list.findIndex(
    (e) =>
      equalsRoute(e, entry) ||
      (typeof entry === "string"
        ? e === entry
        : e?.name === entry?.name && sameParams(e?.params, entry?.params))
  );
  if (idx < 0) return;

  const pageEl = document.querySelector(".page"); // unica page montata
  const panels = pageEl ? pageEl.querySelectorAll(":scope > .snapSection") : [];
  const el = panels[idx];
  if (!el) return;

  isAnimating.value = true;
  el.scrollIntoView({ block: "start", behavior: "smooth" });
  // stop smorzamento hover dopo poco (tempo transizione/scroll)
  setTimeout(() => {
    isAnimating.value = false;
  }, 600);
}
</script>

<template>
  <div class="scrollbar" :class="{ animating: isAnimating }">
    <div
      v-for="(section, index) in sections"
      :key="
        typeof section === 'string'
          ? section
          : `${section.name}:${JSON.stringify(section.params || {})}`
      "
      class="dot"
      :class="{ active: index === activeIndex }"
      @click="goToSection(section)"
    >
      <div class="dot-inner"></div>
    </div>
  </div>
</template>

<style scoped>
/* esempio di stile anti-flicker (vedi punto 2) */
.dot {
  transition: opacity 150ms ease, transform 150ms ease;
}
.dot.active {
  opacity: 1;
  transform: scale(1);
}
.dot:not(.active) {
  opacity: 0.5;
}
.dot:hover:not(.active) {
  transform: scale(1.08);
}

/* durante lo scroll disattivo il bounce dell’hover */
.scrollbar.animating .dot:hover:not(.active) {
  transform: none;
}
</style>
