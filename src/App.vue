<script setup>
import { RouterView, useRoute } from "vue-router";
import { computed, onMounted } from "vue";
import { useUiStore } from "@/stores/ui";

import HeaderComponent from "@/views/components/HeaderComponent.vue";
import ScrollIndicator from "@/views/components/ScrollIndicator.vue";
import ProjectsNavbar from "@/views/components/projects/ProjectsNavbar.vue";
import FullScreenGallery from "@/views/components/projects/FullScreenGallery.vue";

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
  <HeaderComponent />

  <ProjectsNavbar
    v-if="showProjectsNavbar"
    :current-category="currentRootCategory"
  />

  <ScrollIndicator />

  <main>
    <RouterView v-slot="{ Component }">
      <div class="view-wrapper">
        <Transition :name="transitionName" mode="out-in">
          <div class="route-page" :key="viewKey">
            <component :is="Component" />
          </div>
        </Transition>
      </div>
    </RouterView>
  </main>

  <FullScreenGallery />
</template>
