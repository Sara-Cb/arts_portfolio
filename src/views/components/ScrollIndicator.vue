<script setup>
import { computed } from "vue";
import { useRoute } from "vue-router";
import { useRouteMetaStore } from "@/stores/routeMeta";

const route = useRoute();
const metaStore = useRouteMetaStore();

const page = computed(() => route.name?.split("-")[0]);
const sections = computed(() => metaStore.sectionMap[page.value] || []);
const activeIndex = computed(() => sections.value.indexOf(route.name));
</script>

<template>
  <div class="scrollbar">
    <div
      v-for="(section, index) in sections"
      :key="section"
      class="dot"
      :class="{ active: index === activeIndex }"
    />
  </div>
</template>

<style scoped>
.scrollbar {
  position: fixed;
  top: 50%;
  right: 1rem;
  transform: translateY(-50%);
  display: flex;
  flex-direction: column;
  gap: 8px;
  z-index: 200;
}

.dot {
  width: 5px;
  height: 16px;
  background-color: #888;
  border-radius: 2px;
  opacity: 0.3;
  transition: opacity 0.3s, background-color 0.3s;
}

.dot.active {
  opacity: 1;
  background-color: #111;
}

@media (hover: hover) {
  .dot:hover {
    opacity: 0.5;
  }
}
</style>
