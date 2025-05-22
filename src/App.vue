<script setup>
import { RouterView, useRoute } from "vue-router";
import { watch, ref, onMounted } from "vue";
import HeaderComp from "@/views/components/HeaderComponent.vue";
import { useRouteMetaStore } from "@/stores/routeMeta";
import ScrollIndicator from "./views/components/ScrollIndicator.vue";

const route = useRoute();
const routeMetaStore = useRouteMetaStore();
const transitionName = ref("fade");

watch(
  () => route.fullPath,
  () => {
    routeMetaStore.updateMetaFromRoute(route);

    const { transitionType, transitionDirection } = routeMetaStore;
    if (transitionType.value === "vertical") {
      transitionName.value =
        transitionDirection.value === "down" ? "scroll-down" : "scroll-up";
    } else {
      transitionName.value =
        transitionDirection.value === "forward"
          ? "slide-forward"
          : "slide-backward";
    }
  },
  { immediate: true }
);

onMounted(() => {
  console.log(
    `Hello curious friend!\nI am Sara.cb and I wrote this code, if you like this portfolio, check out my github profile! \n- https://github.com/Sara-Cb`
  );
});
</script>

<template>
  <HeaderComp />
  <ScrollIndicator />
  <main>
    <RouterView v-slot="{ Component }">
      <Transition :name="transitionName" mode="out-in">
        <component :is="Component" />
      </Transition>
    </RouterView>
  </main>
</template>

<style scoped>
/* Vertical scroll */
.scroll-down-enter-active,
.scroll-up-enter-active {
  transition: opacity 0.4s ease, transform 0.4s ease;
}
.scroll-down-enter-from {
  opacity: 0;
  transform: translateY(60px);
}
.scroll-up-enter-from {
  opacity: 0;
  transform: translateY(-60px);
}
.scroll-down-leave-to,
.scroll-up-leave-to {
  opacity: 0;
}

/* Horizontal slide */
.slide-forward-enter-active,
.slide-backward-enter-active {
  transition: opacity 0.4s ease, transform 0.4s ease;
}
.slide-forward-enter-from {
  opacity: 0;
  transform: translateX(60px);
}
.slide-backward-enter-from {
  opacity: 0;
  transform: translateX(-60px);
}
.slide-forward-leave-to,
.slide-backward-leave-to {
  opacity: 0;
}
</style>
