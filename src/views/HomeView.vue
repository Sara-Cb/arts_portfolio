<script setup>
import { RouterView } from "vue-router";
</script>

<template>
  <div class="page" id="home">
    <RouterView v-slot="{ Component }">
      <component :is="Component" :key="Component?.__name" />
    </RouterView>
  </div>
</template>
