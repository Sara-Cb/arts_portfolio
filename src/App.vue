<script setup>
import { RouterView, useRoute } from "vue-router";
import HeaderComp from "@/views/components/HeaderComponent.vue";
import { computed, onMounted } from "vue";

const route = useRoute();

const mainClass = computed(() => {
  if (route.name === "home") return "homePage";
  if (route.name === "performance") return "performancePage";
  if (route.name === "visual") return "visualPage";
  if (route.name === "materical") return "matericalPage";
  if (route.name === "detail") return "detailPage";
  if (route.name === "not-found") return "notFoundPage";
  return "";
});

onMounted(() => {
  console.log(
    `Hello curious friend! \nI am Sara.cb and I wrote this code, if you like this portfolio, check out my github profile! \n https://github.com/Sara-Cb`
  );
});
</script>

<template>
  <HeaderComp />
  <main :class="mainClass">
    <RouterView />
  </main>
</template>
