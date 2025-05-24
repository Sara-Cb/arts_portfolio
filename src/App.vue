// App.vue
<script setup>
import { useRoute } from "vue-router";
import { useRouteMetaStore } from "@/stores/routeMeta";
import { useRouteScroller } from "@/composables/useRouteScroller";
import { computed } from "vue";
import HeaderComponent from "./views/components/HeaderComponent.vue";
import ScrollIndicator from "./views/components/ScrollIndicator.vue";

const route = useRoute();
const metaStore = useRouteMetaStore();
useRouteScroller(metaStore.sectionMap);

// TODO: Add method to determine project titles by their slug
// and update the section title accordingly when navigating to a project.
const sectionTitles = {
  0: "Welcome",
  1: "Projects",
  2: "Visit Card",
};

const sectionTitle = computed(
  () => sectionTitles[metaStore.currentSectionIndex] || ""
);

const transitionName = computed(() => {
  if (metaStore.transitionType === "horizontal") {
    return metaStore.transitionDirection === "forward"
      ? "slide-left"
      : "slide-right";
  }

  if (metaStore.transitionType === "vertical") {
    return metaStore.transitionDirection === "down" ? "slide-down" : "slide-up";
  }

  return null;
});
</script>

<template>
  <div id="app">
    <HeaderComponent />
    <ScrollIndicator />
    <main>
      <RouterView v-slot="{ Component }">
        <div class="view-wrapper">
          <Transition :name="transitionName" mode="out-in">
            <component :is="Component" :key="route.name" />
          </Transition>
        </div>
      </RouterView>
      <h2 class="section-title">{{ sectionTitle }}</h2>
    </main>
  </div>
</template>

<style>
/* Transizioni orizzontali */
.slide-left-enter-active,
.slide-left-leave-active,
.slide-right-enter-active,
.slide-right-leave-active,
.slide-down-enter-active,
.slide-down-leave-active,
.slide-up-enter-active,
.slide-up-leave-active {
  transition: transform 0.5s ease;
  position: absolute;
  width: 100%;
  z-index: 1;
}
.slide-left-enter-from {
  transform: translateX(100%);
}
.slide-left-leave-to {
  transform: translateX(-100%);
}
.slide-right-enter-from {
  transform: translateX(-100%);
}
.slide-right-leave-to {
  transform: translateX(100%);
}

/* Transizioni verticali */
.slide-down-enter-from {
  transform: translateY(100%);
}
.slide-down-leave-to {
  transform: translateY(-100%);
}
.slide-up-enter-from {
  transform: translateY(-100%);
}
.slide-up-leave-to {
  transform: translateY(100%);
}

.view-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
}
</style>
