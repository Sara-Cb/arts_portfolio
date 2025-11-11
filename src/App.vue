<script setup>
import { RouterView, useRoute } from "vue-router";
import { computed, onMounted } from "vue";
import { useUiStore } from "@/stores/ui";
import HeaderComponent from "@/views/components/HeaderComponent.vue";
import ScrollIndicator from "@/views/components/ScrollIndicator.vue";

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
  // fallback: primo record di matched (stessa view)
  return key || route.matched[0]?.path || "view";
});

onMounted(() => {
  console.log(
    `Hello curious friend!\nI am Sara.cb and I wrote this code, if you like this portfolio, check out my github profile! \n- https://github.com/Sara-Cb`
  );
});
</script>

<template>
  <HeaderComponent />
  <ScrollIndicator />
  <main>
    <RouterView v-slot="{ Component, route }">
      <div class="view-wrapper">
        <Transition :name="transitionName" mode="out-in">
          <div class="route-page" :key="viewKey">
            <component :is="Component" />
          </div>
        </Transition>
      </div>
    </RouterView>
  </main>
</template>
