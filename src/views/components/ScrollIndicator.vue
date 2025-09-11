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
    ><div class="dot-inner"></div></div>
  </div>
</template>

