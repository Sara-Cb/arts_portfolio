<script setup>
import { computed } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useRouteMetaStore } from "@/stores/routeMeta";

const route = useRoute();
const router = useRouter();
const metaStore = useRouteMetaStore();

const page = computed(() => route.name?.split("-")[0]);
const sections = computed(() => metaStore.sectionMap[page.value] || []);
const activeIndex = computed(() => sections.value.indexOf(route.name));

function goToSection(sectionName) {
  if (sectionName !== route.name) {
    router.push({ name: sectionName });
  }
}
</script>

<template>
  <div class="scrollbar">
    <div
      v-for="(section, index) in sections"
      :key="section"
      class="dot"
      :class="{ active: index === activeIndex }"
      @click="goToSection(section)"
    ></div>
  </div>
</template>

<style scoped>
.scrollbar {
  position: fixed;
  top: 50%;
  right: 0.7rem;
  transform: translateY(-50%);
  display: flex;
  flex-direction: column;
  gap: 8px;
  z-index: 500;
}

@media screen and (min-width: 576px) {
  .scrollbar {
    right: 1rem;
  }
}

.dot {
  width: 5px;
  height: 16px;
  background-color: #f02020;
  border-radius: 2px;
  opacity: 0.3;
  transition: opacity 0.3s, background-color 0.3s;
}

.dot.active {
  opacity: 1;
  background-color: #6e0000;
}

@media (hover: hover) {
  .dot:hover {
    opacity: 0.5;
  }
}
</style>
