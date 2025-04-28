<script setup>
import { useCategoriesStore } from "@/stores/categories";
import { storeToRefs } from "pinia";
import { RouterLink } from "vue-router";

const store = useCategoriesStore();
const { categories } = storeToRefs(store);
</script>

<template>
  <div class="categories">
    <RouterLink
      v-for="cat in categories"
      :to="'/' + cat.type"
      class="category"
      :class="cat.type"
      :key="cat.type"
    >
      <div class="text">
        <h5 class="title">{{ cat.title }}</h5>
        <p class="subtitle">{{ cat.subtitle }}</p>
        <p class="description">{{ cat.description }}</p>
        <p class="cta">[ {{ cat.cta }} ]</p>
      </div>
      <div class="background">
        <img :src="cat.src" :alt="cat.title" />
      </div>
    </RouterLink>
  </div>
</template>
