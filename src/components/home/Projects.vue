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
    <button
      v-for="cat in categories"
      :key="cat.type"
      class="category"
      :class="cat.type"
      type="button"
      @click="navigate(cat.type)"
      :aria-label="`Navigate to ${cat.title} category`"
    >
      <div class="background">
        <img v-image-loader :src="cat.src" role="presentation" />
      </div>
      <div class="text">
        <h5 class="title">{{ cat.title }}</h5>
        <p class="subtitle">{{ cat.subtitle }}</p>
        <p class="description">{{ cat.description }}</p>
        <p class="cta" aria-hidden="true">[ {{ cat.cta }} ]</p>
      </div>
    </button>
  </section>
</template>
