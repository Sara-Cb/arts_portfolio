<script setup>
import { useRouteScroller } from "@/composables/useRouteScroller";
import { useRouteMetaStore } from "@/stores/routeMeta";

const metaStore = useRouteMetaStore();
useRouteScroller(metaStore.sectionMap);
</script>

<template>
  <div class="page projectPage" id="materical">
    <RouterView v-slot="{ Component }">
      <component :is="Component" />
    </RouterView>
  </div>
</template>
