<script setup>
import { RouterView, useRoute } from "vue-router";
import { computed, onMounted, onBeforeUnmount, nextTick } from "vue";
import { useUiStore } from "@/stores/ui";

import HeaderComponent from "@/components/HeaderComponent.vue";
import ScrollIndicator from "@/components/ScrollIndicator.vue";
import ProjectsNavbar from "@/components/projects/ProjectsNavbar.vue";
import FullScreenGallery from "@/components/projects/FullScreenGallery.vue";
import ContentWarning from "@/components/ContentWarning.vue";

const route = useRoute();
const ui = useUiStore();

const transitionName = computed(() =>
  ui.isCrossPageTransition
    ? ui.horizontalDirection === "left"
      ? "slide-left"
      : "slide-right"
    : ""
);

const viewKey = computed(() => {
  const key = ui.findPageKeyForRoute?.(route.name, route.params);
  return key || route.matched[0]?.path || "view";
});

// Cleanup transition state dopo che la transizione è completata
function onAfterEnter() {
  nextTick(() => {
    ui.setCrossPageTransition(false);
  });
}

function onAfterLeave() {
  nextTick(() => {
    ui.setCrossPageTransition(false);
  });
}

// stessa logica del router: prendo il "root" del name
const rootName = (n) => String(n || "").split("-")[0];

// categorie = pageOrder senza la home
const categories = computed(() =>
  ui.pageOrder.filter((name) => name !== "rahem")
);

// categoria corrente a partire dalla route
const currentRootCategory = computed(() => rootName(route.name));

// navbar visibile solo se il rootName della route è una categoria
const showProjectsNavbar = computed(() =>
  categories.value.includes(currentRootCategory.value)
);

onMounted(() => {
  console.log(
    `Hello curious friend!\nI am Sara.cb and I wrote this code, if you like this portfolio, check out my github profile! \n- https://github.com/Sara-Cb`
  );
});
</script>

<template>
  <a href="#main-content" class="skip-link">Skip to main content</a>

  <ContentWarning />

  <HeaderComponent />

  <ProjectsNavbar
    v-if="showProjectsNavbar"
    :current-category="currentRootCategory"
  />

  <main id="main-content">
    <RouterView v-slot="{ Component }">
      <div class="view-wrapper">
        <Transition
          :name="transitionName"
          mode="out-in"
          @after-enter="onAfterEnter"
          @after-leave="onAfterLeave"
        >
          <div class="route-page" :key="viewKey">
            <component :is="Component" />
          </div>
        </Transition>
      </div>
    </RouterView>
  </main>

  <ScrollIndicator />

  <FullScreenGallery />
</template>
