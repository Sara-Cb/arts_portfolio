<script setup>
import { computed } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useRouteMetaStore } from "@/stores/routeMeta";

const route = useRoute();
const router = useRouter();
const metaStore = useRouteMetaStore();

const page = computed(() => route.name?.split("-")[0]);

// Supporta sia stringhe (vecchio Home) sia oggetti {name, params} (Materical)
const sections = computed(
  () =>
    metaStore.getSectionList?.(page.value) ??
    metaStore.sectionMap[page.value] ??
    []
);

// Helper per confrontare una entry con la route corrente
const sameParams = (a = {}, b = {}) => {
  const ka = Object.keys(a),
    kb = Object.keys(b);
  if (ka.length !== kb.length) return false;
  return ka.every((k) => a[k] === b[k]);
};
const equalsRoute = (entry, r) =>
  typeof entry === "string"
    ? entry === r.name
    : entry?.name === r.name && sameParams(entry.params, r.params);

// Indice attivo
const activeIndex = computed(() =>
  sections.value.findIndex((s) => equalsRoute(s, route))
);

// Push robusto
function goToSection(entry) {
  if (typeof entry === "string") {
    if (entry !== route.name) router.push({ name: entry });
  } else if (entry && entry.name) {
    // evita push identico
    if (!equalsRoute(entry, route)) router.push(entry);
  }
}
</script>

<template>
  <div class="scrollbar">
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
