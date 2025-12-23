<script setup>
import { useCategoriesStore } from "@/stores/categories";
import { storeToRefs } from "pinia";
import { useNavigator } from "@/composables/useNavigator";

const store = useCategoriesStore();
const { categories } = storeToRefs(store);
const { navigateTo } = useNavigator();

async function navigate(category) {
  await navigateTo(category, {}, { instantHome: true });
}
</script>

<template>
  <section id="projectCategories" class="sectionInner">
    <div
      v-for="cat in categories"
      :to="{ name: cat.type }"
      class="category"
      :class="cat.type"
      :key="cat.type"
      @click="navigate(cat.type)"
    >
      <div class="text">
        <h5 class="title">{{ cat.title }}</h5>
        <p class="subtitle">{{ cat.subtitle }}</p>
        <p class="description">{{ cat.description }}</p>
        <p class="cta">[ {{ cat.cta }} ]</p>
      </div>
      <div class="background">
        <img v-image-loader :src="cat.src" :alt="cat.title" />
      </div>
    </div>
  </section>
</template>
