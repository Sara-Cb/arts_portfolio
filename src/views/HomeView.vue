<script setup>
import { useSnapScroll } from "@/composables/useSnapScroll.js";
import { useScrollToHashOrId } from "@/composables/useScrollToHash";
import Hero from "@/views/components/home/Hero.vue";
import Projects from "@/views/components/home/Projects.vue";
import VisitCard from "@/views/components/home/VisitCard.vue";

useSnapScroll();

useScrollToHashOrId();
</script>

<template>
  <div class="scrollContainer">
    <section id="raehm" class="snapSection"><Hero /></section>
    <section id="projects" class="snapSection"><Projects /></section>
    <section id="visit-card" class="snapSection"><VisitCard /></section>
  </div>
</template>
